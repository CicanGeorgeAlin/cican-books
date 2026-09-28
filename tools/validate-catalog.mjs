import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

const countWords = text => String(text || "").trim().split(/\s+/).filter(Boolean).length;
const readBookTextField = source => { const m = source?.match(/\btext\s*:\s*[`"]([\s\S]*?)[`"]\s*,?\s*prologueScenes/); return m ? m[1] : ""; };

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
const TECHNICALLY_READY = statuses.READY_TO_PUBLISH;

const readyChecks = [
  "sourceRepo", "sourceEbookId", "sourceUrl", "rightsStatus"
];
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

  if (book.fullBookReady === true) {
    if (!bookSource) {
      errors.push(book.id + ": fullBookReady=true but book source cannot be read");
    } else if (/readerSourceStatus\s*:\s*"SOURCE_PENDING"/.test(bookSource)) {
      errors.push(book.id + ": fullBookReady=true but readerSourceStatus is SOURCE_PENDING");
    } else {
      const embeddedFullText = /fullText\s*:/.test(bookSource);
      const fullTextMatch = bookSource.match(/fullTextUrl\s*:\s*"([^"]+)"/);
      if (!embeddedFullText && !fullTextMatch) {
        errors.push(book.id + ": fullBookReady=true but no complete full-text asset is declared");
      } else if (fullTextMatch) {
        if (/^https?:\/\//i.test(fullTextMatch[1])) {
          errors.push(book.id + ": fullBookReady=true but FULL BOOK source is remote");
        } else if (!fs.existsSync(path.join(ROOT, fullTextMatch[1]))) {
          errors.push(book.id + ": fullBookReady=true but local full-text asset is missing: " + fullTextMatch[1]);
        }
      }
    }
  }

  if (bookSource && book.sourceRepo && (book.status === statuses.CONTENT_REVIEW || book.status === statuses.READY_TO_PUBLISH || book.status === statuses.PUBLISHED)) {
    for (const field of ["sourceEdition", "sourceNote", "sourceUrl"]) {
      if (!new RegExp(field + "\\s*:").test(bookSource)) errors.push(book.id + ": review-stage book missing " + field);
    }
    if (!/targetWords\s*:\s*\d+/.test(bookSource)) errors.push(book.id + ": review-stage book missing numeric targetWords");
    const pendingSource =
      /readerSourceStatus\s*:\s*"SOURCE_PENDING"/.test(bookSource);

    if (!pendingSource) {
      const fullTextMatch = bookSource.match(/fullTextUrl\s*:\s*"([^"]+)"/);
      if (!fullTextMatch) {
        errors.push(book.id + ": ready review-stage book has no local fullTextUrl");
      } else if (/^https?:\/\//i.test(fullTextMatch[1])) {
        errors.push(book.id + ": review-stage FULL BOOK source must be stored locally, not remotely");
      } else if (!fs.existsSync(path.join(ROOT, fullTextMatch[1]))) {
        errors.push(book.id + ": review-stage fullTextUrl asset is missing: " + fullTextMatch[1]);
      }
    }
    const declaredWords = Number((bookSource.match(/targetWords\s*:\s*(\d+)/) || [])[1] || 0);
    if (declaredWords < 500) errors.push(book.id + ": targetWords is below 500");
  }

  if (book.status === statuses.PUBLISHED || book.status === TECHNICALLY_READY) {
    for (const field of readyChecks) {
      if (!book[field]) errors.push(book.id + ": readiness gate missing " + field);
    }
    for (const field of ["sourceRepo", "sourceEbookId", "sourceUrl", "rightsStatus"]) {
      if (!book[field]) errors.push(book.id + ": published catalog record missing " + field);
    }
    if (book.status === statuses.PUBLISHED && (book.rightsStatus === "TERRITORIAL_REVIEW_REQUIRED" || book.rightsStatus === "REVIEW_REQUIRED")) {
      errors.push(book.id + ": cannot be PUBLISHED while territorial rights remain under review");
    }
    for (const field of ["sourceEdition", "sourceNote", "sourceUrl"]) {
      if (!bookSource || !new RegExp(field + "\s*:").test(bookSource)) errors.push(book.id + ": published book missing " + field);
    }
    if (!bookSource || !/targetWords\s*:\s*\d+/.test(bookSource)) errors.push(book.id + ": published book missing numeric targetWords");
    if (bookSource && !/fullTextUrl\s*:/.test(bookSource)) {
      warnings.push(book.id + ": published/ready book has no fullTextUrl; FULL BOOK may be unavailable.");
    } else if (bookSource) {
      const fullTextMatch = bookSource.match(/fullTextUrl\s*:\s*["'`]([^"'`]+)["'`]/);
      if (fullTextMatch) {
        const fullTextPath = fullTextMatch[1];
        if (/^https?:\/\//i.test(fullTextPath)) {
          warnings.push(book.id + ": fullTextUrl is remote; local asset existence cannot be verified by this validator.");
        } else if (!fs.existsSync(path.join(ROOT, fullTextPath))) {
          errors.push(book.id + ": declared fullTextUrl asset is missing: " + fullTextPath);
        }
      }
    }
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
