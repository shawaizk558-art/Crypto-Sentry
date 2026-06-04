import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-neon-green/10 text-neon-green border-neon-green/40 hover:bg-neon-green/20 hover:border-neon-green/60",
  secondary:
    "bg-bg-elevated text-foreground border-border hover:border-border-subtle hover:bg-bg-card",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-bg-elevated border-transparent",
  danger:
    "bg-danger/10 text-danger border-danger/40 hover:bg-danger/20",
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
          "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3 text-base",
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
