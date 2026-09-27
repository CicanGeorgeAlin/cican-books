# CICAN — PLAY THE BOOK

**NOT JUST A NAME. CICAN.**

## EXPERIENCE → UNDERSTAND → READ

CICAN is a reading platform built around a simple idea: a book can be entered through experience, understood through context, and then read directly.

### Current architecture

- `index.html` — public landing page
- `library.html` — book discovery and selection
- `play-v17.html` — current V17 reading/experience surface
- `engine/` — reusable platform modules
- `books/` — book data/configuration
- `fulltext/` — verified canonical source files where available
- `manifest.webmanifest` — PWA metadata
- `service-worker.js` — offline app-shell foundation
- `docs/` — product, book-contract, and Play Store architecture
- `v14.html`, `v15.html`, `v16.html` — protected historical/reference versions

### Product model

A book contains:

- source / edition information
- a coherent 15-minute encounter
- a canonical full-book reading path where legally appropriate
- book DNA and concepts
- a short CICAN experience
- factual context

The reader itself is shared. Books do not receive custom reader implementations.

### Reading modes

**15 MIN**  
The signature CICAN reading encounter.

**FULL BOOK**  
The canonical source-text reading experience.

Future:

- LISTEN
- highlights
- notes
- bookmarks
- reading history
- ASK THE BOOK
- concept discovery and reading journeys

### Game boundary

The current repository contains the **short CICAN doorway into books**.

The larger CICAN game/evolution system remains a separate experimental direction so it does not overwhelm the reading platform.

### Protected lineage

```
V14
 ↓
V15
 ↓
V16  ← protected core
 ↓
V17  ← platform foundation
 ↓
future reader / app architecture
```

Protected versions are never rewritten simply to add new product features.

### Quality philosophy

CICAN is being designed for both the open web and a future Google Play release.

Priority order:

1. reading quality
2. source transparency
3. accessibility
4. performance
5. offline reliability
6. privacy
7. cross-device continuity
8. discovery
9. audio
10. monetization

The goal is not to copy summary apps. The 15-minute format is a doorway; the book remains the center.

For the detailed architecture, see:

- `docs/CICAN-PLATFORM-SPEC.md`
- `docs/BOOK-CONTRACT.md`
- `docs/PLAY-STORE-READINESS.md`
