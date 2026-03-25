import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600",
        variant === "secondary" && "bg-white text-slate-800 border border-[var(--line)] hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
}
