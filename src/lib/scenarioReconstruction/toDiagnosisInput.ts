import type { ScenarioState } from "@/types/scenario";

type ScenarioHandoffLocale = "zh" | "en";
type ServeSubtype = "first_serve" | "second_serve" | "unknown";

function inferServeSubtype(rawInput: string): ServeSubtype {
  const normalized = rawInput.trim();

  if (/(?:二发|第二发|second serve|second-serve|secondserve)/i.test(normalized)) {
    return "second_serve";
  }

  if (/(?:一发(?!力)|第一发|first serve|first-serve|firstserve)/i.test(normalized)) {
    return "first_serve";
  }

  return "unknown";
}

function buildZhStroke(stroke: ScenarioState["stroke"]) {
  if (stroke === "forehand") return "正手";
  if (stroke === "backhand") return "反手";
  if (stroke === "serve") return "发球";
  if (stroke === "return") return "接发";
  if (stroke === "volley") return "截击";
  if (stroke === "overhead") return "高压";
  return "";
}

function buildEnStroke(stroke: ScenarioState["stroke"]) {
  if (stroke === "forehand") return "forehand";
  if (stroke === "backhand") return "backhand";
  if (stroke === "serve") return "serve";
  if (stroke === "return") return "return";
  if (stroke === "volley") return "volley";
  if (stroke === "overhead") return "overhead";
  return "";
}

function buildZhOutcome(
  stroke: ScenarioState["stroke"],
  outcome: ScenarioState["outcome"]["primary_error"],
  serveSubtype: ServeSubtype
) {
  if (stroke === "serve" && serveSubtype === "first_serve" && outcome === "net") return "一发发不进";
  if (stroke === "serve" && serveSubtype === "second_serve" && outcome === "net") return "二发容易下网";
  if (stroke === "serve" && serveSubtype === "second_serve" && outcome === "no_control") return "二发容易双误";
  if (stroke === "serve" && outcome === "net") return "发球容易下网";
  if (stroke === "serve" && outcome === "no_control") return "发球不太受控";
  if (outcome === "net") return "老下网";
  if (outcome === "long") return "容易出界";
  if (outcome === "no_power") return "总是没力量";
  if (outcome === "no_control") return "不太受控";
  if (outcome === "weak") return "回球偏软";
  return "";
}

function buildEnOutcome(
  stroke: ScenarioState["stroke"],
  outcome: ScenarioState["outcome"]["primary_error"],
  serveSubtype: ServeSubtype
) {
  if (stroke === "serve" && serveSubtype === "first_serve" && outcome === "net") return "first serve won't go in";
  if (stroke === "serve" && serveSubtype === "second_serve" && outcome === "net") return "second serve keeps going into the net";
  if (stroke === "serve" && serveSubtype === "second_serve" && outcome === "no_control") return "second serve double-faults";
  if (stroke === "serve" && outcome === "net") return "serve keeps going into the net";
  if (stroke === "serve" && outcome === "no_control") return "serve feels out of control";
  if (outcome === "net") return "keeps going into the net";
  if (outcome === "long") return "keeps flying long";
  if (outcome === "no_power") return "has no power";
  if (outcome === "no_control") return "feels out of control";
  if (outcome === "weak") return "floats too softly";
  return "";
}

function buildZhFeeling(scenario: ScenarioState) {
  if (scenario.subjective_feeling.tight) return "而且会发紧";
  if (scenario.subjective_feeling.nervous) return "而且容易紧张";
  if (scenario.subjective_feeling.rushed) return "而且容易着急";
  return "";
}

function buildZhServeControlDetail(scenario: ScenarioState) {
  if (scenario.stroke !== "serve") {
    return "";
  }

  if (scenario.serve.control_pattern === "net") return "更像发球总下网";
  if (scenario.serve.control_pattern === "long") return "更像发球总偏长";
  if (scenario.serve.control_pattern === "wide") return "更像发球偏左偏右";
  if (scenario.serve.control_pattern === "no_rhythm") return "更像发球完全没节奏";
  return "";
}

function buildEnServeControlDetail(scenario: ScenarioState) {
  if (scenario.stroke !== "serve") {
    return "";
  }

  if (scenario.serve.control_pattern === "net") return "more like the serve keeps going into the net";
  if (scenario.serve.control_pattern === "long") return "more like the serve keeps flying long";
  if (scenario.serve.control_pattern === "wide") return "more like serve placement keeps drifting left-right";
  if (scenario.serve.control_pattern === "no_rhythm") return "more like the serve has no rhythm at all";
  return "";
}

function buildZhServeMechanismDetail(scenario: ScenarioState) {
  if (scenario.stroke !== "serve") {
    return "";
  }

  if (scenario.serve.mechanism_family === "toss") return "更像发球抛球不稳";
  if (scenario.serve.mechanism_family === "contact") return "更像发球击球点和触球时机乱";
  if (scenario.serve.mechanism_family === "rhythm") return "更像发球节奏和时机乱";
  if (scenario.serve.mechanism_family === "direction_control") return "更像发球落点和方向控制不住";
  return "";
}

