# CICAN BOOKS V2 — Edition-Aware Pagination

V2 introduces page markers into the reader without changing the V1 reading mechanics.

## Locked V1 protection

V1 remains untouched on `locked-v1.0-completed`.

## Pagination rule

CICAN must never invent a page count.

A book receives `PAGE X / Y` only after the exact edition/witness represented by the reader source has been identified and its pagination verified.

The registry is:

`catalog/edition-pagination-v2.js`

Every current PUBLIC title is registered as `RESEARCH_REQUIRED` until its pagination evidence is verified.

## Rendering rule

When verified:

- page markers are inserted only at natural text-block boundaries;
- no sentence is split solely to create a page marker;
- the total page count comes from the identified edition;
- the reader remains continuous and auto-readable;
- the existing clock, timer, fullscreen mode and controls are unchanged.

## Research principle

Different editions of the same work can have different pagination. For example, Project Gutenberg #55201 explicitly states that its Republic text is based largely on Jowett's 1888 third edition and that printed 1888 page numbers are represented in the HTML. Project Gutenberg #41445 identifies its Frankenstein text as produced from a photo-reprint of the 1818 edition. Project Gutenberg #42671 identifies its Pride and Prejudice witness as R. W. Chapman and notes that it was prepared from page images.

V2 therefore treats edition identification as part of the data, not as decoration.

## Current status

Pagination engine: IMPLEMENTED  
Edition registry: IMPLEMENTED  
15 PUBLIC titles registered: YES  
Verified page counts: PENDING RESEARCH  
V1: LOCKED AND UNCHANGED
