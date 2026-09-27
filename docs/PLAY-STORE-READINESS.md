# CICAN — PLAY STORE READINESS

## Goal

Prepare CICAN for a high-quality Android release while keeping the web experience first-class.

## Technical direction

The product should have one reading engine and two delivery surfaces:

1. Web/PWA
2. Android application shell

Do not maintain two independent reader implementations.

## Android release requirements

Before Play submission:
- target the current Play-required Android API
- use Android App Bundle
- test on multiple screen sizes
- test rotation/windowing where supported
- test Android back behavior
- test process death/resume
- test offline operation
- test audio lifecycle when introduced
- test accessibility
- test deep links
- test cold/warm/hot startup
- test low-memory behavior

As of 31 August 2026, Google Play requires new apps and updates to target Android 16 / API 36 or higher, subject to the platform-specific exceptions published by Google.

## Play quality

Track:
- user-perceived crash rate
- user-perceived ANR rate
- startup time
- memory
- battery behavior
- rendering performance

These are not post-launch cleanup items. They are release criteria.

## Privacy architecture

Prefer privacy by design:
- no account required for basic reading
- local reading state first
- no unnecessary permissions
- no unnecessary personal data
- no location
- no contacts
- no microphone unless an explicit future feature requires it
- no invasive advertising SDKs in the reading core

If accounts are later introduced:
- provide in-app account deletion
- provide an external deletion resource
- publish a complete privacy policy
- maintain accurate Google Play Data Safety disclosures

## Offline architecture

The reader should be able to:
- open downloaded books
- preserve reading position
- display highlights/notes
- continue reading without network
- recover gracefully after interrupted downloads

Do not make the reader dependent on an active network connection once a book has been downloaded.

## Store experience

The Play listing should communicate:
- what CICAN is
- the 15-minute signature
- full-book reading
- interactive book experiences
- source transparency
- privacy
- accessibility

Do not market CICAN as a generic AI book-summary clone.

## Release gates

### Gate 1
Web/PWA reader stable.

### Gate 2
Offline/PWA stable.

### Gate 3
Android shell stable.

### Gate 4
Play pre-launch testing clean.

### Gate 5
Privacy/Data Safety/permissions reviewed.

### Gate 6
Store assets and listing finalized.

### Gate 7
Closed testing.

### Gate 8
Production release.

## Principle

**A Play Store launch is a quality milestone, not the beginning of development.**
