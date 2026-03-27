import { Input } from "@/components/ui/Input";

type LibraryFiltersProps = {
  keyword: string;
  setKeyword: (value: string) => void;
  showBookmarkedOnly: boolean;
  setShowBookmarkedOnly: (value: boolean) => void;
  bookmarkFilterEnabled: boolean;
};

export function LibraryFilters(props: LibraryFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-soft">
      <Input
        placeholder="搜索内容（输入技术、博主名...）"
        value={props.keyword}
        onChange={(e) => props.setKeyword(e.target.value)}
      />
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
