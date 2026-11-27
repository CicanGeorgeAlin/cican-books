import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const id = process.argv[2] || "";
const fail = message => { console.error("PUBLISH BLOCKED:", message); process.exit(1); };
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const normalizeTransport = value => String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail("candidate_id must be a lowercase kebab-case ID.");
const manifestPath = path.join(root, "pipeline", "inbox", id + ".json");
if (!fs.existsSync(manifestPath)) fail("Missing candidate manifest: pipeline/inbox/" + id + ".json");
const m = readJson(manifestPath);

for (const key of ["id","title","author","category","publicationYear","sourceEdition","publisher","sourceUrl","originalScanUrl","textSourceUrl","fullTextPath","expectedSha256"]) {
  if (m[key] === undefined || m[key] === null || m[key] === "") fail("Missing manifest field: " + key);
}
if (m.id !== id) fail("Manifest id does not match requested candidate_id.");
if (!Number.isInteger(m.publicationYear) || m.publicationYear < 1 || m.publicationYear > new Date().getUTCFullYear()) fail("Invalid publicationYear.");
for (const key of ["sourceUrl","originalScanUrl","textSourceUrl"]) {
  let u; try { u = new URL(m[key]); } catch { fail("Invalid URL in " + key); }
  if (u.protocol !== "https:") fail(key + " must use HTTPS.");
}
if (!/^fulltext\/[a-z0-9-]+\.txt$/.test(m.fullTextPath)) fail("fullTextPath must be fulltext/<id>.txt.");
if (m.fullTextPath !== "fulltext/" + id + ".txt") fail("fullTextPath must match candidate ID.");
if (!/^[a-f0-9]{64}$/.test(m.expectedSha256)) fail("expectedSha256 must be a lowercase SHA-256.");
if (m.originalEdition?.verified !== true || !m.originalEdition?.evidenceUrl) fail("Original edition is not explicitly verified with evidence.");
try { if (new URL(m.originalEdition.evidenceUrl).protocol !== "https:") fail("Original-edition evidence must use HTTPS."); } catch { fail("Invalid original-edition evidence URL."); }
if (m.fidelity?.status !== "PASS" || m.fidelity?.comparedPages !== m.fidelity?.scanPageCount || !Number.isInteger(m.fidelity?.scanPageCount) || m.fidelity.scanPageCount < 1) fail("Every page of the original scan must be recorded as compared and passed.");
if (m.fidelity?.method !== "PAGE_BY_PAGE" || m.fidelity?.transcriptionReviewed !== true) fail("Page-by-page human transcription review is required.");
if (m.rights?.status !== "PASS" || !Array.isArray(m.rights?.jurisdictions) || !["IE","US"].every(x => m.rights.jurisdictions.includes(x)) || !Array.isArray(m.rights?.evidenceUrls) || m.rights.evidenceUrls.length < 1 || !m.rights?.checkedAt || Number.isNaN(Date.parse(m.rights.checkedAt))) fail("Rights evidence for Ireland and the United States is required.");
for (const evidenceUrl of m.rights.evidenceUrls) { try { if (new URL(evidenceUrl).protocol !== "https:") fail("Rights evidence URLs must use HTTPS."); } catch { fail("Invalid rights evidence URL."); } }
if (!Array.isArray(m.structure?.includedSections) || m.structure.includedSections.length < 1 || m.structure?.openingVerified !== true || m.structure?.endingVerified !== true || m.structure?.allPagesAccountedFor !== true) fail("Cover-to-cover structure verification is incomplete.");
if (!m.transcription?.punctuationVerified || !m.transcription?.paragraphsVerified || !m.transcription?.headingsVerified || !m.transcription?.footnotesAndAppendicesVerified) fail("Textual and structural fidelity checks are incomplete.");

const fullTextAbs = path.join(root, m.fullTextPath);
if (!fs.existsSync(fullTextAbs)) fail("Full text asset not found: " + m.fullTextPath);
const local = normalizeTransport(fs.readFileSync(fullTextAbs, "utf8"));
if (local.length < 1000) fail("Full text is unexpectedly short.");
const localHash = sha256(local);
if (localHash !== m.expectedSha256) fail("Local full-text SHA-256 does not match manifest expectedSha256.");
const response = await fetch(m.textSourceUrl, { redirect: "follow", signal: AbortSignal.timeout(90000), headers: { "User-Agent": "CICAN-Books-Original-Edition-Verification/1.0" } });
if (!response.ok) fail("Authoritative text source returned HTTP " + response.status);
const remote = normalizeTransport(await response.text());
const remoteHash = sha256(remote);
if (remoteHash !== localHash) fail("Exact source comparison FAILED. Local " + localHash + " vs remote " + remoteHash + ". No publication.");
if (remote.length < 1000) fail("Remote source is unexpectedly short.");

