import {
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MoonStar,
  SunMedium,
  Waves,
} from "lucide-react";
import { Button } from "./ui/button";

function Sidebar({
  activeView,
  onLogout,
  onThemeToggle,
  onViewChange,
  theme,
  user,
}) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tasks", label: "My Tasks", icon: ListTodo },
    { id: "events", label: "My Events", icon: CalendarDays },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  return (
    <aside className="flex w-full max-w-[250px] flex-col rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-panel)] backdrop-blur-xl">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-accent)]">
          <Waves className="h-4 w-4" />
          Workspace
        </div>
        <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
          {user.name}
        </h2>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
              activeView === id
                ? "bg-[var(--bg-accent-soft)] text-[var(--text-accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-accent-soft)] hover:text-[var(--text-accent)]"
            }`}
            key={id}
            onClick={() => onViewChange(id)}
            type="button"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <Button
        className="mt-auto w-full justify-center gap-2"
        onClick={onThemeToggle}
        size="sm"
        variant="secondary"
      >
        {theme === "dark" ? (
          <SunMedium className="h-4 w-4" />
        ) : (
          <MoonStar className="h-4 w-4" />
        )}
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </Button>

      <Button className="mt-2.5 w-full justify-center gap-2" onClick={onLogout} size="sm">
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </aside>
  );
}

export default Sidebar;
