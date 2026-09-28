import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT = process.argv[2] ?? "tmp/pride-and-prejudice-1813-wikisource.txt";
const BASE = "https://en.wikisource.org/wiki/Pride_and_Prejudice_%281813%29";
const volumes = [
  { number: 1, chapters: 23 },
  { number: 2, chapters: 19 },
  { number: 3, chapters: 19 }
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\u200b/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchChapter(volume, chapter) {
  const url = BASE + "/Volume_" + volume + "/Chapter_" + chapter;
  const response = await fetch(url, {
    headers: { "User-Agent": "CICAN-Play-The-Book/1.0 (research comparison)" }
  });
  if (!response.ok) throw new Error("HTTP " + response.status + ": " + url);
  const html = await response.text();
  const marker = html.indexOf('class="mw-parser-output"');
  if (marker < 0) throw new Error("Wikisource parser output not found: " + url);
  const start = html.indexOf(">", marker) + 1;
  const endCandidates = [
    html.indexOf('class="printfooter"', start),
    html.indexOf('id="catlinks"', start)
  ].filter(index => index >= 0);
  const end = endCandidates.length ? Math.min(...endCandidates) : html.length;
  return stripHtml(html.slice(start, end));
}

const sections = [];
for (const volume of volumes) {
  for (let chapter = 1; chapter <= volume.chapters; chapter++) {
    console.log("Fetching Volume " + volume.number + ", Chapter " + chapter + "...");
    sections.push(await fetchChapter(volume.number, chapter));
  }
}

const output = sections.join("\n\n");
await fs.mkdir(path.dirname(path.resolve(OUTPUT)), { recursive: true });
await fs.writeFile(path.resolve(OUTPUT), output + "\n", "utf8");
console.log("Wrote " + sections.length + " chapters to " + OUTPUT);
