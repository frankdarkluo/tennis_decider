import { NextRequest, NextResponse } from "next/server";
import { analyzeVideoFrames } from "@/lib/vlm";
import { buildVideoDiagnosisResult } from "@/lib/videoDiagnosis";
import { VideoAnalysisRequest } from "@/types/videoDiagnosis";

export const runtime = "nodejs";

function badRequest(message: string, code = "BAD_REQUEST") {
  return NextResponse.json({ error: code, message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<VideoAnalysisRequest>;

    if (!Array.isArray(body.frames) || body.frames.length === 0) {
      return badRequest("请先上传视频并完成关键帧抽取。", "NO_FRAMES");
    }

    if (body.frames.length > 12) {
      return badRequest("当前一次最多只能提交 12 张关键帧。", "TOO_MANY_FRAMES");
    }

    const safeRequest: VideoAnalysisRequest = {
      frames: body.frames,
      userDescription: typeof body.userDescription === "string" ? body.userDescription : "",
      userLevel: typeof body.userLevel === "string" ? body.userLevel : undefined,
      selectedStroke: body.selectedStroke,
      selectedScene: body.selectedScene,
      durationSeconds: typeof body.durationSeconds === "number" ? body.durationSeconds : undefined,
      fileName: typeof body.fileName === "string" ? body.fileName : undefined
    };

    const observation = await analyzeVideoFrames(safeRequest);
    const result = buildVideoDiagnosisResult(observation, safeRequest);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "视频分析过程中出现未知错误。";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}

