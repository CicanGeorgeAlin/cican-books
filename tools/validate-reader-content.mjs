import fs from "node:fs";
import path from "node:path";

const books = [
    "dhammapada",
    "tao-te-ching",
    "the-republic",
    "meditations",
    "walden",
    "thus-spake-zarathustra",
    "frankenstein",
    "dracula",
    "the-great-gatsby",
    "nineteen-eighty-four",
    "moby-dick",
    "pride-and-prejudice"
];

const failures = [];

for (const id of books) {
    const file = path.join("books", id + ".js");
    const source = fs.readFileSync(file, "utf8");

    const hasEmbeddedSource =
        /\bfifteenMinuteText\s*:|\bfullText\s*:|\bfullTextUrl\s*:/.test(source);

    const explicitlyPending =
        /\breaderSourceStatus\s*:\s*"SOURCE_PENDING"/.test(source);

    const hasPrologue =
        /\bprologueScenes\s*:\s*\[/.test(source);

    if (!hasPrologue) {
        failures.push(
            id + ": missing prologueScenes"
        );
    }

    if (!hasEmbeddedSource && !explicitlyPending) {
        failures.push(
            id + ": no source-backed 15-minute path and no explicit pending status"
        );
    }

    if (
        /\bfifteenMinuteText\s*:/.test(source) &&
        !/\btargetWords\s*:/.test(source)
    ) {
        failures.push(
            id + ": fifteenMinuteText exists without targetWords"
        );
    }
}


const playFile = fs.readFileSync("play-v17.html", "utf8");
const notePos = playFile.indexOf("savedProgress > 0.01");
const declarationPos = playFile.indexOf("const savedProgress");
if (notePos >= 0 && declarationPos >= 0 && notePos < declarationPos) {
    failures.push("play-v17.html: reader uses savedProgress before declaration");
}


/*
 * COMPLETE BOOK CONTRACT
 *
 * text = calibrated 15-minute source selection only.
 * fullText = verified complete source asset.
 * fullTextUrl = verified complete source URL.
 *
 * text is NEVER accepted as a complete-book source.
 */
for (const id of books) {
    const file = path.join("books", id + ".js");
    const source = fs.readFileSync(file, "utf8");

    const pending =
        /\breaderSourceStatus\s*:\s*"SOURCE_PENDING"/.test(source);

    const hasFullAsset =
        /\bfullText\s*:/.test(source);

    const hasFullUrl =
        /\bfullTextUrl\s*:/.test(source);

    const hasExplicitCompleteType =
        /\bfullTextSourceType\s*:\s*"COMPLETE_SOURCE_(?:ASSET|URL)"/.test(source);

    if (!pending && !hasFullAsset && !hasFullUrl) {
        failures.push(id + ": missing complete-book source path");
    }

    if (!pending && (hasFullAsset || hasFullUrl) && !hasExplicitCompleteType) {
        failures.push(id + ": complete-book path is not explicitly declared");
    }

    if (
        /\breaderSourceStatus\s*:\s*"SOURCE_READY"/.test(source) &&
        !hasFullAsset &&
        !hasFullUrl
    ) {
        failures.push(id + ": SOURCE_READY is invalid without a complete source path");
    }
}

if (/readerSourceStatus\s*===\s*"SOURCE_READY"[\s\S]{0,250}currentBook\.text/.test(playFile)) {
    failures.push("play-v17.html: SOURCE_READY text fallback still exists");
}

if (/fullAvailable[\s\S]{0,500}readerSourceStatus\s*===\s*"SOURCE_READY"/.test(playFile)) {
    failures.push("play-v17.html: FULL BOOK availability still accepts SOURCE_READY text");
}

const canonicalChecks = [
    [
        "V13 minimum size",
        /const MIN_SIZE = 34/.test(playFile)
    ],
    [
        "V13 exact maximum size",
        /const MAX_SIZE = 180/.test(playFile)
    ],
    [
        "V13 double-tap timing",
        /const DOUBLE_TAP_TIME = 350/.test(playFile)
    ],
    [
        "V13 trail distance",
        /const TRAIL_DISTANCE = 35/.test(playFile)
    ],
    [
        "V13 fixed merge distance",
        /const MERGE_DISTANCE = 20/.test(playFile) &&
        /if \(d <= MERGE_DISTANCE\)/.test(playFile)
    ],
    [
        "V13 split placement",
        /one\.x \+ 45/.test(playFile)
    ],
    [
        "V13 growth increment",
        /one\.size \+= 0\.5/.test(playFile)
    ],
    [
        "canonical full+full READ gate",
        /oneAIsFullSize && oneBIsFullSize/.test(playFile)
    ],
    [
        "canonical movement interpolation",
        /one\.x \+=\s*\(\s*one\.targetX\s*-\s*one\.x\s*\)\s*\* 0\.10/.test(playFile) &&
        /one\.y \+=\s*\(\s*one\.targetY\s*-\s*one\.y\s*\)\s*\* 0\.10/.test(playFile)
    ],
    [
        "book effects isolated from main loop",
        /BOOK-SPECIFIC EXPERIENCE IS VISUAL ONLY/.test(playFile)
    ]
];

for (const [name, passed] of canonicalChecks) {
    if (!passed) {
        failures.push("play-v17.html: missing canonical game contract — " + name);
    }
}

if (failures.length) {
    console.error("Reader content QA failed:");
    for (const failure of failures) {
        console.error(" - " + failure);
    }
    process.exit(1);
}

console.log(
    "Reader content QA passed: 15-minute text and COMPLETE SOURCE paths are structurally separated."
);
