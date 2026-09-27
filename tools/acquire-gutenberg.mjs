import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

function usage() {
  console.log("Usage: node tools/acquire-gutenberg.mjs <source-url> <output-file> [--start <marker>] [--end <marker>]");
}

const [, , sourceUrl, outputFile, ...args] = process.argv;
if (!sourceUrl || !outputFile) {
  usage();
  process.exit(1);
}

function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : "";
}

const startMarker = arg("--start") || null;
const endMarker = arg("--end") || null;

const response = await fetch(sourceUrl, {
  headers: { "User-Agent": "CICAN-PLAY-THE-BOOK acquisition pipeline" }
});
if (!response.ok) {
  throw new Error("Source download failed: HTTP " + response.status);
}

let raw = await response.text();
raw = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");

function boundaryIndex(text, marker, from = 0) {
  if (!marker) return -1;
  return text.indexOf(marker, from);
}

const start = boundaryIndex(raw, startMarker);
const end = boundaryIndex(raw, endMarker, start >= 0 ? start + startMarker.length : 0);

if (startMarker && start < 0) throw new Error("Start marker not found: " + startMarker);
if (endMarker && end < 0) throw new Error("End marker not found: " + endMarker);

let text = raw;
if (startMarker) text = text.slice(start + startMarker.length);
if (endMarker) {
  const relativeEnd = text.indexOf(endMarker);
  if (relativeEnd >= 0) text = text.slice(0, relativeEnd);
}

text = text
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim() + "\n";

const words = text.split(/\s+/).filter(Boolean);
const lower = text.toLowerCase();
const contamination = [
  /project gutenberg/i,
  /you may copy it/i,
  /end of the project gutenberg ebook/i,
  /table of contents/i
].filter(re => re.test(lower));

const destination = path.resolve(ROOT, outputFile);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, text, "utf8");

const report = {
  sourceUrl,
  outputFile,
  startMarker,
  endMarker,
  sourceCharacters: raw.length,
  normalizedCharacters: text.length,
  wordCount: words.length,
  contaminationSignals: contamination.map(String),
  generatedAt: new Date().toISOString()
};

console.log(JSON.stringify(report, null, 2));
if (contamination.length) {
  console.error("WARN: contamination signals require review.");
  process.exitCode = 2;
}
