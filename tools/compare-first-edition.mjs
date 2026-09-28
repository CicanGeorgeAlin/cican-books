import fs from "node:fs/promises";
import path from "node:path";

const [, , referenceFile, canonicalFile, outputFile = "catalog/first-edition-comparison.json"] = process.argv;

if (!referenceFile || !canonicalFile) {
  console.error("Usage: node tools/compare-first-edition.mjs <reference-text> <canonical-text> [output-json]");
  process.exit(1);
}

const [reference, canonical] = await Promise.all([
  fs.readFile(path.resolve(referenceFile), "utf8"),
  fs.readFile(path.resolve(canonicalFile), "utf8")
]);

function normalize(text) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function words(text) {
  return normalize(text).split(/\s+/).filter(Boolean);
}

const refWords = words(reference);
const canWords = words(canonical);
const max = Math.max(refWords.length, canWords.length);
let firstDifference = null;
let differingWords = 0;

for (let i = 0; i < max; i++) {
  if (refWords[i] !== canWords[i]) {
    differingWords++;
    if (!firstDifference) {
      firstDifference = {
        wordIndex: i,
        reference: refWords[i] ?? null,
        canonical: canWords[i] ?? null
      };
    }
  }
}

const result = {
  generatedAt: new Date().toISOString(),
  referenceFile,
  canonicalFile,
  referenceWords: refWords.length,
  canonicalWords: canWords.length,
  differingWordPositions: differingWords,
  firstDifference,
  policy: "Comparison is diagnostic only; it never replaces the canonical asset or grants publication rights."
};

const destination = path.resolve(outputFile);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify(result, null, 2));
