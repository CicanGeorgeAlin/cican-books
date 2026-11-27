import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../catalog/index.js", import.meta.url), "utf8");
const expected = source.split("\n").filter(line => /^\s*\{ id:/.test(line) && /visibility:"PUBLIC"/.test(line)).length;
const server = spawn("python3", ["-m", "http.server", "4174", "--bind", "127.0.0.1"], {stdio:"ignore"});
await new Promise(resolve => setTimeout(resolve, 900));
const browser = await chromium.launch({headless:true});
const results = [];
try {
  for (const viewport of [{name:"mobile",width:412,height:915,columns:2},{name:"desktop",width:1365,height:900,columns:4}]) {
    const page = await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:4174/", {waitUntil:"domcontentloaded"});
    await page.waitForFunction(() => document.querySelectorAll("#books a.book").length > 0);
    const count = await page.locator("#books a.book").count();
    if (count !== expected) throw new Error(viewport.name + ": expected " + expected + " book cards, found " + count);
    const columns = await page.locator("#books").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    if (columns !== viewport.columns) throw new Error(viewport.name + ": expected " + viewport.columns + " grid columns, found " + columns);
    for (let i=0;i<count;i++) {
      const card = page.locator("#books a.book").nth(i);
      await card.scrollIntoViewIfNeeded();
      await card.locator(".cover, .cover-fallback").waitFor({state:"attached"});
      await page.waitForFunction(el => {
        const img=el.querySelector("img.cican-cover-art");
        return !!img && img.complete && img.naturalWidth===600 && img.naturalHeight===840 && img.src.startsWith("data:image/svg+xml");
      }, await card.elementHandle(), {timeout:12000}).catch(() => {
        throw new Error(viewport.name + ": bespoke local CICAN cover failed to render for card " + i);
      });
      const state = await card.evaluate(el => {
        const image=el.querySelector("img.cover-image");
        const fallback=el.querySelector(".cover-fallback");
        const rect=el.getBoundingClientRect();
        return {title:el.querySelector(".title")?.textContent?.trim(),cover:!!image && image.complete && image.naturalWidth===600 && image.naturalHeight===840 && image.src.startsWith("data:image/svg+xml"),width:rect.width,height:rect.height};
      });
      if (!state.title || !state.cover || state.width<=0 || state.height<=0) throw new Error(viewport.name + ": invalid card/cover at index " + i);
      results.push({viewport:viewport.name,index:i+1,title:state.title,cover:state.cover});
    }
    if (errors.length) throw new Error(viewport.name + ": browser errors: " + errors.join(" | "));
    console.log("PASS:",viewport.name,"layout and",count,"covers/cards verified.");
    await page.close();
  }
  console.log("ALL",expected,"PUBLIC BOOK CARDS PASSED MOBILE AND DESKTOP COVER QA.");
} finally {
  await browser.close();
  server.kill();
}
