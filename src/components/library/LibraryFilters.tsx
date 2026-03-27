import { Input } from "@/components/ui/Input";

export type LibraryPlatformFilter = "all" | "Bilibili" | "YouTube" | "Douyin" | "Xiaohongshu";

type LibraryFiltersProps = {
  keyword: string;
  setKeyword: (value: string) => void;
  selectedPlatform: LibraryPlatformFilter;
  setSelectedPlatform: (value: LibraryPlatformFilter) => void;
  showBookmarkedOnly: boolean;
  setShowBookmarkedOnly: (value: boolean) => void;
  bookmarkFilterEnabled: boolean;
};

const platformOptions: Array<{ value: LibraryPlatformFilter; label: string }> = [
  { value: "all", label: "全部平台" },
  { value: "Bilibili", label: "Bilibili" },
  { value: "YouTube", label: "YouTube" },
  { value: "Douyin", label: "抖音" },
  { value: "Xiaohongshu", label: "小红书" }
];

export function LibraryFilters(props: LibraryFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          placeholder="搜索技术、博主或场景"
          value={props.keyword}
          onChange={(e) => props.setKeyword(e.target.value)}
        />
        <select
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-700"
          value={props.selectedPlatform}
          onChange={(e) => props.setSelectedPlatform(e.target.value as LibraryPlatformFilter)}
        >
          {platformOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={props.showBookmarkedOnly}
          aria-disabled={!props.bookmarkFilterEnabled}
          title={props.bookmarkFilterEnabled ? "只看你收藏过的内容" : "登录后可使用收藏功能"}
          className={props.bookmarkFilterEnabled
            ? props.showBookmarkedOnly
              ? "inline-flex min-h-11 items-center rounded-full bg-brand-500 px-4 text-sm font-semibold text-white"
              : "inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            : "inline-flex min-h-11 cursor-not-allowed items-center rounded-full border border-[var(--line)] bg-slate-100 px-4 text-sm font-semibold text-slate-400"}
          onClick={() => {
            if (!props.bookmarkFilterEnabled) {
              return;
            }

            props.setShowBookmarkedOnly(!props.showBookmarkedOnly);
          }}
        >
          我的收藏
        </button>
      </div>
    </div>
  );
}
