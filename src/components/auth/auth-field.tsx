import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function AuthField({
  label,
  icon: Icon,
  id,
  ...props
}: {
  label: string;
  icon: LucideIcon;
  id: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-widest text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim"
          strokeWidth={1.5}
        />
        <input
          id={id}
          className="cyber-input py-3 pl-10 pr-4"
          {...props}
        />
      </div>
    </div>
  );
}
