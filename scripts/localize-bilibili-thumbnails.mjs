import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "thumbnails", "bilibili");
const targets = [
  path.join(projectRoot, "src", "data", "contents.ts"),
  path.join(projectRoot, "src", "data", "creators.ts")
];

const thumbnailPattern = /thumbnail:\s*'(https?:\/\/i\d\.hdslb\.com\/bfs\/archive\/[^']+)'/g;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function downloadFile(url, destination) {
  const normalizedUrl = url.replace(/^http:\/\//, "https://");
  const response = await fetch(normalizedUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; TennisLevelThumbnailBot/1.0)"
    }
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText} for ${normalizedUrl}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destination, bytes);
}

async function main() {
  await ensureDir(outputDir);

  const fileContents = await Promise.all(
    targets.map(async (target) => [target, await fs.readFile(target, "utf8")])
  );

  const urlToLocalPath = new Map();

  for (const [, source] of fileContents) {
    for (const match of source.matchAll(thumbnailPattern)) {
      const remoteUrl = match[1];
      if (urlToLocalPath.has(remoteUrl)) {
        continue;
      }

      const fileName = path.basename(new URL(remoteUrl).pathname);
      urlToLocalPath.set(remoteUrl, `/thumbnails/bilibili/${fileName}`);
    }
  }

  let downloadedCount = 0;
  for (const [remoteUrl, localPath] of urlToLocalPath.entries()) {
    const destination = path.join(projectRoot, "public", localPath.replace(/^\//, ""));

    try {
      await fs.access(destination);
    } catch {
      await downloadFile(remoteUrl, destination);
      downloadedCount += 1;
    }
  }

  for (const [target, source] of fileContents) {
    let nextSource = source;
    for (const [remoteUrl, localPath] of urlToLocalPath.entries()) {
      nextSource = nextSource.split(remoteUrl).join(localPath);
    }

    if (nextSource !== source) {
      await fs.writeFile(target, nextSource);
    }
  }

  console.log(`Localized ${urlToLocalPath.size} Bilibili thumbnail references.`);
  console.log(`Downloaded ${downloadedCount} files into ${path.relative(projectRoot, outputDir)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
