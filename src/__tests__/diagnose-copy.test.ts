import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";

describe("diagnose result copy", () => {
  it("uses a diagnosis-style badge label in Chinese and English", () => {
    expect(zh["diagnose.result.badge"]).toBe("你的问题是：");
    expect(en["diagnose.result.badge"]).toBe("Your issue is:");
  });
});
