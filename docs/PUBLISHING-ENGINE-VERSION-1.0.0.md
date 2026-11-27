# CICAN Books Publishing Engine — Version Record

## Named baseline
- **Name:** CICAN Books Publishing Engine — Foundation Baseline
- **Version:** 1.0.0-foundation
- **Status:** IMPLEMENTED — NOT CERTIFIED FOR AUTOMATIC PUBLISHING
- **Recorded:** 2026-11-27
- **Branch:** main
- **Baseline commit at record time:** 709950d641dcdecb864ac0f8e690f1680a9b6f27

This is a recovery reference, not a claim of end-to-end production readiness.

## Components
- `.github/workflows/cican-publish-engine.yml`: candidate-triggered/manual publisher.
- `qa/publish-verified-book.mjs`: candidate, edition, rights, fidelity, hash and catalogue checks.
- `pipeline/CANDIDATE-TEMPLATE.json` and `pipeline/README.md`: intake format and instructions.
- `.github/workflows/qa.yml`: repository and browser QA.
- `.github/workflows/book-deployment-smoke-test.yml`: live reader smoke test.
- GitHub Pages deployment workflow.

## Locked publishing principles
FIND → VERIFY → COPY COMPLETE TEXT → ADD BOOK → DEPLOY → FAST WEBSITE TEST → NEXT BOOK.

Each CONTINUE is intended to publish one new eligible book. Failed candidates must be held. Never fabricate missing text, rights evidence, original-edition evidence, or human page-by-page review. Protect existing reader behavior, landing-page design, catalogue compatibility and saved reading experience.

## Verification state at record time
Latest observed main commit: `709950d641dcdecb864ac0f8e690f1680a9b6f27`.

Latest observed QA run #339, Pages deployment #1181, and smoke test #237 were queued, not passed. The candidate inbox was absent/empty. No successful end-to-end new-book publication had been demonstrated.

## Known blockers
1. Publisher pushes use the default Actions token. Downstream push workflows may not run on commits made with `GITHUB_TOKEN`; a properly scoped GitHub App or fine-grained token is needed if automatic downstream triggers are required.
2. Smoke-test deployment lookup must be tied to the exact `GITHUB_SHA`, not simply the newest Pages deployment.
3. Infrastructure checks must pass on one current main commit.
4. A genuine candidate must pass evidence review, publisher validation, publication, deployment and live-reader testing.

## Recovery rule
Use this named baseline and baseline commit as the comparison reference if a later change breaks the engine. Do not silently roll back unrelated book, catalogue, reader or design work.

**Approval rule:** This baseline does not authorize unattended automatic publishing. Approval requires successful infrastructure checks and a controlled real-candidate end-to-end test.
