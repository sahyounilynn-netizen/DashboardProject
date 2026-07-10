const db = require("../config/db");

const ALLOWED_EVENT_COLORS = new Set([
  "blue",
  "sky",
  "indigo",
  "green",
  "amber",
  "rose",
]);

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

function normalizeDateTime(value, fieldName) {
  const text = normalizeRequiredText(value, fieldName);
  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${fieldName} must be a valid date/time.`);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1" || value === 1) {
    return true;
  }

  if (value === "false" || value === "0" || value === 0 || value == null) {
    return false;
  }

  return Boolean(value);
}

function normalizeReminderMinutes(value) {
  if (value == null || value === "") {
    return null;
  }

  const minutes = Number(value);

  if (!Number.isInteger(minutes) || minutes < 0) {
    const error = new Error("reminder_minutes must be a non-negative integer.");
    error.statusCode = 400;
    throw error;
  }

  return minutes;
}

function normalizeTaskId(value) {
  if (value == null || value === "") {
    return null;
  }

  const taskId = Number(value);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    const error = new Error("taskId must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  return taskId;
}

function normalizeEventColor(value) {
  const color = normalizeOptionalText(value) || "blue";

  if (!ALLOWED_EVENT_COLORS.has(color)) {
    const error = new Error(
      `color must be one of: ${Array.from(ALLOWED_EVENT_COLORS).join(", ")}.`
    );
    error.statusCode = 400;
    throw error;
  }

  return color;
}

async function validateTaskOwnership(taskId, userId) {
  if (taskId == null) {
    return;
  }

  const [rows] = await db.query(
    `SELECT id
     FROM tasks
     WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
    [taskId, userId]
  );

  if (rows.length === 0) {
    const error = new Error("Selected task was not found for this user.");
    error.statusCode = 400;
    throw error;
  }
}

function validateEventWindow(startAt, endAt) {
  if (new Date(endAt).getTime() < new Date(startAt).getTime()) {
    const error = new Error("end_at must be the same as or later than start_at.");
    error.statusCode = 400;
    throw error;
  }
}

async function validateEventConflict({
  endAt,
  eventId = null,
  startAt,
  userId,
}) {
  const query = `
    SELECT id, title, start_at, end_at
    FROM events
    WHERE user_id = ?
      AND is_deleted = FALSE
      AND start_at <= ?
      AND end_at >= ?
      ${eventId ? "AND id <> ?" : ""}
    LIMIT 1
  `;

  const params = eventId
    ? [userId, endAt, startAt, eventId]
    : [userId, endAt, startAt];

  const [rows] = await db.query(query, params);

  if (rows.length === 0) {
    return;
  }

  const conflictingEvent = rows[0];
  const error = new Error(
    `This event conflicts with "${conflictingEvent.title}". Choose another time.`
  );
  error.statusCode = 409;
  throw error;
}

function mapEventInput(eventData, userId) {
  const title = normalizeRequiredText(eventData.title, "title");
  const description = normalizeOptionalText(eventData.description);
  const startAt = normalizeDateTime(eventData.start_at, "start_at");
  const endAt = normalizeDateTime(eventData.end_at, "end_at");
  const color = normalizeEventColor(eventData.color);
  const isAllDay = normalizeBoolean(eventData.is_all_day);
  const recurrenceRule = normalizeOptionalText(eventData.recurrence_rule);
  const reminderMinutes = normalizeReminderMinutes(eventData.reminder_minutes);
  const taskId = normalizeTaskId(eventData.taskId ?? eventData.task_id);

  validateEventWindow(startAt, endAt);

  return {
    userId,
    taskId,
    title,
    description,
    startAt,
    endAt,
    color,
    isAllDay,
    recurrenceRule,
    reminderMinutes,
  };
}

async function getAllEvents(userId) {
  const [rows] = await db.query(
    `SELECT *
     FROM events
     WHERE user_id = ?
       AND is_deleted = FALSE
     ORDER BY start_at ASC, id ASC`,
    [userId]
  );

  return rows;
}

async function createEvent(eventData, userId) {
  const event = mapEventInput(eventData, userId);
  await validateTaskOwnership(event.taskId, userId);
  await validateEventConflict({
    endAt: event.endAt,
    startAt: event.startAt,
    userId,
  });

  const [result] = await db.query(
    `INSERT INTO events (
       user_id, task_id, title, description, start_at, end_at,
       color, is_all_day, recurrence_rule, reminder_minutes
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.userId,
      event.taskId,
      event.title,
      event.description,
      event.startAt,
      event.endAt,
      event.color,
      event.isAllDay,
      event.recurrenceRule,
      event.reminderMinutes,
    ]
  );

  const [rows] = await db.query(
    "SELECT * FROM events WHERE id = ? AND is_deleted = FALSE",
    [result.insertId]
  );

  return rows[0];
}

async function updateEvent(eventId, eventData, userId) {
  const event = mapEventInput(eventData, userId);
  await validateTaskOwnership(event.taskId, userId);
  await validateEventConflict({
    endAt: event.endAt,
    eventId,
    startAt: event.startAt,
    userId,
  });

  const [result] = await db.query(
    `UPDATE events
     SET task_id = ?,
         title = ?,
         description = ?,
         start_at = ?,
         end_at = ?,
         color = ?,
         is_all_day = ?,
         recurrence_rule = ?,
         reminder_minutes = ?
     WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
    [
      event.taskId,
      event.title,
      event.description,
      event.startAt,
      event.endAt,
      event.color,
      event.isAllDay,
      event.recurrenceRule,
      event.reminderMinutes,
      eventId,
      userId,
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query(
    "SELECT * FROM events WHERE id = ? AND is_deleted = FALSE",
    [eventId]
  );
  return rows[0];
}

async function deleteEvent(eventId, userId) {
  const [result] = await db.query(
    `UPDATE events
     SET is_deleted = TRUE
     WHERE id = ? AND user_id = ? AND is_deleted = FALSE`,
    [eventId, userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
