import { cn } from "../../lib/utils";

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 p-8 pb-4", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-2xl font-semibold tracking-tight text-[var(--text-primary)]", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-6 text-[var(--text-muted)]", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-8 pt-2", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center p-8 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
