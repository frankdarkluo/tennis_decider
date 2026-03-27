import crypto from "node:crypto";

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
];

function getMixinKey(source) {
  return mixinKeyEncTab.map((index) => source[index]).join("").slice(0, 32);
}

function sanitizeWbiValue(value) {
  return value.replace(/[!'()*]/g, "");
}

async function getBilibiliMixinKey() {
  const response = await fetch("https://api.bilibili.com/x/web-interface/nav", {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  const payload = await response.json();
  const imgKey = payload.data.wbi_img.img_url.split("/").pop().split(".")[0];
  const subKey = payload.data.wbi_img.sub_url.split("/").pop().split(".")[0];
  return getMixinKey(imgKey + subKey);
}

async function fetchBilibiliVideos(mid, pageSize = 12) {
  const mixinKey = await getBilibiliMixinKey();
  const wts = String(Math.floor(Date.now() / 1000));
  const params = {
    mid,
    pn: "1",
    ps: String(pageSize),
    order: "click",
    platform: "web",
    web_location: "1550101",
    wts
  };

  const query = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(sanitizeWbiValue(value))}`)
    .join("&");

  const wRid = crypto.createHash("md5").update(query + mixinKey).digest("hex");
  const url = `https://api.bilibili.com/x/space/wbi/arc/search?${query}&w_rid=${wRid}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  const payload = await response.json();

  if (payload.code !== 0) {
    throw new Error(`Bilibili API error ${payload.code}: ${payload.message}`);
  }

  return payload.data.list.vlist.map((video) => ({
    id: video.bvid,
    title: video.title,
    url: `https://www.bilibili.com/video/${video.bvid}/`,
    plays: Number(video.play) || 0,
    comments: Number(video.comment) || 0,
    length: video.length
  }));
}

async function fetchYouTubeChannelId(handle) {
  const response = await fetch(`https://www.youtube.com/${handle}/videos`, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  const html = await response.text();
  const match = html.match(/"browseId":"(UC[^"]+)"/);

  if (!match) {
    throw new Error(`Could not find channel id for ${handle}`);
  }

  return match[1];
}

async function fetchYouTubeVideos(handle, pageSize = 8) {
  const channelId = await fetchYouTubeChannelId(handle);
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  const xml = await response.text();

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, pageSize);
  return entries.map(([, entry]) => {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]
      ?.replace(/&amp;/g, "&")
      ?.replace(/&#39;/g, "'")
      ?.replace(/&quot;/g, "\"")
      ?.trim();

    return {
      id,
      title,
      url: `https://www.youtube.com/watch?v=${id}`
    };
  }).filter((item) => item.id && item.title);
}

async function main() {
  const [platform, identifier] = process.argv.slice(2);

  if (!platform || !identifier) {
    console.error("Usage: node scripts/fetch-creator-video-candidates.mjs <bilibili|youtube> <mid|handle>");
    process.exit(1);
  }

  const data = platform === "bilibili"
    ? await fetchBilibiliVideos(identifier)
    : await fetchYouTubeVideos(identifier);

  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
