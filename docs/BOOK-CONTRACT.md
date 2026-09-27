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
- text
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
