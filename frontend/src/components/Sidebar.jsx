import {
  CalendarPlus,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  LogOut,
  PanelLeftClose,
  MoonStar,
  PlusSquare,
  SunMedium,
  Waves,
} from "lucide-react";
import { Button } from "./ui/button";

function Sidebar({
  activeView,
  onLogout,
  onSidebarClose,
  onThemeToggle,
  onViewChange,
  theme,
  user,
}) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tasks", label: "My Tasks", icon: ListTodo },
    { id: "add-task", label: "Add Task", icon: PlusSquare },
    { id: "add-event", label: "Add Event", icon: CalendarPlus },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  return (
    <aside className="flex w-full max-w-xs flex-col rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-accent)]">
            <Waves className="h-4 w-4" />
            Dashboard
          </div>

          <button
            aria-label="Hide sidebar"
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-accent-soft)] hover:text-[var(--text-accent)]"
            onClick={onSidebarClose}
            type="button"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Workspace</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Signed in as {user.name}
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
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
