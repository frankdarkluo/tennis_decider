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
            serve_variant: "second_serve",
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
          selected_next_question_id: null,
          asked_followup_ids: []
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

  it("resets the active reconstruction when the complaint text changes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenario: {
          raw_user_input: "比赛里我反手老下网",
          language: "zh",
          stroke: "backhand",
          context: {
            session_type: "match",
            serve_variant: "unknown",
            pressure: "unknown",
            movement: "moving",
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
            tight: false,
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
          next_question_candidates: ["q_incoming_ball_depth"],
          selected_next_question_id: "q_incoming_ball_depth",
          asked_followup_ids: []
        },
        missing_slots: ["incoming_ball.depth"],
        eligible_questions: [
          {
            id: "q_incoming_ball_depth",
            family: "incoming_ball_depth",
            category: "scenario_localization",
            target_slots: ["incoming_ball.depth"],
            fillsSlots: ["incoming_ball.depth"],
            priority: 70,
            zh: "这个问题更常出现在对手球比较深的时候吗？",
            en: "Does this happen more when the incoming ball is deeper?",
            ask_when: [],
            do_not_ask_when: [],
            information_gain_weight: 0.8,
            presupposition_risk: 0.28,
            easy_to_answer_score: 0.82,
            options: [
              { key: "deep", zh: "深球更明显", en: "More on deep balls" }
            ]
          }
        ],
        selected_question: {
          id: "q_incoming_ball_depth",
          family: "incoming_ball_depth",
          category: "scenario_localization",
          target_slots: ["incoming_ball.depth"],
          fillsSlots: ["incoming_ball.depth"],
          priority: 70,
          zh: "这个问题更常出现在对手球比较深的时候吗？",
          en: "Does this happen more when the incoming ball is deeper?",
          ask_when: [],
          do_not_ask_when: [],
          information_gain_weight: 0.8,
          presupposition_risk: 0.28,
          easy_to_answer_score: 0.82,
          options: [
            { key: "deep", zh: "深球更明显", en: "More on deep balls" }
          ]
        },
        done: false
      })
    } satisfies Partial<Response>);

    const { DeepScenarioModule } = await import("@/components/diagnose/DeepScenarioModule");

    const view = render(
      <DeepScenarioModule
        sourceText="比赛里我反手老下网"
        language="zh"
        visible
        resetSignal={0}
        onApplyScenario={handleApply}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "开始场景还原" }));

    expect(await screen.findByText("这个问题更常出现在对手球比较深的时候吗？")).toBeInTheDocument();

    view.rerender(
      <DeepScenarioModule
        sourceText="一发总发不进"
        language="zh"
        visible
        resetSignal={0}
        onApplyScenario={handleApply}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("这个问题更常出现在对手球比较深的时候吗？")).not.toBeInTheDocument();
    });
    expect(screen.getByText("一发总发不进")).toBeInTheDocument();
    expect(screen.queryByText("下一步先问")).not.toBeInTheDocument();
  });
});
