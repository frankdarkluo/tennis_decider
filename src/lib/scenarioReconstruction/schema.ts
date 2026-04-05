import type { MissingSlotPath } from "@/types/scenario";

export const scenarioCriticalSlotOrder: MissingSlotPath[] = [
  "context.session_type",
  "context.movement",
  "outcome.primary_error",
  "incoming_ball.depth",
  "subjective_feeling.rushed"
];
