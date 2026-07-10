import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function normalizeDeadlineValue(value) {
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

function TaskForm({ existingTasks = [], onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");
  const [deadlineWarning, setDeadlineWarning] = useState("");
  const [isDeadlineConfirmed, setIsDeadlineConfirmed] = useState(false);
  const [pendingTaskData, setPendingTaskData] = useState(null);

  function getTasksForDeadline(dateValue) {
    if (!dateValue) {
      return [];
    }

    return existingTasks.filter(
      (task) => normalizeDeadlineValue(task.due_date) === dateValue
    );
  }

  const tasksOnSameDeadline = getTasksForDeadline(dueDate);

  function buildTaskData() {
    return {
      title,
      priority,
      status,
      due_date: dueDate || null,
    };
  }

  function resetForm() {
    setTitle("");
    setPriority("medium");
    setStatus("pending");
    setDueDate("");
    setFormError("");
    setDeadlineWarning("");
    setIsDeadlineConfirmed(false);
    setPendingTaskData(null);
  }

  async function saveTask(taskData) {
    const wasCreated = await onTaskCreated(taskData);

    if (wasCreated !== false) {
      resetForm();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "") {
      setFormError("Task title is required.");
      setDeadlineWarning("");
      return;
    }

    if (tasksOnSameDeadline.length > 0 && !isDeadlineConfirmed) {
      const taskData = buildTaskData();

      setFormError("");
      setDeadlineWarning(
        `There ${tasksOnSameDeadline.length === 1 ? "is" : "are"} already ${
          tasksOnSameDeadline.length
        } task${tasksOnSameDeadline.length === 1 ? "" : "s"} with this deadline. Do you still want to add this task?`
      );
      setPendingTaskData(taskData);
      return;
    }

    setFormError("");
    setDeadlineWarning("");
    await saveTask(buildTaskData());
  }

  async function handleProceedAnyway() {
    setFormError("");
    setDeadlineWarning("");
    setIsDeadlineConfirmed(true);
    await saveTask(pendingTaskData ?? buildTaskData());
  }

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Add a task</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {formError && (
            <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {formError}
            </div>
          )}

          {(deadlineWarning || tasksOnSameDeadline.length > 0) && (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <p>
                {deadlineWarning ||
                  `There ${tasksOnSameDeadline.length === 1 ? "is" : "are"} already ${
                    tasksOnSameDeadline.length
                  } task${tasksOnSameDeadline.length === 1 ? "" : "s"} with this deadline.`}
              </p>
              {tasksOnSameDeadline.length > 0 ? (
                <div className="rounded-xl bg-white/60 px-3 py-3 text-xs text-amber-900 dark:bg-black/10 dark:text-amber-100">
                  Existing tasks:
                  {tasksOnSameDeadline.map((task) => (
                    <div key={task.id}>{task.title}</div>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleProceedAnyway} type="button">
                  Add anyway
                </Button>
                <Button
                  onClick={() => {
                    setDeadlineWarning("");
                    setIsDeadlineConfirmed(false);
                    setPendingTaskData(null);
                  }}
                  type="button"
                  variant="secondary"
                >
                  Choose another day
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="task-title">Task title</Label>
            <Input
              id="task-title"
              onChange={(event) => {
                setTitle(event.target.value);
                setFormError("");
              }}
              placeholder="Write a short task title"
              type="text"
              value={title}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                className="flex h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                id="task-priority"
                onChange={(event) => setPriority(event.target.value)}
                value={priority}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-date">Deadline</Label>
              <Input
                id="task-due-date"
                onChange={(event) => {
                  const nextDueDate = event.target.value;
                  const matchingTasks = getTasksForDeadline(nextDueDate);

                  setDueDate(nextDueDate);
                  setDeadlineWarning(
                    matchingTasks.length > 0
                      ? `There ${matchingTasks.length === 1 ? "is" : "are"} already ${
                          matchingTasks.length
                        } task${matchingTasks.length === 1 ? "" : "s"} with this deadline.`
                      : ""
                  );
                  setIsDeadlineConfirmed(false);
                  setPendingTaskData(null);
                }}
                type="date"
                value={dueDate}
              />
              {tasksOnSameDeadline.length > 0 ? (
                <p className="text-sm font-medium text-amber-700 dark:text-amber-200">
                  {tasksOnSameDeadline.length} existing task
                  {tasksOnSameDeadline.length === 1 ? "" : "s"} already use this
                  deadline.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                className="flex h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                id="task-status"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <Button className="w-full sm:w-auto" type="submit">
            Add task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default TaskForm;
