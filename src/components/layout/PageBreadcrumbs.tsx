import Link from "next/link";

type BreadcrumbItem = {
  href: string;
  label: string;
};

export function PageBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          className="transition hover:text-slate-600"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
