import {
  buildDiagnoseMediationPrompt,
  buildQuestionRankerPrompt,
  buildScenarioParserPrompt,
  buildTennisSceneExtractionPrompt
} from "@/lib/scenarioReconstruction/llm/prompts";
import type { ScenarioQuestion, ScenarioState, SkillCategory } from "@/types/scenario";

type FetchLike = typeof fetch;

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

export type LocalQwenConfig = {
  baseUrl: string;
  apiKey: string;
  modelName: string;
};

export type LocalQwenClient = {
  extractTennisScene(text: string): Promise<unknown>;
  mediateDiagnoseComplaint(
    complaint: string,
    locale: "zh" | "en",
    lockedCategory: SkillCategory | null
  ): Promise<unknown>;
  parseScenario(text: string): Promise<Partial<ScenarioState> | null>;
  rankQuestions(scenario: ScenarioState, eligibleQuestions: ScenarioQuestion[]): Promise<string[] | null>;
};

type CreateLocalQwenClientOptions = {
  env?: Record<string, string | undefined>;
  fetch?: FetchLike;
};

export function readLocalQwenConfig(env: Record<string, string | undefined> = process.env) {
  const baseUrl = env.OPENAI_BASE_URL?.trim() || "http://127.0.0.1:8080/v1";
  const apiKey = env.OPENAI_API_KEY?.trim() || "EMPTY";
  const modelName = env.MODEL_NAME?.trim() || "mlx-community/Qwen3-8B-4bit";

  return { baseUrl, apiKey, modelName };
}

export function stripThinkingBlocks(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function extractMessageContent(data: ChatCompletionResponse) {
  const rawContent = data?.choices?.[0]?.message?.content;

  if (typeof rawContent === "string") {
    return rawContent;
  }

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((item) => (typeof item === "object" && item && "text" in item ? String(item.text ?? "") : ""))
      .join("\n");
  }

  return "";
}

function extractJsonSubstring(text: string) {
  const objectMatch = text.match(/\{[\s\S]*\}/);

  if (objectMatch) {
    return objectMatch[0];
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  return arrayMatch?.[0] ?? text;
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(extractJsonSubstring(stripThinkingBlocks(text))) as T;
  } catch {
    return null;
  }
}

async function postChatCompletion(
  fetchImpl: FetchLike,
  config: LocalQwenConfig,
  userPrompt: string,
  maxTokens: number
) {
  const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.modelName,
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return JSON only. Do not include chain-of-thought."
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Local Qwen request failed: ${response.status}`);
  }

  const data = await response.json() as ChatCompletionResponse;
  return extractMessageContent(data);
}

export function createLocalQwenClient(options: CreateLocalQwenClientOptions = {}): LocalQwenClient {
  const config = readLocalQwenConfig(options.env);
  const fetchImpl = options.fetch ?? fetch;

  return {
    async extractTennisScene(text: string) {
      const content = await postChatCompletion(fetchImpl, config, buildTennisSceneExtractionPrompt(text), 350);
      return safeParseJson<unknown>(content);
    },
    async mediateDiagnoseComplaint(
      complaint: string,
      locale: "zh" | "en",
      lockedCategory: SkillCategory | null
    ) {
      const content = await postChatCompletion(
        fetchImpl,
        config,
        buildDiagnoseMediationPrompt({ complaint, locale, lockedCategory }),
        220
      );
      return safeParseJson<unknown>(content);
    },
    async parseScenario(text: string) {
      const content = await postChatCompletion(fetchImpl, config, buildScenarioParserPrompt(text), 400);
      return safeParseJson<Partial<ScenarioState>>(content);
    },
    async rankQuestions(scenario: ScenarioState, eligibleQuestions: ScenarioQuestion[]) {
      const content = await postChatCompletion(
        fetchImpl,
        config,
        buildQuestionRankerPrompt(scenario, eligibleQuestions),
        200
      );
      const parsed = safeParseJson<{ ranked_question_ids?: unknown }>(content);

      if (!parsed || !Array.isArray(parsed.ranked_question_ids)) {
        return null;
      }

      return parsed.ranked_question_ids.filter((value): value is string => typeof value === "string");
    }
  };
}
