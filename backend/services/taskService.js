const db = require("../config/db");

const ALLOWED_TASK_STATUSES = new Set(["pending", "in-progress", "completed"]);
const ALLOWED_TASK_PRIORITIES = new Set(["low", "medium", "high"]);
const TASK_SELECT_FIELDS = `
  SELECT id,
         title,
         description,
         status,
         priority,
         DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
         user_id,
         is_deleted,
         created_at
  FROM tasks
`;

function normalizeOptionalText(value) {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text === "" ? null : text;
}

function normalizeRequiredText(value, fieldName) {
  const text = normalizeOptionalText(value);

  if (!text) {
    const error = new Error(`${fieldName} is required.`);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function normalizeTaskStatus(value) {
  const status = normalizeOptionalText(value) || "pending";

  if (!ALLOWED_TASK_STATUSES.has(status)) {
    const error = new Error(
      `status must be one of: ${Array.from(ALLOWED_TASK_STATUSES).join(", ")}.`
    );
    error.statusCode = 400;
    throw error;
  }

  return status;
}

function normalizeTaskPriority(value) {
  const priority = normalizeOptionalText(value) || "medium";

  if (!ALLOWED_TASK_PRIORITIES.has(priority)) {
    const error = new Error(
      `priority must be one of: ${Array.from(ALLOWED_TASK_PRIORITIES).join(", ")}.`
    );
    error.statusCode = 400;
    throw error;
  }

  return priority;
}

function normalizeDueDate(value) {
  if (value == null || value === "") {
    return null;
  }

  const text = String(value).trim();
  const directDateMatch = text.match(/^(\d{4}-\d{2}-\d{2})$/);

  if (directDateMatch) {
    return directDateMatch[1];
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    const error = new Error("due_date must be a valid date.");
    error.statusCode = 400;
    throw error;
  }

  return date.toISOString().slice(0, 10);
}

function normalizeTaskInput(task) {
  return {
    title: normalizeRequiredText(task.title, "title"),
    description: normalizeOptionalText(task.description),
    status: normalizeTaskStatus(task.status),
    priority: normalizeTaskPriority(task.priority),
    dueDate: normalizeDueDate(task.due_date),
    userId: Number(task.userId),
    allowSharedDeadline: task.allowSharedDeadline === true,
  };
}

async function getTaskById(taskId, userId) {
  const [rows] = await db.query(
    `${TASK_SELECT_FIELDS}
     WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
    [taskId, userId]
  );

  return rows[0] ?? null;
}

async function getTaskByIdAnyState(taskId) {
  const [rows] = await db.query(
    `${TASK_SELECT_FIELDS}
     WHERE id = ?`,
    [taskId]
  );

  return rows[0] ?? null;
}

async function validateSharedDeadline({
  allowSharedDeadline,
  dueDate,
  taskId = null,
  userId,
}) {
  if (!dueDate || allowSharedDeadline) {
    return;
  }

  const [rows] = await db.query(
    `SELECT id, title
     FROM tasks
     WHERE user_id = ?
       AND due_date = ?
       AND is_deleted = FALSE
       ${taskId ? "AND id <> ?" : ""}
     ORDER BY created_at ASC`,
    taskId ? [userId, dueDate, taskId] : [userId, dueDate]
  );

  if (rows.length === 0) {
    return;
  }

  const error = new Error(
    `Another task already uses this deadline: ${rows
      .map((task) => task.title)
      .join(", ")}.`
  );
  error.statusCode = 409;
  error.code = "DUPLICATE_TASK_DEADLINE";
  throw error;
}

async function getAllTasks(userId) {
  const [rows] = await db.query(
    `${TASK_SELECT_FIELDS}
     WHERE is_deleted = FALSE AND user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
}

async function createTask(task) {
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    userId,
    allowSharedDeadline,
  } =
    normalizeTaskInput(task);

  await validateSharedDeadline({
    allowSharedDeadline,
    dueDate,
    userId,
  });

  const [result] = await db.query(
    `INSERT INTO tasks (title, description, status, priority, due_date, user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || "",
      status,
      priority,
      dueDate,
      userId,
    ]
  );

  return getTaskByIdAnyState(result.insertId);
}

async function deleteTask(taskId, userId) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let result;

    [result] = await connection.query(
      `UPDATE tasks
       SET is_deleted = TRUE
       WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
      [taskId, userId]
    );

    if (result.affectedRows > 0) {
      await connection.query(
        `UPDATE events
         SET is_deleted = TRUE
         WHERE task_id = ? AND user_id = ?`,
        [taskId, userId]
      );
    }

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateTaskStatus(taskId, status, userId) {
  const normalizedStatus = normalizeTaskStatus(status);
  const [result] = await db.query(
    `UPDATE tasks
     SET status = ?
     WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
    [normalizedStatus, taskId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getTaskByIdAnyState(taskId);
}

async function updateTask(taskId, taskData, userId) {
  const existingTask = await getTaskById(taskId, userId);

  if (!existingTask) {
    return null;
  }

  const { title, description, status, priority, dueDate } = normalizeTaskInput({
    ...existingTask,
    ...taskData,
    description:
      Object.prototype.hasOwnProperty.call(taskData, "description")
        ? taskData.description
        : existingTask.description,
    userId,
  });

  await validateSharedDeadline({
    allowSharedDeadline: taskData.allowSharedDeadline === true,
    dueDate,
    taskId,
    userId,
  });

  const [result] = await db.query(
    `UPDATE tasks
     SET title = ?,
         description = ?,
         status = ?,
         priority = ?,
         due_date = ?
     WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
    [
      title,
      description || "",
      status,
      priority,
      dueDate,
      taskId,
      userId,
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getTaskByIdAnyState(taskId);
}

module.exports = {
  getAllTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
  updateTask,
};
