import type { ScenarioState } from "@/types/scenario";

export function applyScenarioAnswer(
  scenario: ScenarioState,
  questionId: string,
  answerKey: string
): ScenarioState {
  const nextScenario: ScenarioState = {
    ...scenario,
    context: { ...scenario.context },
    incoming_ball: { ...scenario.incoming_ball },
    outcome: { ...scenario.outcome },
    subjective_feeling: { ...scenario.subjective_feeling, other: [...scenario.subjective_feeling.other] }
  };

  if (questionId === "q_match_or_practice") {
    if (answerKey === "practice" || answerKey === "match" || answerKey === "both") {
      nextScenario.context.session_type = answerKey;
    }
  }

  if (questionId === "q_movement_state") {
    if (answerKey === "stationary" || answerKey === "moving") {
      nextScenario.context.movement = answerKey;
    }
  }

  if (questionId === "q_outcome_pattern") {
    if (answerKey === "net" || answerKey === "long" || answerKey === "weak" || answerKey === "no_control") {
      nextScenario.outcome.primary_error = answerKey;
    }
  }

  if (questionId === "q_incoming_ball_depth") {
    if (answerKey === "short" || answerKey === "mid" || answerKey === "deep") {
      nextScenario.incoming_ball.depth = answerKey;
    }
  }

  if (questionId === "q_feeling_rushed_or_tight") {
    nextScenario.subjective_feeling.rushed = answerKey === "rushed";
    nextScenario.subjective_feeling.tight = answerKey === "tight" || nextScenario.subjective_feeling.tight;
  }

  nextScenario.selected_next_question_id = questionId;
  return nextScenario;
}
