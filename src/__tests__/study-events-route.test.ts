import { beforeEach, describe, expect, it, vi } from "vitest";

const range = vi.fn();
const order = vi.fn();
const select = vi.fn();
const from = vi.fn();
const getSupabaseServerClient = vi.fn();

vi.mock("@/lib/supabaseServer", () => ({
  getSupabaseServerClient
}));

describe("GET /api/study/events", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    order.mockReturnValue({ order, range });
    select.mockReturnValue({ order, range });
    from.mockReturnValue({ select });
    getSupabaseServerClient.mockReturnValue({ from });
  });

  it("returns nextCursor when current page is full", async () => {
    range.mockResolvedValueOnce({
      data: [
        { id: "1", event_type: "page.view" },
        { id: "2", event_type: "page.leave" }
      ],
      error: null
    });

    const { GET } = await import("../app/api/study/events/route");
    const response = await GET(new Request("http://localhost/api/study/events?limit=2&cursor=0"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("event_logs");
    expect(range).toHaveBeenCalledWith(0, 1);
    expect(body.ok).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.page.nextCursor).toBe(2);
    expect(body.page.hasMore).toBe(true);
  });

  it("returns null nextCursor when page is exhausted", async () => {
    range.mockResolvedValueOnce({
      data: [{ id: "1", event_type: "page.view" }],
      error: null
    });

    const { GET } = await import("../app/api/study/events/route");
    const response = await GET(new Request("http://localhost/api/study/events?limit=2&cursor=2"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(range).toHaveBeenCalledWith(2, 3);
    expect(body.ok).toBe(true);
    expect(body.page.nextCursor).toBeNull();
    expect(body.page.hasMore).toBe(false);
  });

  it("does not expose the old study event POST transport anymore", async () => {
    const routeModule = await import("../app/api/study/events/route");

    expect("POST" in routeModule).toBe(false);
  });
});
