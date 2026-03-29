import fs from "node:fs";
import path from "node:path";

const snapshotVersion = process.env.NEXT_PUBLIC_STUDY_SNAPSHOT_VERSION?.trim() || "2026-03-29-v1";
const outputDir = path.resolve(__dirname, "../src/data/studySnapshot");

const contentsPath = path.join(outputDir, `contents.${snapshotVersion}.json`);
const creatorsPath = path.join(outputDir, `creators.${snapshotVersion}.json`);
const metadataPath = path.join(outputDir, `metadata.${snapshotVersion}.json`);

for (const filePath of [contentsPath, creatorsPath, metadataPath]) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing snapshot file: ${path.basename(filePath)}`);
  }
}

const contents = JSON.parse(fs.readFileSync(contentsPath, "utf8")) as Array<unknown>;
const creators = JSON.parse(fs.readFileSync(creatorsPath, "utf8")) as Array<unknown>;
const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8")) as {
  snapshotVersion: string;
  contentCount: number;
  creatorCount: number;
  sortingMode: string;
  contentSetVersion: string;
  creatorSetVersion: string;
};

if (metadata.snapshotVersion !== snapshotVersion) {
  throw new Error(`snapshotVersion mismatch: expected ${snapshotVersion}, got ${metadata.snapshotVersion}`);
}

if (metadata.contentCount !== contents.length) {
  throw new Error(`contentCount mismatch: metadata=${metadata.contentCount}, actual=${contents.length}`);
}

if (metadata.creatorCount !== creators.length) {
  throw new Error(`creatorCount mismatch: metadata=${metadata.creatorCount}, actual=${creators.length}`);
}

if (metadata.sortingMode !== "deterministic_study") {
  throw new Error(`sortingMode mismatch: ${metadata.sortingMode}`);
}

if (metadata.contentSetVersion !== `content-${snapshotVersion}`) {
  throw new Error(`contentSetVersion mismatch: ${metadata.contentSetVersion}`);
}

if (metadata.creatorSetVersion !== `creators-${snapshotVersion}`) {
  throw new Error(`creatorSetVersion mismatch: ${metadata.creatorSetVersion}`);
}

console.log(`verified snapshot ${snapshotVersion}`);
console.log(`contents=${contents.length}`);
console.log(`creators=${creators.length}`);
