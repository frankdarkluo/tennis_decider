import { VideoAnalysisRequest, VideoSceneType, VideoStrokeType, VLMObservation } from "@/types/videoDiagnosis";

type VLMProvider = "mock" | "siliconflow" | "dashscope" | "together";

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "user"; content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> };

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getProvider(): VLMProvider {
  const provider = (process.env.VLM_PROVIDER ?? "mock") as VLMProvider;
  return provider;
}

function inferStroke(userDescription = "", selectedStroke: VideoStrokeType = "other"): VideoStrokeType {
  if (selectedStroke !== "other") {
    return selectedStroke;
  }

  const text = userDescription.toLowerCase();
  if (text.includes("发球") || text.includes("二发") || text.includes("一发") || text.includes("serve")) return "serve";
  if (text.includes("反手") || text.includes("backhand") || text.includes("切削") || text.includes("slice")) return "backhand";
  if (text.includes("网前") || text.includes("截击") || text.includes("volley")) return "volley";
  if (text.includes("正手") || text.includes("forehand") || text.includes("上旋")) return "forehand";
  return "other";
}

function inferLevel(userLevel?: string) {
  if (["2.5", "3.0", "3.5", "4.0", "4.5"].includes(userLevel ?? "")) {
    return userLevel!;
  }
  return "3.5";
}

function buildMockObservation(input: VideoAnalysisRequest): VLMObservation {
  const strokeType = inferStroke(input.userDescription, input.selectedStroke ?? "other");
  const sceneType = input.selectedScene ?? "unknown";
  const description = input.userDescription ?? "";
  const issueText = description.toLowerCase();

  const genericByStroke: Record<VideoStrokeType, { issues: string[]; contactPoint: string; swingPath: string }> = {
    forehand: {
      issues: ["击球点偏晚", "拍面控制不稳", "重心没有送出去"],
      contactPoint: "正手击球点略偏后，容易在身体侧后方处理来球。",
      swingPath: "挥拍结束偏低，出手后的弧线和容错都不够。"
    },
    backhand: {
      issues: ["引拍偏慢", "拍面打开过多", "脚步到位不够"],
      contactPoint: "反手击球点不够靠前，来球一快时更容易在身后处理。",
      swingPath: "挥拍路径偏短，击球后拍面稳定时间不够。"
    },
    serve: {
      issues: ["抛球不稳定", "蹬转衔接断开", "挥拍节奏不连贯"],
      contactPoint: "击球点高度不够稳定，导致发力和落点都在飘。",
      swingPath: "引拍到加速的连接不够顺，发力链条断在中段。"
    },
    volley: {
      issues: ["准备偏晚", "拍头控制不稳", "脚步压上不足"],
      contactPoint: "网前触球点略偏靠身体，压迫感和稳定性都会下降。",
      swingPath: "截击动作偏大，收拍没有稳定在身前。"
    },
    other: {
      issues: ["准备节奏不稳", "击球点不够清楚", "脚步到位偏慢"],
      contactPoint: "视频里能看出你处理来球时击球点有些犹豫，不够固定。",
      swingPath: "挥拍整体是可识别的，但前后衔接还不够顺。"
    }
  };

  let confidence = 0.74;
  if (!description.trim()) {
    confidence -= 0.12;
  }
  if ((input.frames?.length ?? 0) < 4) {
    confidence -= 0.15;
  }
  if (sceneType === "unknown") {
    confidence -= 0.05;
  }
  if (issueText.includes("看不清") || issueText.includes("随便拍") || issueText.includes("有点模糊")) {
    confidence -= 0.18;
  }

  const preset = genericByStroke[strokeType];
  const keyIssues = [...preset.issues];

  if (issueText.includes("出界")) {
    keyIssues[0] = "拍面偏开导致出界";
  } else if (issueText.includes("下网")) {
    keyIssues[0] = "击球点偏后导致下网";
  } else if (issueText.includes("没力") || issueText.includes("力量")) {
    keyIssues[1] = "转体和重心传递不足";
  } else if (issueText.includes("紧张")) {
    keyIssues[2] = "动作节奏受紧张影响";
  }

  const finalConfidence = clamp(confidence);

  return {
    strokeType,
    sceneType,
    bodyPosture: strokeType === "serve"
      ? "发球时上肢启动在前、下肢跟进在后，蹬转和向上顶的衔接还不够完整。"
      : "身体准备是有的，但重心前移和转体衔接还不够连续，击球前后容易散。 ",
    contactPoint: preset.contactPoint,
    footwork: sceneType === "match"
      ? "脚步第一反应偏慢，分腿垫步和上前调整都略晚半拍。"
      : "脚步有在找点，但最后两步的调整还不够干净，容易把问题留到手上解决。",
    swingPath: preset.swingPath,
    overallAssessment: finalConfidence < 0.45
      ? "视频里能看到一些动作轮廓，但清晰度、角度或节奏信息还不够，当前更适合先给保守判断。"
      : "视频已经能看出你当前最影响稳定性的动作环节，问题不在单一力量，而在准备、击球点和动作节奏的衔接。",
    keyIssues,
    estimatedLevel: inferLevel(input.userLevel),
    confidence: finalConfidence,
    retakeAdvice: finalConfidence < 0.45
      ? "建议横屏拍摄 3 到 5 个完整击球，镜头固定在侧后方，尽量让击球点和全身步伐都进入画面。"
      : undefined
  };
}

