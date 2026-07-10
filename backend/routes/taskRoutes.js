const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
} = require("../services/taskService");

function parseUserId(value) {
  if (value == null || value === "") {
    return null;
  }

  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("userId must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  return userId;
}

router.get("/", async (req, res) => {
  try {
    const userId = parseUserId(req.query.userId);
    const tasks = await getAllTasks(userId);

    res.json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = parseUserId(req.body.userId);
    const newTask = await createTask({
      ...req.body,
      userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = parseUserId(req.query.userId);

    const wasDeleted = await deleteTask(taskId, userId);

    if (!wasDeleted) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task soft deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = parseUserId(req.body.userId);

    const updatedTask = await updateTaskStatus(taskId, status, userId);

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to update task status",
      error: error.message,
    });
  }
});

module.exports = router;
