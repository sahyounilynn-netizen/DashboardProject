import { Card, CardContent } from "./ui/card";

function DashboardCard({ onClick, title, value }) {
  const content = (
    <CardContent className="space-y-2 p-4">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {title}
      </h3>
      <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </CardContent>
  );

  if (onClick) {
    return (
      <button
        className="w-full text-left transition hover:opacity-90"
        onClick={onClick}
        type="button"
      >
        <Card className="min-w-[180px] bg-white/80">
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Card className="min-w-[180px] bg-white/80">
      {content}
    </Card>
  );
}

export default DashboardCard;
