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
  const api = "https://en.wikisource.org/w/api.php?action=parse&page=" +
    encodeURIComponent("Pride_and_Prejudice_(1813)/Volume_" + volume + "/Chapter_" + chapter) +
    "&prop=text&format=json&formatversion=2";
  let response;
  for (let attempt = 1; attempt <= 4; attempt++) {
    response = await fetch(api, {
      headers: {
        "User-Agent": "CICAN-Play-The-Book/1.0 (research comparison)",
        "Accept": "application/json"
      }
    });
    if (response.ok) break;
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 4) {
      throw new Error("HTTP " + response.status + ": " + api);
    }
    await new Promise(resolve => setTimeout(resolve, attempt * 1500));
  }
  const data = await response.json();
  if (!data.parse?.text) {
    throw new Error("Wikisource API returned no parsed text: " + api);
  }
  return stripHtml(data.parse.text);
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
