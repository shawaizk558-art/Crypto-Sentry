import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { box: "h-9 w-9", text: "text-sm" },
  md: { box: "h-28 w-28", text: "text-3xl" },
  lg: { box: "h-32 w-32", text: "text-4xl" },
};

export function UserAvatar({
  src,
  name,
  email,
  size = "sm",
  className,
}: UserAvatarProps) {
  const initial = (name?.[0] ?? email?.[0] ?? "?").toUpperCase();
  const dims = sizeMap[size];

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size === "sm" ? 36 : size === "md" ? 112 : 128}
        height={size === "sm" ? 36 : size === "md" ? 112 : 128}
        unoptimized
        className={cn(
          dims.box,
          "shrink-0 rounded-sm border border-neon-cyan/30 object-cover",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        dims.box,
        "flex shrink-0 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/10 font-mono font-bold text-neon-cyan",
        dims.text,
        className,
      )}
    >
      {initial}
    </div>
  );
}
