import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type DiagnoseInputProps = {
  value: string;
  quickTags: string[];
  quickTagsLabel?: string;
  variant?: "default" | "compact";
  onChange: (value: string) => void;
  onDiagnose: () => void;
  onClear: () => void;
  onQuickTagClick?: (tag: string) => void;
};

export function DiagnoseInput({
  value,
  quickTags,
  quickTagsLabel = "也可以直接点：",
  variant = "default",
  onChange,
  onDiagnose,
  onClear,
  onQuickTagClick
}: DiagnoseInputProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-soft">
      <Textarea
        rows={variant === "compact" ? 3 : 5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={variant === "compact" ? "min-h-[120px]" : undefined}
        placeholder="我反手总下网 / 二发没信心 / 正手一发力就出界 / 比赛里总来不及准备"
      />
      {quickTagsLabel ? <p className="text-sm text-slate-500">{quickTagsLabel}</p> : null}
      <div className="flex flex-wrap gap-2">
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="min-h-11 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            onClick={() => {
              if (onQuickTagClick) {
                onQuickTagClick(tag);
                return;
              }

              onChange(tag);
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onDiagnose}>开始诊断</Button>
        <Button variant="secondary" onClick={onClear}>清空</Button>
      </div>
    </div>
  );
}
