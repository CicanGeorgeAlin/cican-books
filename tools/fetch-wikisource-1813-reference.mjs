import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT = process.argv[2] ?? "tmp/pride-and-prejudice-1813-wikisource.txt";
const BASE = "https://en.wikisource.org/wiki/Pride_and_Prejudice_%281813%29";
const volumes = [
  { number: 1, chapters: 23 },
  { number: 2, chapters: 19 },
  { number: 3, chapters: 19 }
];

function toRoman(number) {
  const values = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let value = number;
  let output = "";
  for (const [unit, symbol] of values) {
    while (value >= unit) { output += symbol; value -= unit; }
  }
  return output;
}

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

async function fetchPage(title) {
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "text",
    format: "json",
    formatversion: "2"
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
  const html = data.parse?.text;
  if (!html) throw new Error("Wikisource API returned no rendered text for: " + title);
  return stripHtml(html);
}

async function fetchBatch(titles) {
  const results = [];
  for (const title of titles) {
    console.log("Fetching rendered Wikisource page: " + title);
    results.push(await fetchPage(title));
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  return results;
}

const sections = [];
for (const volume of volumes) {
  const titles = [];
  for (let chapter = 1; chapter <= volume.chapters; chapter++) {
    titles.push("Pride_and_Prejudice_(1813)/Volume_" + volume.number + "/Chapter_" + chapter);
  }
  console.log("Fetching Volume " + volume.number + " (" + titles.length + " chapters) in one batched API request...");
  const batch = await fetchBatch(titles);
  batch.forEach((text, index) => {
    sections.push("CHAPTER " + toRoman(index + 1) + ".\n\n" + text);
  });
  await new Promise(resolve => setTimeout(resolve, 5000));
}

const output = sections.join("\n\n");
await fs.mkdir(path.dirname(path.resolve(OUTPUT)), { recursive: true });
await fs.writeFile(path.resolve(OUTPUT), output + "\n", "utf8");
console.log("Wrote " + sections.length + " chapters to " + OUTPUT);
