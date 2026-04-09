import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const videoDiagnosePagePath = path.resolve(process.cwd(), "src/app/video-diagnose/page.tsx");

describe("video diagnose boundary cleanup", () => {
  it("keeps the hidden video diagnose route free of study artifact transport", () => {
    const source = fs.readFileSync(videoDiagnosePagePath, "utf8");

    expect(source).not.toContain('from "@/lib/study/client"');
    expect(source).not.toContain('from "@/lib/study/localData"');
    expect(source).not.toContain("sanitizeVideoDiagnosisArtifact");
    expect(source).not.toContain("persistStudyArtifact(");
    expect(source).not.toContain("updateLocalStudyProgress(");
  });
});
