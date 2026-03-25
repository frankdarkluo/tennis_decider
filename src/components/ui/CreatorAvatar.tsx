import { clsx } from "clsx";

type CreatorAvatarProps = {
  name: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-11 w-11 text-sm",
  md: "h-12 w-12 text-base"
};

function getCreatorInitial(name: string) {
  const initial = name.trim().charAt(0);

  if (/^[a-z]$/i.test(initial)) {
    return initial.toUpperCase();
  }

  return initial;
}

export function CreatorAvatar({ name, size = "md", className }: CreatorAvatarProps) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] font-bold text-[#085041]",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {getCreatorInitial(name)}
    </div>
  );
}
