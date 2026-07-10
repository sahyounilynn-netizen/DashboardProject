import { Card, CardContent } from "./ui/card";

function DashboardCard({ title, value }) {
  return (
    <Card className="min-w-[220px] flex-1 bg-white/80">
      <CardContent className="space-y-3 p-6">
        <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {title}
        </h3>
        <p className="text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
