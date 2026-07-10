import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  ListTodo,
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
  createTask,
  deleteTask,
  getDashboardData,
  getTasks,
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

function ActionBox({ description, icon: Icon, onClick, title }) {
  return (
    <button
      className="group flex w-full flex-col justify-between rounded-[28px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 text-left shadow-[var(--shadow-panel)] transition hover:-translate-y-1 hover:bg-[var(--bg-accent-soft)]"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-[var(--bg-panel-soft)] p-3 text-[var(--text-accent)] transition group-hover:bg-white/70">
          <Icon className="h-6 w-6" />
        </div>
        <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-[var(--text-accent)]" />
      </div>

      <div className="mt-8 space-y-2">
        <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      </div>
    </button>
  );
}

function TasksPage({
  editingTaskId,
  error,
  handleCancelTaskEdit,
  handleDeleteTask,
  handleSaveTaskEdit,
  handleStartTaskEdit,
  handleStatusChange,
  handleTaskEditChange,
  taskEditForm,
  tasks,
}) {
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
                        <span className="rounded-full bg-[var(--bg-panel-soft)] px-3 py-1 text-xs font-semibold capitalize tracking-[0.08em] text-[var(--text-muted)]">
                          {task.status.replace("-", " ")}
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
      )}
    </div>
  );
}

function AddTaskPage({ error, onTaskCreated }) {
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
        <TaskForm onTaskCreated={onTaskCreated} />

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
  const isMyScope = selectedScope === "my";

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

      const [cards, savedTasks] = await Promise.all([
        getDashboardData({
          scope,
          userId: user.id,
        }),
        getTasks(user.id),
      ]);

      setDashboardCards(cards);
      setTasks(savedTasks);
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
      setActiveView("tasks");
      await fetchDashboardCards();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      setError("");

      await deleteTask(taskId, user.id);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
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
    setError("");
  }

  function handleCancelTaskEdit() {
    setEditingTaskId(null);
    setTaskEditForm({
      title: "",
      priority: "medium",
      status: "pending",
      due_date: "",
    });
  }

  function handleTaskEditChange(field, value) {
    setTaskEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveTaskEdit(taskId) {
    if (taskEditForm.title.trim() === "") {
      setError("Task title is required.");
      return;
    }

    try {
      setError("");

      const updatedTask = await updateTask(taskId, {
        ...taskEditForm,
        userId: user.id,
        due_date: taskEditForm.due_date || null,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setEditingTaskId(null);
      await fetchDashboardCards();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadInitialOverviewData() {
      try {
        const [cards, savedTasks] = await Promise.all([
          getDashboardData({
            scope: "my",
            userId: user.id,
          }),
          getTasks(user.id),
        ]);

        if (isCancelled) {
          return;
        }

        setDashboardCards(cards);
        setTasks(savedTasks);
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

  return (
    <div className="min-h-screen bg-[var(--bg-app)] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <Sidebar
          activeView={activeView}
          onLogout={onLogout}
          onThemeToggle={onThemeToggle}
          onViewChange={setActiveView}
          theme={theme}
          user={user}
        />

        <main className="flex-1 space-y-6">
          {activeView === "calendar" ? (
            <CalendarPage
              onTaskSelect={handleCalendarTaskSelect}
              tasks={tasks}
              user={user}
            />
          ) : activeView === "tasks" ? (
            <TasksPage
              editingTaskId={editingTaskId}
              error={error}
              handleCancelTaskEdit={handleCancelTaskEdit}
              handleDeleteTask={handleDeleteTask}
              handleSaveTaskEdit={handleSaveTaskEdit}
              handleStartTaskEdit={handleStartTaskEdit}
              handleStatusChange={handleStatusChange}
              handleTaskEditChange={handleTaskEditChange}
              taskEditForm={taskEditForm}
              tasks={tasks}
            />
          ) : activeView === "add-task" ? (
            <AddTaskPage error={error} onTaskCreated={handleTaskCreated} />
          ) : (
            <>
              <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
                      {selectedScope === "my" ? "My stats" : "Global stats"}
                    </div>
                    <div>
                      <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
                        Welcome back, {user.name}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                        Open the area you need instead of managing everything in
                        one long screen.
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
                    <Button className="gap-2" onClick={fetchOverviewData}>
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

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    Overview
                  </h2>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {isMyScope
                      ? "A quick view of your progress, plus clear doors into task management."
                      : "A quick view of activity across all users and tasks."}
                  </p>
                </div>

                {isLoading ? (
                  <Card className="bg-white/75">
                    <CardContent className="p-6 text-sm text-[var(--text-muted)]">
                      Loading dashboard data...
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-wrap gap-4">
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

              {isMyScope ? (
                <section className="grid gap-6 lg:grid-cols-2">
                  <ActionBox
                    description="Open your task list, edit deadlines, update status, and clean up active work."
                    icon={ListTodo}
                    onClick={() => setActiveView("tasks")}
                    title="My Tasks"
                  />
                  <ActionBox
                    description="Create a new task in a dedicated screen with a proper deadline-first flow."
                    icon={Plus}
                    onClick={() => setActiveView("add-task")}
                    title="Add Task"
                  />
                  <ActionBox
                    description="See your tasks on a calendar by due date and edit them from there."
                    icon={CalendarDays}
                    onClick={() => setActiveView("calendar")}
                    title="Calendar"
                  />
                  <Card className="bg-white/80">
                    <CardContent className="flex h-full flex-col justify-between p-6">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                          Workflow
                        </p>
                        <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
                          Keep it simple
                        </h3>
                        <p className="text-sm leading-6 text-[var(--text-muted)]">
                          Add tasks with deadlines, review them in your task
                          page, and use Calendar only to see what is due on each
                          date.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
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
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
