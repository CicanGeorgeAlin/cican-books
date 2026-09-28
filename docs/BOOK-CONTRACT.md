# CICAN BOOK CONTRACT

Every book configuration must conform to the same conceptual contract.

## Required

- id
- title
- author
- category
- difficulty
- targetMinutes
- targetWords
- sourceEdition
- sourceTranslator (nullable)
- sourceNote
- sourceUrl
- prologueScenes

## Recommended

- tradition
- gameMode
- gameTitle
- gameDNA
- fullTextUrl
- fullText
- fifteenMinuteStartMarker
- cover
- publicationYear
- language
- rights
- chapters
- concepts
- context

## Separation

### SOURCE
Canonical text and edition information.

A COMPLETE BOOK source is separate from the 15-minute selection:

- `fullText` = verified complete source asset.
- `fullTextUrl` = verified complete source URL.
- `fullTextSourceType` = `COMPLETE_SOURCE_ASSET` or `COMPLETE_SOURCE_URL`.
- `fifteenMinuteStartMarker` = source-text marker used to begin the calibrated 15-minute selection inside the actual work, skipping edition front matter when necessary.
- `fifteenMinuteText` = runtime-calibrated source selection derived from the verified complete source.
- `text` = legacy-compatible 15-minute source selection only when present.
- `text` must contain source text, not a summary, and must NEVER be treated as the complete book.

### CICAN 15 MIN
A coherent, explicitly labeled selected encounter.

### EXPERIENCE
Short interactive doorway.

### CONTEXT
Factual orientation and historical information.

### INTERPRETATION
CICAN-created or AI-assisted explanatory material.

These must never be silently mixed.

## Future normalized shape

```js
{
  id,
  identity: {
    title,
    author,
    language,
    publicationYear
  },

  edition: {
    title,
    translator,
    sourceUrl,
    rights,
    provenance
  },

  reading: {
    fifteenMinuteText,
    fullText,
    targetMinutes,
    targetWords,
    difficulty
  },

  discovery: {
    category,
    tradition,
    concepts,
    dna
  },

  experience: {
    mode,
    title,
    scenes,
    configuration
  },

  context: {
    summary,
    author,
    work,
    historicalContext
  }
}
```

The existing book files remain valid legacy-compatible inputs. Migration should be additive, not destructive.
