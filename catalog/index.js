/**
 * CICAN catalog index.
 * The catalog is the single discovery source for the Library UI.
 * Book content remains in books/*.js and is loaded only when a reader opens a title.
 */

export const CATALOG_VERSION = 1;

export const CATALOG = Object.freeze([
  { id:"dhammapada", title:"THE DHAMMAPADA", author:"F. Max Müller", category:"Buddhism", translator:"F. Max Müller", targetMinutes:15, bookSource:"books/dhammapada.js" },
  { id:"tao-te-ching", title:"TAO TE CHING", author:"Laozi", category:"Taoism", translator:"James Legge", targetMinutes:15, bookSource:"books/tao-te-ching.js" },
  { id:"the-republic", title:"THE REPUBLIC", author:"Plato", category:"Philosophy", translator:"Benjamin Jowett", targetMinutes:15, bookSource:"books/the-republic.js" },
  { id:"meditations", title:"MEDITATIONS", author:"Marcus Aurelius", category:"Philosophy", translator:"", targetMinutes:15, bookSource:"books/meditations.js" },
  { id:"walden", title:"WALDEN", author:"Henry David Thoreau", category:"Nature", translator:"", targetMinutes:15, bookSource:"books/walden.js" },
  { id:"thus-spake-zarathustra", title:"THUS SPAKE ZARATHUSTRA", author:"Friedrich Nietzsche", category:"Philosophy", translator:"Thomas Common", targetMinutes:15, bookSource:"books/thus-spake-zarathustra.js" },
  { id:"frankenstein", title:"FRANKENSTEIN", author:"Mary Shelley", category:"Classic Fiction", translator:"", targetMinutes:15, status:"CONTENT_REVIEW", bookSource:"books/frankenstein.js" },
  { id:"dracula", title:"DRACULA", author:"Bram Stoker", category:"Classic Fiction", translator:"", targetMinutes:15, bookSource:"books/dracula.js" },
  { id:"the-great-gatsby", title:"THE GREAT GATSBY", author:"F. Scott Fitzgerald", category:"Classic Fiction", translator:"", targetMinutes:15, status:"CONTENT_REVIEW", bookSource:"books/the-great-gatsby.js" },
  { id:"nineteen-eighty-four", title:"NINETEEN EIGHTY-FOUR", author:"George Orwell", category:"Classic Fiction", translator:"", targetMinutes:15, status:"CONTENT_REVIEW", bookSource:"books/nineteen-eighty-four.js" }
]);

export function findCatalogBook(id) {
  return CATALOG.find(book => book.id === id) || null;
}
