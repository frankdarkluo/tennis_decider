import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function TabButton({ active, className, ...props }: TabButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-[var(--line)] bg-white text-slate-700 hover:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}
