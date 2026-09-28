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

function chapterize(text) {
  const normalized = normalize(text);
  const matches = [...normalized.matchAll(/^CHAPTER\s+([IVXLCDM]+|[0-9]+)\.?\s*$/gmi)];
  return matches.map((match, index) => ({
    label: match[1],
    text: normalized.slice(match.index, matches[index + 1]?.index ?? normalized.length)
  }));
}

const refChapters = chapterize(reference);
const canChapters = chapterize(canonical);
const chapterCount = Math.max(refChapters.length, canChapters.length);
const chapterResults = [];

for (let i = 0; i < chapterCount; i++) {
  const ref = refChapters[i];
  const can = canChapters[i];
  if (!ref || !can) {
    chapterResults.push({
      chapterIndex: i + 1,
      referenceLabel: ref?.label ?? null,
      canonicalLabel: can?.label ?? null,
      status: "MISSING_CHAPTER"
    });
    continue;
  }

  const refWords = words(ref.text);
  const canWords = words(can.text);
  const max = Math.max(refWords.length, canWords.length);
  let differingWordPositions = 0;
  let firstDifference = null;

  for (let j = 0; j < max; j++) {
    if (refWords[j] !== canWords[j]) {
      differingWordPositions++;
      if (!firstDifference) {
        firstDifference = {
          wordIndexWithinChapter: j,
          reference: refWords[j] ?? null,
          canonical: canWords[j] ?? null
        };
      }
    }
  }

  chapterResults.push({
    chapterIndex: i + 1,
    referenceLabel: ref.label,
    canonicalLabel: can.label,
    referenceWords: refWords.length,
    canonicalWords: canWords.length,
    differingWordPositions,
    firstDifference,
    status: differingWordPositions ? "DIFFERENCES_DETECTED" : "MATCH"
  });
}

const structureMismatch = refChapters.length !== canChapters.length || refChapters.some((x, i) => x.label !== canChapters[i]?.label);

const refWords = words(reference);
const canWords = words(canonical);

const result = {
  generatedAt: new Date().toISOString(),
  referenceFile,
  canonicalFile,
  referenceWords: refWords.length,
  canonicalWords: canWords.length,
  referenceChapterCount: refChapters.length,
  canonicalChapterCount: canChapters.length,
  chapterResults,
  policy: "Comparison is diagnostic only; it never replaces the canonical asset or grants publication rights."
};

const differingChapters = chapterResults.filter(x => x.status === "DIFFERENCES_DETECTED");
const missingChapters = chapterResults.filter(x => x.status === "MISSING_CHAPTER");
const summary = {
  structure: structureMismatch ? "MISMATCH" : "MATCH",
  differingChapters: differingChapters.length,
  missingChapters: missingChapters.length,
  totalComparedChapters: chapterResults.filter(x => x.status !== "MISSING_CHAPTER").length,
  textIdentityStatus: structureMismatch ? "UNRESOLVED_STRUCTURE" : (differingChapters.length ? "DIFFERENCES_REQUIRE_CLASSIFICATION" : "MATCH_AT_NORMALIZED_WORD_LEVEL")
};

const destination = path.resolve(outputFile);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify(result, null, 2));
