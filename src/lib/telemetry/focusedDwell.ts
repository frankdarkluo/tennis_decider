export type FocusedDwellState = {
  enteredAt: number;
  focusedAccumulatedMs: number;
  focusedStartedAt: number | null;
  activeAccumulatedMs: number;
  activeStartedAt: number | null;
  activeUntilAt: number | null;
  isVisible: boolean;
  isWindowFocused: boolean;
};

type FocusStateInput = {
  isVisible: boolean;
  isWindowFocused: boolean;
};

function shouldCountFocusedTime(input: FocusStateInput) {
  return input.isVisible && input.isWindowFocused;
}

const ACTIVE_DWELL_WINDOW_MS = 10_000;

export function createFocusedDwellState(now: number, input: FocusStateInput): FocusedDwellState {
  return {
    enteredAt: now,
    focusedAccumulatedMs: 0,
    focusedStartedAt: shouldCountFocusedTime(input) ? now : null,
    activeAccumulatedMs: 0,
    activeStartedAt: null,
    activeUntilAt: null,
    isVisible: input.isVisible,
    isWindowFocused: input.isWindowFocused
  };
}

export function updateFocusedDwellState(
  state: FocusedDwellState,
  now: number,
  input: FocusStateInput
) {
  const wasCounting = shouldCountFocusedTime(state);
  const shouldCount = shouldCountFocusedTime(input);
  let focusedAccumulatedMs = state.focusedAccumulatedMs;
  let activeAccumulatedMs = state.activeAccumulatedMs;

  if (wasCounting && state.focusedStartedAt !== null) {
    focusedAccumulatedMs += Math.max(0, now - state.focusedStartedAt);
  }

  if (wasCounting && state.activeStartedAt !== null && state.activeUntilAt !== null) {
    activeAccumulatedMs += Math.max(0, Math.min(now, state.activeUntilAt) - state.activeStartedAt);
  }

  const activeWindowStillOpen = shouldCount
    && state.activeUntilAt !== null
    && state.activeUntilAt > now;

  return {
    ...state,
    focusedAccumulatedMs,
    activeAccumulatedMs,
    focusedStartedAt: shouldCount ? now : null,
    activeStartedAt: activeWindowStillOpen ? now : null,
    activeUntilAt: activeWindowStillOpen ? state.activeUntilAt : null,
    isVisible: input.isVisible,
    isWindowFocused: input.isWindowFocused
  };
}

export function markFocusedDwellInteraction(
  state: FocusedDwellState,
  now: number
) {
  const settled = updateFocusedDwellState(state, now, {
    isVisible: state.isVisible,
    isWindowFocused: state.isWindowFocused
  });

  if (!shouldCountFocusedTime(settled)) {
    return settled;
  }

  return {
    ...settled,
    activeStartedAt: now,
    activeUntilAt: Math.max(settled.activeUntilAt ?? now, now + ACTIVE_DWELL_WINDOW_MS)
  };
}

export function finishFocusedDwell(
  state: FocusedDwellState,
  now: number,
  input: FocusStateInput
) {
  const settled = updateFocusedDwellState(state, now, input);

  return {
    dwellMs: Math.max(0, now - settled.enteredAt),
    focusedDwellMs: settled.focusedAccumulatedMs,
    activeDwellMs: settled.activeAccumulatedMs
  };
}
