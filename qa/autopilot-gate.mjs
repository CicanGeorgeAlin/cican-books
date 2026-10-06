import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const fail = message => { console.error("FAIL:", message); process.exitCode = 1; };
const pass = message => console.log("PASS:", message);
const catalog = read("catalog/index.js");
const reader = read("reader.html");
const index = read("index.html");
const lines = catalog.split("\n").filter(line => /^\s*\{ id:/.test(line));
const records = lines.map(line => ({
  id: line.match(/id:"([^"]+)"/)?.[1] || "",
  title: line.match(/title:"([^"]+)"/)?.[1] || "",
  author: line.match(/author:"([^"]+)"/)?.[1] || "",
  visibility: line.match(/visibility:"([^"]+)"/)?.[1] || "",
  status: line.match(/status:"([^"]+)"/)?.[1] || "",
  words: Number(line.match(/targetWords:(\d+)/)?.[1] || 0),
  source: line.match(/bookSource:"([^"]+)"/)?.[1] || "",
  sourceUrl: line.match(/sourceUrl:"([^"]+)"/)?.[1] || "",
  sourceId: line.match(/sourceEbookId:"([^"]+)"/)?.[1] || ""
}));
const ids = new Set();
for (const b of records) {
  if (!b.id || !b.title || !b.author || !b.source) fail(`Incomplete book metadata: ${b.id || b.title}`);
  if (ids.has(b.id)) fail(`Duplicate book id: ${b.id}`);
  ids.add(b.id);
  if (!/^books\/.+\.js$/.test(b.source)) fail(`Invalid source path: ${b.id}`);
  if (!fs.existsSync(path.join(root, b.source))) fail(`Missing source file: ${b.source}`);
  if (!b.sourceUrl.startsWith("https://")) fail(`Missing stable HTTPS source URL: ${b.id}`);
  if (!b.sourceId) fail(`Missing source identifier: ${b.id}`);
  if (b.words < 2400 || b.words > 3000) fail(`15-minute target outside 2,400–3,000 words: ${b.id} (${b.words})`);
  if (b.visibility === "PUBLIC" && b.status === "DRAFT") fail(`PUBLIC book still marked DRAFT: ${b.id}`);
  if (b.visibility === "DRAFT" && b.status !== "DRAFT") fail(`DRAFT book has non-DRAFT status: ${b.id}`);
}
const publicCount = records.filter(b => b.visibility === "PUBLIC").length;
if (publicCount < 1) fail("No PUBLIC books found."); else pass(`Book catalog gate inspected ${records.length} records (${publicCount} PUBLIC).`);
for (const b of records.filter(x => x.visibility === "PUBLIC")) {
  const source = read(b.source);
  for (const required of ["BOOK_READ", "title", "author", "sourceUrl", "targetWords"]) if (!source.includes(required)) fail(`PUBLIC source missing ${required}: ${b.id}`);
  if (source.replace(/\s+/g, " ").trim().length < 10000) fail(`PUBLIC source appears suspiciously short: ${b.id}`);
  if (/---BEGIN AUTHOR TEXT---|---END AUTHOR TEXT---/.test(source)) fail(`Repository wrapper remains in source: ${b.id}`);
}
if (/\bblink\b/i.test(catalog + reader + index)) fail("Forbidden project wording found."); else pass("Forbidden project wording absent.");
const invariants = [[
  [/READER_WPM\s*=\s*100/, "100 WPM reader benchmark"],
  [/function\s+fluidAutoReader\s*\(/, "fluid auto-reader"],
  [/readerPlaybackInterval/, "deterministic playback interval"],
  [/readerWatchdogTimer/, "auto-reader watchdog"],
  [/loadReaderPosition\(\)/, "saved-position restoration"],
  [/id="alphabet"/, "A-Z library"],
  [/type="search"/, "library search"]
]];
for (const [rx, label] of invariants) if (!rx.test(reader + index)) fail(`Locked invariant missing: ${label}`);
pass("Locked reader and library invariants remain present.");
if (process.exitCode) process.exit(1);
console.log("CICAN BOOKS AUTOPILOT GATE PASSED.");