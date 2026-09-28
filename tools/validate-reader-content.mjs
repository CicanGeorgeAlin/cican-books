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
