import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const fail = message => {
  console.error("FAIL:", message);
  process.exitCode = 1;
};
const pass = message => console.log("PASS:", message);

const index = read("index.html");
const reader = read("reader.html");
const catalog = read("catalog/index.js");
const loader = read("engine/book-loader.js");
const serviceWorker = read("service-worker.js");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");

if (!/CATALOG\.filter\(b=>b\.visibility==="PUBLIC"\)/.test(index)) {
  fail("Landing page does not use explicit PUBLIC catalog visibility.");
} else pass("Landing page uses explicit PUBLIC visibility.");

if (/\bblink\b/i.test(index + reader + catalog + loader + serviceWorker)) {
  fail("Forbidden project wording found.");
} else pass("Forbidden project wording absent.");

const recordLines = catalog.split("\n").filter(line => /^\s*\{ id:/.test(line));
const records = recordLines.map(line => ({
  id: line.match(/id:"([^"]+)"/)?.[1],
  status: line.match(/status:"([^"]+)"/)?.[1],
  visibility: line.match(/visibility:"([^"]+)"/)?.[1],
  targetWords: Number(line.match(/targetWords:(\d+)/)?.[1] || 0),
  source: line.match(/bookSource:"([^"]+)"/)?.[1],
  title: line.match(/title:"([^"]+)"/)?.[1]
}));

if (records.length !== 22) fail(`Expected 22 catalog records, found ${records.length}.`);
else pass("Catalog contains 22 records.");

const publicRecords = records.filter(r => r.visibility === "PUBLIC");
const draftRecords = records.filter(r => r.visibility === "DRAFT");

if (publicRecords.length !== 15) fail(`Expected 15 PUBLIC records, found ${publicRecords.length}.`);
else pass("Catalog contains 15 PUBLIC records.");

if (draftRecords.length !== 7) fail(`Expected 7 DRAFT records, found ${draftRecords.length}.`);
else pass("Catalog contains 7 DRAFT records.");

for (const record of records) {
  if (!record.id || !record.title || !record.source) {
    fail(`Incomplete catalog record: ${JSON.stringify(record)}`);
    continue;
  }
  if (!["PUBLIC", "DRAFT"].includes(record.visibility)) {
    fail(`Invalid visibility for ${record.id}: ${record.visibility}`);
  }
  if (record.visibility === "DRAFT" && record.status !== "DRAFT") {
    fail(`DRAFT visibility/status mismatch for ${record.id}`);
  }
  if (record.visibility === "PUBLIC" && record.status === "DRAFT") {
    fail(`PUBLIC visibility/status mismatch for ${record.id}`);
  }
  if (record.targetWords < 2400 || record.targetWords > 3000) {
    fail(`15-minute target outside CICAN range for ${record.id}: ${record.targetWords}`);
  }
  if (!fs.existsSync(path.join(root, record.source))) {
    fail(`Missing book source: ${record.source}`);
  }
}

if (!/function\s+fluidAutoReader\s*\(/.test(reader)) fail("Fluid auto-reader missing.");
if (!/READER_WPM\s*=\s*100/.test(reader)) fail("Reader WPM benchmark changed.");
if (!/\.reader-header-actions\s*\{[\s\S]*?display:\s*flex/.test(reader)) fail("Reader header control bar missing.");
else pass("Reader uses the fixed header control bar.");
if (!/position:\s*static/.test(reader.match(/#readerFullscreen\s*\{[\s\S]*?\}/)?.[0] || "")) fail("Fullscreen button is not fixed in the header.");
else pass("Fullscreen button is fixed in the header.");
if (!/position:\s*static/.test(reader.match(/#readerHUD\s*\{[\s\S]*?\}/)?.[0] || "")) fail("Clock is not fixed in the header.");
else pass("Clock is fixed in the header.");
if (!/html\.cican-device-fullscreen\s+\.reader-header,/.test(reader) || !/#reader:fullscreen\s+\.reader-header,/.test(reader)) fail("Reader header is not hidden in fullscreen.");
else pass("Fullscreen hides the entire reader header.");
if (/makeReaderControlMovable|saveHUDPosition|restoreHUDPosition|saveFullscreenButtonPosition|restoreFullscreenButtonPosition/.test(reader)) fail("Obsolete movable-control logic remains.");
else pass("Obsolete movable-control logic absent.");
if (!/const savedPosition = loadReaderPosition\(\)/.test(reader)) fail("Reader does not restore saved reading position.");
if (/Force the beginning again after layout has settled/.test(reader)) fail("Reader still contains the old forced-reset resume logic.");
if (!/document\.documentElement\.requestFullscreen/.test(reader)) fail("Device fullscreen API missing.");
if (!/navigationUI:\s*"hide"/.test(reader)) fail("Fullscreen navigation UI hint missing.");
if (!/reader\.classList\.contains\("open"\)/.test(reader)) fail("Reader lifecycle guard missing.");

const moduleScript = [...reader.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].at(-1)?.[1];
if (!moduleScript) {
  fail("Reader module script could not be extracted.");
} else {
  try {
    new Function(moduleScript);
    pass("Reader module passes JavaScript syntax parsing.");
  } catch (error) {
    fail("Reader JavaScript syntax error: " + error.message);
  }
}

if (!/cican-books\/sitemap\.xml/.test(robots)) fail("robots.txt points to the wrong sitemap.");
else pass("robots.txt points to CICAN Books sitemap.");

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (sitemapUrls.length !== publicRecords.length + 1) {
  fail(`Sitemap should contain ${publicRecords.length + 1} URLs, found ${sitemapUrls.length}.`);
} else pass("Sitemap covers homepage plus every PUBLIC book.");

for (const record of publicRecords) {
  const url = `https://cicangeorgealin.github.io/cican-books/reader.html?book=${record.id}`;
  if (!sitemapUrls.includes(url)) fail(`Missing sitemap URL for ${record.id}`);
}

if (!/cican-books-v32/.test(serviceWorker)) fail("Service worker cache version was not bumped.");
else pass("Service worker cache version is current.");

if (!/record\.visibility === "PUBLIC"/.test(loader)) fail("Book loader is not aligned with catalog visibility.");
else pass("Book loader respects catalog visibility.");

if (process.exitCode) {
  console.error("\nCICAN BOOKS QA FAILED.");
} else {
  console.log("\nCICAN BOOKS QA PASSED.");
}
