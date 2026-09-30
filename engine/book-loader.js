/**
 * CICAN book loader.
 * The catalog is the discovery source; book records remain separate content assets.
 */

import { CATALOG, findCatalogBook } from "../catalog/index.js";

export const BOOK_SOURCES = Object.freeze(
  Object.fromEntries(CATALOG.map(book => [book.id, book.bookSource]))
);

export function getBookSource(bookId) {
  return BOOK_SOURCES[bookId] || null;
}

export function isPublishedBook(bookId) {
  const record = getCatalogRecord(bookId);
  return !!record && (!record.status || record.status === "PUBLISHED");
}

/*
 * Experience loading is intentionally separate from publication status.
 * A catalog entry may be playable during CICAN development/review without
 * being marked PUBLISHED. This does not change, or imply, rights clearance.
 */
export function isExperienceBook(bookId) {
  const record = getCatalogRecord(bookId);
  return !!record && !!record.bookSource;
}

export function getCatalogRecord(bookId) {
  return findCatalogBook(bookId);
}

function normalizeReaderSource(sourceText) {
  let text = String(sourceText || "").replace(/\r\n/g, "\n");

  const startMarker = text.indexOf("*** START OF THE PROJECT GUTENBERG EBOOK");
  const endMarker = text.indexOf("*** END OF THE PROJECT GUTENBERG EBOOK");

  if (startMarker >= 0 && endMarker > startMarker) {
    text = text
      .slice(text.indexOf("\n", startMarker) + 1, endMarker)
      .trim();
  }

  return text.trim();
}

function selectFifteenMinuteText(sourceText, targetWords, startMarker = "") {
  let normalized = normalizeReaderSource(sourceText);
  if (!normalized) return "";

  const marker = String(startMarker || "").trim();
  if (marker) {
    const markerIndex = normalized.indexOf(marker);
    if (markerIndex >= 0) {
      normalized = normalized.slice(markerIndex).trim();
    }
  }

  const limit = Math.max(1, Number(targetWords) || 2700);
  const words = [...normalized.matchAll(/\S+/g)];

  if (words.length <= limit) return normalized;

  const lastWord = words[limit - 1];
  return normalized.slice(0, lastWord.index + lastWord[0].length).trim();
}

async function prepareFifteenMinuteSource(book) {
  if (!book || book.fifteenMinuteText) return book;

  if (book.fullText && String(book.fullText).trim()) {
    book.fifteenMinuteText =
      selectFifteenMinuteText(
        book.fullText,
        book.targetWords,
        book.fifteenMinuteStartMarker
      );
    return book;
  }

  if (!book.fullTextUrl) return book;

  const response = await fetch(
    new URL(book.fullTextUrl, document.baseURI).href,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Could not load complete source for 15-minute reader: " + book.id);
  }

  const sourceText = await response.text();

  if (sourceText.trim().length < 1000) {
    throw new Error("Complete source is unexpectedly short for " + book.id);
  }

  const normalized = normalizeReaderSource(sourceText);

  if (!normalized) {
    throw new Error("Complete source is empty after normalization for " + book.id);
  }

  book.fifteenMinuteText =
    selectFifteenMinuteText(
    normalized,
    book.targetWords,
    book.fifteenMinuteStartMarker
  );

  return book;
}

export async function loadBook(bookId) {
  const src = getBookSource(bookId);

  if (!isExperienceBook(bookId)) {
    throw new Error("Book is not available for the CICAN experience: " + bookId);
  }

  if (!src) {
    throw new Error("Unknown CICAN book: " + bookId);
  }

  window.BOOK_READ = null;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src + "?cican_book=" + Date.now();
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load book: " + bookId));
    document.head.appendChild(script);
  });

  if (!window.BOOK_READ) {
    throw new Error("Book did not provide BOOK_READ: " + bookId);
  }

  const book = {
    id: bookId,
    ...window.BOOK_READ
  };

  /*
   * Resolve the calibrated 15-minute source before the reader opens.
   * fullTextUrl is a location only; never treat the path string as text.
   */
  try {
    await prepareFifteenMinuteSource(book);
  } catch (error) {
    if (book.readerSourceStatus === "SOURCE_READY") {
      throw error;
    }
  }

  return book;
}

export function validateBook(book) {
  const required = [
    "title",
    "author",
    "category",
    "targetMinutes",
    "targetWords",
    "sourceEdition",
    "sourceNote",
    "sourceUrl"
  ];

  const missing = required.filter(
    key => book == null || book[key] === undefined || book[key] === null || book[key] === ""
  );

  const hasReaderSource =
    (book && String(book.text || "").trim()) ||
    (book && String(book.fifteenMinuteText || "").trim()) ||
    (book && String(book.fullText || "").trim()) ||
    (book && String(book.fullTextUrl || "").trim());

  if (!hasReaderSource) {
    missing.push("reader source");
  }

  if (missing.length) {
    throw new Error(
      "CICAN book validation failed. Missing: " + missing.join(", ")
    );
  }

  if (!Number.isFinite(Number(book.targetMinutes)) || Number(book.targetMinutes) <= 0) {
    throw new Error("Invalid targetMinutes for " + book.title);
  }

  if (!Number.isFinite(Number(book.targetWords)) || Number(book.targetWords) <= 0) {
    throw new Error("Invalid targetWords for " + book.title);
  }

  const catalog = getCatalogRecord(book.id);
  if (!catalog) {
    throw new Error("Book is missing from CICAN catalog: " + book.id);
  }

  if (catalog.title !== String(book.title).toUpperCase()) {
    throw new Error("Catalog title mismatch for " + book.id);
  }

  if (catalog.author && !String(book.author).toLowerCase().includes(catalog.author.toLowerCase())) {
    throw new Error("Catalog author mismatch for " + book.id);
  }

  if (catalog.status === "PUBLISHED" && catalog.fullTextUrl) {
    // Full-text existence is checked by catalog QA; runtime keeps the loader lightweight.
  }

  return true;
}

export { CATALOG };
