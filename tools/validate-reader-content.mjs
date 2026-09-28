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
 * Every playable book must provide a complete-book source path.
 * SOURCE_PENDING is allowed only when the edition is explicitly not
 * available yet; it must never silently fall back to a chapter excerpt.
 */
for (const id of books) {
    const file = path.join("books", id + ".js");
    const source = fs.readFileSync(file, "utf8");
    const pending = /\\breaderSourceStatus\\s*:\\s*"SOURCE_PENDING"/.test(source);
    const hasFullPath = /\\bfullTextUrl\\s*:/.test(source) || /\\bfullText\\s*:/.test(source);
    if (!pending && !hasFullPath) {
        failures.push(id + ": missing complete-book source path");
    }
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
    "Reader content QA passed: every book has a source-backed 15-minute path or an explicit pending status."
);
