/*
 * CICAN BOOKS V2 — edition pagination registry.
 *
 * Page counts are intentionally NOT guessed.
 * Each entry must identify the exact edition/witness before PAGE X / Y
 * is enabled in the reader.
 */
export const EDITION_PAGINATION = Object.freeze({
  "dhammapada": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #2017" },
  "tao-te-ching": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #216 — James Legge" },
  "the-republic": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #55201 — Jowett, 1888/1908 witness" },
  "meditations": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #2680 — Meric Casaubon" },
  "walden": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #205" },
  "thus-spake-zarathustra": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #1998 — Thomas Common" },
  "frankenstein": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #41445 — 1818 photo-reprint witness" },
  "dracula": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #345 — Grosset & Dunlap witness" },
  "the-great-gatsby": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #64317 — Standard Ebooks / PGA witness" },
  "nineteen-eighty-four": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg Australia #0100021" },
  "moby-dick": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #2701" },
  "pride-and-prejudice": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #42671 — Chapman, 1813 witness" },
  "alice-adventures-in-wonderland": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #11" },
  "adventures-of-sherlock-holmes": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #48320" },
  "crime-and-punishment": { type:"RESEARCH_REQUIRED", source:"Project Gutenberg #2554 — Constance Garnett" }
});

export function getEditionPagination(bookId) {
  return EDITION_PAGINATION[bookId] || null;
}
