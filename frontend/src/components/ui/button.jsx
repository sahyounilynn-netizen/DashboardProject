import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bg-accent)] text-white shadow-[var(--shadow-accent)] focus-visible:ring-[var(--ring-accent)] hover:brightness-110",
        secondary:
          "bg-[var(--bg-panel-strong)] text-[var(--text-secondary)] ring-1 ring-[var(--border-muted)] focus-visible:ring-[var(--ring-accent)] hover:brightness-105",
        ghost:
          "text-[var(--text-secondary)] focus-visible:ring-[var(--ring-accent)] hover:bg-[var(--bg-panel-soft)] hover:text-[var(--text-primary)]",
        outline:
          "bg-transparent text-[var(--text-secondary)] ring-1 ring-[var(--border-muted)] focus-visible:ring-[var(--ring-accent)] hover:bg-[var(--bg-panel-soft)]",
        danger:
          "bg-red-500 text-white focus-visible:ring-red-200 hover:bg-red-400",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, type = "button", ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}

export { Button };
