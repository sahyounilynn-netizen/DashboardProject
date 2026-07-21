import { Card, CardContent } from "./ui/card";

function DashboardCard({ onClick, title, value }) {
  const content = (
    <CardContent className="space-y-0.5 p-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {title}
      </h3>
      <p className="text-2xl font-semibold leading-none text-[var(--text-primary)]">
        {value}
      </p>
    </CardContent>
  );

  if (onClick) {
    return (
      <button
        className="w-full text-left transition hover:opacity-90"
        onClick={onClick}
        type="button"
      >
        <Card className="min-w-[136px] bg-white/80">
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Card className="min-w-[136px] bg-white/80">
      {content}
    </Card>
  );
}

export default DashboardCard;
