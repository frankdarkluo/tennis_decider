import type { MissingSlotPath } from "@/types/scenario";

export const scenarioCriticalSlotOrder: MissingSlotPath[] = [
  "context.session_type",
  "context.movement",
  "outcome.primary_error",
  "serve.control_pattern",
  "serve.mechanism_family",
  "incoming_ball.depth",
  "subjective_feeling.rushed"
];
