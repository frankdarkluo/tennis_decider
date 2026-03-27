"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

type CreatorAvatarProps = {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-12 w-12 text-sm",
  md: "h-[3.25rem] w-[3.25rem] text-[1.05rem]"
};

function getCreatorInitial(name: string) {
  const initial = name.trim().charAt(0);

  if (/^[a-z]$/i.test(initial)) {
    return initial.toUpperCase();
  }

  return initial;
}

export function CreatorAvatar({ name, avatarUrl, size = "md", className }: CreatorAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1F5EE] font-bold text-[#085041]",
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        getCreatorInitial(name)
      )}
    </div>
  );
}
