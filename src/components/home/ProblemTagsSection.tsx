import Link from "next/link";

const tags = ["正手总出界", "反手总下网", "二发没信心", "网前容易失误", "比赛容易紧张", "不知道该练什么"];

export function ProblemTagsSection() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-slate-900">高频问题</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/diagnose?q=${encodeURIComponent(tag)}`}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            {tag}
          </Link>
        ))}
      </div>
    </section>
  );
}
