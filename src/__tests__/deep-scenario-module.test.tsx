import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockFetch = vi.fn();
const handleApply = vi.fn();

describe("DeepScenarioModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  it("runs an inline deep reconstruction and hands back a narrowed diagnosis input", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenario: {
          raw_user_input: "关键分时我的二发容易下网",
          language: "zh",
          stroke: "serve",
          context: {
            session_type: "match",
            pressure: "high",
            movement: "stationary",
            format: "unknown"
          },
          incoming_ball: {
            depth: "unknown",
            height: "unknown",
            pace: "unknown",
            spin: "unknown",
            direction: "unknown"
          },
          outcome: {
            primary_error: "net",
            frequency: "often"
          },
          subjective_feeling: {
            tight: true,
            rushed: false,
            awkward: false,
            hesitant: false,
            nervous: false,
            late_contact: false,
            no_timing: false,
            other: []
          },
          user_confidence: "medium",
          missing_slots: ["incoming_ball.depth"],
          next_question_candidates: [],
          selected_next_question_id: null
        },
        missing_slots: ["incoming_ball.depth"],
        eligible_questions: [],
        selected_question: null,
        done: true
      })
    } satisfies Partial<Response>);

    const { DeepScenarioModule } = await import("@/components/diagnose/DeepScenarioModule");

    render(
      <DeepScenarioModule
        sourceText="关键分时我的二发容易下网"
        language="zh"
        visible
        resetSignal={0}
        onApplyScenario={handleApply}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "开始场景还原" }));

    expect(await screen.findByText("当前场景已经足够进入后续分析。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "进入后续分析" }));

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith(expect.objectContaining({
        diagnosisInput: expect.stringContaining("二发"),
        scenario: expect.objectContaining({
          stroke: "serve"
        })
      }));
    });
  });
});
