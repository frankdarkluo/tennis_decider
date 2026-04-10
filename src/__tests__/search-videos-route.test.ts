import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("search videos route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns supported availability for live bilibili search results", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          result: [
            {
              bvid: "BV1demo123456",
              title: "Serve rhythm drill",
              author: "Coach Demo",
              pic: "//i0.hdslb.com/demo.jpg",
              play: "3.2万",
              duration: "04:12",
              pubdate: 1710000000
            }
          ]
        }
      })
    })) as unknown as typeof fetch);

    const { POST } = await import("@/app/api/search-videos/route");
    const response = await POST(new Request("http://localhost/api/search-videos", {
      method: "POST",
      body: JSON.stringify({
        platform: "bilibili",
        query: "serve rhythm",
        maxResults: 1
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.availability).toBe("supported");
    expect(body.cached).toBe(false);
    expect(body.results).toHaveLength(1);
    expect(body.results[0]).toMatchObject({
      platform: "bilibili",
      title: "Serve rhythm drill",
      author: "Coach Demo"
    });
  });

  it("returns unsupported availability for planned connectors without pretending live support", async () => {
    const { POST } = await import("@/app/api/search-videos/route");
    const response = await POST(new Request("http://localhost/api/search-videos", {
      method: "POST",
      body: JSON.stringify({
        platform: "instagram",
        query: "serve rhythm"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.availability).toBe("unsupported");
    expect(body.cached).toBe(false);
    expect(body.results).toEqual([]);
  });

  it("returns not_configured availability when youtube search is enabled in code but missing credentials", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");

    const { POST } = await import("@/app/api/search-videos/route");
    const response = await POST(new Request("http://localhost/api/search-videos", {
      method: "POST",
      body: JSON.stringify({
        platform: "youtube",
        query: "serve rhythm"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.availability).toBe("not_configured");
    expect(body.cached).toBe(false);
    expect(body.results).toEqual([]);
  });
});
