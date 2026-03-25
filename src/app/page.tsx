import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickEntrySection } from "@/components/home/QuickEntrySection";
import { ImprovementPathSection } from "@/components/home/ImprovementPathSection";
import { HotContentSection } from "@/components/home/HotContentSection";
import { HotCreatorsSection } from "@/components/home/HotCreatorsSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <HeroSection />
        <QuickEntrySection />
        <ImprovementPathSection />

        <div className="grid gap-5 md:grid-cols-2">
          <HotContentSection />
          <HotCreatorsSection />
        </div>

        <Card className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-700">说不清问题也没关系</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">还没想好从哪开始？1 分钟评估帮你找方向</h3>
          </div>
          <Link href="/assessment"><Button variant="secondary" className="h-11 px-6">先做评估</Button></Link>
        </Card>
      </div>
    </PageContainer>
  );
}
