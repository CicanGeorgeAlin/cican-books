/**
 * CICAN book loader.
 * Book data stays separate from reader/game code.
 */

const BOOK_SOURCES = Object.freeze({
  "dhammapada": "books/dhammapada.js",
  "tao-te-ching": "books/tao-te-ching.js",
  "the-republic": "books/the-republic.js",
  "meditations": "books/meditations.js",
  "walden": "books/walden.js",
  "thus-spake-zarathustra": "books/thus-spake-zarathustra.js",
  "frankenstein": "books/frankenstein.js",
  "dracula": "books/dracula.js",
  "the-great-gatsby": "books/the-great-gatsby.js",
  "nineteen-eighty-four": "books/nineteen-eighty-four.js"
});

export function getBookSource(bookId) {
  return BOOK_SOURCES[bookId] || null;
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

  return true;
}

export { BOOK_SOURCES };
