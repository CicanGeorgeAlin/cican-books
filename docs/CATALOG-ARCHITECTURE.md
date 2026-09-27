# CICAN Catalog Architecture

## Goal

The CICAN catalog must scale from the current small library to 10,000+ books without changing reader behavior for each title.

## Rule

**Catalog data is content. Reader behavior is code.**

A new book should normally require:

- one book record
- one canonical full-text asset where legally appropriate
- one 15-minute reading selection
- one experience configuration
- source/provenance metadata

It should not require:

- a new reader
- new reader UI code
- a new route
- custom scrolling logic
- custom storage logic
- custom PWA logic

## Target catalog layers

```
CATALOG INDEX
    |
    +-- BOOK RECORD
    |     |
    |     +-- identity
    |     +-- edition / provenance
    |     +-- rights
    |     +-- reading
    |     +-- discovery
    |     +-- experience
    |
    +-- FULL TEXT ASSET
    |
    +-- 15-MINUTE ASSET
    |
    +-- OPTIONAL COVER / MEDIA
```

## Acquisition sources

Initial priority:

1. Project Gutenberg
2. Standard Ebooks
3. Other repositories only after source-specific rights and redistribution rules are verified

Project Gutenberg provides machine-readable catalog metadata, including XML/RDF, CSV and MARC formats, and specifically recommends using those catalogs instead of crawling the website. It also provides OPDS and feeds for discovery. The catalog metadata is available for incorporation into other collections.

Standard Ebooks provides carefully proofread, semantically marked-up public-domain ebooks and releases its own ebook production work under CC0, while noting that its public-domain assessment is U.S.-based.

## Rights discipline

A source being free to access does not automatically mean CICAN can redistribute the text commercially in every jurisdiction.

Every imported work therefore receives a rights/provenance status before publication.

Recommended statuses:

- `REVIEW_REQUIRED`
- `US_PUBLIC_DOMAIN_REVIEWED`
- `TERRITORIAL_REVIEWED`
- `LICENSED`
- `DO_NOT_DISTRIBUTE`

The catalog must retain the source's own rights/licensing information rather than replacing it with a generic CICAN label.

## Quality pipeline

```
DISCOVER
  ↓
SOURCE VERIFY
  ↓
RIGHTS REVIEW
  ↓
EDITION SELECT
  ↓
ACQUIRE
  ↓
NORMALIZE
  ↓
STRUCTURE
  ↓
CALIBRATE 15 MIN
  ↓
CREATE EXPERIENCE
  ↓
VALIDATE
  ↓
PUBLISH
```

## Scale requirement

The library UI must eventually consume catalog records through a single catalog interface.

Do not maintain a manually duplicated book list across:

- library UI
- reader
- search
- experience
- metadata
- service worker
- future Android app

The catalog becomes the source of truth.

## Future capabilities

The catalog architecture should eventually support:

- multiple editions of one work
- multiple translations
- multiple languages
- author pages
- categories
- concepts
- collections
- reading journeys
- search indexing
- availability/rights filtering
- source comparison
- edition switching
- downloadable/offline assets

## Quality over raw count

10,000+ books is a strategic target.

CICAN should never publish a title merely to increase the catalog number.

Every published title should be:

- identifiable
- attributable
- traceable to its source
- structurally valid
- readable
- resumable
- mobile-tested
- rights-reviewed
- compatible with the shared reader
