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

export function getCatalogRecord(bookId) {
  return findCatalogBook(bookId);
}

export async function loadBook(bookId) {
  const src = getBookSource(bookId);

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

  return {
    id: bookId,
    ...window.BOOK_READ
  };
}

export function validateBook(book) {
  const required = [
    "title",
    "author",
    "category",
    "targetMinutes",
    "targetWords",
    "text",
    "sourceEdition",
    "sourceNote",
    "sourceUrl"
  ];

  const missing = required.filter(
    key => book == null || book[key] === undefined || book[key] === null || book[key] === ""
  );

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

  return true;
}

export { CATALOG };
