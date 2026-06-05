import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "solid";

const variants: Record<Variant, string> = {
  primary:
    "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/40 hover:bg-neon-cyan/20 hover:border-neon-cyan/60 shadow-[0_0_16px_rgba(0,240,255,0.1)]",
  solid:
    "bg-neon-cyan text-bg-deep border-neon-cyan font-bold shadow-[0_0_24px_rgba(0,240,255,0.3)] hover:shadow-[0_0_32px_rgba(0,240,255,0.45)]",
  secondary:
    "bg-bg-elevated text-foreground border-border hover:border-neon-cyan/30 hover:bg-bg-card",
  ghost:
    "bg-transparent text-muted hover:text-foreground hover:bg-bg-elevated border-transparent",
  danger:
    "bg-danger/10 text-danger border-danger/40 hover:bg-danger/20 shadow-[0_0_16px_rgba(255,0,85,0.1)]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-sm border font-medium uppercase tracking-wider transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          size === "sm" && "px-3 py-1.5 text-[10px]",
          size === "md" && "px-5 py-2.5 text-xs",
          size === "lg" && "px-7 py-3 text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
