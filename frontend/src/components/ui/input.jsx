import { cn } from "../../lib/utils";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]",
        className
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
