import { sanitizeTennisSceneExtraction, type StructuredTennisSceneExtraction } from "@/lib/intake/schema";
import { createLocalQwenClient, type LocalQwenClient } from "@/lib/scenarioReconstruction/llm/client";

export async function extractTennisScene(
  text: string,
  options: { client?: LocalQwenClient } = {}
): Promise<StructuredTennisSceneExtraction | null> {
  const client = options.client ?? createLocalQwenClient();

  try {
    const extraction = await client.extractTennisScene(text);
    return sanitizeTennisSceneExtraction(extraction);
  } catch {
    return null;
  }
}
