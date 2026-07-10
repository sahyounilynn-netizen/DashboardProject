import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "") {
      setFormError("Task title is required.");
      return;
    }

    setFormError("");

    const taskData = {
      title,
      priority,
      status,
      due_date: dueDate || null,
    };

    onTaskCreated(taskData);

    setTitle("");
    setPriority("medium");
    setStatus("pending");
    setDueDate("");
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
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                value={dueDate}
              />
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
