const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function getResponseError(response, fallbackMessage) {
  let errorData = null;

  try {
    errorData = await response.json();
  } catch {
    errorData = null;
  }

  throw new Error(
    errorData?.error || errorData?.message || fallbackMessage
  );
}

export async function getDashboardData({ scope, userId }) {
  const query = new URLSearchParams({
    scope,
  });

  if (scope === "my" && Number.isInteger(Number(userId)) && Number(userId) > 0) {
    query.set("userId", String(userId));
  }

  const response = await fetch(`${API_BASE_URL}/dashboard?${query.toString()}`);

  if (!response.ok) {
    await getResponseError(response, "Failed to fetch dashboard data");
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
    await getResponseError(response, "Failed to register user");
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
    await getResponseError(response, "Failed to log in");
  }

  const data = await response.json();
  return data.user;
}

export async function getTasks(userId) {
  const query = userId ? `?userId=${userId}` : "";
  const response = await fetch(`${API_BASE_URL}/tasks${query}`);

  if (!response.ok) {
    await getResponseError(response, "Failed to fetch tasks");
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
    await getResponseError(response, "Failed to create task");
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
    await getResponseError(response, "Failed to delete task");
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
    await getResponseError(response, "Failed to update task status");
  }

  const data = await response.json();
  return data.task;
}

export async function updateTask(taskId, task) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    await getResponseError(response, "Failed to update task");
  }

  const data = await response.json();
  return data.task;
}

export async function getEvents(userId) {
  const query = new URLSearchParams({
    userId: String(userId),
  });

  const response = await fetch(`${API_BASE_URL}/events?${query.toString()}`);

  if (!response.ok) {
    await getResponseError(response, "Failed to fetch events");
  }

  const data = await response.json();
  return data.events;
}

export async function createEvent(event) {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    await getResponseError(response, "Failed to create event");
  }

  const data = await response.json();
  return data.event;
}

export async function updateEvent(eventId, event) {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    await getResponseError(response, "Failed to update event");
  }

  const data = await response.json();
  return data.event;
}

export async function deleteEvent(eventId, userId) {
  const query = new URLSearchParams({
    userId: String(userId),
  });

  const response = await fetch(
    `${API_BASE_URL}/events/${eventId}?${query.toString()}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    await getResponseError(response, "Failed to delete event");
  }

  return response.json();
}
