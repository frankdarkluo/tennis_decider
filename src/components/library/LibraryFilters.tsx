import { Input } from "@/components/ui/Input";
import { creators } from "@/data/creators";
import { toChineseSkill } from "@/lib/utils";

type LibraryFiltersProps = {
  keyword: string;
  setKeyword: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  skill: string;
  setSkill: (value: string) => void;
  platform: string;
  setPlatform: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  creator: string;
  setCreator: (value: string) => void;
};

type FilterOption = {
  label: string;
  value: string;
};

function SelectFilter({ value, setValue, options }: { value: string; setValue: (value: string) => void; options: FilterOption[] }) {
  return (
    <select
      className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export function LibraryFilters(props: LibraryFiltersProps) {
  const creatorOptions: FilterOption[] = [{ label: "全部博主", value: "全部博主" }, ...creators.map((creator) => ({
    label: creator.name,
    value: creator.id
  }))];

  const skillValues = ["forehand", "backhand", "serve", "net", "movement", "matchplay", "basics", "consistency", "topspin", "return", "training", "mental", "footwork", "slice", "defense", "doubles"];
  const skillOptions: FilterOption[] = [
    { label: "全部技术", value: "全部技术" },
    ...skillValues.map((skill) => ({ label: toChineseSkill(skill), value: skill }))
  ];

  const platformOptions: FilterOption[] = ["全部平台", "YouTube", "Bilibili", "Xiaohongshu", "Zhihu", "Instagram"].map((item) => ({
    label: item,
    value: item
  }));

  const languageOptions: FilterOption[] = [
    { label: "全部语言", value: "全部语言" },
    { label: "中文", value: "zh" },
    { label: "英文", value: "en" }
  ];

  const typeOptions: FilterOption[] = [
    { label: "全部类型", value: "全部类型" },
    { label: "视频", value: "video" },
    { label: "图文", value: "post" },
    { label: "文章", value: "article" }
  ];

  const levelOptions: FilterOption[] = ["全部等级", "2.5", "3.0", "3.5", "4.0", "4.5"].map((item) => ({ label: item, value: item }));

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-soft">
      <Input
        placeholder="搜索内容关键词"
        value={props.keyword}
        onChange={(e) => props.setKeyword(e.target.value)}
      />
      <div className="grid gap-2 md:grid-cols-3">
        <SelectFilter value={props.level} setValue={props.setLevel} options={levelOptions} />
        <SelectFilter value={props.skill} setValue={props.setSkill} options={skillOptions} />
        <SelectFilter value={props.platform} setValue={props.setPlatform} options={platformOptions} />
        <SelectFilter value={props.language} setValue={props.setLanguage} options={languageOptions} />
        <SelectFilter value={props.type} setValue={props.setType} options={typeOptions} />
        <SelectFilter value={props.creator} setValue={props.setCreator} options={creatorOptions} />
      </div>
    </div>
  );
}