function buildSystemPrompt(userLevel?: string) {
  return [
    "你是一位经验丰富的网球教练，需要根据关键帧分析学员动作。",
    "请识别击球类型、场景、击球点、身体姿态、脚步、挥拍路径，并给出最多 3 个关键问题。",
    "输出必须是 JSON，不要输出额外解释。",
    userLevel ? `用户自评等级为 ${userLevel}，请参考但不要机械依赖。` : ""
  ].filter(Boolean).join("\n");
}

function buildUserContent(input: VideoAnalysisRequest): Extract<ChatMessage, { role: "user"; content: unknown[] }>["content"] {
  const frames = input.frames.slice(0, 8);
  const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = frames.map((frame) => ({
    type: "image_url",
    image_url: {
      url: `data:image/jpeg;base64,${frame}`
    }
  }));

  const hints = [
    input.userDescription ? `用户描述：${input.userDescription}` : "用户没有额外文字描述。",
    input.selectedStroke && input.selectedStroke !== "other" ? `用户认为主要击球是：${input.selectedStroke}` : "",
    input.selectedScene && input.selectedScene !== "unknown" ? `视频场景：${input.selectedScene}` : ""
  ].filter(Boolean).join("\n");

  content.push({
    type: "text",
    text: `请结合这些关键帧完成网球动作分析。\n${hints}`
  });

  return content;
}

function safeJsonParse(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("模型未返回可解析的 JSON。");
  }
  return JSON.parse(match[0]);
}

function normalizeObservation(input: Partial<VLMObservation>, fallback: VideoAnalysisRequest): VLMObservation {
  const fallbackObservation = buildMockObservation(fallback);

  return {
    strokeType: input.strokeType ?? fallbackObservation.strokeType,
    sceneType: input.sceneType ?? fallbackObservation.sceneType,
    bodyPosture: input.bodyPosture ?? fallbackObservation.bodyPosture,
    contactPoint: input.contactPoint ?? fallbackObservation.contactPoint,
    footwork: input.footwork ?? fallbackObservation.footwork,
    swingPath: input.swingPath ?? fallbackObservation.swingPath,
    overallAssessment: input.overallAssessment ?? fallbackObservation.overallAssessment,
    keyIssues: Array.isArray(input.keyIssues) && input.keyIssues.length > 0 ? input.keyIssues.slice(0, 3) : fallbackObservation.keyIssues,
    estimatedLevel: input.estimatedLevel ?? fallbackObservation.estimatedLevel,
    confidence: clamp(typeof input.confidence === "number" ? input.confidence : fallbackObservation.confidence),
    retakeAdvice: input.retakeAdvice ?? fallbackObservation.retakeAdvice
  };
}

async function analyzeWithRemoteProvider(input: VideoAnalysisRequest): Promise<VLMObservation> {
  const apiKey = process.env.VLM_API_KEY;
  const provider = getProvider();
  const baseUrl = process.env.VLM_BASE_URL ?? (provider === "dashscope"
    ? "https://dashscope.aliyuncs.com/compatible-mode/v1"
    : "https://api.siliconflow.cn/v1");
  const model = process.env.VLM_MODEL ?? "Qwen/Qwen2.5-VL-72B-Instruct";

  if (!apiKey) {
    return buildMockObservation(input);
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(input.userLevel) },
        { role: "user", content: buildUserContent(input) }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`VLM 请求失败：${response.status}`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  const payload = typeof rawContent === "string"
    ? safeJsonParse(rawContent)
    : Array.isArray(rawContent)
      ? safeJsonParse(rawContent.map((item) => item?.text ?? "").join("\n"))
      : data;

  return normalizeObservation(payload as Partial<VLMObservation>, input);
}

export async function analyzeVideoFrames(input: VideoAnalysisRequest): Promise<VLMObservation> {
  if (!input.frames.length) {
    throw new Error("至少需要 1 张关键帧才能分析。");
  }

  if (getProvider() === "mock") {
    return buildMockObservation(input);
  }

  try {
    return await analyzeWithRemoteProvider(input);
  } catch {
    return buildMockObservation(input);
  }
}

