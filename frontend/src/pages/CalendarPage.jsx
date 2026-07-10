import { useState } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function getDateOnlyKey(value) {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 10);
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getSelectedDateLabel(dateKey) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function formatDueDateLabel(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${getDateOnlyKey(value)}T00:00:00`));
}

function buildCalendarDays(currentMonth) {
  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function CalendarPage({ onTaskSelect, user, tasks }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    formatDateKey(new Date())
  );

  function handlePreviousMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }

  function handleNextMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }

  const calendarDays = buildCalendarDays(currentMonth);
  const dueTasksByDate = {};

  for (const task of tasks) {
    const dueDateKey = getDateOnlyKey(task.due_date);

    if (!dueDateKey) {
      continue;
    }

    if (!dueTasksByDate[dueDateKey]) {
      dueTasksByDate[dueDateKey] = [];
    }

    dueTasksByDate[dueDateKey].push(task);
  }

  for (const dateKey of Object.keys(dueTasksByDate)) {
    dueTasksByDate[dateKey].sort((firstTask, secondTask) =>
      firstTask.title.localeCompare(secondTask.title)
    );
  }

  const selectedDateTasks = dueTasksByDate[selectedDateKey] ?? [];
  const tasksWithDeadline = tasks.filter((task) => task.due_date);
  const monthDueTaskCount = tasksWithDeadline.filter((task) => {
    const dueDate = new Date(`${getDateOnlyKey(task.due_date)}T00:00:00`);

    return (
      dueDate.getFullYear() === currentMonth.getFullYear() &&
      dueDate.getMonth() === currentMonth.getMonth()
    );
  }).length;
  const overdueTaskCount = tasksWithDeadline.filter((task) => {
    const dueDateKey = getDateOnlyKey(task.due_date);
    const todayKey = formatDateKey(new Date());

    return dueDateKey < todayKey && task.status !== "completed";
  }).length;
  const undatedTaskCount = tasks.filter((task) => !task.due_date).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
              Calendar
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
                Deadline calendar for {user.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                This page shows your tasks by deadline date only. It answers the
                simple question: what is due, and when?
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Due this month
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                  {monthDueTaskCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Overdue
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                  {overdueTaskCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  No deadline
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                  {undatedTaskCount}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.95fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{getMonthLabel(currentMonth)}</CardTitle>
              <CardDescription>
                Each day highlights tasks by deadline. This is the main planning
                signal now.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePreviousMonth} size="sm" variant="secondary">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNextMonth} size="sm" variant="secondary">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-[var(--border-soft)] bg-[var(--bg-panel-soft)]">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]"
                  key={label}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((date) => {
                const dateKey = formatDateKey(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isSelected = dateKey === selectedDateKey;
                const dayTasks = dueTasksByDate[dateKey] ?? [];

                return (
                  <button
                    className={`min-h-44 border-b border-r border-[var(--border-soft)] p-3 text-left transition ${
                      isSelected
                        ? "bg-[var(--bg-accent-soft)]"
                        : "bg-transparent hover:bg-[var(--bg-panel-soft)]"
                    }`}
                    key={dateKey}
                    onClick={() => setSelectedDateKey(dateKey)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          isCurrentMonth
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-muted)] opacity-60"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                          {dayTasks.length} due
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayTasks.slice(0, 3).map((task) => (
                        <button
                          className="rounded-2xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                          key={task.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            onTaskSelect?.(task);
                          }}
                          type="button"
                        >
                          <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {task.title}
                          </div>
                        </button>
                      ))}

                      {dayTasks.length > 3 && (
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-200">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{getSelectedDateLabel(selectedDateKey)}</CardTitle>
              <CardDescription>
                A focused list of everything due on the selected date.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDateTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-4 py-5 text-sm text-[var(--text-muted)]">
                  No tasks are due on this day.
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <button
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900/60 dark:bg-amber-950/40"
                    key={task.id}
                    onClick={() => onTaskSelect?.(task)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-100">
                          <Flag className="h-4 w-4" />
                          {task.title}
                        </p>
                        <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                          Priority: {task.priority} | Status: {task.status}
                        </p>
                        <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                          Deadline: {formatDueDateLabel(task.due_date)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-black/20 dark:text-amber-200">
                        Due
                      </span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
