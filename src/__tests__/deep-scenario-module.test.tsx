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
          serve: {
            control_pattern: "net",
            mechanism_family: "rhythm"
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
          slot_resolution: {
            stroke: "answered",
            "context.session_type": "answered",
            "context.serve_variant": "answered",
            "context.movement": "answered",
            "outcome.primary_error": "answered",
            "serve.control_pattern": "answered",
            "serve.mechanism_family": "answered",
            "incoming_ball.depth": "unasked",
            "subjective_feeling.rushed": "answered"
          },
          deep_progress: {
            deepReady: true,
            stoppedByCap: false,
            requiredRemaining: [],
            optionalRemaining: ["incoming_ball.depth"],
            unresolvedRequiredBecauseOfSkip: [],
            unresolvedRequiredBecauseUnavailable: []
          },
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

    expect(await screen.findByText("当前场景已经补全到可进入深入分析。")).toBeInTheDocument();

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
          slot_resolution: {
            stroke: "answered",
            "context.session_type": "answered",
            "context.serve_variant": "unasked",
            "context.movement": "answered",
            "outcome.primary_error": "answered",
            "incoming_ball.depth": "unasked",
            "subjective_feeling.rushed": "unasked"
          },
          deep_progress: {
            deepReady: false,
            stoppedByCap: false,
            requiredRemaining: ["subjective_feeling.rushed", "incoming_ball.depth"],
            optionalRemaining: [],
            unresolvedRequiredBecauseOfSkip: [],
            unresolvedRequiredBecauseUnavailable: []
          },
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

  it("keeps the proceed CTA hidden while Deep Mode is still gathering required information", async () => {
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
          slot_resolution: {
            stroke: "answered",
            "context.session_type": "answered",
            "context.serve_variant": "unasked",
            "context.movement": "answered",
            "outcome.primary_error": "answered",
            "incoming_ball.depth": "unasked",
            "subjective_feeling.rushed": "unasked"
          },
          deep_progress: {
            deepReady: false,
            stoppedByCap: false,
            requiredRemaining: ["incoming_ball.depth", "subjective_feeling.rushed"],
            optionalRemaining: [],
            unresolvedRequiredBecauseOfSkip: [],
            unresolvedRequiredBecauseUnavailable: []
          },
          missing_slots: ["incoming_ball.depth", "subjective_feeling.rushed"],
          next_question_candidates: ["q_incoming_ball_depth", "q_feeling_rushed_or_tight"],
          selected_next_question_id: "q_incoming_ball_depth",
          asked_followup_ids: []
        },
        missing_slots: ["incoming_ball.depth", "subjective_feeling.rushed"],
        eligible_questions: [],
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
            { key: "deep", zh: "深球更明显", en: "More on deep balls" },
            { key: "skip", zh: "先跳过", en: "Skip for now" },
            { key: "cannot_answer", zh: "说不清", en: "Can't answer" }
          ]
        },
        done: false
      })
    } satisfies Partial<Response>);

    const { DeepScenarioModule } = await import("@/components/diagnose/DeepScenarioModule");

    render(
      <DeepScenarioModule
        sourceText="比赛里我反手老下网"
        language="zh"
        visible
        resetSignal={0}
        onApplyScenario={handleApply}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "开始场景还原" }));

    expect(await screen.findByText("仍在补全关键场景信息")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "进入后续分析" })).not.toBeInTheDocument();
  });
});