const catalogPath = path.join(root, "catalog", "index.js");
let catalog = fs.readFileSync(catalogPath, "utf8");
if (catalog.includes('id:"' + id + '"') || catalog.includes("id: '" + id + "'")) fail("Duplicate catalogue ID.");
const titleUpper = m.title.toUpperCase();
const catalogRecords = catalog.split("\\n").filter(line => /^\\s*\\{ id:/.test(line));
if (catalogRecords.some(line => line.toLowerCase().includes(m.title.toLowerCase()) && line.toLowerCase().includes(m.author.toLowerCase()))) fail("Possible title/author duplicate already exists in catalogue.");
const versionMatch = catalog.match(/export const CATALOG_VERSION = (\\d+);/);
if (!versionMatch) fail("Could not read CATALOG_VERSION.");
const targetWords = Number.isInteger(m.targetWords) && m.targetWords >= 2400 && m.targetWords <= 3000 ? m.targetWords : 2700;
const marker = String(m.fifteenMinuteStartMarker || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const book = {
  title: m.title,
  author: m.author,
  category: m.category,
  difficulty: m.difficulty || "LITERARY_CLASSIC",
  targetMinutes: 15,
  targetWords,
  ...(marker ? { fifteenMinuteStartMarker: marker } : {}),
  readerSourceStatus: "SOURCE_READY",
  fullBookReady: true,
  fullTextSourceType: "ORIGINAL_EDITION_VERIFIED_TEXT",
  fullTextSourceVerified: true,
  fullTextSourceVerification: "Page-by-page original scan comparison passed; exact source text SHA-256 " + localHash,
  sourceEdition: m.sourceEdition,
  sourcePublisher: m.publisher,
  sourcePublicationYear: m.publicationYear,
  sourceTranslator: m.translator || "",
  sourceNote: "Complete original-edition text. Original scan, all-page comparison, structure and rights evidence are recorded in verification/" + id + ".json.",
  sourceUrl: m.sourceUrl,
  fullTextUrl: m.fullTextPath
};
const bookPath = path.join(root, "books", id + ".js");
if (fs.existsSync(bookPath)) fail("Book source already exists: books/" + id + ".js");
fs.writeFileSync(bookPath, "window.BOOK_READ = " + JSON.stringify(book, null, 2) + ";\n");
const catalogRecord = '  { id:"' + id + '", title:' + JSON.stringify(titleUpper) + ', author:' + JSON.stringify(m.author) + ', category:' + JSON.stringify(m.category) + ', translator:' + JSON.stringify(m.translator || "") + ', targetMinutes:15, targetWords:' + targetWords + ', status:"PUBLISHED", visibility:"PUBLIC", fullBookReady:true, sourceRepo:"Original edition archive", sourceUrl:' + JSON.stringify(m.sourceUrl) + ', rightsStatus:"VERIFIED_IE_US", originalScanUrl:' + JSON.stringify(m.originalScanUrl) + ', sourceEdition:' + JSON.stringify(m.sourceEdition) + ', bookSource:' + JSON.stringify("books/" + id + ".js") + ' },';
const close = catalog.lastIndexOf("]);");
if (close < 0) fail("Could not locate catalogue closing delimiter.");
catalog = catalog.slice(0, close) + catalogRecord + "\n" + catalog.slice(close);
fs.writeFileSync(catalogPath, catalog);

const verificationDir = path.join(root, "verification");
fs.mkdirSync(verificationDir, { recursive: true });
const report = {
  schemaVersion: 1,
  id, title: m.title, author: m.author,
  edition: { publicationYear: m.publicationYear, publisher: m.publisher, description: m.sourceEdition, evidenceUrl: m.originalEdition.evidenceUrl, scanUrl: m.originalScanUrl, pageCount: m.fidelity.scanPageCount, pagesCompared: m.fidelity.comparedPages },
  rights: m.rights,
  fidelity: { status: "PASS", method: "PAGE_BY_PAGE", transcriptionReviewed: true, exactSourceComparison: "PASS", localSha256: localHash, remoteSha256: remoteHash, textSourceUrl: m.textSourceUrl, includedSections: m.structure.includedSections },
  text: { path: m.fullTextPath, characters: local.length, words: local.trim().split(/\s+/).length },
  verifiedAt: new Date().toISOString(),
  releaseStatus: "PUBLISHED"
};
fs.writeFileSync(path.join(verificationDir, id + ".json"), JSON.stringify(report, null, 2) + "\n");
const processedDir = path.join(root, "pipeline", "processed");
fs.mkdirSync(processedDir, { recursive: true });
fs.renameSync(manifestPath, path.join(processedDir, id + ".json"));
console.log("PUBLISH READY:", id);
console.log("Exact source SHA-256:", localHash);
console.log("Words:", report.text.words, "| characters:", report.text.characters);
console.log("Original scan pages compared:", m.fidelity.comparedPages);
console.log("Generated books/" + id + ".js, catalogue record and verification/" + id + ".json");
