import { chromium } from "playwright";
import { spawn } from "node:child_process";

const books = [
  ["dhammapada","THE DHAMMAPADA"],
  ["tao-te-ching","TAO TE CHING"],
  ["the-republic","THE REPUBLIC"],
  ["meditations","MEDITATIONS"],
  ["walden","WALDEN"],
  ["thus-spake-zarathustra","THUS SPAKE ZARATHUSTRA"],
  ["frankenstein","FRANKENSTEIN"],
  ["dracula","DRACULA"],
  ["the-great-gatsby","THE GREAT GATSBY"],
  ["nineteen-eighty-four","NINETEEN EIGHTY-FOUR"],
  ["moby-dick","MOBY DICK; OR, THE WHALE"],
  ["pride-and-prejudice","PRIDE AND PREJUDICE"],
  ["alice-adventures-in-wonderland","ALICE'S ADVENTURES IN WONDERLAND"],
  ["adventures-of-sherlock-holmes","ADVENTURES OF SHERLOCK HOLMES"],
  ["crime-and-punishment","CRIME AND PUNISHMENT"]
];

const server = spawn("python3", ["-m", "http.server", "4173", "--bind", "127.0.0.1"], {stdio:"ignore"});
await new Promise(r => setTimeout(r, 1000));

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:412,height:915}, deviceScaleFactor:2, isMobile:true});
const results = [];

for (const [id, expected] of books) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  try {
    await page.goto(`http://127.0.0.1:4173/reader.html?book=${encodeURIComponent(id)}&autoplay=1&fresh=1`, {waitUntil:"networkidle", timeout:20000});
    await page.waitForSelector("#reader.open", {timeout:10000});
    const title = await page.locator("#readerTitle").innerText();
    if (!title.toUpperCase().includes(expected.split(" ")[0])) throw new Error("wrong reader title: " + title);
    await page.waitForFunction(() => document.getElementById("readerText")?.innerText.trim().length > 500, {timeout:15000});
    const before = await page.locator("#readerText").evaluate(el => ({scrollTop:el.scrollTop, text:el.innerText.length, timer:document.getElementById("readerTimer")?.textContent}));
    await page.waitForTimeout(2600);
    const after = await page.locator("#readerText").evaluate(el => ({scrollTop:el.scrollTop, text:el.innerText.length, timer:document.getElementById("readerTimer")?.textContent, status:document.getElementById("readerStatus")?.textContent}));
    if (after.scrollTop <= 0) throw new Error("reader did not establish a resumable position");
    await page.locator("#readerPause").dispatchEvent("pointerdown");
    await page.waitForTimeout(900);
    const saved = await page.evaluate((bookId) => {
      const key = "cican_reader_position:" + bookId + ":15";
      return {key, value: Number(localStorage.getItem(key)), raw: localStorage.getItem(key)};
    }, id);
    if (!Number.isFinite(saved.value) || saved.value <= 0) throw new Error(`reader position was not persisted (${saved.raw})`);
    await page.close();
    const resumePage = await context.newPage();
    const resumeErrors = [];
    resumePage.on("pageerror", e => resumeErrors.push("pageerror: " + e.message));
    resumePage.on("console", m => { if (m.type() === "error") resumeErrors.push("console: " + m.text()); });
    await resumePage.goto(`http://127.0.0.1:4173/reader.html?book=${encodeURIComponent(id)}&autoplay=1`, {waitUntil:"networkidle", timeout:20000});
    await resumePage.waitForSelector("#reader.open", {timeout:10000});
    await resumePage.waitForFunction(() => document.getElementById("readerText")?.innerText.trim().length > 500, {timeout:15000});
    await resumePage.waitForTimeout(500);
    const resumed = await resumePage.locator("#readerText").evaluate(el => ({scrollTop:el.scrollTop, note:document.getElementById("readerModeNote")?.textContent}));
    if (Math.abs(resumed.scrollTop - saved.value) > Math.max(8, saved.value * 0.12)) throw new Error(`resume position mismatch (${saved.value}->${resumed.scrollTop})`);
    await resumePage.close();
    const moved = after.scrollTop > before.scrollTop + 0.5;
    const timerMoved = after.timer !== before.timer;
    if (!moved && !timerMoved) throw new Error(`auto-reader did not advance (scroll ${before.scrollTop}->${after.scrollTop}, timer ${before.timer}->${after.timer})`);
    results.push({id, ok:true, title, textChars:after.text, scroll:`${before.scrollTop}->${after.scrollTop}`, savedPosition:saved.value, resumedPosition:resumed.scrollTop, resumeNote:resumed.note, timer:`${before.timer}->${after.timer}`});
  } catch (e) {
    results.push({id, ok:false, error:e.message, errors});
  } finally {
    await page.close();
  }
}

await browser.close();
server.kill();
for (const r of results) console.log(r.ok ? "PASS:" : "FAIL:", JSON.stringify(r));
const failed = results.filter(r => !r.ok);
if (failed.length) process.exitCode = 1;
else console.log(`ALL ${results.length} PUBLIC BOOKS PASSED BROWSER READER QA.`);