function buildEnServeMechanismDetail(scenario: ScenarioState) {
  if (scenario.stroke !== "serve") {
    return "";
  }

  if (scenario.serve.mechanism_family === "toss") return "it feels more like the serve toss is unstable";
  if (scenario.serve.mechanism_family === "contact") return "it feels more like the serve contact point and timing are messy";
  if (scenario.serve.mechanism_family === "rhythm") return "it feels more like the serve rhythm and timing break down";
  if (scenario.serve.mechanism_family === "direction_control") return "it feels more like serve placement and direction control keep drifting";
  return "";
}

function buildEnFeeling(scenario: ScenarioState) {
  if (scenario.subjective_feeling.tight) return "and it feels tight";
  if (scenario.subjective_feeling.nervous) return "and I get nervous";
  if (scenario.subjective_feeling.rushed) return "and I feel rushed";
  return "";
}

function buildZhSummary(scenario: ScenarioState) {
  const leadParts: string[] = [];
  const serveSubtype = inferServeSubtype(scenario.raw_user_input);
  const suppressPressureContext = scenario.stroke === "serve" && serveSubtype === "second_serve";

  if (scenario.context.session_type === "match") {
    leadParts.push("比赛里");
  } else if (scenario.context.session_type === "practice") {
    leadParts.push("练习里");
  }

  if (scenario.context.pressure === "high" && !suppressPressureContext) {
    leadParts.push("关键分时");
  }

  const movement = scenario.context.movement === "moving"
    ? "跑动中的"
    : scenario.context.movement === "stationary"
      ? "原地的"
      : "";
  const stroke = buildZhStroke(scenario.stroke);
  const outcome = buildZhOutcome(scenario.stroke, scenario.outcome.primary_error, serveSubtype);
  const subject = `${movement}${stroke}`;

  if (subject || outcome) {
    const prefix = leadParts.length === 0 && subject ? "我的" : "我";
    leadParts.push(`${prefix}${subject}${outcome}`);
  }

  const detailParts: string[] = [];

  if (scenario.incoming_ball.depth === "deep") {
    detailParts.push("尤其对手球比较深的时候更明显");
  }

  const serveControlDetail = buildZhServeControlDetail(scenario);
  if (serveControlDetail) {
    detailParts.push(serveControlDetail);
  }

  const feeling = buildZhFeeling(scenario);
  if (feeling && !suppressPressureContext) {
    detailParts.push(feeling);
  }

  const serveMechanismDetail = buildZhServeMechanismDetail(scenario);
  if (serveMechanismDetail) {
    detailParts.push(serveMechanismDetail);
  }

  const summary = [leadParts.join(""), ...detailParts].filter(Boolean).join("，");

  if (summary) {
    return `${summary}。`;
  }

  if (scenario.raw_user_input.trim()) {
    return scenario.raw_user_input.trim().replace(/[。.!?]$/, "") + "。";
  }

  return "我想继续分析这个问题。";
}

function buildEnSummary(scenario: ScenarioState) {
  const leadParts: string[] = [];
  const serveSubtype = inferServeSubtype(scenario.raw_user_input);
  const suppressPressureContext = scenario.stroke === "serve" && serveSubtype === "second_serve";

  if (scenario.context.session_type === "match") {
    leadParts.push("In matches");
  } else if (scenario.context.session_type === "practice") {
    leadParts.push("In practice");
  }

  if (scenario.context.pressure === "high" && !suppressPressureContext) {
    leadParts.push("on key points");
  }

  const movement = scenario.context.movement === "moving"
    ? "moving "
    : scenario.context.movement === "stationary"
      ? "stationary "
      : "";
  const stroke = buildEnStroke(scenario.stroke);
  const outcome = buildEnOutcome(scenario.stroke, scenario.outcome.primary_error, serveSubtype);
  const subject = `${movement}${stroke}`.trim();

  if (subject || outcome) {
    leadParts.push(`my ${subject} ${outcome}`.trim());
  }

  const detailParts: string[] = [];

  if (scenario.incoming_ball.depth === "deep") {
    detailParts.push("especially on deeper balls");
  }

  const serveControlDetail = buildEnServeControlDetail(scenario);
  if (serveControlDetail) {
    detailParts.push(serveControlDetail);
  }

  const feeling = buildEnFeeling(scenario);
  if (feeling && !suppressPressureContext) {
    detailParts.push(feeling);
  }

  const serveMechanismDetail = buildEnServeMechanismDetail(scenario);
  if (serveMechanismDetail) {
    detailParts.push(serveMechanismDetail);
  }

  const summary = [leadParts.join(" "), ...detailParts].filter(Boolean).join(", ");

  if (summary) {
    return `${summary}.`;
  }

  if (scenario.raw_user_input.trim()) {
    return scenario.raw_user_input.trim().replace(/[。.!?]$/, "") + ".";
  }

  return "I want to continue analyzing this problem.";
}

export function toDiagnosisInput({
  scenario,
  locale
}: {
  scenario: ScenarioState;
  locale: ScenarioHandoffLocale;
}) {
  return locale === "en" ? buildEnSummary(scenario) : buildZhSummary(scenario);
}
