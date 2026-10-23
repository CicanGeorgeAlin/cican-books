import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";

const catalogText = fs.readFileSync(new URL("../catalog/index.js", import.meta.url), "utf8");
const books = catalogText
  .split("\n")
  .filter(line => /^\s*\{ id:/.test(line))
  .map(line => ({
    id: line.match(/id:"([^"]+)"/)?.[1] || "",
    title: line.match(/title:"([^"]+)"/)?.[1] || "",
    visibility: line.match(/visibility:"([^"]+)"/)?.[1] || ""
  }))
  .filter(book => book.id && book.visibility === "PUBLIC");

if (!books.length) throw new Error("No PUBLIC books found in the catalog.");

const server = spawn("python3", ["-m", "http.server", "4173", "--bind", "127.0.0.1"], {stdio:"ignore"});
await new Promise(r => setTimeout(r, 1000));

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:412,height:915}, deviceScaleFactor:2, isMobile:true});
const results = [];

for (const book of books) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  try {
    await page.goto(\`http://127.0.0.1:4173/reader.html?book=\${encodeURIComponent(book.id)}&autoplay=1&fresh=1\`, {waitUntil:"networkidle", timeout:30000});
    await page.waitForSelector("#reader.open", {timeout:15000});
    const title = (await page.locator("#readerTitle").innerText()).trim();
    if (title.toUpperCase() !== book.title.toUpperCase()) throw new Error("wrong reader title: " + title + " (expected " + book.title + ")");
    await page.waitForFunction(() => document.getElementById("readerText")?.innerText.trim().length > 500, null, {timeout:20000});
    const before = await page.locator("#readerText").evaluate(el => ({scrollTop:el.scrollTop, text:el.innerText.length, timer:document.getElementById("readerTimer")?.textContent}));
    await page.waitForTimeout(1800);
    const after = await page.locator("#readerText").evaluate(el => ({scrollTop:el.scrollTop, text:el.innerText.length, timer:document.getElementById("readerTimer")?.textContent, status:document.getElementById("readerStatus")?.textContent}));
    const moved = after.scrollTop > before.scrollTop + 0.5;
    const timerMoved = after.timer !== before.timer;
    if (!moved && !timerMoved) throw new Error(\`auto-reader did not advance (scroll \${before.scrollTop}->\${after.scrollTop}, timer \${before.timer}->\${after.timer})\`);
    if (errors.length) throw new Error("browser reported errors: " + errors.join(" | "));
    results.push({id:book.id, ok:true, title, textChars:after.text, scroll:\`\${before.scrollTop}->\${after.scrollTop}\`, timer:\`\${before.timer}->\${after.timer}\`});
  } catch (e) {
    results.push({id:book.id, ok:false, error:e.message, errors});
  } finally {
    await page.close();
  }
}

await browser.close();
server.kill();
for (const r of results) console.log(r.ok ? "PASS:" : "FAIL:", JSON.stringify(r));
const failed = results.filter(r => !r.ok);
if (failed.length) process.exitCode = 1;
else console.log(\`ALL \${results.length} PUBLIC BOOKS PASSED MOBILE BROWSER READER QA.\`);
