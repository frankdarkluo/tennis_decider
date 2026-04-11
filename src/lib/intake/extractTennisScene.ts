import { sanitizeTennisSceneExtraction, type StructuredTennisSceneExtraction } from "@/lib/intake/schema";
import { createLocalModelClient, type LocalModelClient } from "@/lib/localModel/client";

export async function extractTennisScene(
  text: string,
  options: { client?: LocalModelClient } = {}
): Promise<StructuredTennisSceneExtraction | null> {
  const client = options.client ?? createLocalModelClient();

  try {
    const extraction = await client.extractTennisScene(text);
    return sanitizeTennisSceneExtraction(extraction);
  } catch {
    return null;
  }
}
