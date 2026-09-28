# CICAN — PLAY THE BOOK — Known-Good Baseline

Date: 2026-09-28

## Stable commit

Mainline known-good audit commit:

51e690510508fb93ecec93b010ed2ed059e4edb0

Recovery branch:

cican-stable-reader-game-2026-09-28

Pre-audit snapshot branch:

cican-stable-before-reader-audit-2026-09-28

## Protected gameplay contract

- V13 CICAN movement interpolation remains x += (targetX - x) * 0.10 and y += (targetY - y) * 0.10.
- Growth remains +0.5 per frame while selected.
- Original split placement is one.x + 45.
- Original merge contact distance is fixed at MERGE_DISTANCE = 20.
- READ appears only after two already-full CICAN objects merge.
- Full + small does not unlock READ.
- Small + small does not unlock READ.
- Merge does not automatically open the reader.
- READ opens the selected book's prologue, then the reader.

## Reader contract

- 15 MIN uses source text only.
- FULL BOOK never substitutes a CICAN-written summary for source text.
- Embedded source books use a direct in-memory 15-minute path.
- SOURCE_READY embedded text is valid for FULL BOOK availability.
- Reader HUD, timer, progress, pause/resume, and saved positions remain unchanged.

## QA baseline

- play-v17.html contains exactly two script blocks.
- Both script blocks compile as JavaScript.
- savedProgress is declared before use.
- All catalog books have prologueScenes.
- Every book has a source-backed reader path or explicit SOURCE_PENDING status.

This file is a recovery reference. Do not replace the stable branch with experimental changes.
