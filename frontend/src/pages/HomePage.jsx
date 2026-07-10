import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ListTodo,
  PanelLeftOpen,
  Plus,
  RefreshCcw,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
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
  getDashboardData,
  getEvents,
  getTasks,
  updateEvent,
  updateTask,
  updateTaskStatus,
} from "../services/api";

function formatDueDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${String(value).slice(0, 10)}T00:00:00`));
}

function getTaskFormValues(task) {
  return {
    title: task.title ?? "",
    priority: task.priority ?? "medium",
    status: task.status ?? "pending",
    due_date: task.due_date ? String(task.due_date).slice(0, 10) : "",
  };
}

function getDateKey(value) {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 10);
}

function getTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
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

function countOtherTasksWithDeadline(tasks, dueDate, taskIdToIgnore = null) {
  if (!dueDate) {
    return 0;
  }

  return tasks.filter((task) => {
    const matchesDeadline = String(task.due_date ?? "").slice(0, 10) === dueDate;
    const isIgnoredTask = taskIdToIgnore != null && task.id === taskIdToIgnore;

    return matchesDeadline && !isIgnoredTask;
  }).length;
}

function getTasksForDeadline(tasks, dueDate, taskIdToIgnore = null) {
  if (!dueDate) {
    return [];
  }

  return tasks.filter((task) => {
    const matchesDeadline = String(task.due_date ?? "").slice(0, 10) === dueDate;
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
  handleConfirmTaskEditSave,
  handleCancelTaskEdit,
  handleDeleteTask,
  handleSaveTaskEdit,
  handleStartTaskEdit,
  handleStatusChange,
  handleTaskEditChange,
  onStatusFilterChange,
  onTaskQueryChange,
  taskQuery,
  taskEditForm,
  tasks,
}) {
  const groupedDeadlines = allTasks.reduce((groups, task) => {
    const dueDate = String(task.due_date ?? "").slice(0, 10);

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

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-8">
        <div className="space-y-3">
          <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
            My Tasks
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
              Task workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
              Review your tasks, adjust deadlines, and keep everything clean in
              one focused place.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            onChange={(event) => onTaskQueryChange(event.target.value)}
            placeholder="Search tasks by title"
            value={taskQuery}
          />
          <select
            className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
            onChange={(event) => onStatusFilterChange(event.target.value)}
            value={activeStatusFilter}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <Card className="bg-white/75">
          <CardContent className="p-6 text-sm text-[var(--text-muted)]">
            No tasks added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card className="bg-white/80" key={task.id}>
                <CardContent className="flex flex-col gap-5 p-6">
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
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {task.title}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            Priority:{" "}
                            <span className="font-medium capitalize text-[var(--text-secondary)]">
                              {task.priority}
                            </span>
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            Deadline:{" "}
                            <span className="font-medium text-[var(--text-secondary)]">
                              {formatDueDate(task.due_date)}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-[0.08em] ${getStatusBadgeClass(task.status)}`}
                          >
                            {getTaskStatusLabel(task.status)}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-[0.08em] ${getPriorityBadgeClass(task.priority)}`}
                          >
                            {task.priority} priority
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[minmax(180px,220px)_auto_auto] sm:items-center">
                        <select
                          className="h-11 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                          onChange={(event) =>
                            handleStatusChange(task.id, event.target.value)
                          }
                          value={task.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <Button
                          className="w-full sm:w-auto"
                          onClick={() => handleStartTaskEdit(task)}
                          variant="secondary"
                        >
                          Edit
                        </Button>

                        <Button
                          className="w-full sm:w-auto"
                          onClick={() => handleDeleteTask(task.id)}
                          variant="outline"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-[var(--bg-panel-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    {(editingTaskId === task.id ? taskEditForm.due_date : task.due_date)
                      ? "This task will appear on the Calendar page on its deadline date."
                      : "Add a deadline if you want this task to appear on the Calendar page."}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {duplicateDeadlineGroups.length > 0 ? (
            <aside className="xl:sticky xl:top-6">
              <section className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-4 shadow-[var(--shadow-panel)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[var(--bg-accent-soft)] p-2 text-[var(--text-accent)]">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                        Shared deadlines
                      </h2>
                      <span className="rounded-full bg-[var(--bg-panel-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                        {duplicateDeadlineGroups.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                      More than one task is using the same day.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {duplicateDeadlineGroups.map(([dueDate, groupedTasks]) => (
                    <div
                      className="rounded-2xl bg-[var(--bg-panel-soft)] px-3 py-3"
                      key={dueDate}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-accent)]">
                        {formatDueDate(dueDate)}
                      </p>
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
                    </div>
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

function HomePage({ user, onLogout, onThemeToggle, theme }) {
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardCards, setDashboardCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScope, setSelectedScope] = useState("my");
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
  const [events, setEvents] = useState([]);
  const isMyScope = selectedScope === "my";
  const todayKey = getTodayKey();
  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(taskQuery.trim().toLowerCase())
    )
    .filter((task) =>
      taskStatusFilter === "all" ? true : task.status === taskStatusFilter
    )
    .sort(compareTasksByDeadline);
  const dueTodayTasks = tasks
    .filter((task) => {
      const dueDateKey = getDateKey(task.due_date);

      return dueDateKey === todayKey && task.status !== "completed";
    })
    .sort(compareTasksByDeadline)
    .slice(0, 5);
  const upcomingTasks = tasks
    .filter((task) => {
      const dueDateKey = getDateKey(task.due_date);

      return dueDateKey && dueDateKey > todayKey && task.status !== "completed";
    })
    .sort(compareTasksByDeadline)
    .slice(0, 3);

  async function fetchDashboardCards(scope = selectedScope) {
    const cards = await getDashboardData({
      scope,
      userId: user.id,
    });

    setDashboardCards(cards);
  }

  async function fetchOverviewData(scope = selectedScope) {
    try {
      setIsLoading(true);
      setError("");

      const [cards, savedTasks, savedEvents] = await Promise.all([
        getDashboardData({
          scope,
          userId: user.id,
        }),
        getTasks(user.id),
        getEvents(user.id),
      ]);

      setDashboardCards(cards);
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

      const newTask = await createTask({
        ...taskData,
        userId: user.id,
      });

      setTasks((currentTasks) => [...currentTasks, newTask]);
      await fetchDashboardCards();
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
      await fetchDashboardCards();
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
      await fetchDashboardCards();
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
    await fetchDashboardCards();
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
      await saveTaskEdit(taskId);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadInitialOverviewData() {
      try {
        const [cards, savedTasks, savedEvents] = await Promise.all([
          getDashboardData({
            scope: "my",
            userId: user.id,
          }),
          getTasks(user.id),
          getEvents(user.id),
        ]);

        if (isCancelled) {
          return;
        }

        setDashboardCards(cards);
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

  async function handleScopeChange(event) {
    const nextScope = event.target.value;
    setSelectedScope(nextScope);
    await fetchOverviewData(nextScope);
  }

  function handleCalendarTaskSelect(task) {
    setSelectedScope("my");
    handleStartTaskEdit(task);
  }

  function handleViewChange(nextView) {
    if (nextView === "tasks") {
      resetTaskWorkspaceState();
    }

    setActiveView(nextView);
  }

  function handleSummaryCardClick(title) {
    setSelectedScope("my");
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

  return (
    <div className="min-h-screen bg-[var(--bg-app)] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center">
          <button
            aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-[var(--shadow-panel)] transition hover:bg-[var(--bg-accent-soft)] hover:text-[var(--text-accent)]"
            onClick={() => setIsSidebarOpen((current) => !current)}
            type="button"
          >
            <PanelLeftOpen className="h-4 w-4" />
            Navigation
          </button>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          {isSidebarOpen ? (
            <Sidebar
              activeView={activeView}
              onLogout={onLogout}
              onSidebarClose={() => setIsSidebarOpen(false)}
              onThemeToggle={onThemeToggle}
              onViewChange={handleViewChange}
              theme={theme}
              user={user}
            />
          ) : null}

        <main className="flex-1 space-y-6">
          {activeView === "calendar" || activeView === "add-event" ? (
            <CalendarPage
              entryMode={activeView === "add-event" ? "create-event" : "browse"}
              error={error}
              events={events}
              onEventCreate={handleEventCreated}
              onEventDelete={handleEventDeleted}
              onEventUpdate={handleEventUpdated}
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
              handleConfirmTaskEditSave={handleConfirmTaskEditSave}
              handleCancelTaskEdit={handleCancelTaskEdit}
              handleDeleteTask={handleDeleteTask}
              handleSaveTaskEdit={handleSaveTaskEdit}
              handleStartTaskEdit={handleStartTaskEdit}
              handleStatusChange={handleStatusChange}
              handleTaskEditChange={handleTaskEditChange}
              onStatusFilterChange={setTaskStatusFilter}
              onTaskQueryChange={setTaskQuery}
              taskQuery={taskQuery}
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
              <section className="rounded-[26px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
                      {selectedScope === "my" ? "My stats" : "Global stats"}
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                        Welcome back, {user.name}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                        Keep things simple: check today&apos;s tasks, then open
                        the section you need.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      className="h-11 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                      onChange={handleScopeChange}
                      value={selectedScope}
                    >
                      <option value="my">My Stats</option>
                      <option value="global">Global Stats</option>
                    </select>
                    <Button className="gap-2" onClick={() => fetchOverviewData()}>
                      <RefreshCcw className="h-4 w-4" />
                      Refresh data
                    </Button>
                  </div>
                </div>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}

              {isMyScope ? (
                <>
                  <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <SimpleTaskList
                      emptyMessage="Nothing is due today."
                      onTaskClick={handleStartTaskEdit}
                      tasks={dueTodayTasks}
                      title="Due today"
                    />
                    <SimpleTaskList
                      emptyMessage="No upcoming deadlines."
                      onTaskClick={handleStartTaskEdit}
                      tasks={upcomingTasks}
                      title="Next"
                    />
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Go to
                      </h2>
                      <p className="text-sm text-[var(--text-muted)]">
                        Choose one section.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <ActionBox
                      description="Open your task list."
                      icon={ListTodo}
                      onClick={() => setActiveView("tasks")}
                      title="My Tasks"
                    />
                    <ActionBox
                      description="Create a task."
                      icon={Plus}
                      onClick={() => setActiveView("add-task")}
                      title="Add Task"
                    />
                      <ActionBox
                        description="Create a scheduled event."
                        icon={CalendarDays}
                        onClick={() => setActiveView("add-event")}
                        title="Add Event"
                      />
                      <ActionBox
                        description="See deadlines and scheduled events."
                        icon={CalendarDays}
                        onClick={() => setActiveView("calendar")}
                        title="Calendar"
                      />
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--text-primary)]">
                        Summary
                      </h2>
                      <p className="text-sm text-[var(--text-muted)]">
                        Press a box to open the related tasks.
                      </p>
                    </div>

                    {isLoading ? (
                      <Card className="bg-white/75">
                        <CardContent className="p-6 text-sm text-[var(--text-muted)]">
                          Loading dashboard data...
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardCards.map((card) => (
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
                </>
              ) : (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      Global Dashboard Access
                    </h2>
                    <p className="text-sm leading-6 text-[var(--text-muted)]">
                      Global Stats is a read-only overview. Task creation and
                      editing live in My Stats.
                    </p>
                  </div>

                  <Card className="bg-white/75">
                    <CardContent className="p-6 text-sm leading-6 text-[var(--text-muted)]">
                      Switch back to{" "}
                      <span className="font-medium text-[var(--text-secondary)]">
                        My Stats
                      </span>{" "}
                      to manage your own tasks.
                    </CardContent>
                  </Card>

                  <section className="space-y-3">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--text-primary)]">
                        Summary
                      </h2>
                      <p className="text-sm text-[var(--text-muted)]">
                        A quick view of activity across all users and tasks.
                      </p>
                    </div>

                    {isLoading ? (
                      <Card className="bg-white/75">
                        <CardContent className="p-6 text-sm text-[var(--text-muted)]">
                          Loading dashboard data...
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardCards.map((card) => (
                          <DashboardCard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </section>
              )}
            </>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
