import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(ROOT, "catalog", "index.js");
const catalogSource = fs.readFileSync(catalogPath, "utf8");
const errors = [];
const warnings = [];
const ids = [...catalogSource.matchAll(/\{ id:"([^"]+)"/g)].map(m => m[1]);

if (!ids.length) errors.push("Catalog contains no book records.");
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicates.length) errors.push("Duplicate catalog IDs: " + [...new Set(duplicates)].join(", "));

for (const id of ids) {
  const marker = `  { id:"${id}"`;
  const start = catalogSource.indexOf(marker);
  const end = catalogSource.indexOf("\n", start);
  if (start < 0 || end < 0) { errors.push(id + ": could not parse catalog record."); continue; }
  const record = catalogSource.slice(start, end);
  for (const field of ["title", "author", "category", "bookSource"]) {
    if (!record.includes(field + ":")) errors.push(id + ": missing " + field);
  }
  const sourceMatch = record.match(/bookSource:"([^"]+)"/);
  if (sourceMatch && !fs.existsSync(path.join(ROOT, sourceMatch[1]))) errors.push(id + ": missing book source " + sourceMatch[1]);
  const minutes = record.match(/targetMinutes:(\d+(?:\.\d+)?)/);
  if (!minutes || Number(minutes[1]) <= 0) errors.push(id + ": invalid targetMinutes");
}

if (ids.length < 100) warnings.push("Catalog currently has " + ids.length + " titles. This is expected during foundation work.");
console.log("CICAN catalog QA");
console.log("================");
console.log("Books checked:", ids.length);
if (warnings.length) { console.log("\nWARN"); warnings.forEach(w => console.log("- " + w)); }
if (errors.length) { console.error("\nFAIL"); errors.forEach(e => console.error("- " + e)); process.exit(1); }
console.log("\nPASS");