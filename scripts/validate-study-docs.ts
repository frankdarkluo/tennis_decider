import path from "node:path";
import { STUDY_FIXED_SEED, STUDY_SNAPSHOT_VERSION } from "../src/lib/study/config";
import { runStudyDocConsistencyChecks } from "../src/lib/study/docConsistency";

const rootDir = path.resolve(__dirname, "..");
const result = runStudyDocConsistencyChecks({
  rootDir,
  snapshotVersion: STUDY_SNAPSHOT_VERSION,
  fixedSeed: STUDY_FIXED_SEED
});

if (!result.ok) {
  result.errors.forEach((error) => {
    console.error(`- ${error}`);
  });
  process.exit(1);
}

console.log(`validated study docs for snapshot ${STUDY_SNAPSHOT_VERSION}`);
