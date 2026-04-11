import { notFound } from "next/navigation";
import VideoDiagnoseClient from "./VideoDiagnoseClient";
import { VIDEO_DIAGNOSE_VISIBLE } from "@/lib/videoDiagnose";

export default function VideoDiagnosePage() {
  if (!VIDEO_DIAGNOSE_VISIBLE) {
    notFound();
  }

  return <VideoDiagnoseClient />;
}
