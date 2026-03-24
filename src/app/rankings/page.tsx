"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { creators } from "@/data/creators";
import { Creator } from "@/types/creator";
import { PageContainer } from "@/components/layout/PageContainer";
import { TabButton } from "@/components/ui/Tabs";
import { CreatorCard } from "@/components/rankings/CreatorCard";
import { CreatorDetailModal } from "@/components/rankings/CreatorDetailModal";
import { toChineseSkill } from "@/lib/utils";

const specialtyOptions = [
  { label: "全部方向", value: "全部方向" },
  { label: toChineseSkill("serve"), value: "serve" },
  { label: toChineseSkill("forehand"), value: "forehand" },
  { label: toChineseSkill("backhand"), value: "backhand" },
  { label: toChineseSkill("doubles"), value: "doubles" },
  { label: toChineseSkill("matchplay"), value: "matchplay" },
  { label: toChineseSkill("net"), value: "net" },
  { label: toChineseSkill("movement"), value: "movement" },
  { label: toChineseSkill("return"), value: "return" },
  { label: toChineseSkill("training"), value: "training" },
  { label: toChineseSkill("mental"), value: "mental" },
  { label: toChineseSkill("basics"), value: "basics" },
  { label: toChineseSkill("consistency"), value: "consistency" },
  { label: toChineseSkill("topspin"), value: "topspin" },
  { label: toChineseSkill("footwork"), value: "footwork" }
];

function FilterSelect(
  { value, setValue, options }: { value: string; setValue: (value: string) => void; options: Array<{ label: string; value: string }> }
) {
  return (
    <select className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm" value={value} onChange={(e) => setValue(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export default function RankingsPage() {
  const router = useRouter();
  const [region, setRegion] = useState<"domestic" | "overseas">("domestic");
  const [level, setLevel] = useState("全部等级");
  const [specialty, setSpecialty] = useState("全部方向");
  const [language, setLanguage] = useState("全部语言");
  const [style, setStyle] = useState("全部风格");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const list = useMemo(() => {
    return creators.filter((creator) => {
      const hitRegion = creator.region === region;
      const hitLevel = level === "全部等级" ? true : creator.levels.includes(level as "3.0" | "3.5" | "4.0");
      const hitSpecialty = specialty === "全部方向" ? true : creator.specialties.includes(specialty as never);
      const hitLanguage = language === "全部语言" ? true : (language === "中文" ? creator.region === "domestic" : creator.region === "overseas");
      const hitStyle = style === "全部风格" ? true : creator.styleTags.includes(style as never);
      return hitRegion && hitLevel && hitSpecialty && hitLanguage && hitStyle;
    });
  }, [region, level, specialty, language, style]);

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">教学博主榜</h1>
          <p className="mt-2 text-slate-600">按等级、技术方向和语言寻找更适合你的博主</p>
        </div>

        <div className="flex gap-2">
          <TabButton active={region === "domestic"} onClick={() => setRegion("domestic")}>国内博主</TabButton>
          <TabButton active={region === "overseas"} onClick={() => setRegion("overseas")}>国外博主</TabButton>
        </div>

        <div className="grid gap-2 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-4">
          <FilterSelect value={level} setValue={setLevel} options={["全部等级", "3.0", "3.5", "4.0"].map((item) => ({ label: item, value: item }))} />
          <FilterSelect value={specialty} setValue={setSpecialty} options={specialtyOptions} />
          <FilterSelect value={language} setValue={setLanguage} options={["全部语言", "中文", "英文"].map((item) => ({ label: item, value: item }))} />
          <FilterSelect value={style} setValue={setStyle} options={["全部风格", "新手友好", "讲解清晰", "实战导向", "细节导向"].map((item) => ({ label: item, value: item }))} />
        </div>

        {list.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onDetail={() => setSelectedCreator(creator)}
                onViewLibrary={() => router.push(`/library?creator=${creator.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-6 text-slate-600">当前筛选条件下暂无博主，建议放宽筛选条件。</div>
        )}
      </div>
      <CreatorDetailModal creator={selectedCreator} open={Boolean(selectedCreator)} onClose={() => setSelectedCreator(null)} />
    </PageContainer>
  );
}
