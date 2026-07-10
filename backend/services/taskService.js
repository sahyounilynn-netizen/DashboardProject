const db = require("../config/db");

async function getAllTasks(userId) {
  if (userId != null) {
    const [rows] = await db.query(
      `SELECT *
       FROM tasks
       WHERE is_deleted = FALSE AND user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows;
  }

  const [rows] = await db.query(
    "SELECT * FROM tasks WHERE is_deleted = FALSE ORDER BY created_at DESC"
  );

  return rows;
}

async function createTask(task) {
  const { title, description, status, priority, due_date, userId } = task;

  const [result] = await db.query(
    `INSERT INTO tasks (title, description, status, priority, due_date, user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || "",
      status || "pending",
      priority || "medium",
      due_date || null,
      userId ?? null,
    ]
  );

  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [
    result.insertId,
  ]);

  return rows[0];
}

async function deleteTask(taskId, userId) {
  let result;

  if (userId != null) {
    [result] = await db.query(
      `UPDATE tasks
       SET is_deleted = TRUE
       WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
      [taskId, userId]
    );
  } else {
    [result] = await db.query(
      `UPDATE tasks
       SET is_deleted = TRUE
       WHERE id = ? AND is_deleted = FALSE`,
      [taskId]
    );
  }

  return result.affectedRows > 0;
}

async function updateTaskStatus(taskId, status, userId) {
  let result;

  if (userId != null) {
    [result] = await db.query(
      `UPDATE tasks
       SET status = ?
       WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
      [status, taskId, userId]
    );
  } else {
    [result] = await db.query(
      `UPDATE tasks
       SET status = ?
       WHERE id = ? AND is_deleted = FALSE`,
      [status, taskId]
    );
  }

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);

  return rows[0];
}

async function updateTask(taskId, taskData, userId) {
  const { title, description, status, priority, due_date } = taskData;

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
      status || "pending",
      priority || "medium",
      due_date || null,
      taskId,
      userId,
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
  return rows[0];
}

module.exports = {
  getAllTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
  updateTask,
};
