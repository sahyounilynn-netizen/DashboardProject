import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import Sidebar from "../components/Sidebar";
import TaskForm from "../components/TaskForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import CalendarPage from "./CalendarPage";
import {
  createEvent,
  createTask,
  deleteEvent,
  deleteTask,
  getEvents,
  getTasks,
  updateEvent,
  updateTask,
  updateTaskStatus,
} from "../services/api";

function normalizeDateKey(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const directDateMatch = trimmedValue.match(/^(\d{4}-\d{2}-\d{2})/);

    if (directDateMatch) {
      return directDateMatch[1];
    }
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDueDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${normalizeDateKey(value)}T00:00:00`));
}

function getTaskFormValues(task) {
  return {
    title: task.title ?? "",
    priority: task.priority ?? "medium",
    status: task.status ?? "pending",
    due_date: normalizeDateKey(task.due_date),
  };
}

function getDateKey(value) {
  return normalizeDateKey(value) || null;
}

function getTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function addDaysToDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);

  return normalizeDateKey(date);
}

function getRangeEndKey(range, todayKey) {
  if (range === "today") {
    return todayKey;
  }

  if (range === "week") {
    return addDaysToDateKey(todayKey, 6);
  }

  if (range === "month") {
    return addDaysToDateKey(todayKey, 29);
  }

  return null;
}

function isDateInRange(dateKey, startKey, endKey) {
  if (!dateKey) {
    return false;
  }

  if (dateKey < startKey) {
    return false;
  }

  if (endKey === null) {
    return true;
  }

  return dateKey <= endKey;
}

function formatEventDateLabel(event) {
  const startDate = new Date(event.start_at);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(startDate);
}

function formatActivityTime(value) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function getPriorityRank(priority) {
  if (priority === "high") {
    return 0;
  }

  if (priority === "medium") {
    return 1;
  }

  return 2;
}

function isTaskOverdueForDashboard(task, todayKey) {
  const dueDateKey = getDateKey(task.due_date);

  return Boolean(dueDateKey && dueDateKey < todayKey && task.status !== "completed");
}

function buildRecentActivity(tasks, events) {
  const taskActivity = tasks
    .map((task) => {
      const changedAt = task.updated_at || task.created_at;

      if (!changedAt) {
        return null;
      }

      return {
        id: `task-${task.id}`,
        label:
          task.status === "completed"
            ? "Task completed"
            : task.updated_at && task.created_at && task.updated_at !== task.created_at
              ? "Task status changed"
              : "Task created",
        title: task.title,
        timestamp: changedAt,
      };
    })
    .filter(Boolean);

  const eventActivity = events
    .map((event) => {
      const changedAt = event.created_at || event.start_at;

      if (!changedAt) {
        return null;
      }

      return {
        id: `event-${event.id}`,
        label: "Event added",
        title: event.title,
        timestamp: changedAt,
      };
    })
    .filter(Boolean);

  return [...taskActivity, ...eventActivity]
    .sort(
      (firstItem, secondItem) =>
        new Date(secondItem.timestamp).getTime() -
        new Date(firstItem.timestamp).getTime()
    )
    .slice(0, 5);
}

function compareTasksByDeadline(firstTask, secondTask) {
  const firstDate = getDateKey(firstTask.due_date);
  const secondDate = getDateKey(secondTask.due_date);

  if (firstDate && secondDate) {
    return firstDate.localeCompare(secondDate) || firstTask.title.localeCompare(secondTask.title);
  }

  if (firstDate) {
    return -1;
  }

  if (secondDate) {
    return 1;
  }

  return firstTask.title.localeCompare(secondTask.title);
}

function getTaskStatusLabel(status) {
  return status.replace("-", " ");
}

function getStatusBadgeClass(status) {
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200";
  }

  if (status === "in-progress") {
    return "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function getPriorityBadgeClass(priority) {
  if (priority === "high") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200";
  }

  if (priority === "medium") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200";
}

function getTasksForDeadline(tasks, dueDate, taskIdToIgnore = null) {
  if (!dueDate) {
    return [];
  }

  return tasks.filter((task) => {
    const matchesDeadline = normalizeDateKey(task.due_date) === dueDate;
    const isIgnoredTask = taskIdToIgnore != null && task.id === taskIdToIgnore;

    return matchesDeadline && !isIgnoredTask;
  });
}

function ActionBox({ description, icon: Icon, onClick, title }) {
  return (
    <button
      className="group flex w-full items-center gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-3 text-left shadow-[var(--shadow-panel)] transition hover:bg-[var(--bg-accent-soft)]"
      onClick={onClick}
      type="button"
    >
      <div className="rounded-xl bg-[var(--bg-panel-soft)] p-2 text-[var(--text-accent)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          {description}
        </p>
      </div>
    </button>
  );
}

function ModalShell({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            aria-label="Close dialog"
            className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-accent-soft)] hover:text-[var(--text-accent)]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TodayFocusPanel({
  onTaskClick,
  onStatusChange,
  progressSummary,
  rangeLabel,
  tasks,
  urgentTasks,
}) {
  const totalTracked =
    progressSummary.completed +
    progressSummary.inProgress +
    progressSummary.pending;
  const completionPercent =
    totalTracked === 0
      ? 0
      : Math.round((progressSummary.completed / totalTracked) * 100);

  return (
    <Card className="self-start bg-white/80 dark:bg-slate-900/60">
      <CardContent className="space-y-3 p-3.5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-accent)]">
              Overview
            </p>
            <h3 className="text-lg font-semibold leading-tight text-[var(--text-primary)]">
              Today's Focus
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {rangeLabel}
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-4 py-4">
            <h4 className="text-base font-semibold text-[var(--text-primary)]">
              You&apos;re all caught up for today.
            </h4>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              No tasks are currently due.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Tasks due
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {tasks.length} item{tasks.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] px-3 py-2.5 text-left transition hover:bg-[var(--bg-accent-soft)]"
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  type="button"
                >
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDueDate(task.due_date)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityBadgeClass(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(task.status)}`}
                      >
                        {getTaskStatusLabel(task.status)}
                      </span>
                      <select
                        className="h-8 rounded-full border border-[var(--border-muted)] bg-white px-3 text-xs font-semibold text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] dark:bg-slate-950"
                        onChange={(event) => onStatusChange(task.id, event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        value={task.status}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-[var(--bg-panel-soft)] px-3 py-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Progress
                  </p>
                  <p className="mt-1 text-xl font-semibold leading-none text-[var(--text-primary)]">
                    {completionPercent}%
                  </p>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {progressSummary.completed}/{totalTracked || 0}
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-slate-950/60">
                <div className="flex h-full w-full">
                  <div
                    className="bg-emerald-500"
                    style={{
                      width:
                        totalTracked === 0
                          ? "0%"
                          : `${(progressSummary.completed / totalTracked) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-sky-500"
                    style={{
                      width:
                        totalTracked === 0
                          ? "0%"
                          : `${(progressSummary.inProgress / totalTracked) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-slate-300 dark:bg-slate-700"
                    style={{
                      width:
                        totalTracked === 0
                          ? "100%"
                          : `${(progressSummary.pending / totalTracked) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/70 px-2.5 py-2 text-center dark:bg-slate-950/40">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Done
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {progressSummary.completed}
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 px-2.5 py-2 text-center dark:bg-slate-950/40">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Active
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {progressSummary.inProgress}
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 px-2.5 py-2 text-center dark:bg-slate-950/40">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Pending
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {progressSummary.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Urgent tasks
              </p>
              {urgentTasks.length === 0 ? (
                <div className="rounded-xl bg-[var(--bg-panel-soft)] px-3 py-3 text-sm text-[var(--text-muted)]">
                  No urgent tasks.
                </div>
              ) : (
                urgentTasks.map((task) => (
                  <button
                    className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30"
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    type="button"
                  >
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {task.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-slate-900 dark:text-rose-200">
                        High priority
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(task.status)}`}
                      >
                        {getTaskStatusLabel(task.status)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingPanel({ emptyMessage, items, onEventClick, onTaskClick }) {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? items : items.slice(0, 4);

  return (
    <Card className="self-start bg-white/80 dark:bg-slate-900/60">
      <CardContent className="space-y-3 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-accent)]">
              Schedule
            </p>
            <h3 className="text-lg font-semibold leading-tight text-[var(--text-primary)]">
              Upcoming
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Next 3 to 5 items
            </p>
          </div>
          {items.length > 4 ? (
            <button
              className="text-xs font-semibold text-[var(--text-accent)] transition hover:opacity-80"
              onClick={() => setShowAll((current) => !current)}
              type="button"
            >
              {showAll ? "Show less" : "View all"}
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-3 py-3 text-sm text-[var(--text-muted)]">
            {emptyMessage}
          </div>
        ) : (
          <div className={`space-y-2 ${showAll && items.length > 4 ? "max-h-[320px] overflow-y-auto pr-1" : ""}`}>
            {displayedItems.map((item) => {
              const isTask = item.kind === "task";
              const Icon = isTask ? ListTodo : CalendarDays;

              return (
                <button
                  className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] px-3 py-2.5 text-left transition hover:bg-[var(--bg-accent-soft)]"
                  key={item.key}
                  onClick={() =>
                    isTask ? onTaskClick?.(item.source) : onEventClick?.(item.source)
                  }
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {isTask ? "Task" : "Event"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {item.when}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isTask ? (
                      <>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityBadgeClass(item.source.priority)}`}
                        >
                          {item.source.priority}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(item.source.status)}`}
                        >
                          {getTaskStatusLabel(item.source.status)}
                        </span>
                      </>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
                        Scheduled
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityCard({ activities }) {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 4);

  return (
    <SmallInsightCard
      subtitle="Latest changes across tasks and events."
      title="Recent Activity"
    >
      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-3 py-3 text-sm text-[var(--text-muted)]">
          No activity yet.
        </div>
      ) : (
        <>
          <div className={`space-y-2 ${showAll && activities.length > 4 ? "max-h-[320px] overflow-y-auto pr-1" : ""}`}>
            {displayedActivities.map((activity) => (
              <div
                className="rounded-xl bg-[var(--bg-panel-soft)] px-3 py-2"
                key={activity.id}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {activity.label}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {activity.title}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {formatActivityTime(activity.timestamp)}
                </p>
              </div>
            ))}
          </div>
          {activities.length > 4 ? (
            <button
              className="text-xs font-semibold text-[var(--text-accent)] transition hover:opacity-80"
              onClick={() => setShowAll((current) => !current)}
              type="button"
            >
              {showAll ? "Show less" : "View all activity"}
            </button>
          ) : null}
        </>
      )}
    </SmallInsightCard>
  );
}

function SmallInsightCard({ children, title, subtitle }) {
  return (
    <Card className="self-start bg-white/80 dark:bg-slate-900/60">
      <CardContent className="space-y-3 p-3.5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function SimpleTaskList({ emptyMessage, onTaskClick, tasks, title }) {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/60">
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-3 py-3 text-sm text-[var(--text-muted)]">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] px-3 py-2.5 text-left transition hover:bg-[var(--bg-accent-soft)]"
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                type="button"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {task.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDueDate(task.due_date)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityBadgeClass(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(task.status)}`}
                    >
                      {getTaskStatusLabel(task.status)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TasksPage({
  allTasks = [],
  editDeadlineWarning,
  activeStatusFilter,
  editingTaskId,
  error,
  events,
  onOpenAddTask,
  onDuplicateTask,
  onClearFilters,
  onDueFilterChange,
  onPriorityFilterChange,
  onSortChange,
  handleConfirmTaskEditSave,
  handleCancelTaskEdit,
  handleDeleteTask,
  handleSaveTaskEdit,
  handleStartTaskEdit,
  handleStatusChange,
  handleTaskEditChange,
  onStatusFilterChange,
  onTaskQueryChange,
  taskDueFilter,
  taskPriorityFilter,
  taskQuery,
  taskSort,
  taskEditForm,
  tasks,
}) {
  const groupedDeadlines = allTasks.reduce((groups, task) => {
    const dueDate = normalizeDateKey(task.due_date);

    if (!dueDate) {
      return groups;
    }

    if (!groups[dueDate]) {
      groups[dueDate] = [];
    }

    groups[dueDate].push(task);
    return groups;
  }, {});
  const duplicateDeadlineGroups = Object.entries(groupedDeadlines).filter(
    ([, groupedTasks]) => groupedTasks.length > 1
  );
  const linkedEventsByTaskId = events.reduce((groups, event) => {
    if (!event.task_id) {
      return groups;
    }

    if (!groups[event.task_id]) {
      groups[event.task_id] = [];
    }

    groups[event.task_id].push(event);
    return groups;
  }, {});
  const quickCounts = {
    all: allTasks.length,
    pending: allTasks.filter((task) => task.status === "pending").length,
    "in-progress": allTasks.filter((task) => task.status === "in-progress").length,
    completed: allTasks.filter((task) => task.status === "completed").length,
    overdue: allTasks.filter((task) => isTaskOverdueForDashboard(task, getTodayKey())).length,
  };
  const activeFilterCount = [
    taskQuery.trim() !== "",
    activeStatusFilter !== "all",
    taskPriorityFilter !== "all",
    taskDueFilter !== "all",
    taskSort !== "newest",
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;
  const filterControls = (
    <>
      <select
        aria-label="Filter by status"
        className="h-10 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
        onChange={(event) => onStatusFilterChange(event.target.value)}
        value={activeStatusFilter}
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
      </select>
      <select
        aria-label="Filter by priority"
        className="h-10 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
        onChange={(event) => onPriorityFilterChange(event.target.value)}
        value={taskPriorityFilter}
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        aria-label="Filter by due date"
        className="h-10 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
        onChange={(event) => onDueFilterChange(event.target.value)}
        value={taskDueFilter}
      >
        <option value="all">All dates</option>
        <option value="today">Due today</option>
        <option value="week">This week</option>
        <option value="overdue">Overdue</option>
        <option value="none">No date</option>
      </select>
      <select
        aria-label="Sort tasks"
        className="h-10 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
        onChange={(event) => onSortChange(event.target.value)}
        value={taskSort}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="due-date">Due date</option>
        <option value="priority">Priority</option>
      </select>
      {hasActiveFilters ? (
        <Button
          className="h-10"
          onClick={onClearFilters}
          size="sm"
          variant="secondary"
        >
          Clear Filters ({activeFilterCount})
        </Button>
      ) : null}
    </>
  );

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-panel)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
              My Tasks
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              My Tasks
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Organize, update, and track your work.
            </p>
          </div>
          <Button className="h-10 gap-2 self-start lg:self-auto" onClick={onOpenAddTask}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["in-progress", "In Progress"],
              ["completed", "Completed"],
              ["overdue", "Overdue"],
            ].map(([value, label]) => (
              <button
                aria-pressed={activeStatusFilter === value}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  activeStatusFilter === value
                    ? "bg-[var(--bg-accent-soft)] text-[var(--text-accent)]"
                    : "bg-[var(--bg-panel-soft)] text-[var(--text-secondary)] hover:bg-[var(--bg-accent-soft)] hover:text-[var(--text-accent)]"
                }`}
                key={value}
                onClick={() => onStatusFilterChange(value)}
                type="button"
              >
                {label} {quickCounts[value]}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:hidden">
            <Input
              className="h-10"
              onChange={(event) => onTaskQueryChange(event.target.value)}
              placeholder="Search by task title"
              value={taskQuery}
            />
            <details className="group">
              <summary className="flex h-10 cursor-pointer items-center justify-between rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm font-semibold text-[var(--text-secondary)] shadow-sm">
                <span>Filters{hasActiveFilters ? ` (${activeFilterCount})` : ""}</span>
                <span className="text-xs">Open</span>
              </summary>
              <div className="mt-3 grid gap-3">{filterControls}</div>
            </details>
          </div>

          <div className="hidden gap-3 lg:grid xl:grid-cols-[minmax(0,1fr)_160px_160px_170px_160px_auto]">
            <Input
              className="h-10"
              onChange={(event) => onTaskQueryChange(event.target.value)}
              placeholder="Search by task title"
              value={taskQuery}
            />
            {filterControls}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {allTasks.length === 0 ? (
        <Card className="bg-white/75">
          <CardContent className="space-y-3 p-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                No tasks yet
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Create your first task to start organizing your work.
              </p>
            </div>
            <Button className="gap-2" onClick={onOpenAddTask} size="sm">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="bg-white/75">
          <CardContent className="space-y-3 p-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                No tasks match these filters
              </h2>
            </div>
            {hasActiveFilters ? (
              <Button onClick={onClearFilters} size="sm" variant="secondary">
                Clear Filters ({activeFilterCount})
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card
                className={`bg-white/80 ${task.status === "completed" ? "opacity-70" : ""}`}
                key={task.id}
              >
                <CardContent className="flex flex-col gap-2.5 p-3.5">
                  {editingTaskId === task.id ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            Task title
                          </p>
                          <Input
                            onChange={(event) =>
                              handleTaskEditChange("title", event.target.value)
                            }
                            value={taskEditForm.title}
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            Priority
                          </p>
                          <select
                            className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                            onChange={(event) =>
                              handleTaskEditChange("priority", event.target.value)
                            }
                            value={taskEditForm.priority}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            Deadline
                          </p>
                          <Input
                            onChange={(event) =>
                              handleTaskEditChange("due_date", event.target.value)
                            }
                            type="date"
                            value={taskEditForm.due_date}
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            Status
                          </p>
                          <select
                            className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                            onChange={(event) =>
                              handleTaskEditChange("status", event.target.value)
                            }
                            value={taskEditForm.status}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {editDeadlineWarning ? (
                        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                          <p>{editDeadlineWarning}</p>
                          <div className="flex flex-wrap gap-3">
                            <Button onClick={() => handleConfirmTaskEditSave(task.id)}>
                              Save anyway
                            </Button>
                            <Button
                              onClick={handleCancelTaskEdit}
                              variant="secondary"
                            >
                              Choose another day
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => handleSaveTaskEdit(task.id)}>
                          Save changes
                        </Button>
                        <Button onClick={handleCancelTaskEdit} variant="secondary">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1.5">
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <button
                              aria-label={`Mark ${task.title} complete`}
                              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                                task.status === "completed"
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-[var(--border-muted)] bg-white text-[var(--text-muted)] hover:border-emerald-400 hover:text-emerald-600"
                              }`}
                              onClick={() => handleStatusChange(task.id, "completed")}
                              type="button"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">
                              {task.title}
                            </h3>
                          </div>
                          {task.description ? (
                            <p className="text-sm text-[var(--text-muted)]">
                              {task.description}
                            </p>
                          ) : null}
                          <p className="text-sm text-[var(--text-muted)]">
                            {formatDueDate(task.due_date)}
                          </p>
                          {linkedEventsByTaskId[task.id]?.[0] ? (
                            <p className="text-xs text-[var(--text-muted)]">
                              Linked event: {linkedEventsByTaskId[task.id][0].title}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-[0.08em] ${getPriorityBadgeClass(task.priority)}`}
                          >
                            {task.priority} priority
                          </span>
                          {isTaskOverdueForDashboard(task, getTodayKey()) ? (
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
                              Overdue
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[minmax(140px,170px)_auto] sm:items-center">
                        <select
                          className="h-10 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                          onChange={(event) =>
                            handleStatusChange(task.id, event.target.value)
                          }
                          value={task.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <details className="relative">
                          <summary className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] text-lg text-[var(--text-secondary)]">
                            ...
                          </summary>
                          <div className="absolute right-0 z-10 mt-2 w-36 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-2 shadow-[var(--shadow-panel)]">
                            <button
                              className="w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-panel-soft)]"
                              onClick={() => handleStartTaskEdit(task)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-panel-soft)]"
                              onClick={() => onDuplicateTask(task)}
                              type="button"
                            >
                              Duplicate
                            </button>
                            <button
                              className="w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              onClick={() => {
                                if (window.confirm("Delete this task?")) {
                                  handleDeleteTask(task.id);
                                }
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>

          {duplicateDeadlineGroups.length > 0 ? (
            <aside className="xl:sticky xl:top-6">
              <section className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-panel)] px-3.5 py-3.5 shadow-[var(--shadow-panel)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[var(--bg-accent-soft)] p-2 text-[var(--text-accent)]">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                        Deadline Groups
                      </h2>
                      <span className="rounded-full bg-[var(--bg-panel-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                        {duplicateDeadlineGroups.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5">
                  {duplicateDeadlineGroups.map(([dueDate, groupedTasks]) => (
                    <details
                      className="rounded-2xl bg-[var(--bg-panel-soft)] px-3 py-2.5"
                      key={dueDate}
                    >
                      <summary className="cursor-pointer list-none">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-accent)]">
                          {formatDueDate(dueDate)} - {groupedTasks.length} task
                          {groupedTasks.length === 1 ? "" : "s"}
                        </p>
                      </summary>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {groupedTasks.map((task) => (
                          <span
                            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
                            key={task.id}
                          >
                            {task.title}
                          </span>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}

function AddTaskPage({ error, onTaskCreated, tasks }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-8">
        <div className="space-y-3">
          <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
            Add Task
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
              Create a new task
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
              Add the task, give it a deadline, and it will immediately become
              useful inside your calendar.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <TaskForm existingTasks={tasks} onTaskCreated={onTaskCreated} />

        <Card className="bg-white/80">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Good task setup
              </h2>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                Keep titles short, use the deadline field when the task belongs
                on the calendar, and use status only for real progress changes.
              </p>
              <div className="rounded-2xl bg-[var(--bg-panel-soft)] px-4 py-4 text-sm leading-6 text-[var(--text-muted)]">
                Example:
                Write backend checklist API
                Deadline: next Friday
                Status: pending
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HomePage({ authEntrySource, user, onLogout, onThemeToggle, theme }) {
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [overviewRange, setOverviewRange] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskEditForm, setTaskEditForm] = useState({
    title: "",
    priority: "medium",
    status: "pending",
    due_date: "",
  });
  const [editDeadlineWarning, setEditDeadlineWarning] = useState("");
  const [taskQuery, setTaskQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
  const [taskDueFilter, setTaskDueFilter] = useState("all");
  const [taskSort, setTaskSort] = useState("newest");
  const [events, setEvents] = useState([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const todayKey = getTodayKey();
  const overviewRangeEndKey = getRangeEndKey(overviewRange, todayKey);
  const weekEndKey = addDaysToDateKey(todayKey, 6);
  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(taskQuery.trim().toLowerCase())
    )
    .filter((task) => {
      if (taskStatusFilter === "all") {
        return true;
      }

      if (taskStatusFilter === "overdue") {
        return isTaskOverdueForDashboard(task, todayKey);
      }

      return task.status === taskStatusFilter;
    })
    .filter((task) =>
      taskPriorityFilter === "all" ? true : task.priority === taskPriorityFilter
    )
    .filter((task) => {
      const dueDateKey = getDateKey(task.due_date);

      if (taskDueFilter === "all") {
        return true;
      }

      if (taskDueFilter === "today") {
        return dueDateKey === todayKey;
      }

      if (taskDueFilter === "week") {
        return isDateInRange(dueDateKey, todayKey, weekEndKey);
      }

      if (taskDueFilter === "overdue") {
        return Boolean(dueDateKey && dueDateKey < todayKey);
      }

      if (taskDueFilter === "none") {
        return !dueDateKey;
      }

      return true;
    })
    .sort((firstTask, secondTask) => {
      if (taskSort === "oldest") {
        return (
          new Date(firstTask.created_at || 0).getTime() -
          new Date(secondTask.created_at || 0).getTime()
        );
      }

      if (taskSort === "due-date") {
        return compareTasksByDeadline(firstTask, secondTask);
      }

      if (taskSort === "priority") {
        return (
          getPriorityRank(firstTask.priority) - getPriorityRank(secondTask.priority)
        );
      }

      return (
        new Date(secondTask.created_at || 0).getTime() -
        new Date(firstTask.created_at || 0).getTime()
      );
    });
  const rangeTasks = tasks
    .filter((task) => {
      const dueDateKey = getDateKey(task.due_date);

      return isDateInRange(dueDateKey, todayKey, overviewRangeEndKey);
    })
    .sort(compareTasksByDeadline);
  const overviewTasks = rangeTasks
    .filter((task) => task.status !== "completed")
    .slice(0, 5);
  const upcomingItems = [
    ...tasks
      .filter((task) => {
        const dueDateKey = getDateKey(task.due_date);

        return (
          dueDateKey &&
          dueDateKey > (overviewRangeEndKey ?? todayKey) &&
          task.status !== "completed"
        );
      })
      .map((task) => ({
        key: `task-${task.id}`,
        kind: "task",
        title: task.title,
        when: formatDueDate(task.due_date),
        sortAt: new Date(`${getDateKey(task.due_date)}T00:00:00`).getTime(),
        source: task,
      })),
    ...events
      .filter((event) => normalizeDateKey(event.start_at) > (overviewRangeEndKey ?? todayKey))
      .map((event) => ({
        key: `event-${event.id}`,
        kind: "event",
        title: event.title,
        when: formatEventDateLabel(event),
        sortAt: new Date(event.start_at).getTime(),
        source: event,
      })),
  ]
    .sort((firstItem, secondItem) => firstItem.sortAt - secondItem.sortAt)
    .slice(0, 5);
  const urgentOverviewTasks = overviewTasks
    .filter((task) => task.priority === "high")
    .slice(0, 3);
  const progressSummary = {
    completed: rangeTasks.filter((task) => task.status === "completed").length,
    inProgress: rangeTasks.filter((task) => task.status === "in-progress").length,
    pending: rangeTasks.filter((task) => task.status === "pending").length,
  };
  const selectedRangeLabel =
    overviewRange === "today"
      ? "Today"
      : overviewRange === "week"
        ? "This Week"
        : overviewRange === "month"
          ? "This Month"
          : "All Time";
  const summaryCards = [
    {
      title: overviewRange === "all" ? "Total Tasks" : `Tasks ${selectedRangeLabel}`,
      value: rangeTasks.length,
    },
    {
      title:
        overviewRange === "all"
          ? "Completed Tasks"
          : `Completed ${selectedRangeLabel}`,
      value: `${progressSummary.completed} - ${
        rangeTasks.length === 0
          ? 0
          : Math.round((progressSummary.completed / rangeTasks.length) * 100)
      }%`,
    },
    {
      title:
        overviewRange === "all"
          ? "Pending Tasks"
          : `Pending ${selectedRangeLabel}`,
      value: progressSummary.pending,
    },
    {
      title:
        overviewRange === "all"
          ? "In Progress Tasks"
          : `In Progress ${selectedRangeLabel}`,
      value: progressSummary.inProgress,
    },
  ];
  const weeklyTasks = tasks
    .filter((task) =>
      isDateInRange(getDateKey(task.due_date), todayKey, addDaysToDateKey(todayKey, 6))
    )
    .sort(compareTasksByDeadline);
  const weeklyStats = {
    completed: weeklyTasks.filter((task) => task.status === "completed").length,
    pending: weeklyTasks.filter((task) => task.status !== "completed").length,
    completionPercent:
      weeklyTasks.length === 0
        ? 0
        : Math.round(
            (weeklyTasks.filter((task) => task.status === "completed").length /
              weeklyTasks.length) *
              100
          ),
  };
  const priorityBreakdown = {
    high: rangeTasks.filter((task) => task.priority === "high").length,
    medium: rangeTasks.filter((task) => task.priority === "medium").length,
    low: rangeTasks.filter((task) => task.priority === "low").length,
  };
  const recentActivity = buildRecentActivity(tasks, events);

  async function fetchOverviewData() {
    try {
      setIsLoading(true);
      setError("");

      const [savedTasks, savedEvents] = await Promise.all([
        getTasks(user.id),
        getEvents(user.id),
      ]);

      setTasks(savedTasks);
      setEvents(savedEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTaskCreated(taskData) {
    try {
      setError("");

      await createTask({
        ...taskData,
        userId: user.id,
      });

      const savedTasks = await getTasks(user.id);
      setTasks(savedTasks);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleEventCreated(eventData) {
    try {
      setError("");
      const newEvent = await createEvent({
        ...eventData,
        userId: user.id,
      });

      setEvents((currentEvents) =>
        [...currentEvents, newEvent].sort(
          (firstEvent, secondEvent) =>
            new Date(firstEvent.start_at).getTime() -
            new Date(secondEvent.start_at).getTime()
        )
      );
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function handleEventUpdated(eventId, eventData) {
    try {
      setError("");
      const savedEvent = await updateEvent(eventId, {
        ...eventData,
        userId: user.id,
      });

      setEvents((currentEvents) =>
        currentEvents
          .map((event) => (event.id === eventId ? savedEvent : event))
          .sort(
            (firstEvent, secondEvent) =>
              new Date(firstEvent.start_at).getTime() -
              new Date(secondEvent.start_at).getTime()
          )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function handleEventDeleted(eventId) {
    try {
      setError("");
      await deleteEvent(eventId, user.id);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      setError("");

      await deleteTask(taskId, user.id);
      const [savedTasks, savedEvents] = await Promise.all([
        getTasks(user.id),
        getEvents(user.id),
      ]);

      setTasks(savedTasks);
      setEvents(savedEvents);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      setError("");

      const updatedTask = await updateTaskStatus(taskId, newStatus, user.id);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function handleStartTaskEdit(task) {
    setActiveView("tasks");
    setEditingTaskId(task.id);
    setTaskEditForm(getTaskFormValues(task));
    setEditDeadlineWarning("");
    setError("");
  }

  async function handleTaskCreatedFromDialog(taskData) {
    const wasCreated = await handleTaskCreated(taskData);

    if (wasCreated) {
      setIsTaskDialogOpen(false);
    }

    return wasCreated;
  }

  function handleCancelTaskEdit() {
    setEditingTaskId(null);
    setEditDeadlineWarning("");
    setTaskEditForm({
      title: "",
      priority: "medium",
      status: "pending",
      due_date: "",
    });
  }

  function resetTaskWorkspaceState() {
    handleCancelTaskEdit();
    setTaskQuery("");
    setTaskStatusFilter("all");
    setTaskPriorityFilter("all");
    setTaskDueFilter("all");
    setTaskSort("newest");
  }

  function handleTaskEditChange(field, value) {
    if (field === "due_date") {
      setEditDeadlineWarning("");
    }

    setTaskEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveTaskEdit(taskId) {
    const updatedTask = await updateTask(taskId, {
      ...taskEditForm,
      userId: user.id,
      due_date: taskEditForm.due_date || null,
    });

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
    );
    setEditingTaskId(null);
    setEditDeadlineWarning("");
  }

  async function handleSaveTaskEdit(taskId) {
    if (taskEditForm.title.trim() === "") {
      setError("Task title is required.");
      return;
    }

    const tasksOnSameDeadline = getTasksForDeadline(
      tasks,
      taskEditForm.due_date,
      taskId
    );

    if (tasksOnSameDeadline.length > 0) {
      setEditDeadlineWarning(
        `There ${tasksOnSameDeadline.length === 1 ? "is" : "are"} already ${tasksOnSameDeadline.length} other task${tasksOnSameDeadline.length === 1 ? "" : "s"} with this deadline: ${tasksOnSameDeadline.map((task) => task.title).join(", ")}. Do you still want to save it?`
      );
      return;
    }

    try {
      setError("");
      await saveTaskEdit(taskId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmTaskEditSave(taskId) {
    try {
      setError("");
      const updatedTask = await updateTask(taskId, {
        ...taskEditForm,
        userId: user.id,
        due_date: taskEditForm.due_date || null,
        allowSharedDeadline: true,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setEditingTaskId(null);
      setEditDeadlineWarning("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadInitialOverviewData() {
      try {
        const [savedTasks, savedEvents] = await Promise.all([
          getTasks(user.id),
          getEvents(user.id),
        ]);

        if (isCancelled) {
          return;
        }

        setTasks(savedTasks);
        setEvents(savedEvents);
        setError("");
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitialOverviewData();

    return () => {
      isCancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (activeView === "events") {
      setIsSidebarVisible(true);
    }
  }, [activeView]);

  function handleCalendarTaskSelect(task) {
    handleStartTaskEdit(task);
  }

  function handleViewChange(nextView) {
    if (nextView === "tasks") {
      resetTaskWorkspaceState();
    }

    setActiveView(nextView);
  }

  function handleSummaryCardClick(title) {
    setTaskQuery("");

    if (title.toLowerCase().includes("completed")) {
      setTaskStatusFilter("completed");
    } else if (title.toLowerCase().includes("pending")) {
      setTaskStatusFilter("pending");
    } else if (title.toLowerCase().includes("in progress")) {
      setTaskStatusFilter("in-progress");
    } else {
      setTaskStatusFilter("all");
    }

    setActiveView("tasks");
  }

  function handleStartEventWorkspace() {
    setActiveView("events");
  }

  async function handleDuplicateTask(task) {
    try {
      setError("");
      await createTask({
        title: `${task.title} Copy`,
        description: task.description ?? "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || null,
        userId: user.id,
      });

      const savedTasks = await getTasks(user.id);
      setTasks(savedTasks);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex justify-start">
          <Button
            className="gap-2"
            onClick={() => setIsSidebarVisible((visible) => !visible)}
            size="sm"
            variant="secondary"
          >
            {isSidebarVisible ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
            Navigation
          </Button>
        </div>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          {isSidebarVisible ? (
            <Sidebar
              activeView={activeView}
              onLogout={onLogout}
              onThemeToggle={onThemeToggle}
              onViewChange={setActiveView}
              theme={theme}
              user={user}
            />
          ) : null}

          <main className="min-w-0 flex-1 space-y-6">
            {activeView === "calendar" || activeView === "add-event" || activeView === "events" ? (
              <CalendarPage
                entryMode={
                  activeView === "add-event"
                    ? "create-event"
                    : activeView === "events"
                      ? "events"
                      : "browse"
                }
                error={error}
                events={events}
                onEventCreate={handleEventCreated}
                onEventDelete={handleEventDeleted}
                onEventUpdate={handleEventUpdated}
                isSidebarVisible={isSidebarVisible}
                onSidebarToggle={() =>
                  setIsSidebarVisible((visible) => !visible)
                }
                onTaskSelect={handleCalendarTaskSelect}
                tasks={tasks}
                user={user}
              />
            ) : activeView === "tasks" ? (
              <TasksPage
                allTasks={tasks}
                editDeadlineWarning={editDeadlineWarning}
                activeStatusFilter={taskStatusFilter}
                editingTaskId={editingTaskId}
                error={error}
                events={events}
                onOpenAddTask={() => setIsTaskDialogOpen(true)}
                onDuplicateTask={handleDuplicateTask}
                onClearFilters={resetTaskWorkspaceState}
                onDueFilterChange={setTaskDueFilter}
                onPriorityFilterChange={setTaskPriorityFilter}
                onSortChange={setTaskSort}
                handleConfirmTaskEditSave={handleConfirmTaskEditSave}
                handleCancelTaskEdit={handleCancelTaskEdit}
                handleDeleteTask={handleDeleteTask}
                handleSaveTaskEdit={handleSaveTaskEdit}
                handleStartTaskEdit={handleStartTaskEdit}
                handleStatusChange={handleStatusChange}
                handleTaskEditChange={handleTaskEditChange}
                onStatusFilterChange={setTaskStatusFilter}
                onTaskQueryChange={setTaskQuery}
                taskDueFilter={taskDueFilter}
                taskPriorityFilter={taskPriorityFilter}
                taskQuery={taskQuery}
                taskSort={taskSort}
                taskEditForm={taskEditForm}
                tasks={filteredTasks}
              />
            ) : activeView === "add-task" ? (
              <AddTaskPage
                error={error}
                onTaskCreated={handleTaskCreated}
                tasks={tasks}
              />
            ) : (
              <>
                <section className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-3 shadow-[var(--shadow-panel)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                        Overview
                      </h1>
                      <p className="text-sm text-[var(--text-muted)]">
                        Here's what's happening today.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        className="h-10 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                        onChange={(event) => setOverviewRange(event.target.value)}
                        value={overviewRange}
                      >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                      </select>
                      <Button onClick={() => fetchOverviewData()} size="sm" variant="secondary">
                        Refresh
                      </Button>
                    </div>
                  </div>
                </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}

              <section className="space-y-3">
                {isLoading ? (
                  <Card className="bg-white/75">
                    <CardContent className="p-5 text-sm text-[var(--text-muted)]">
                      Loading...
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                      <DashboardCard
                        key={card.title}
                        onClick={() => handleSummaryCardClick(card.title)}
                        title={card.title}
                        value={card.value}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_300px] lg:items-start">
                <div className="space-y-3">
                  <TodayFocusPanel
                    onTaskClick={handleStartTaskEdit}
                    onStatusChange={handleStatusChange}
                    progressSummary={progressSummary}
                    rangeLabel={
                      overviewRange === "today"
                        ? "Tasks due today and their current status."
                        : overviewRange === "week"
                          ? "Tasks due this week and the most urgent ones."
                          : overviewRange === "month"
                            ? "Tasks due this month and the most urgent ones."
                            : "All tasks in your dashboard and the most urgent ones."
                    }
                    tasks={overviewTasks}
                    urgentTasks={urgentOverviewTasks}
                  />

                  <SmallInsightCard
                    subtitle="Completed, pending, and progress for the next 7 days."
                    title="Weekly Progress"
                  >
                    <div
                      className={
                        weeklyStats.completionPercent === 0 ? "space-y-2" : "space-y-3"
                      }
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Completed</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {weeklyStats.completed}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Still pending</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {weeklyStats.pending}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>Completion</span>
                          <span>{weeklyStats.completionPercent}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-panel-soft)]">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${weeklyStats.completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </SmallInsightCard>
                </div>

                <div className="space-y-3">
                  <UpcomingPanel
                    emptyMessage="No upcoming tasks or events."
                    items={upcomingItems}
                    onEventClick={handleStartEventWorkspace}
                    onTaskClick={handleStartTaskEdit}
                  />

                  <RecentActivityCard activities={recentActivity} />
                </div>
              </section>
              </>
            )}
          </main>
        </div>
      </div>
      {isTaskDialogOpen ? (
        <ModalShell onClose={() => setIsTaskDialogOpen(false)} title="Add Task">
          <TaskForm
            existingTasks={tasks}
            onTaskCreated={handleTaskCreatedFromDialog}
          />
        </ModalShell>
      ) : null}
    </div>
  );
}

export default HomePage;
