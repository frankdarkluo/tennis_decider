import { AssessmentQuestion } from "@/types/assessment";
import { StudyLanguage } from "@/types/study";

const questionCopy: Record<string, { en: string; labels?: Record<number, string> }> = {
  gender: {
    en: "What is your gender?",
    labels: { 1: "Male", 2: "Female" }
  },
  years: {
    en: "How long have you been playing tennis?"
  },
  coarse_rally: {
    en: "How many shots can you usually hit in a rally during practice?",
    labels: {
      1: "Up to 3 shots",
      2: "4-8 shots",
      3: "9-15 shots",
      4: "16+ shots, without many unforced errors"
    }
  },
  coarse_serve: {
    en: "How would you describe your serve right now?",
    labels: {
      1: "Still learning, often miss",
      2: "Can land it, little spin",
      3: "Some spin and placement control",
      4: "Attacking first serve, stable second serve"
    }
  },
  coarse_movement: {
    en: "What usually happens with your movement and recovery?",
    labels: {
      1: "I get stuck and watch balls go by",
      2: "I chase balls, but I am often late",
      3: "I reach most balls and recover reasonably well",
      4: "My first step and recovery are natural, and I rarely get wrong-footed"
    }
  },
  coarse_awareness: {
    en: "What is usually in your head during rallies or matches?",
    labels: {
      1: "Just put the ball back",
      2: "I think about direction but cannot execute it",
      3: "I can move the opponent on purpose",
      4: "I can build tactics around opponent weaknesses"
    }
  },
  coarse_pressure: {
    en: "What usually happens when the score gets tight or practice gets pressured?",
    labels: {
      1: "I get tight and errors jump quickly",
      2: "I become passive and my quality drops",
      3: "I stay close to my normal level",
      4: "I usually raise my level on important points"
    }
  },
  fine_a_grip: {
    en: "How stable are your grip and preparation habits?",
    labels: {
      1: "Still unsure how to hold the racquet",
      2: "I know it, but forget often",
      3: "Mostly stable, sometimes messy",
      4: "Feels natural already"
    }
  },
  fine_a_fast: {
    en: "What happens when the incoming ball gets a little faster?",
    labels: {
      1: "I often cannot react in time",
      2: "I can touch it but lose direction",
      3: "I usually get it back",
      4: "I get it back with decent quality"
    }
  },
  fine_a_issue: {
    en: "What is your biggest issue right now?",
    labels: {
      1: "My mechanics are not stable yet",
      2: "I have the motion, but too many errors",
      3: "My consistency comes and goes",
      4: "I am stable and want more variety"
    }
  },
  fine_a_movement: {
    en: "How are your movement and recovery during points?",
    labels: {
      1: "I often stay in one spot after I hit",
      2: "I move, but rarely recover in time",
      3: "I usually get back to a ready position",
      4: "Recovery after each shot feels natural"
    }
  },
  fine_b_both_sides: {
    en: "How big is the gap between your forehand and backhand?",
    labels: {
      1: "Backhand is much weaker",
      2: "I can hit it, but do not trust it",
      3: "Not much gap, both are fairly stable",
      4: "I can attack with both sides"
    }
  },
  fine_b_direction: {
    en: "Can you control direction on purpose?",
    labels: {
      1: "Not really",
      2: "Only sometimes",
      3: "Most of the time",
      4: "I can hit crosscourt and down the line on purpose"
    }
  },
  fine_b_rhythm: {
    en: "What happens when the opponent changes pace or spin?",
    labels: {
      1: "I break down easily",
      2: "I hang on, but quality drops a lot",
      3: "I adapt and keep decent quality",
      4: "It does not affect me much"
    }
  },
  fine_b_serve_game: {
    en: "How stable are your service games?",
    labels: {
      1: "I lose most of my service games",
      2: "I hold sometimes, but not reliably",
      3: "I usually steady the game with my serve",
      4: "My serve games are a dependable weapon"
    }
  },
  fine_c_net: {
    en: "How would you describe your net play?",
    labels: {
      1: "I almost never come to the net",
      2: "I come to the net sometimes and can handle simple volleys",
      3: "I come to the net on purpose and feel fairly confident with my volleys",
      4: "Net play is one of my regular ways to win points"
    }
  },
  fine_c_depth: {
    en: "How much depth and variation do you have?",
    labels: {
      1: "Balls often land near the service line",
      2: "I can hit deep, but with little variation",
      3: "I can control depth and change direction",
      4: "I combine depth, angles, and spin"
    }
  },
  fine_c_forcing: {
    en: "Can you force errors from your opponent?",
    labels: {
      1: "Mostly waiting for their errors",
      2: "Sometimes I hit a pressuring ball",
      3: "I can force errors consistently through steady pressure",
      4: "I create scoring opportunities through point construction"
    }
  },
  fine_c_adaptability: {
    en: "Can you adjust your game plan for different opponents?",
    labels: {
      1: "I mostly play the same way regardless of the opponent",
      2: "I notice what to change, but I cannot execute it in matches",
      3: "I can make targeted adjustments during a match",
      4: "I actively shape and switch tactics for different opponents"
    }
  },
  fine_c_pressure: {
    en: "How do you perform on big points?",
    labels: {
      1: "I get nervous and errors increase noticeably",
      2: "I hang in but play passively, afraid to attack",
      3: "I keep my normal level and sometimes hit a good shot",
      4: "I can attack on big points and have a reliable weapon"
    }
  }
};

export function formatAssessmentYearsLabel(value: number, language: StudyLanguage) {
  if (language === "en") {
    if (value === 0.5) {
      return "6 months";
    }
    if (value >= 10) {
      return "10+ years";
    }
    return `${value} year${value === 1 ? "" : "s"}`;
  }

  if (value === 0.5) {
    return "半年";
  }

  if (value >= 10) {
    return "10年+";
  }

  return `${value}年`;
}

export function getAssessmentQuestionText(question: AssessmentQuestion, language: StudyLanguage) {
  if (language === "zh") {
    return question.question;
  }

  return questionCopy[question.id]?.en ?? question.question;
}

export function getAssessmentOptionLabel(questionId: string, value: number, fallback: string, language: StudyLanguage) {
  if (language === "zh") {
    return fallback;
  }

  return questionCopy[questionId]?.labels?.[value] ?? fallback;
}
