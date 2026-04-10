import type { ScenarioState } from "@/types/scenario";

export function applyScenarioAnswer(
  scenario: ScenarioState,
  questionId: string,
  answerKey: string
): ScenarioState {
  const nextScenario: ScenarioState = {
    ...scenario,
    context: { ...scenario.context },
    serve: { ...scenario.serve },
    skill_detail: { ...scenario.skill_detail },
    incoming_ball: { ...scenario.incoming_ball },
    outcome: { ...scenario.outcome },
    subjective_feeling: { ...scenario.subjective_feeling, other: [...scenario.subjective_feeling.other] },
    slot_resolution: { ...scenario.slot_resolution },
    deep_progress: { ...scenario.deep_progress },
    asked_followup_ids: [...scenario.asked_followup_ids]
  };

  function mark(slot: keyof ScenarioState["slot_resolution"], state: ScenarioState["slot_resolution"][typeof slot]) {
    nextScenario.slot_resolution[slot] = state;
  }

  function applyNonAnswer(slot: keyof ScenarioState["slot_resolution"]) {
    if (answerKey === "skip") {
      mark(slot, "skipped");
      return true;
    }

    if (answerKey === "cannot_answer") {
      mark(slot, "cannot_answer");
      return true;
    }

    return false;
  }

  if (questionId === "q_broad_shot_family") {
    if (applyNonAnswer("stroke")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "serve" || answerKey === "return" || answerKey === "volley") {
      nextScenario.stroke = answerKey;
    }

    if (answerKey === "net_play") {
      nextScenario.stroke = "volley";
    }

    if (answerKey === "groundstroke" && nextScenario.stroke === "unknown") {
      nextScenario.stroke = "groundstroke";
    }

    mark("stroke", "answered");
  }

  if (questionId === "q_match_or_practice") {
    if (applyNonAnswer("context.session_type")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "practice" || answerKey === "match" || answerKey === "both") {
      nextScenario.context.session_type = answerKey;
    }

    mark("context.session_type", "answered");
  }

  if (questionId === "q_movement_state") {
    if (applyNonAnswer("context.movement")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "stationary" || answerKey === "moving") {
      nextScenario.context.movement = answerKey;
    }

    mark("context.movement", "answered");
  }

  if (questionId === "q_outcome_pattern") {
    if (applyNonAnswer("outcome.primary_error")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "net" || answerKey === "long" || answerKey === "weak" || answerKey === "no_control") {
      nextScenario.outcome.primary_error = answerKey;
    }

    mark("outcome.primary_error", "answered");
  }

  if (questionId === "q_serve_variant") {
    if (applyNonAnswer("context.serve_variant")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "first_serve" || answerKey === "second_serve" || answerKey === "both") {
      nextScenario.context.serve_variant = answerKey;
    }

    mark("context.serve_variant", "answered");
  }

  if (questionId === "q_serve_control_pattern") {
    if (applyNonAnswer("serve.control_pattern")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "net" || answerKey === "long" || answerKey === "wide" || answerKey === "no_rhythm") {
      nextScenario.serve.control_pattern = answerKey;
    }

    mark("serve.control_pattern", "answered");
  }

  if (questionId === "q_serve_mechanism_family") {
    if (applyNonAnswer("serve.mechanism_family")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "toss" || answerKey === "contact" || answerKey === "rhythm" || answerKey === "direction_control") {
      nextScenario.serve.mechanism_family = answerKey;
    }

    mark("serve.mechanism_family", "answered");
  }

  if (questionId === "q_incoming_ball_depth") {
    if (applyNonAnswer("incoming_ball.depth")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "short" || answerKey === "mid" || answerKey === "deep") {
      nextScenario.incoming_ball.depth = answerKey;
    }

    mark("incoming_ball.depth", "answered");
  }

  if (questionId === "q_feeling_rushed_or_tight") {
    if (applyNonAnswer("subjective_feeling.rushed")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    nextScenario.subjective_feeling.rushed = answerKey === "rushed";
    nextScenario.subjective_feeling.tight = answerKey === "tight";
    nextScenario.subjective_feeling.nervous = false;
    mark("subjective_feeling.rushed", "answered");
  }

  if (questionId === "q_return_positioning") {
    if (applyNonAnswer("skill_detail.return_positioning")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "jammed" || answerKey === "too_far_back" || answerKey === "stepping_in") {
      nextScenario.skill_detail.return_positioning = answerKey;
    }

    mark("skill_detail.return_positioning", "answered");
  }

  if (questionId === "q_return_first_ball_goal") {
    if (applyNonAnswer("skill_detail.return_first_ball_goal")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "block" || answerKey === "neutralize" || answerKey === "attack") {
      nextScenario.skill_detail.return_first_ball_goal = answerKey;
    }

    mark("skill_detail.return_first_ball_goal", "answered");
  }

  if (questionId === "q_volley_height") {
    if (applyNonAnswer("skill_detail.volley_height")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "low" || answerKey === "waist" || answerKey === "high") {
      nextScenario.skill_detail.volley_height = answerKey;
    }

    mark("skill_detail.volley_height", "answered");
  }

  if (questionId === "q_volley_racket_face") {
    if (applyNonAnswer("skill_detail.volley_racket_face")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "open" || answerKey === "closed" || answerKey === "unstable") {
      nextScenario.skill_detail.volley_racket_face = answerKey;
    }

    mark("skill_detail.volley_racket_face", "answered");
  }

  if (questionId === "q_overhead_contact") {
    if (applyNonAnswer("skill_detail.overhead_contact")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "late" || answerKey === "behind" || answerKey === "too_low") {
      nextScenario.skill_detail.overhead_contact = answerKey;
    }

    mark("skill_detail.overhead_contact", "answered");
  }

  if (questionId === "q_slice_response_pattern") {
    if (applyNonAnswer("skill_detail.slice_response_pattern")) {
      nextScenario.selected_next_question_id = questionId;
      nextScenario.asked_followup_ids.push(questionId);
      return nextScenario;
    }

    if (answerKey === "net" || answerKey === "float" || answerKey === "sits_up" || answerKey === "long") {
      nextScenario.skill_detail.slice_response_pattern = answerKey;
    }

    mark("skill_detail.slice_response_pattern", "answered");
  }

  nextScenario.selected_next_question_id = questionId;
  nextScenario.asked_followup_ids.push(questionId);
  return nextScenario;
}
