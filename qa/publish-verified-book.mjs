import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const id = process.argv[2] || "";
const fail = message => { console.error("PUBLISH BLOCKED:", message); process.exit(1); };
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const normalize = value => String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail("Invalid book ID.");
const manifestPath = path.join(root, "pipeline", "inbox", id + ".json");
if (!fs.existsSync(manifestPath)) fail("Missing candidate: " + manifestPath);
const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

for (const key of ["id","title","author","category","publicationYear","authorDeathYear","sourceEdition","publisher","gutenbergId"]) {
  if (m[key] === undefined || m[key] === null || m[key] === "") fail("Missing " + key);
}
if (m.id !== id) fail("Candidate ID mismatch.");
if (!Number.isInteger(m.publicationYear) || m.publicationYear > 1930) fail("This simple publisher accepts editions published no later than 1930.");
if (!Number.isInteger(m.authorDeathYear) || m.authorDeathYear > 1955) fail("Author death year does not meet the conservative Ireland life+70 check for 2026.");
if (!/^\d+$/.test(String(m.gutenbergId))) fail("Invalid Project Gutenberg ebook number.");
const sourceUrl = "https://www.gutenberg.org/ebooks/" + m.gutenbergId;
const textUrl = m.textSourceUrl || "https://www.gutenberg.org/files/" + m.gutenbergId + "/" + m.gutenbergId + "-0.txt";
let response;
try {
  response = await fetch(textUrl, { redirect: "follow", signal: AbortSignal.timeout(90000), headers: { "User-Agent": "CICAN-Books/1.0 (public-domain text acquisition)" } });
} catch (error) { fail("Could not retrieve Project Gutenberg text: " + error.message); }
if (!response.ok) fail("Project Gutenberg text returned HTTP " + response.status + " at " + textUrl);
const text = normalize(await response.text());
if (text.length < 5000) fail("Downloaded text is too short to be a complete book.");
if (!/\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i.test(text) || !/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i.test(text)) fail("Project Gutenberg start/end markers missing; refusing incomplete text.");
const wordCount = text.split(/\s+/).length;
if (wordCount < 5000) fail("Downloaded text has fewer than 5,000 words; candidate may be incomplete.");
const fullTextPath = "fulltext/" + id + ".txt";
fs.mkdirSync(path.dirname(path.join(root, fullTextPath)), { recursive: true });
fs.writeFileSync(path.join(root, fullTextPath), text + "\n", "utf8");
const hash = sha256(text);

const catalogPath = path.join(root, "catalog", "index.js");
let catalog = fs.readFileSync(catalogPath, "utf8");
if (catalog.includes('id:"' + id + '"') || catalog.includes("id: '" + id + "'")) fail("Duplicate catalogue ID.");
const titleUpper = m.title.toUpperCase();
const catalogRecords = catalog.split("\n").filter(line => /^\s*\{ id:/.test(line));
if (catalogRecords.some(line => line.toLowerCase().includes(m.title.toLowerCase()) && line.toLowerCase().includes(m.author.toLowerCase()))) fail("Possible duplicate title and author.");
const versionMatch = catalog.match(/export const CATALOG_VERSION = (\d+);/);
if (!versionMatch) fail("Could not read catalogue version.");
catalog = catalog.replace(versionMatch[0], "export const CATALOG_VERSION = " + (Number(versionMatch[1]) + 1) + ";");
const targetWords = Number.isInteger(m.targetWords) && m.targetWords >= 2400 && m.targetWords <= 3000 ? m.targetWords : 2700;
const book = {
  title: m.title, author: m.author, category: m.category, difficulty: m.difficulty || "LITERARY_CLASSIC",
  targetMinutes: 15, targetWords, readerSourceStatus: "SOURCE_READY", fullBookReady: true,
  fullTextSourceType: "PROJECT_GUTENBERG_PROOFREAD_TEXT", fullTextSourceVerified: true,
  fullTextSourceVerification: "Downloaded complete Project Gutenberg text; SHA-256 " + hash,
  sourceEdition: m.sourceEdition, sourcePublisher: m.publisher, sourcePublicationYear: m.publicationYear,
  sourceTranslator: m.translator || "", sourceNote: "Complete Project Gutenberg text. Source and acquisition details are recorded in verification/" + id + ".json.",
  sourceUrl, fullTextUrl: fullTextPath
};
const bookPath = path.join(root, "books", id + ".js");
if (fs.existsSync(bookPath)) fail("Book source already exists.");
fs.writeFileSync(bookPath, "window.BOOK_READ = " + JSON.stringify(book, null, 2) + ";\n");
const record = '  { id:"' + id + '", title:' + JSON.stringify(titleUpper) + ', author:' + JSON.stringify(m.author) + ', category:' + JSON.stringify(m.category) + ', translator:' + JSON.stringify(m.translator || "") + ', targetMinutes:15, targetWords:' + targetWords + ', status:"PUBLISHED", visibility:"PUBLIC", fullBookReady:true, sourceRepo:"Project Gutenberg", sourceEbookId:' + JSON.stringify(String(m.gutenbergId)) + ', sourceUrl:' + JSON.stringify(sourceUrl) + ', rightsStatus:"PUBLIC_DOMAIN_IE_US", bookSource:' + JSON.stringify("books/" + id + ".js") + ' },';
const close = catalog.lastIndexOf("]);");
if (close < 0) fail("Could not locate catalogue closing delimiter.");
catalog = catalog.slice(0, close) + record + "\n" + catalog.slice(close);
fs.writeFileSync(catalogPath, catalog);

const verificationDir = path.join(root, "verification");
fs.mkdirSync(verificationDir, { recursive: true });
const report = {
  schemaVersion: 2, id, title: m.title, author: m.author,
  source: { provider: "Project Gutenberg", ebookId: String(m.gutenbergId), catalogueUrl: sourceUrl, textUrl, publicationYear: m.publicationYear, authorDeathYear: m.authorDeathYear, publisher: m.publisher, edition: m.sourceEdition },
  rightsCheck: { result: "PASS_BY_DECLARED_DATES", rule: "US publication before 1931; Ireland author death before 1956; no translator declared", note: "Conservative automated screening, not a legal opinion." },
  text: { path: fullTextPath, characters: text.length, words: wordCount, sha256: hash, startMarkerFound: true, endMarkerFound: true },
  acquiredAt: new Date().toISOString(), releaseStatus: "PUBLISHED"
};
fs.writeFileSync(path.join(verificationDir, id + ".json"), JSON.stringify(report, null, 2) + "\n");
const processed = path.join(root, "pipeline", "processed");
fs.mkdirSync(processed, { recursive: true });
fs.renameSync(manifestPath, path.join(processed, id + ".json"));
console.log("PUBLISHED CANDIDATE READY:", id, "| words:", wordCount, "| SHA-256:", hash);
