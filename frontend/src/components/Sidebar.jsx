import {
  Bell,
  LayoutDashboard,
  LogOut,
  MoonStar,
  Settings,
  SunMedium,
  Waves,
} from "lucide-react";
import { Button } from "./ui/button";

function Sidebar({ user, onLogout, onThemeToggle, theme }) {
  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Analytics", icon: Waves },
    { label: "Notifications", icon: Bell },
    { label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex w-full max-w-xs flex-col rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-accent)]">
          <Waves className="h-4 w-4" />
          Dashboard
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Workspace</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Signed in as {user.name}
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, icon: Icon }) => (
          <a
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-accent-soft)] hover:text-[var(--text-accent)]"
            href="#"
            key={label}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </nav>

      <Button
        className="mt-auto w-full justify-center gap-2"
        onClick={onThemeToggle}
        variant="secondary"
      >
        {theme === "dark" ? (
          <SunMedium className="h-4 w-4" />
        ) : (
          <MoonStar className="h-4 w-4" />
        )}
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </Button>

      <Button className="mt-3 w-full justify-center gap-2" onClick={onLogout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </aside>
  );
}

export default Sidebar;
