# CICAN Books Publishing Engine — Version Record

## Named baseline
- **Name:** CICAN Books — Foundation Baseline
- **Version:** 1.0.0-foundation
- **Recorded:** 2026-11-27
- **Baseline commit:** 709950d641dcdecb864ac0f8e690f1680a9b6f27

## Hardening update
- **Name:** CICAN Books — Publishing Readiness Hardening
- **Version:** 1.0.1-readiness
- **Recorded:** 2026-11-27
- **Commit:** 839cd045c17f234b490f99b15df2e2508909df63
- **Status:** IMPLEMENTED — NOT CERTIFIED FOR AUTOMATIC PUBLISHING

### Changes in 1.0.1
1. The live deployment smoke test now searches for a GitHub Pages deployment whose SHA exactly matches the commit being tested. An older deployment can no longer satisfy the deployment gate.
2. The publisher workflow now requires the repository secret `CICAN_PUBLISH_TOKEN` and uses it for checkout/push, so a successful publication commit can trigger downstream push workflows. This secret has not yet been configured or verified.
3. No reader, landing page, catalogue content or book text was intentionally changed by this hardening update.

## Locked publishing principles
FIND → VERIFY → COPY COMPLETE TEXT → ADD BOOK → DEPLOY → FAST WEBSITE TEST → NEXT BOOK.

Each CONTINUE is intended to publish one new eligible book. A candidate must have original-edition evidence, complete text, full-page fidelity review, and defensible rights clearance for Ireland and the United States. Failed candidates remain unpublished. Never invent source facts, rights evidence, or human review attestations. Protect the existing reader and saved reading experience.

## Verification state
- No real candidate has yet completed the end-to-end publishing pipeline.
- Current-commit QA, Pages deployment and live smoke-test jobs must complete successfully before infrastructure approval.
- The repository secret `CICAN_PUBLISH_TOKEN` must be configured with suitable repository permissions.
- The Actions jobs observed at the time of this record had not yet been assigned runners.

## Capacity target
The operational goal is 1,000 verified books per month (approximately 33 per day). This is a target, not a proven throughput figure. Research, source matching, rights checks, text fidelity and reader QA must be scalable without weakening the verification rules. The current pipeline is not certified to meet this throughput.

## Approval rule
Do not give the green light until the secret is configured, current-commit infrastructure checks pass, and one genuine candidate passes verification, publication, deployment and live-reader testing end to end.
