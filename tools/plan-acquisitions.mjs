import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const queuePath = path.join(ROOT, "catalog", "acquisition-queue.json");

const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
const candidates = [...(queue.candidates || [])].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

const report = {
  generatedAt: new Date().toISOString(),
  queueVersion: queue.version ?? null,
  attempted: [],
  skipped: [],
  errors: []
};

for (const book of candidates) {
  const item = {
    id: book.id,
    title: book.title,
    priority: book.priority ?? null,
    stage: book.queueStage ?? null
  };

  if (book.sourceStatus !== "SOURCE_VERIFIED") {
    report.skipped.push({ ...item, reason: "SOURCE_NOT_VERIFIED" });
    continue;
  }

  if (!book.sourceTextUrl) {
    report.skipped.push({ ...item, reason: "SOURCE_TEXT_URL_MISSING" });
    continue;
  }

  if (!book.normalizationRules?.startMarker || !book.normalizationRules?.stopMarker) {
    report.skipped.push({ ...item, reason: "NORMALIZATION_BOUNDARIES_MISSING" });
    continue;
  }

  report.attempted.push({
    ...item,
    sourceTextUrl: book.sourceTextUrl,
    outputFile: book.canonicalOutput || `fulltext/${book.id}.txt`,
    rightsStatus: book.rightsStatus,
    action: "READY_FOR_ACQUISITION"
  });
}

const outputPath = path.join(ROOT, "catalog", "acquisition-plan.json");
await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  attempted: report.attempted.length,
  skipped: report.skipped.length,
  errors: report.errors.length,
  output: "catalog/acquisition-plan.json"
}, null, 2));

if (report.errors.length) process.exitCode = 1;
