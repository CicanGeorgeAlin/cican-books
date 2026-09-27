/**
 * CICAN catalog index.
 * The catalog is the single discovery source for the Library UI.
 * Book content remains in books/*.js and is loaded only when a reader opens a title.
 */

export const CATALOG_VERSION = 3;

export const CATALOG_STATUS = Object.freeze({
  PUBLISHED: "PUBLISHED",
  CONTENT_REVIEW: "CONTENT_REVIEW",
  RIGHTS_REVIEW: "RIGHTS_REVIEW",
  DRAFT: "DRAFT"
});

export const CATALOG = Object.freeze([
  { id:"dhammapada", title:"THE DHAMMAPADA", author:"F. Max Müller", category:"Buddhism", translator:"F. Max Müller", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"2017", sourceUrl:"https://www.gutenberg.org/ebooks/2017", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/dhammapada.js" },
  { id:"tao-te-ching", title:"TAO TE CHING", author:"Laozi", category:"Taoism", translator:"James Legge", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"216", sourceUrl:"https://www.gutenberg.org/ebooks/216", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/tao-te-ching.js" },
  { id:"the-republic", title:"THE REPUBLIC", author:"Plato", category:"Philosophy", translator:"Benjamin Jowett", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"1497", sourceUrl:"https://www.gutenberg.org/ebooks/1497", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/the-republic.js" },
  { id:"meditations", title:"MEDITATIONS", author:"Marcus Aurelius", category:"Philosophy", translator:"", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"2680", sourceUrl:"https://www.gutenberg.org/ebooks/2680", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/meditations.js" },
  { id:"walden", title:"WALDEN", author:"Henry David Thoreau", category:"Nature", translator:"", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"205", sourceUrl:"https://www.gutenberg.org/ebooks/205", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/walden.js" },
  { id:"thus-spake-zarathustra", title:"THUS SPAKE ZARATHUSTRA", author:"Friedrich Nietzsche", category:"Philosophy", translator:"Thomas Common", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"1998", sourceUrl:"https://www.gutenberg.org/ebooks/1998", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/thus-spake-zarathustra.js" },
  { id:"frankenstein", title:"FRANKENSTEIN", author:"Mary Shelley", category:"Classic Fiction", translator:"", targetMinutes:15, status:"CONTENT_REVIEW", bookSource:"books/frankenstein.js" },
  { id:"dracula", title:"DRACULA", author:"Bram Stoker", category:"Classic Fiction", translator:"", targetMinutes:15, status:"RIGHTS_REVIEW", sourceRepo:"Project Gutenberg", sourceEbookId:"345", sourceUrl:"https://www.gutenberg.org/ebooks/345", rightsStatus:"TERRITORIAL_REVIEW_REQUIRED", bookSource:"books/dracula.js" },
  { id:"the-great-gatsby", title:"THE GREAT GATSBY", author:"F. Scott Fitzgerald", category:"Classic Fiction", translator:"", targetMinutes:15, status:"CONTENT_REVIEW", bookSource:"books/the-great-gatsby.js" },
  { id:"nineteen-eighty-four", title:"NINETEEN EIGHTY-FOUR", author:"George Orwell", category:"Classic Fiction", translator:"", targetMinutes:15, status:"CONTENT_REVIEW", bookSource:"books/nineteen-eighty-four.js" }
]);

export function findCatalogBook(id) {
  return CATALOG.find(book => book.id === id) || null;
}

export function getPublishedCatalog() {
  return CATALOG.filter(book => !book.status || book.status === CATALOG_STATUS.PUBLISHED);
}

export function getCatalogByStatus(status) {
  return CATALOG.filter(book => (book.status || CATALOG_STATUS.PUBLISHED) === status);
}

export function searchCatalog(query, { publishedOnly = true } = {}) {
  const q = String(query || "").trim().toLowerCase();
  const source = publishedOnly ? getPublishedCatalog() : CATALOG;
  if (!q) return source.slice();

  return source.filter(book =>
    [book.title, book.author, book.category, book.translator]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
