import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const videoDiagnosePagePath = path.resolve(process.cwd(), "src/app/video-diagnose/page.tsx");
const videoDiagnoseClientPath = path.resolve(process.cwd(), "src/app/video-diagnose/VideoDiagnoseClient.tsx");
const videoDiagnoseApiPath = path.resolve(process.cwd(), "src/app/api/video-diagnose/route.ts");

describe("video diagnose boundary cleanup", () => {
  it("closes the hidden video diagnose page behind a route-level visibility guard", () => {
    const source = fs.readFileSync(videoDiagnosePagePath, "utf8");

    expect(source).toContain('from "next/navigation"');
    expect(source).toContain("VIDEO_DIAGNOSE_VISIBLE");
    expect(source).toContain("notFound()");
  });

  it("keeps the hidden video diagnose client free of study artifact transport", () => {
    const source = fs.readFileSync(videoDiagnoseClientPath, "utf8");

    expect(source).not.toContain('from "@/components/app/AppShellProvider"');
    expect(source).not.toContain('from "@/components/study/StudyProvider"');
    expect(source).not.toContain('from "@/lib/study/client"');
    expect(source).not.toContain('from "@/lib/study/localData"');
    expect(source).not.toContain("sanitizeVideoDiagnosisArtifact");
    expect(source).not.toContain("persistStudyArtifact(");
    expect(source).not.toContain("updateLocalStudyProgress(");
  });

  it("closes the hidden video diagnose API behind the same visibility guard", () => {
    const source = fs.readFileSync(videoDiagnoseApiPath, "utf8");

    expect(source).toContain("VIDEO_DIAGNOSE_VISIBLE");
    expect(source).toContain('error: "NOT_FOUND"');
    expect(source).toContain("status: 404");
  });
});
