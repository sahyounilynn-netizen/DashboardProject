const API_BASE_URL = "http://localhost:5000/api";

export async function getDashboardData({ scope, userId }) {
  const query = new URLSearchParams({
    scope,
  });

  if (scope === "my" && userId) {
    query.set("userId", String(userId));
  }

  const response = await fetch(`${API_BASE_URL}/dashboard?${query.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch dashboard data");
  }

  const data = await response.json();
  return data.cards;
}

export async function registerUser(user) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register user");
  }

  const data = await response.json();
  return data.user;
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to log in");
  }

  const data = await response.json();
  return data.user;
}

export async function getTasks(userId) {
  const query = userId ? `?userId=${userId}` : "";
  const response = await fetch(`${API_BASE_URL}/tasks${query}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch tasks");
  }

  const data = await response.json();
  return data.tasks;
}

export async function createTask(task) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create task");
  }

  const data = await response.json();
  return data.task;
}

export async function deleteTask(taskId, userId) {
  const query = userId ? `?userId=${userId}` : "";
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}${query}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete task");
  }

  const data = await response.json();
  return data;
}

export async function updateTaskStatus(taskId, status, userId) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update task status");
  }

  const data = await response.json();
  return data.task;
}
