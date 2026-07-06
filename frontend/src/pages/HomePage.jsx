import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import TaskForm from "../components/TaskForm";
import {
  getDashboardData,
  getTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
} from "../services/api";

function HomePage() {
  const [dashboardCards, setDashboardCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState("today");
  const [tasks, setTasks] = useState([]);

  async function fetchDashboardData() {
    try {
      setIsLoading(true);
      setError("");

      const cards = await getDashboardData(selectedRange);
      setDashboardCards(cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function testInvalidRange() {
    try {
      setIsLoading(true);
      setError("");

      const cards = await getDashboardData("random");
      setDashboardCards(cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTaskCreated(taskData) {
    try {
      setError("");

      const newTask = await createTask(taskData);

      setTasks((currentTasks) => [...currentTasks, newTask]);
    } catch (err) {
      setError(err.message);
    }
  }
async function handleDeleteTask(taskId) {
  try {
    setError("");

    await deleteTask(taskId);

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
  } catch (err) {
    setError(err.message);
  }
}
async function handleStatusChange(taskId, newStatus) {
  try {
    setError("");

    const updatedTask = await updateTaskStatus(taskId, newStatus);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? updatedTask : task
      )
    );
  } catch (err) {
    setError(err.message);
  }
}
  useEffect(() => {
    async function loadInitialData() {
      try {
        const cards = await getDashboardData("today");
        const savedTasks = await getTasks();

        setDashboardCards(cards);
        setTasks(savedTasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <h1>Dashboard Project</h1>
        <p>Welcome to our full-stack React dashboard.</p>

        <button onClick={fetchDashboardData}>Refresh Data</button>
        <button onClick={testInvalidRange}>Test Invalid Range</button>

        <select
          value={selectedRange}
          onChange={(event) => setSelectedRange(event.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <section>
          <h2>Overview</h2>

          {isLoading && <p>Loading dashboard data...</p>}

          {error && <p>{error}</p>}

          {!isLoading && !error && (
            <div className="cards-grid">
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

        <TaskForm onTaskCreated={handleTaskCreated} />

        <section>
          <h2>Tasks</h2>

          {tasks.length === 0 && <p>No tasks added yet.</p>}

      {tasks.map((task) => (
  <div key={task.id}>
    <h3>{task.title}</h3>
    <p>Priority: {task.priority}</p>

    <label>Status: </label>
    <select
      value={task.status}
      onChange={(event) =>
        handleStatusChange(task.id, event.target.value)
      }
    >
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>

    <button onClick={() => handleDeleteTask(task.id)}>
      Delete
    </button>
  </div>
))}
        </section>
      </main>
    </div>
  );
}

export default HomePage;