# CICAN Books Publishing Engine — Version Record

## Hardening update
- **Name:** CICAN Books — Token-Free Publishing and Post-Publish Verification
- **Version:** 1.0.2-token-free
- **Recorded:** 2026-11-27
- **Implementation commits:** f073dd8853653e410ee7837533104d1d26793968, 8d059252dd185a92cc6951538e232b4493bc22c1, a687021e7da171ea42fb446ae62ae907c5d13a8e, f58ab6754408a6202b9ca41452d9edad8f775911
- **Status:** IMPLEMENTED — NOT CERTIFIED FOR AUTOMATIC PUBLISHING

### Changes in 1.0.2
1. Removed the mandatory `CICAN_PUBLISH_TOKEN` secret and explicit personal-token checkout requirement. The publisher uses the standard repository-provided GitHub Actions token.
2. Added a post-publisher `workflow_run` trigger for repository QA, so validation and browser tests can run after the publisher has committed its output, even when the commit was created by the Actions token.
3. Added a post-publisher `workflow_run` trigger for the live deployment smoke test.
4. Corrected the smoke test to resolve the current published `main` commit and require a Pages deployment for that exact SHA before testing the live site.
5. Rewrote the pipeline documentation to distinguish machine-verifiable checks from human review attestations and to state what is not yet automated.

### What this version does not claim
- It does not autonomously discover and research books from A to Z.
- A matching SHA-256 proves equality between two text payloads; it does not prove that the transcription matches every page of the original scan.
- A manifest cannot prove that a human actually performed page-by-page comparison or legal review. Such attestations must be genuine and auditable.
- The GitHub Actions token's ability to publish a new commit and the subsequent Pages deployment still require a successful end-to-end run. This version has not yet demonstrated that.
- No new book is certified as published by this change.

## Locked publishing principles
FIND → VERIFY → COPY COMPLETE TEXT → ADD BOOK → DEPLOY → FAST WEBSITE TEST → NEXT BOOK.

One CONTINUE targets one eligible book. Failed candidates remain unpublished. Never invent source facts, rights evidence, or human review attestations. Protect the existing reader, landing page, saved reading experience and catalogue integrity.

## Approval rule
Do not certify the engine until a genuine candidate passes original-edition research, complete-text acquisition, source-to-scan fidelity review, Ireland and US rights review, repository QA, publication, exact-SHA Pages deployment and live-reader smoke testing.
