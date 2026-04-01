import { creators } from "../src/data/creators";
import { contents } from "../src/data/contents";
import { expandedContents } from "../src/data/expandedContents";

type CreatorPlatform = "Bilibili" | "YouTube";

type CheckResult = {
  id: string;
  name: string;
  platform: CreatorPlatform;
  url: string;
  ok: boolean;
  status: number;
  finalUrl: string;
  note: string;
  sampleVideoUrl: string;
  sampleVideoOk: boolean;
  sampleVideoStatus: number;
  sampleVideoNote: string;
  skipped: boolean;
};

const TARGET_PLATFORMS: CreatorPlatform[] = ["Bilibili", "YouTube"];
const TIMEOUT_MS = 12000;

function findProfileUrl(creator: (typeof creators)[number], platform: CreatorPlatform): string {
  if (platform === "Bilibili") {
    return creator.platformLinks?.Bilibili ?? creator.profileUrl ?? "";
  }

  return creator.platformLinks?.YouTube ?? creator.profileUrl ?? "";
}

function domainMismatch(platform: CreatorPlatform, finalUrl: string, originalUrl: string): boolean {
  const combined = `${finalUrl} ${originalUrl}`.toLowerCase();

  if (platform === "Bilibili") {
    return !combined.includes("bilibili.com");
  }

  return !combined.includes("youtube.com") && !combined.includes("youtu.be");
}

async function checkUrl(url: string, platform: CreatorPlatform): Promise<{
  ok: boolean;
  status: number;
  finalUrl: string;
  note: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 TennisLevelCreatorAudit/1.0"
      }
    });

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      finalUrl: response.url,
      note: "-"
    };
  } catch (error) {
    const note =
      error instanceof Error && error.name === "AbortError"
        ? "timeout"
        : error instanceof Error
          ? error.message
          : "network-error";

    return {
      ok: false,
      status: 0,
      finalUrl: url,
      note
    };
  } finally {
    clearTimeout(timer);
  }
}

function findSampleVideoUrl(creator: (typeof creators)[number], platform: CreatorPlatform): string {
  const featured = creator.featuredVideos?.find((video) => video.platform === platform)?.url;
  if (featured) {
    return featured;
  }

  const sourceItems = [...contents, ...expandedContents];
  const matched = sourceItems.find((item) => item.creatorId === creator.id && item.platform === platform);
  return matched?.url ?? "";
}

async function run(): Promise<number> {
  const targetCreators = creators.filter((creator) =>
    creator.platforms.some((platform) => TARGET_PLATFORMS.includes(platform as CreatorPlatform))
  );

  const results: CheckResult[] = [];

  for (const creator of targetCreators) {
    for (const platform of creator.platforms) {
      if (!TARGET_PLATFORMS.includes(platform as CreatorPlatform)) {
        continue;
      }

      const typedPlatform = platform as CreatorPlatform;
      const url = findProfileUrl(creator, typedPlatform);

      if (!url) {
        const isPlaceholder = creator.discoveryEligible === false && creator.rankingEligible === false;
        results.push({
          id: creator.id,
          name: creator.name,
          platform: typedPlatform,
          url: "",
          ok: isPlaceholder,
          status: 0,
          finalUrl: "",
          note: isPlaceholder ? "placeholder-no-profile-url" : "missing-profile-url",
          sampleVideoUrl: "",
          sampleVideoOk: isPlaceholder,
          sampleVideoStatus: 0,
          sampleVideoNote: isPlaceholder ? "placeholder-no-sample-video" : "missing-sample-video",
          skipped: isPlaceholder
        });
        continue;
      }

      const checked = await checkUrl(url, typedPlatform);
      const mismatch = domainMismatch(typedPlatform, checked.finalUrl, url);
      const note = mismatch
        ? checked.note === "-"
          ? "domain-mismatch"
          : `${checked.note};domain-mismatch`
        : checked.note;

      const sampleVideoUrl = findSampleVideoUrl(creator, typedPlatform);
      let sampleVideoOk = false;
      let sampleVideoStatus = 0;
      let sampleVideoNote = "missing-sample-video";

      if (sampleVideoUrl) {
        const sampleChecked = await checkUrl(sampleVideoUrl, typedPlatform);
        sampleVideoOk = sampleChecked.ok;
        sampleVideoStatus = sampleChecked.status;
        sampleVideoNote = sampleChecked.note;
      }

      const existenceOk = typedPlatform === "YouTube" ? sampleVideoOk : checked.ok || sampleVideoOk;

      results.push({
        id: creator.id,
        name: creator.name,
        platform: typedPlatform,
        url,
        ok: existenceOk && !mismatch,
        status: checked.status,
        finalUrl: checked.finalUrl,
        note,
        sampleVideoUrl,
        sampleVideoOk,
        sampleVideoStatus,
        sampleVideoNote,
        skipped: false
      });
    }
  }

  const totals = {
    total: results.length,
    skipped: results.filter((item) => item.skipped).length,
    ok: results.filter((item) => item.ok).length,
    failed: results.filter((item) => !item.ok).length
  };

  const byPlatform = TARGET_PLATFORMS.reduce<Record<CreatorPlatform, { total: number; ok: number; failed: number }>>(
    (acc, platform) => {
      const group = results.filter((item) => item.platform === platform);
      acc[platform] = {
        total: group.length,
        ok: group.filter((item) => item.ok).length,
        failed: group.filter((item) => !item.ok).length
      };
      return acc;
    },
    {
      Bilibili: { total: 0, ok: 0, failed: 0 },
      YouTube: { total: 0, ok: 0, failed: 0 }
    }
  );

  console.log("CREATOR_EXISTENCE_AUDIT");
  console.log(JSON.stringify({ totals, byPlatform }, null, 2));

  const failed = results.filter((item) => !item.ok);
  if (failed.length > 0) {
    console.log("FAILED_ROWS_START");
    for (const row of failed) {
      console.log(
        [
          row.platform,
          row.id,
          row.status,
          row.note,
          row.url,
          row.finalUrl,
          row.sampleVideoStatus,
          row.sampleVideoNote,
          row.sampleVideoUrl
        ].join("\t")
      );
    }
    console.log("FAILED_ROWS_END");
    return 1;
  }

  return 0;
}

void run()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error("CREATOR_EXISTENCE_AUDIT_ERROR", error);
    process.exit(1);
  });
