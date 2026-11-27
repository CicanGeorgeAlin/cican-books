# CICAN Books — Verified Original Book Publisher

This pipeline is a **fail-closed publication validator**, not an autonomous copyright lawyer or a substitute for source research. It preserves the existing reader, landing page, shared engine, cover renderer and legacy Autopilot Gate.

## Token-free execution

The publisher now uses the repository-provided `GITHUB_TOKEN` through the standard checkout action. No personal access token and no `CICAN_PUBLISH_TOKEN` secret are required.

1. Prepare one candidate manifest at `pipeline/inbox/<id>.json` and its complete text at `fulltext/<id>.txt`.
2. Commit those files to `main` (or use the publisher's manual workflow dispatch with the candidate ID).
3. The publisher validates the manifest, original-edition evidence, rights evidence, full-text hashes and required review attestations.
4. It runs repository QA and browser reader tests before committing the new book and verification record.
5. After the publisher completes successfully, the QA and deployment smoke-test workflows are also triggered through `workflow_run`. The smoke test resolves the current published `main` commit, waits for a successful Pages deployment for that exact SHA, then tests the live library and every PUBLIC book in Chromium.

## What the engine actually verifies

- Candidate ID, required fields, HTTPS evidence URLs and duplicate catalogue IDs.
- The full-text asset exists, is non-trivial, and matches its declared SHA-256 after transport normalization.
- The authoritative text endpoint returns the same normalized bytes and hash.
- The candidate manifest contains explicit original-edition, rights, complete-structure and page-by-page review attestations.
- Repository validation and browser tests pass before the publisher commits.

**Important distinction:** a matching text hash proves the local text matches the remote text endpoint. It does not prove that the endpoint matches every page of the original scan. The publisher also cannot independently prove that a human actually completed page-by-page comparison or legal review. Those remain genuine reviewer responsibilities; never mark them PASS unless they were actually completed and documented. A candidate with missing or uncertain evidence must remain on hold.

## Current limits

- Candidate discovery, archival research, source acquisition, transcription correction and rights analysis are not yet fully automated end-to-end.
- Machine OCR must not be described as proofread transcription.
- A public-domain conclusion must be supported for both Ireland and the United States and must account for the exact edition, translator, editor and other separately protected material.
- One book per CONTINUE is a target, never a reason to bypass a failed check.
- No new book is considered published until the publisher, post-publish QA, Pages deployment and live reader smoke test all pass.

## Paths

- `pipeline/inbox/`: prepared candidates awaiting publication
- `pipeline/processed/`: manifests for successfully published books
- `fulltext/`: complete text assets
- `verification/`: per-book evidence reports
- `qa/publish-verified-book.mjs`: fail-closed validation and book/catalog generation
