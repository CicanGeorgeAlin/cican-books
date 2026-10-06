import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

export function sourceTextUrl(record) {
  if (record.sourceRepo === "Project Gutenberg Australia") return record.sourceUrl;
  if (record.sourceRepo === "Project Gutenberg" && /^\d+$/.test(record.sourceId)) {
    return "https://www.gutenberg.org/cache/epub/" + record.sourceId + "/pg" + record.sourceId + ".txt";
  }
  return null;
}

export function normalizeSourceText(value) {
  let text = String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  text = text.replace(/^---BEGIN AUTHOR TEXT---\s*\n?/m, "");
  text = text.replace(/\n?---END AUTHOR TEXT---\s*$/m, "");
  const start = text.match(/\*\*\* START OF (?:THE )?PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i);
  if (start) text = text.slice(start.index + start[0].length);
  const end = text.search(/\*\*\* END OF (?:THE )?PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i);
  if (end >= 0) text = text.slice(0, end);
  return text.split("\n").map(line => line.replace(/[ \t]+$/g, "")).join("\n").trim();
}

function loadBook(root, record) {
  const filename = path.join(root, record.source);
  const code = fs.readFileSync(filename, "utf8");
  const window = {};
  vm.runInNewContext(code, { window }, { filename });
  if (!window.BOOK_READ || typeof window.BOOK_READ.fullText !== "string") {
    throw new Error("BOOK_READ.fullText missing: " + record.id);
  }
  return window.BOOK_READ;
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function firstDifference(a, b) {
  let i = 0;
  const limit = Math.min(a.length, b.length);
  while (i < limit && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  if (i === a.length && i === b.length) return null;
  const context = (text, at) => text.slice(Math.max(0, at - 80), Math.min(text.length, at + 120)).replace(/\n/g, "\\n");
  return { index: i, local: context(a, i), authoritative: context(b, i) };
}

export async function verifySourceIntegrity({ root, record }) {
  const url = sourceTextUrl(record);
  if (!url) throw new Error("No deterministic authoritative text URL: " + record.id);

  const book = loadBook(root, record);
  const response = await fetch(url, {
    headers: { "User-Agent": "CICAN-Books-Autopilot/1.0" }
  });
  if (!response.ok) throw new Error("Authoritative source HTTP " + response.status + ": " + url);

  const localText = normalizeSourceText(book.fullText);
  const sourceText = normalizeSourceText(await response.text());
  const localHash = sha256(localText);
  const sourceHash = sha256(sourceText);

  if (localHash !== sourceHash) {
    const diff = firstDifference(localText, sourceText);
    throw new Error(
      "EXACT SOURCE MISMATCH: " + record.id +
      " | first mismatch: " + (diff ? diff.index : "unknown") +
      " | local SHA-256: " + localHash +
      " | source SHA-256: " + sourceHash +
      " | local: " + (diff ? diff.local : "") +
      " | authoritative: " + (diff ? diff.authoritative : "")
    );
  }

  return { url, sha256: localHash, characters: localText.length };
}
