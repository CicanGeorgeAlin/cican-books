import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

const catalogPath = path.join(ROOT, "catalog", "index.js");
const queuePath = path.join(ROOT, "catalog", "acquisition-queue.json");

let catalogModule;
try {
  catalogModule = await import(pathToFileURL(catalogPath).href + "?qa=" + Date.now());
} catch (error) {
  errors.push("Catalog module could not be imported: " + error.message);
}

const catalog = catalogModule?.CATALOG || [];
const statuses = catalogModule?.CATALOG_STATUS || {};
const ids = catalog.map(book => book.id);

if (!catalog.length) errors.push("Catalog contains no book records.");

const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicates.length) errors.push("Duplicate catalog IDs: " + [...new Set(duplicates)].join(", "));

const allowedStatuses = new Set(Object.values(statuses));
for (const book of catalog) {
  let bookSource;
  if (book.bookSource && fs.existsSync(path.join(ROOT, book.bookSource))) {
    try { bookSource = fs.readFileSync(path.join(ROOT, book.bookSource), "utf8"); } catch {}
  }
  for (const field of ["id", "title", "author", "category", "bookSource"]) {
    if (!book[field]) errors.push((book.id || "<unknown>") + ": missing " + field);
  }

  if (!allowedStatuses.has(book.status)) {
    errors.push(book.id + ": invalid status " + String(book.status));
  }

  if (!Number.isFinite(book.targetMinutes) || book.targetMinutes <= 0) {
    errors.push(book.id + ": invalid targetMinutes");
  }

  if (book.bookSource && !fs.existsSync(path.join(ROOT, book.bookSource))) {
    errors.push(book.id + ": missing book source " + book.bookSource);
  }

  if (book.status === statuses.PUBLISHED) {
    for (const field of ["sourceEdition", "sourceNote", "sourceUrl"]) {
      if (!bookSource || !new RegExp(field + "\\s*:").test(bookSource)) errors.push(book.id + ": published book missing " + field);
    }
    if (!bookSource || !/targetWords\s*:\s*\d+/.test(bookSource)) errors.push(book.id + ": published book missing numeric targetWords");
    if (bookSource && !/fullTextUrl\s*:/.test(bookSource)) warnings.push(book.id + ": published book has no fullTextUrl; FULL BOOK may be unavailable.");
  }
}

if (fs.existsSync(queuePath)) {
  let queue;
  try {
    queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
  } catch (error) {
    errors.push("Acquisition queue is not valid JSON: " + error.message);
  }

  if (queue) {
    const queueIds = (queue.candidates || []).map(book => book.id);
    const queueDuplicates = queueIds.filter((id, i) => queueIds.indexOf(id) !== i);
    if (queueDuplicates.length) {
      errors.push("Duplicate acquisition queue IDs: " + [...new Set(queueDuplicates)].join(", "));
    }

    for (const book of queue.candidates || []) {
      for (const field of ["id", "title", "author", "sourceRepo", "sourceEbookId", "sourceUrl", "sourceStatus", "rightsStatus", "nextStep"]) {
        if (!book[field]) errors.push("Queue " + (book.id || "<unknown>") + ": missing " + field);
      }
      if (ids.includes(book.id)) warnings.push("Queue " + book.id + " is already represented in the catalog.");
    }
  }
} else {
  warnings.push("No acquisition queue found.");
}

if (catalog.length < 100) {
  warnings.push("Catalog currently has " + catalog.length + " titles. This is expected during foundation work.");
}

console.log("CICAN catalog QA");
console.log("================");
console.log("Published catalog records:", catalog.filter(book => book.status === statuses.PUBLISHED).length);
console.log("Total catalog records:", catalog.length);

if (warnings.length) {
  console.log("\nWARN");
  warnings.forEach(w => console.log("- " + w));
}

if (errors.length) {
  console.error("\nFAIL");
  errors.forEach(e => console.error("- " + e));
  process.exit(1);
}

console.log("\nPASS");
