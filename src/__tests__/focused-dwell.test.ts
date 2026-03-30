import { describe, expect, it } from "vitest";
import {
  createFocusedDwellState,
  finishFocusedDwell,
  markFocusedDwellInteraction,
  updateFocusedDwellState
} from "@/lib/study/focusedDwell";

describe("focused dwell helpers", () => {
  it("counts only the intervals when the page is visible and focused", () => {
    const started = createFocusedDwellState(1_000, {
      isVisible: true,
      isWindowFocused: true
    });
    const hidden = updateFocusedDwellState(started, 6_000, {
      isVisible: false,
      isWindowFocused: true
    });
    const resumed = updateFocusedDwellState(hidden, 15_000, {
      isVisible: true,
      isWindowFocused: true
    });
    const finished = finishFocusedDwell(resumed, 19_000, {
      isVisible: true,
      isWindowFocused: true
    });

    expect(finished.dwellMs).toBe(18_000);
    expect(finished.focusedDwellMs).toBe(9_000);
  });

  it("counts active dwell only during recent interaction windows while focused", () => {
    const started = createFocusedDwellState(1_000, {
      isVisible: true,
      isWindowFocused: true
    });
    const interacted = markFocusedDwellInteraction(started, 2_000);
    const blurred = updateFocusedDwellState(interacted, 8_000, {
      isVisible: true,
      isWindowFocused: false
    });
    const resumed = updateFocusedDwellState(blurred, 12_000, {
      isVisible: true,
      isWindowFocused: true
    });
    const interactedAgain = markFocusedDwellInteraction(resumed, 13_000);
    const finished = finishFocusedDwell(interactedAgain, 26_000, {
      isVisible: true,
      isWindowFocused: true
    });

    expect(finished.focusedDwellMs).toBe(21_000);
    expect(finished.activeDwellMs).toBe(16_000);
  });
});
