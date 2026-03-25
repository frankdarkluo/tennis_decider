import { Card } from "@/components/ui/Card";

const steps = [
  {
    step: "01",
    desc: "说出你最常丢分的那个问题"
  },
  {
    step: "02",
    desc: "看看问题出在动作、节奏还是站位"
  },
  {
    step: "03",
    desc: "找到对应内容，针对性地练"
  }
];

export function ImprovementPathSection() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--line)] bg-gradient-to-r from-brand-50 via-white to-white px-5 py-3 md:px-6">
        <p className="text-sm font-semibold text-brand-700">适合业余球员的一条常见提升路径</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">先找准问题，再决定练什么</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          对多数业余球员来说，最有效的不是一次改很多，而是先解决最影响得分的那个高频失误。
        </p>
      </div>

      <div className="grid gap-px bg-[var(--line)] md:grid-cols-3">
        {steps.map((item) => (
          <div key={item.step} className="bg-white px-4 py-3 md:px-5 md:py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {item.step}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-900 md:text-[15px]">{item.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
