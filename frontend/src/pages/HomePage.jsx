import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import TaskForm from "../components/TaskForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  getDashboardData,
  getTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
} from "../services/api";

function HomePage({ user, onLogout, onThemeToggle, theme }) {
  const [dashboardCards, setDashboardCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScope, setSelectedScope] = useState("my");
  const [tasks, setTasks] = useState([]);
  const isMyScope = selectedScope === "my";

  async function fetchDashboardCards(scope = selectedScope) {
    const cards = await getDashboardData({
      scope,
      userId: user.id,
    });

    setDashboardCards(cards);
  }

  async function fetchDashboardData(scope = selectedScope) {
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

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [cards, savedTasks] = await Promise.all([
          getDashboardData({
            scope: "my",
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

    loadInitialData();
  }, [user.id]);

  async function handleScopeChange(event) {
    const nextScope = event.target.value;
    setSelectedScope(nextScope);
    await fetchDashboardData(nextScope);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <Sidebar
          onLogout={onLogout}
          onThemeToggle={onThemeToggle}
          theme={theme}
          user={user}
        />

        <main className="flex-1 space-y-6">
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
                    {isMyScope
                      ? "Here is your calm workspace for tracking your own tasks and reviewing your progress."
                      : "Here is the overall dashboard view for all users and tasks in the system."}
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
                <Button className="gap-2" onClick={fetchDashboardData}>
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
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Overview</h2>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                {isMyScope
                  ? "A quick view of your current task progress."
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
            <>
              <TaskForm onTaskCreated={handleTaskCreated} />

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">My Tasks</h2>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    Update status or remove tasks that are no longer active.
                  </p>
                </div>

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
                        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                              {task.title}
                            </h3>
                            <p className="text-sm text-[var(--text-muted)]">
                              Priority:{" "}
                              <span className="font-medium capitalize text-[var(--text-secondary)]">
                                {task.priority}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                              onClick={() => handleDeleteTask(task.id)}
                              variant="outline"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
                  Global Stats is a read-only overview. Task creation, status
                  changes, and deletion are only available in My Stats.
                </p>
              </div>

              <Card className="bg-white/75">
                <CardContent className="p-6 text-sm leading-6 text-[var(--text-muted)]">
                  Switch back to <span className="font-medium text-[var(--text-secondary)]">My Stats</span> to manage your own tasks.
                </CardContent>
              </Card>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
