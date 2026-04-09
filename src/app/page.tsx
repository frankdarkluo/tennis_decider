"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { HotContentSection } from "@/components/home/HotContentSection";
import { HotCreatorsSection } from "@/components/home/HotCreatorsSection";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <HeroSection />

        <div className="grid gap-5 md:grid-cols-2">
          <HotContentSection />
          <HotCreatorsSection />
        </div>
      </div>
    </PageContainer>
  );
}
