import {
  createLocalQwenClient,
  readLocalQwenConfig,
  stripThinkingBlocks,
  type LocalQwenClient
} from "@/lib/scenarioReconstruction/llm/client";

export type LocalModelClient = LocalQwenClient;
export type CreateLocalModelClientOptions = Parameters<typeof createLocalQwenClient>[0];

export function createLocalModelClient(options: CreateLocalModelClientOptions = {}): LocalModelClient {
  return createLocalQwenClient(options);
}

export function readLocalModelConfig(env: Record<string, string | undefined> = process.env) {
  return readLocalQwenConfig(env);
}

export { stripThinkingBlocks };
