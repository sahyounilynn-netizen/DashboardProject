import {
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MoonStar,
  PlusSquare,
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
    { id: "add-task", label: "Add Task", icon: PlusSquare },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  const focusLabel =
    activeView === "calendar"
      ? "Calendar deadlines"
      : activeView === "tasks"
        ? "Task editing"
        : activeView === "add-task"
          ? "Task creation"
          : "Workspace overview";

  const focusDescription =
    activeView === "calendar"
      ? "Browse deadlines by date and jump into task editing when something needs to change."
      : activeView === "tasks"
        ? "Review, edit, and clean up your task list in one dedicated space."
        : activeView === "add-task"
          ? "Create a task with the right deadline before it reaches your calendar."
          : "Use the big action boxes to move quickly into the task area you need.";

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

      <div className="mt-6 rounded-[26px] bg-[var(--bg-accent-hero)] p-5 text-[var(--text-on-accent)] shadow-[var(--shadow-accent)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
          Current focus
        </p>
        <p className="mt-3 text-lg font-semibold">
          {focusLabel}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/80">
          {focusDescription}
        </p>
      </div>

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
