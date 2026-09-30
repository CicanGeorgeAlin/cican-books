# CICAN — PLAY THE BOOK
## Source Integrity Manifest

Generated for the 12-book catalog.

This manifest identifies the exact repository full-text asset currently associated with each book. The fingerprint below is the **Git blob SHA** for the tracked source file; it is not a SHA-256 digest. A change to the source asset changes its Git blob fingerprint and should trigger source QA.

| Book | Source asset | Edition / source | Git blob SHA | Status |
|---|---|---|---|---|
| Dhammapada | fulltext/dhammapada.txt | The Sacred Books of the East, Volume X, Part I — F. Max Müller | 6b69cfe7aebbf68e29e86376f0d10d7e13899294 | SOURCE_READY |
| Tao Te Ching | fulltext/tao-te-ching.txt | The Texts of Taoism, The Sacred Books of the East, Volume XXXIX | 59d259a6b6e763367821881dcd5fc0a8313435de | SOURCE_READY |
| The Republic | fulltext/the-republic.txt | Project Gutenberg #55201 | 3a820d33ce86abe09e7b9c5c19fa2a175249d2c4 | SOURCE_READY |
| Meditations | fulltext/meditations.txt | Project Gutenberg #2680 — Meric Casaubon translation | 1dd49de7ef53f4b41cee37595b49efd3f8caca11 | SOURCE_READY |
| Walden | fulltext/walden.txt | Project Gutenberg #205 | b77e6ab7c131753ea2afac9adca2fb633c606d40 | SOURCE_READY |
| Thus Spake Zarathustra | fulltext/thus-spake-zarathustra.txt | Project Gutenberg #1998 | cae4231f6fff2048902f31b44923259efb821933 | SOURCE_READY |
| Frankenstein | fulltext/frankenstein.txt | Project Gutenberg #41445 — 1818 edition | a5bf5dd0e5d5511a4cb88f49237186615530f2f5 | SOURCE_READY |
| Dracula | fulltext/dracula.txt | Project Gutenberg #345 — 1897 text | 1e719b973cfd072c0bf1ae17f6a4801d45ff5091 | SOURCE_READY |
| The Great Gatsby | fulltext/the-great-gatsby.txt | Project Gutenberg #64317 — 1925 text | fbb792ee7a7f5b66a8d3c55517c337457fcabb74 | SOURCE_READY |
| Nineteen Eighty-Four | fulltext/nineteen-eighty-four.txt | Project Gutenberg Australia eBook 0100021 | 8c92fb6d0560920c938ed16db758a031382a07e5 | SOURCE_READY* |
| Moby Dick | fulltext/moby-dick.txt | Project Gutenberg #2701 | 32088c711f50a77ff687dde60c2bac2952f42e6d | SOURCE_READY* |
| Pride and Prejudice | fulltext/pride-and-prejudice.txt | Project Gutenberg #42671 — 1813 text; R. W. Chapman edited source | b7fca83bc37b24bebf46b8b2e30525b66c11113c | SOURCE_READY |

### Interpretation

- **SOURCE_READY** means the application has a declared complete local source asset for the configured edition and the reader QA accepts it.
- **SOURCE_READY*** means the source asset is complete and locally available, but territorial/publication-rights review remains relevant. Source completeness is not a legal-rights clearance statement.
- `fullTextUrl` is treated as a source-file location, not as reader text.
- The 15-minute reader is a calibrated window extracted from the declared complete source.
- FULL BOOK is intended to expose the complete local source asset for that declared edition.
- This manifest does not claim that the text is identical to every physical or digital edition of the same title. Different editions and translations can legitimately differ.

### Change-control rule

If a tracked `fulltext/*.txt` file changes, its Git blob SHA changes. The source should then be revalidated before release. The canonical CICAN game mechanics and book-specific identity layer must not be modified merely because a source asset changes.

Generated: 2026-09-30
