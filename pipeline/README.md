# CICAN Books — Verified Original Book Publisher

This is a new, fail-closed publishing pipeline. It does not modify the reader, landing page, shared engine, cover renderer, or the legacy Autopilot Gate.

## Intake

1. Prepare an original-edition full-text asset at `fulltext/<id>.txt`.
2. Add `pipeline/inbox/<id>.json` using `pipeline/CANDIDATE-TEMPLATE.json`.
3. Establish the exact edition using the original title page / authoritative catalogue and scan.
4. A reviewer must attest that every page was compared, the transcription preserves punctuation/paragraphs/headings and all included matter, and the complete opening and ending are present.
5. Add evidence-based rights clearance for both Ireland and the United States. Uncertain rights remain on hold.
6. Set `expectedSha256` to the SHA-256 of the full-text asset after only UTF-8 BOM removal and CRLF-to-LF newline normalization. The remote text endpoint must resolve to the same exact edition and produce the same normalized hash.

## Publish

Run GitHub Actions → **CICAN Books — Verified Original Book Publisher** → Run workflow. Enter the candidate ID.

The workflow fails closed unless:
- the candidate ID is valid and not already in the catalogue;
- the original edition evidence exists;
- every page in the scan is recorded as compared;
- complete-book structure and transcription checks pass;
- rights evidence covers IE and US;
- local full text matches the declared SHA-256;
- the HTTPS authoritative text endpoint returns exactly the same normalized text;
- existing repository QA and browser reader QA pass.

On success it generates the book source in the existing `window.BOOK_READ` format, appends a PUBLIC catalogue record, writes an auditable `verification/<id>.json`, archives the manifest under `pipeline/processed/`, then commits to main. Existing push workflows handle Pages deployment and deployment smoke tests.

## Important limits

- The workflow does not discover books autonomously or decide copyright law. Research and evidence collection are part of candidate preparation.
- Page-by-page comparison and rights clearance are explicit reviewer attestations, not magically inferred from a URL.
- The exact text endpoint must represent the same edition as the scan. If a scan has no reliable matching text endpoint, the candidate remains on hold until a faithful transcription is prepared and reviewed.
- No source, rights or completeness failure is bypassed just to meet a one-book-per-CONTINUE target.
- The legacy `book-autopilot-gate.yml` is not invoked or reused.

## Paths

- `pipeline/inbox/`: prepared candidates awaiting publication
- `pipeline/processed/`: manifests for successfully published books
- `fulltext/`: complete text assets
- `verification/`: per-book evidence reports
- `qa/publish-verified-book.mjs`: fail-closed validation and book/catalog generation
