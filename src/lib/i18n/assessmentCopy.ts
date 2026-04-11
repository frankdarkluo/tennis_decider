import { AssessmentQuestion } from "@/types/assessment";
import { LocaleValue } from "@/lib/i18n/config";

const questionCopy: Record<string, { en: string; labels?: Record<string, string>; descriptions?: Record<string, string> }> = {
  rally_stability: {
    en: "During a normal rally, what quality do you usually sustain?",
    labels: {
      rally_1: "I often miss within 3 balls",
      rally_2: "I can hold 4–8 balls, but a faster, deeper, or wider ball breaks it down",
      rally_3: "I can usually hold 9–15 balls, even when the pace rises a bit",
      rally_4: "I can usually keep quality beyond 16 balls with relatively few unforced errors"
    }
  },
  forehand_weapon: {
    en: "When you get a comfortable forehand, which one sounds closest?",
    labels: {
      forehand_1: "I mostly just guide it back without real pressure",
      forehand_2: "I swing for it, but errors are still too high to trust in matches",
      forehand_3: "I can usually produce a quality forehand and sometimes pin the opponent back",
      forehand_4: "My forehand is already a real weapon that can change direction, accelerate, or create openings"
    }
  },
  backhand_slice_reliability: {
    en: "How would you describe your backhand and slice as a whole?",
    labels: {
      backhand_slice_1: "My backhand is a clear liability and I rarely trust the slice",
      backhand_slice_2: "I can hit the backhand, but pressure breaks it down and the slice floats or sits short",
      backhand_slice_3: "I can usually hold the backhand, and the slice works as a neutral or defensive change-up",
      backhand_slice_4: "I can hold the backhand in exchanges, and the slice can stay low or disrupt rhythm on purpose"
    }
  },
  serve_quality: {
    en: "In your service games, what does your serve feel like right now?",
    labels: {
      serve_1: "Both first-serve percentage and second-serve safety are shaky, and I donate points outright",
      serve_2: "I can land some first serves, but the second serve is vulnerable",
      serve_3: "My first serve has basic placement or rhythm, and my second serve usually starts the rally cleanly",
      serve_4: "My first serve can create an edge, and my second serve is dependable"
    }
  },
  return_quality: {
    en: "Against an opponent's serve, which one sounds closest to your return?",
    labels: {
      return_1: "I often miss the contact point and only poke it back or miss outright",
      return_2: "I can return ordinary serves, but pace or spin quickly exposes me",
      return_3: "I can return most serves in and start the rally normally",
      return_4: "I can return in and also use placement, tempo, or direction to pressure the server"
    }
  },
  movement_recovery: {
    en: "How would you describe your movement, deceleration, and recovery?",
    labels: {
      movement_1: "I am often a half-step late and get stuck after I hit",
      movement_2: "I can chase a lot of balls, but I struggle to connect the next shot after stopping",
      movement_3: "I reach most balls and usually recover back to a usable ready position",
      movement_4: "My start, stop, and recovery are natural, and I can still keep reasonable shot quality on the run"
    }
  },
  net_transition_volley: {
    en: "How would you describe your transition forward, volleys, and half-volleys?",
    labels: {
      net_1: "I rarely come forward, and the first volley often breaks down immediately",
      net_2: "I can handle simple high balls, but low balls, pace, or half-volleys get messy fast",
      net_3: "I know when to come in, I usually clean up the first volley, and I can sometimes save a half-volley",
      net_4: "I can use the net to pressure or finish points, and even low balls and half-volleys have baseline quality"
    }
  },
  overhead_highball: {
    en: "When you handle high balls and overheads, which one sounds closest?",
    labels: {
      overhead_1: "I often misread the drop point and do not trust the overhead",
      overhead_2: "I can reach the ball, but the footwork and contact point are still unstable",
      overhead_3: "I handle most high balls and overheads cleanly and do not donate them easily",
      overhead_4: "I can actively finish with the overhead and stay composed on deeper recovery lobs"
    }
  },
  pressure_matchplay: {
    en: "When the score gets tight or a miss streak starts, what usually happens?",
    labels: {
      pressure_1: "I tighten up, the motion changes, and errors jump quickly",
      pressure_2: "I get noticeably more passive and the quality drops a lot",
      pressure_3: "I stay close to my normal level and do not completely fall apart on big points",
      pressure_4: "I keep a clear head on big points and still trust my most reliable patterns"
    }
  },
  point_construction: {
    en: "In rallies or matches, can you organize points with a clear idea?",
    labels: {
      tactics_1: "I mostly just send the ball back and rarely think about the next shot",
      tactics_2: "I know what I want to do, but the first shot often fails and the point gets messy",
      tactics_3: "I have one or two usable patterns, like pressing one side before opening space",
      tactics_4: "I can switch patterns based on the opponent, score, and incoming ball quality instead of just rallying mechanically"
    }
  },
  play_style_profile: {
    en: "Which playing style feels closest right now?",
    labels: {
      defensive: "Defensive",
      baseline_attack: "Baseline attack",
      all_court: "All-court",
      net_pressure: "Net pressure"
    },
    descriptions: {
      defensive: "Stabilize the rally first and wait for the opponent to miss",
      baseline_attack: "Use baseline ball quality to push the opponent back",
      all_court: "Look for chances to move forward and connect baseline play to net play",
      net_pressure: "Prefer to press with the net, volleys, and doubles-style patterns"
    }
  },
  play_context_modifier: {
    en: "Which real playing context sounds closest right now?",
    labels: {
      singles_standard: "Singles first",
      singles_limited_mobility: "Singles with load control",
      mixed_with_doubles: "Singles and doubles mix",
      doubles_primary: "Doubles first"
    },
    descriptions: {
      singles_standard: "Movement is not the main limiting factor",
      singles_limited_mobility: "Fitness, movement, or recovery has to be managed carefully",
      mixed_with_doubles: "Net play and partner coordination also matter",
      doubles_primary: "You want more positioning, rotation, and net pressure content"
    }
  }
};

export function getAssessmentQuestionText(question: AssessmentQuestion, language: LocaleValue) {
  if (language === "zh") {
    return question.prompt;
  }

  return questionCopy[question.id]?.en ?? question.prompt;
}

export function getAssessmentOptionLabel(questionId: string, value: string, fallback: string, language: LocaleValue) {
  if (language === "zh") {
    return fallback;
  }

  return questionCopy[questionId]?.labels?.[value] ?? fallback;
}

export function getAssessmentOptionDescription(questionId: string, value: string, fallback: string | undefined, language: LocaleValue) {
  if (language === "zh") {
    return fallback;
  }

  return questionCopy[questionId]?.descriptions?.[value] ?? fallback;
}
