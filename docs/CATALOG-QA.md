# CICAN Catalog QA

## Purpose

Validate large batches of books before publication.

## Required checks

### Catalog record
- unique id
- title
- author
- category
- book source
- target minutes

### Book record
- title
- author
- category
- target minutes
- target words
- 15-minute text
- source edition
- source note
- source URL

### Content
- non-empty text
- sensible word count
- no obvious Gutenberg header/footer contamination
- no accidental table of contents used as the reading body
- no duplicate book IDs
- no broken full-text path
- source edition matches metadata

### Experience
- experience configuration exists
- prologue is short and skippable
- experience does not replace the source text
- reader entry works

### Reader
- 15-minute mode opens
- full-book mode opens when available
- reading position can be restored
- mobile layout works
- reduced-motion mode does not break controls

### Provenance
- source repository identified
- source URL recorded
- edition/translator recorded when applicable
- rights status reviewed before publication

## Batch principle

A batch should fail loudly rather than partially publish silently.

Future catalog tooling should produce:

- PASS
- WARN
- FAIL

and identify the exact book and field responsible.

## Publication rule

A title with a rights-related FAIL is never published automatically.

A title with content or metadata WARN may be queued for human review.

The purpose of QA is to make large-scale expansion safer, not merely faster.
