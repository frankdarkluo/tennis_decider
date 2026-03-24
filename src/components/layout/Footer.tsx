export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:px-6 md:flex-row md:items-center md:justify-between">
        <div>TennisLevel MVP · 网球学习推荐平台</div>
        <div className="flex flex-wrap items-center gap-4">
          <span>关于我们</span>
          <span>使用说明</span>
          <span>联系方式</span>
          <span>隐私政策</span>
        </div>
      </div>
    </footer>
  );
}
