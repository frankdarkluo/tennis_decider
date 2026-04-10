"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { HotContentSection } from "@/components/home/HotContentSection";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <HeroSection />
        <HotContentSection />
      </div>
    </PageContainer>
  );
}
