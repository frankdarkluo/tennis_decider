import { promises as fs } from "fs";
import path from "path";
import { execFileSync } from "child_process";

type ThumbnailResult = {
  scope: "content" | "creator_video";
  id: string;
  thumbnail: string | null;
  duration: string | null;
};

const RESULTS_PATH = path.join(process.cwd(), "scripts", "thumbnail-results.json");
const CONTENTS_PATH = path.join(process.cwd(), "src", "data", "contents.ts");
const CREATORS_PATH = path.join(process.cwd(), "src", "data", "creators.ts");
const CONTENTS_GIT_PATH = "src/data/contents.ts";
const CREATORS_GIT_PATH = "src/data/creators.ts";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeStringLiteral(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function upsertField(block: string, field: "thumbnail" | "duration", value: string) {
  const escapedValue = escapeStringLiteral(value);
  const fieldPattern = new RegExp(`^\\s*${field}:\\s*["'][^"']*["'],\\n?`, "gm");
  const cleanedBlock = block.replace(fieldPattern, "");

  const indentMatch = cleanedBlock.match(/\n(\s*)id:\s*['"]/);
  const indentation = indentMatch?.[1] ?? "    ";
  const fieldLine = `${indentation}${field}: '${escapedValue}',\n`;

  if (field === "thumbnail" && /\n\s*duration:/.test(cleanedBlock)) {
    return cleanedBlock.replace(/\n(\s*duration:)/m, `\n${fieldLine}$1`);
  }

  if (/\n\s*url:/.test(cleanedBlock)) {
    return cleanedBlock.replace(/\n(\s*url:)/m, `\n${fieldLine}$1`);
  }

  return cleanedBlock.replace(/\n(\s*\}$)/m, `\n${fieldLine}$1`);
}

function readGitBaseFile(gitPath: string) {
  return execFileSync("git", ["show", `HEAD:${gitPath}`], {
    cwd: process.cwd(),
    encoding: "utf-8"
  });
}

function applyResultsToFile(fileContents: string, results: ThumbnailResult[]) {
  let nextFileContents = fileContents;
  let updated = 0;

  for (const result of results) {
    if (!result.thumbnail && !result.duration) {
      continue;
    }

    const blockPattern = new RegExp(`\\{\\s*\\n\\s*id:\\s*["']${escapeRegExp(result.id)}["'][\\s\\S]*?\\n\\s*\\}`, "m");
    const match = nextFileContents.match(blockPattern);

    if (!match || typeof match.index !== "number") {
      console.log(`未找到: ${result.id}`);
      continue;
    }

    let updatedBlock = match[0];

    if (result.thumbnail) {
      updatedBlock = upsertField(updatedBlock, "thumbnail", result.thumbnail);
    }

    if (result.duration) {
      updatedBlock = upsertField(updatedBlock, "duration", result.duration);
    }

    if (updatedBlock !== match[0]) {
      nextFileContents =
        nextFileContents.slice(0, match.index) +
        updatedBlock +
        nextFileContents.slice(match.index + match[0].length);
      updated += 1;
    }
  }

  return { fileContents: nextFileContents, updated };
}

async function main() {
  const results = JSON.parse(await fs.readFile(RESULTS_PATH, "utf-8")) as ThumbnailResult[];
  const contentResults = results.filter((item) => item.scope === "content");
  const creatorVideoResults = results.filter((item) => item.scope === "creator_video");

  const [contentsFile, creatorsFile] = [
    readGitBaseFile(CONTENTS_GIT_PATH),
    readGitBaseFile(CREATORS_GIT_PATH)
  ];

  const contentUpdate = applyResultsToFile(contentsFile, contentResults);
  const creatorUpdate = applyResultsToFile(creatorsFile, creatorVideoResults);

  await Promise.all([
    fs.writeFile(CONTENTS_PATH, contentUpdate.fileContents, "utf-8"),
    fs.writeFile(CREATORS_PATH, creatorUpdate.fileContents, "utf-8")
  ]);

  console.log(`已更新 ${contentUpdate.updated} 条内容的缩略图/时长`);
  console.log(`已更新 ${creatorUpdate.updated} 条博主视频的缩略图/时长`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
