import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type DiagnoseInputProps = {
  value: string;
  quickTags: string[];
  onChange: (value: string) => void;
  onDiagnose: () => void;
  onClear: () => void;
};

export function DiagnoseInput({ value, quickTags, onChange, onDiagnose, onClear }: DiagnoseInputProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-soft">
      <Textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="我反手总是下网 / 我的二发没有信心 / 正手一发力就容易出界 / 比赛里总觉得来不及准备"
      />
      <div className="flex flex-wrap gap-2">
        {quickTags.map((tag) => (
          <button
            key={tag}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-slate-700 hover:border-brand-300"
            onClick={() => onChange(tag)}
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
