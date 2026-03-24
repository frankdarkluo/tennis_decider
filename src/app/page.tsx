import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickEntrySection } from "@/components/home/QuickEntrySection";
import { ProblemTagsSection } from "@/components/home/ProblemTagsSection";
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
        <ProblemTagsSection />

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">3.0-3.5 提升路径</h2>
          <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">第一步：测水平</div>
            <div className="rounded-xl bg-slate-50 p-3">第二步：找问题</div>
            <div className="rounded-xl bg-slate-50 p-3">第三步：看内容并练动作</div>
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <HotContentSection />
          <HotCreatorsSection />
        </div>

        <Card className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">还不知道该从哪里开始？先做一次水平评估。</h3>
          </div>
          <Link href="/assessment"><Button className="h-11 px-6">免费开始</Button></Link>
        </Card>
      </div>
    </PageContainer>
  );
}
