"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { contents } from "@/data/contents";
import { PageContainer } from "@/components/layout/PageContainer";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { Button } from "@/components/ui/Button";

function LibraryPageContent() {
  const params = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState(params.get("level") ?? "全部等级");
  const [skill, setSkill] = useState("全部技术");
  const [platform, setPlatform] = useState("全部平台");
  const [language, setLanguage] = useState("全部语言");
  const [type, setType] = useState("全部类型");
  const [creator, setCreator] = useState(params.get("creator") ?? "全部博主");

  const filtered = useMemo(() => {
    return contents.filter((item) => {
      const hitKeyword = keyword
        ? [item.title, item.summary, item.reason, item.problemTags.join(" ")].join(" ").toLowerCase().includes(keyword.toLowerCase())
        : true;
      const hitLevel = level === "全部等级" ? true : item.levels.includes(level as "3.0" | "3.5" | "4.0");
      const hitSkill = skill === "全部技术" ? true : item.skills.includes(skill as never);
      const hitPlatform = platform === "全部平台" ? true : item.platform === platform;
      const hitLanguage = language === "全部语言" ? true : item.language === language;
      const hitType = type === "全部类型" ? true : item.type === type;
      const hitCreator = creator === "全部博主" ? true : item.creatorId === creator;
      return hitKeyword && hitLevel && hitSkill && hitPlatform && hitLanguage && hitType && hitCreator;
    });
  }, [keyword, level, skill, platform, language, type, creator]);

  const clearAll = () => {
    setKeyword("");
    setLevel("全部等级");
    setSkill("全部技术");
    setPlatform("全部平台");
    setLanguage("全部语言");
    setType("全部类型");
    setCreator("全部博主");
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">内容库</h1>
          <p className="mt-2 text-slate-600">按等级、技术项和问题类型筛选适合你的网球学习内容</p>
        </div>

        <LibraryFilters
          keyword={keyword}
          setKeyword={setKeyword}
          level={level}
          setLevel={setLevel}
          skill={skill}
          setSkill={setSkill}
          platform={platform}
          setPlatform={setPlatform}
          language={language}
          setLanguage={setLanguage}
          type={type}
          setType={setType}
          creator={creator}
          setCreator={setCreator}
        />

        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <p className="text-slate-700">暂无匹配内容，请调整筛选条件。</p>
            <Button className="mt-3" variant="secondary" onClick={clearAll}>清空筛选</Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">正在加载内容库...</p></PageContainer>}>
      <LibraryPageContent />
    </Suspense>
  );
}
