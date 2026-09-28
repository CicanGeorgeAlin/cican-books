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

async function fetchBatch(titles) {
  const params = new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    format: "json",
    formatversion: "2",
    titles: titles.join("|")
  });
  const api = "https://en.wikisource.org/w/api.php?" + params.toString();
  let response;
  for (let attempt = 1; attempt <= 6; attempt++) {
    response = await fetch(api, {
      headers: {
        "User-Agent": "CICAN-Play-The-Book/1.0 (research comparison; contactable)",
        "Accept": "application/json"
      }
    });
    if (response.ok) break;
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 6) {
      throw new Error("HTTP " + response.status + ": " + api);
    }
    await new Promise(resolve => setTimeout(resolve, response.status === 429 ? attempt * 10000 : attempt * 2000));
  }
  const data = await response.json();
  const pages = data.query?.pages ?? [];
  const byTitle = new Map();
  for (const page of pages) {
    const content = page.revisions?.[0]?.slots?.main?.content;
    if (!content) throw new Error("Wikisource API returned no revision text for: " + page.title);
    byTitle.set(page.title, stripHtml(content));
  }
  return titles.map(title => {
    const text = byTitle.get(title);
    if (!text) throw new Error("Missing requested Wikisource page: " + title);
    return text;
  });
}

const sections = [];
for (const volume of volumes) {
  const titles = [];
  for (let chapter = 1; chapter <= volume.chapters; chapter++) {
    titles.push("Pride_and_Prejudice_(1813)/Volume_" + volume.number + "/Chapter_" + chapter);
  }
  console.log("Fetching Volume " + volume.number + " (" + titles.length + " chapters) in one batched API request...");
  const batch = await fetchBatch(titles);
  sections.push(...batch);
  await new Promise(resolve => setTimeout(resolve, 5000));
}

const output = sections.join("\n\n");
await fs.mkdir(path.dirname(path.resolve(OUTPUT)), { recursive: true });
await fs.writeFile(path.resolve(OUTPUT), output + "\n", "utf8");
console.log("Wrote " + sections.length + " chapters to " + OUTPUT);
