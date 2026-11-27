# CICAN BOOKS — BOOK AUTOPILOT

## Purpose
The website, reader, and reader mechanics are locked. Normal production work is books-only.
The autopilot may discover, verify, prepare, test, and publish books, but it must never modify the locked reader engine, reader UX, or landing-page mechanics as part of normal book intake.

## Production pipeline
DISCOVER → VERIFY → SOURCE → STRUCTURE → CALIBRATE → BUILD → QA → PUBLISH → LOCK CHECKPOINT → NEXT BOOK

### Discovery
- Prefer established public-domain sources, especially Project Gutenberg and equivalent authoritative archives.
- Prefer historically important, complete works.
- Avoid duplicates already PUBLIC or DRAFT.
- Keep a candidate queue rather than publishing the first result found.

### Verification
- Verify exact title and author.
- Verify edition/translation where applicable.
- Verify source identity and stable source URL.
- Verify complete text availability.
- Verify public-domain status in the relevant jurisdiction.
- Verify translator/editor rights when applicable.
- If rights are uncertain, do not publish.

### Source integrity
- Use the complete source text, not a summary or excerpt.
- Preserve the source faithfully.
- Remove only repository/transport wrappers or other non-book artifacts.
- Record source URL and identifier.

### Structure
Check title page/work identity, author, translator, parts/books/chapters/sections, opening, ending, missing sections, and accidental duplication.
An ambiguous source is rejected rather than forcing the locked reader to accommodate it.

### CICAN calibration
- Target: 15 minutes.
- Practical target: 2,400–3,000 words.
- Canonical reader speed: 100 WPM.
The complete work is the source of truth. targetWords describes the CICAN experience and is not permission to truncate the source.

### Build
Only add the new book source, catalog record, metadata, and verification data.
Do not alter reader mechanics, controls, fullscreen, resume behavior, landing-page mechanics, or shared engine code to make a book fit.

### QA
Every candidate must pass catalog validation, source validation, complete-text checks, target-range checks, browser reader QA, saved-position/resume QA, autoplay/timer QA, forbidden-word checks, and engine/UX regression checks.

### Publish
Only a candidate that passes every gate may become PUBLIC. Failed or uncertain candidates remain DRAFT.

### Lock checkpoint
After a successful publication batch, create a new baseline branch named locked-books-YYYY-MM-DD. The branch records the exact published catalog state.

## Golden rules
1. Quality before quantity.
2. Never invent bibliographic facts.
3. Never silently substitute an edition or translation.
4. Never publish when rights are uncertain.
5. Never modify the locked engine to make a book fit.
6. Never promote a book that fails QA.
7. If uncertain, stop that book and continue with the next candidate.

## Continue protocol
When the user says Continue, continue the books-only pipeline from the current checkpoint: select the next strongest candidate, verify it, prepare it without changing the locked engine, run the complete QA gate, publish only if all gates pass, report exactly what was added and verified, then prepare the next candidate.
The word Continue must never be interpreted as permission to redesign the locked reader or website.

## Mandatory exact-source gate
Before a book can become PUBLIC, the autopilot must deterministically compare the local complete text against the selected authoritative plain-text source for the exact edition/translation.

The comparison must:
- retrieve the authoritative text from a stable raw-text endpoint;
- remove only documented transport wrappers (for example Project Gutenberg's outer envelope and repository-only markers);
- preserve the actual book's words, punctuation, headings, paragraph breaks, and section order;
- compare the normalized texts exactly;
- report the first mismatch and both normalized SHA-256 hashes when they differ;
- record the authoritative text URL and normalized hash for the verification record;
- fail closed when an authoritative text endpoint cannot be established.

A title/author/source-page check is not sufficient. A book is not PUBLIC until exact source comparison passes.


## Implemented publishing engine (2026-11-27)

A new workflow, `.github/workflows/cican-publish-engine.yml`, and validator, `qa/publish-verified-book.mjs`, implement a fail-closed release path. Prepared candidate manifests are placed in `pipeline/inbox/<id>.json`; the complete text asset is placed at `fulltext/<id>.txt`. Adding a candidate manifest to the inbox on main automatically starts the publisher. The workflow checks edition evidence, reviewer attestations for page-by-page fidelity and rights in Ireland and the United States, complete-book structure, and an exact normalized SHA-256 match between the local asset and the declared HTTPS text source. It then generates the existing BOOK_READ format, adds a PUBLIC catalogue entry, writes an auditable verification report, archives the manifest, runs repository QA and browser reader QA, and commits only on success.

This engine does not use or invoke the legacy `book-autopilot-gate.yml`. It does not alter the reader, landing page, cover renderer or shared engine. Discovery, acquisition, source identity, scan comparison and legal assessment still require evidence-led preparation; a workflow cannot infer these facts merely from a URL. A failed candidate remains in the inbox and is not published.
