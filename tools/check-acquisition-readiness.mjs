import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const queue = JSON.parse(await fs.readFile(path.join(ROOT, "catalog", "acquisition-queue.json"), "utf8"));
const candidates = [...(queue.candidates || [])].sort((a,b)=>(a.priority??999)-(b.priority??999));

const rows = candidates.map(book => {
  const sourceReady = book.sourceStatus === "SOURCE_VERIFIED";
  const boundariesReady = Boolean(book.normalizationRules?.startMarker && book.normalizationRules?.stopMarker);
  const textReady = Boolean(book.sourceTextUrl);
  const rightsHold = !["US_PUBLIC_DOMAIN_REVIEWED","TERRITORIAL_REVIEWED","LICENSED"].includes(book.rightsStatus);
  return {
    id: book.id,
    title: book.title,
    priority: book.priority ?? null,
    sourceVerified: sourceReady,
    sourceTextVerified: textReady,
    normalizationReady: boundariesReady,
    rightsHold,
    nextSafeAction: !sourceReady ? "SOURCE_VERIFICATION" :
      !textReady ? "SOURCE_TEXT_ACQUISITION" :
      !boundariesReady ? "NORMALIZATION_RULES" :
      "ACQUISITION_READY",
    publishable: false
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  policy: "Acquisition planning never grants distribution rights.",
  rows
};

await fs.writeFile(path.join(ROOT, "catalog", "acquisition-readiness.json"), JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify({books:rows.length, acquisitionReady:rows.filter(x=>x.nextSafeAction==="ACQUISITION_READY").length, rightsHeld:rows.filter(x=>x.rightsHold).length},null,2));
