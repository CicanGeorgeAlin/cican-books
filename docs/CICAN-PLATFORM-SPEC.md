# CICAN — PLAY THE BOOK
## Reading Platform Specification

Status: **FOUNDATION SPECIFICATION — September 2026**

## 1. Product promise

CICAN is not a conventional summary feed and not a conventional ebook reader.

The core journey is:

**EXPERIENCE → UNDERSTAND → READ**

A book remains the source. CICAN adds a short interactive doorway, orientation, reading modes, and tools that help a reader return to the text.

The 15-minute experience is a signature mode, not the definition of the whole product.

## 2. Product layers

### Layer A — CICAN identity
- black / white visual language
- fast opening
- unmistakable CICAN interaction
- minimal chrome
- accessible controls

### Layer B — Book
Every book is a data object, not custom reader code.

A book provides:
- identity
- author
- edition
- translator
- source URL
- rights/provenance note
- canonical full text where legally appropriate
- 15-minute text/selection
- DNA/concepts
- experience configuration
- context
- optional audio configuration

### Layer C — Experience
The experience is a short doorway into the book.

Rules:
- seconds, not minutes
- consistent CICAN interaction
- book-aware without becoming a separate game
- skippable in the mature product
- never blocks the reader unnecessarily

### Layer D — Reader
The reader has two primary modes:

**15 MIN**
- calibrated encounter
- continuous reading
- clear time/progress
- pause/resume
- per-book/per-mode resume
- completion state

**FULL BOOK**
- canonical source text
- manual scrolling
- bookmarks
- highlights
- notes
- search
- text selection
- adjustable typography
- reading progress
- resume

Later modes:
- LISTEN
- READ ALONG
- ASK THE BOOK

## 3. Reader principles

1. Text is the primary interface.
2. Controls disappear when not needed.
3. Never force auto-scroll.
4. Never make the user fight the viewport.
5. Never lose reading position.
6. Never silently replace source text with AI-generated prose.
7. Clearly label source text, CICAN interpretation, and generated assistance.
8. Respect reduced motion and accessibility settings.
9. Preserve the same reading state across web and app when an account/sync layer exists.
10. Full-book reading must work without the 15-minute mode.

## 4. Navigation model

Primary:

HOME → LIBRARY → BOOK → EXPERIENCE → READ

Inside BOOK:

- EXPERIENCE
- 15 MIN
- FULL BOOK
- UNDERSTAND
- BOOK DNA
- SOURCE / EDITION

Later:

- LISTEN
- HIGHLIGHTS
- NOTES
- BOOKMARKS
- ASK THE BOOK

The reader must never become a maze of screens.

## 5. Persistent reading state

The system should store, per user and per book:
- current mode
- exact reading position
- last opened timestamp
- completion
- bookmark locations
- highlight ranges
- notes
- preferred typography settings
- audio position when available

Local-first storage should work without login.

Cloud sync is optional and should be added only when it materially improves the product.

## 6. Offline-first direction

The web version should become a PWA.

The Android application should reuse the same product core rather than implementing a second reader.

Target architecture:

WEB/PWA
   ↓
CICAN CORE
   ↓
ANDROID APP SHELL

The Android shell should eventually provide:
- offline library
- background/lock-screen audio where appropriate
- Android share integration
- deep links
- notifications only when genuinely useful
- native lifecycle handling

## 7. Performance requirements

Reader performance is a product feature.

Requirements:
- no long synchronous parsing of massive books on the UI thread
- lazy-load full books
- avoid rendering the entire book as thousands of DOM nodes
- use one text surface where possible
- use pagination/virtualization if future annotation density requires it
- preserve 60fps interaction where animation is present
- keep opening/startup lightweight
- show explicit loading state for remote/full-text acquisition

Google's current Android guidance emphasizes startup, responsiveness, stability, memory, ANRs and battery behavior; these must be acceptance criteria before Play release.

## 8. Accessibility requirements

Minimum:
- semantic headings
- buttons with labels
- keyboard navigation on web
- visible focus
- sufficient contrast
- scalable text
- adjustable line height
- adjustable margins
- reduced-motion mode
- screen-reader-compatible controls
- no information conveyed only by animation
- no gesture-only critical action
- manual reading always available

## 9. Search

Search should eventually operate across:
- titles
- authors
- categories
- traditions
- concepts
- book text
- personal highlights/notes

Search results should identify the exact book and allow direct navigation to the passage.

## 10. AI boundary

AI is an assistant layer, never the source layer.

When AI is used:
- identify generated interpretation
- ground answers in the selected book
- provide passage references
- distinguish quotation from paraphrase
- avoid presenting interpretation as authorial text
- never silently rewrite the source

## 11. Experience/game boundary

Current repository:
- CICAN signature doorway
- book-specific micro-experiences
- reader platform

Separate future repository:
- large CICAN game / evolution systems
- complex progression
- deeper game mechanics

The reading app must never become dependent on the larger game.

## 12. Content pipeline

Adding a book should become a repeatable process:

1. verify source and edition
2. verify rights/public-domain status for intended distribution
3. acquire canonical source
4. normalize text
5. create book metadata
6. create 15-minute selection
7. validate word count and coherence
8. create DNA/concepts
9. create short experience
10. test reader
11. test mobile
12. test offline
13. publish

Book content should be data. Reader behavior should be code.

## 13. Quality gate

No new book is considered complete until:
- source provenance is recorded
- text passes structural validation
- 15-minute selection is coherent
- full text passes loading validation
- title/author/edition metadata is consistent
- experience opens and exits correctly
- reading position survives reload
- accessibility checks pass
- no broken links exist
- no protected version was modified accidentally

## 14. Long-term information architecture

CICAN
├── Home
├── Library
│   ├── Continue
│   ├── Discover
│   ├── Concepts
│   └── Collections
└── Book
    ├── Experience
    ├── 15 MIN
    ├── FULL BOOK
    ├── Understand
    ├── DNA
    └── Source
        └── Edition

Future:
    ├── Listen
    ├── Highlights
    ├── Notes
    ├── Bookmarks
    ├── Ask the Book
    └── Reading History

## 15. Non-negotiable architectural rule

**Do not create a new reader implementation for every book.**

One reader.
One book contract.
Many books.
Many small experiences.

That is the architecture that lets CICAN scale.
