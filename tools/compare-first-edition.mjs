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
  const rows = refWords.length + 1;
  const cols = canWords.length + 1;
  if (rows * cols > 25000000) {
    throw new Error("Comparison matrix too large for chapter " + (i + 1) + " (" + rows + "x" + cols + "); split the chapter comparison before running.");
  }
  const previous = new Uint32Array(cols);
  const current = new Uint32Array(cols);
  let best = 0;

  for (let a = 1; a < rows; a++) {
    current[0] = 0;
    for (let b = 1; b < cols; b++) {
      current[b] = refWords[a - 1] === canWords[b - 1]
        ? previous[b - 1] + 1
        : Math.max(previous[b], current[b - 1]);
      if (current[b] > best) best = current[b];
    }
    previous.set(current);
  }

  const editDistance = refWords.length + canWords.length - (2 * best);
  const identical = editDistance === 0;
  let firstDifference = null;

  if (!identical) {
    let a = 0;
    let b = 0;
    while (a < refWords.length && b < canWords.length && refWords[a] === canWords[b]) {
      a++;
      b++;
    }
    firstDifference = {
      referenceWordIndex: a,
      canonicalWordIndex: b,
      reference: refWords[a] ?? null,
      canonical: canWords[b] ?? null
    };
  }

  chapterResults.push({
    chapterIndex: i + 1,
    referenceLabel: ref.label,
    canonicalLabel: can.label,
    referenceWords: refWords.length,
    canonicalWords: canWords.length,
    lcsWordCount: best,
    editDistance,
    firstDifference,
    status: identical ? "MATCH" : "DIFFERENCES_DETECTED"
  });
}

const structureMismatch = refChapters.length !== canChapters.length || refChapters.some((x, i) => x.label !== canChapters[i]?.label);

const refWords = words(reference);
const canWords = words(canonical);

const differingChapters = chapterResults.filter(x => x.status === "DIFFERENCES_DETECTED");
const missingChapters = chapterResults.filter(x => x.status === "MISSING_CHAPTER");
const summary = {
  structure: structureMismatch ? "MISMATCH" : "MATCH",
  differingChapters: differingChapters.length,
  missingChapters: missingChapters.length,
  totalComparedChapters: chapterResults.filter(x => x.status !== "MISSING_CHAPTER").length,
  textIdentityStatus: structureMismatch ? "UNRESOLVED_STRUCTURE" : (differingChapters.length ? "DIFFERENCES_REQUIRE_CLASSIFICATION" : "MATCH_AT_NORMALIZED_WORD_LEVEL"),
  comparisonMethod: "LCS_WORD_SEQUENCE_EDIT_DISTANCE"
};

const result = {
  generatedAt: new Date().toISOString(),
  referenceFile,
  canonicalFile,
  referenceWords: refWords.length,
  canonicalWords: canWords.length,
  referenceChapterCount: refChapters.length,
  canonicalChapterCount: canChapters.length,
  chapterResults,
  summary,
  policy: "Comparison is diagnostic only; it never replaces the canonical asset or grants publication rights."
};

const destination = path.resolve(outputFile);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify(result, null, 2));
