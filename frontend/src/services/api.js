const API_BASE_URL = "http://localhost:5000/api";

export async function getDashboardData(range) {
  const response = await fetch(`${API_BASE_URL}/dashboard?range=${range}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch dashboard data");
  }

  const data = await response.json();
  return data.cards;
}
export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch tasks");
  }

  const data = await response.json();
  return data.tasks;
}

export async function createTask(taskData) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create task");
  }

  const data = await response.json();
  return data.task;
}