# CICAN Free Library Pipeline

## Purpose

Build CICAN toward a very large library using legitimately redistributable free works first, while preserving source, edition, provenance, and rights information for every title.

## Primary acquisition source

Project Gutenberg is the first major source for English-language works because it provides a large catalog of free ebooks and machine-readable catalog information.

CICAN must use the individual ebook's own license and rights notice, not assume that every item in Project Gutenberg is freely redistributable everywhere.

## CICAN acquisition states

Every candidate book moves through:

1. DISCOVERED
2. SOURCE VERIFIED
3. RIGHTS REVIEWED
4. EDITION SELECTED
5. TEXT ACQUIRED
6. TEXT CLEANED
7. BOOK CONTRACT CREATED
8. 15-MINUTE EXPERIENCE CREATED
9. READER QA
10. MOBILE QA
11. PUBLISHED

A book does not enter the public CICAN catalog merely because it is free to download.

## Required provenance

Every published book should record:

- title
- author
- language
- original publication year when known
- selected edition
- translator/editor when applicable
- source repository
- source ebook identifier
- source landing-page URL
- source/rights note
- jurisdictional review status
- full-text provenance
- CICAN processing/version information

## Gutenberg rules

When using a Project Gutenberg work:

- Prefer works identified by Gutenberg as unrestricted by U.S. copyright.
- Inspect the actual ebook license/header for every title.
- Do not assume a work is unrestricted in Ireland or every other territory.
- Do not treat the Project Gutenberg trademark as interchangeable with the underlying literary work.
- Prefer linking to the Gutenberg ebook landing page for provenance.
- For large-scale acquisition, use Gutenberg's official offline catalogs/feeds and approved mirrors rather than automated scraping of the main website.
- Do not add copyrighted works merely because Gutenberg hosts them with permission.
- If a title's rights status is uncertain, hold it out of the published catalog.

## Catalog strategy

CICAN should not hard-code a fixed list of books as the long-term catalog architecture.

The long-term model is:

catalog index -> book records -> canonical source text -> reader -> experience

Adding book 10,001 should not require changing reader logic.

## Selection strategy

The free-library expansion will prioritize:

1. canonical works with enduring reader demand
2. works with strong source quality
3. works with clear rights/provenance
4. works across fiction, philosophy, history, science, religion, essays, poetry, drama, economics, education and other major subjects
5. works that support a meaningful CICAN experience
6. language expansion after the English pipeline is reliable

Popularity is a discovery signal, not a quality verdict.

## Quality rule

CICAN's goal is not to inflate a counter with low-value files.

The library should scale through a repeatable pipeline where every published title is searchable, readable, resumable, correctly attributed, and traceable to its source.

## Long-term target

Design the infrastructure for 10,000+ titles and beyond.

The book count is a product objective. The reader engine remains shared.

## Legal note

This document is an engineering/content policy, not legal advice. Territorial copyright and distribution rights must be checked before publishing or distributing each work, especially for a product operated from Ireland.

## Text normalization standard

CICAN keeps a clean canonical text asset separate from the raw source transport file.

For Project Gutenberg acquisitions:

1. Verify the exact ebook identifier and selected edition.
2. Preserve the source landing page and source-text endpoint as provenance.
3. Locate the Gutenberg start/end boundaries in the source text.
4. Remove only transport material such as Gutenberg licensing boilerplate and technical footer material.
5. Preserve the literary work's wording, spelling, punctuation, chapter headings, and paragraph boundaries.
6. Do not silently modernize, rewrite, summarize, or correct the source text.
7. Treat illustrations, captions, transcription notes, editorial notes, and unusual front/back matter as review items rather than automatically deleting them.
8. Record the normalization rules used for every acquired title.
9. Generate a word count and contamination report before the text can enter the book contract.
10. Keep the raw-source provenance even after the normalized CICAN asset is created.

The normalized asset is the reader's canonical full text. The raw source remains the provenance reference.
