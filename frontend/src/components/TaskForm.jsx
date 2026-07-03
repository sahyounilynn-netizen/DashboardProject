import { useState } from "react";

function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");

  function handleSubmit(event) {
    event.preventDefault();

    const taskData = {
      title: title,
      priority: priority,
      status: status,
    };

    onTaskCreated(taskData);

    setTitle("");
    setPriority("Medium");
    setStatus("Pending");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Task</h2>

      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskForm;