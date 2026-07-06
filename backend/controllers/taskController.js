const {
  createTask,
  getTasks,
  deleteTask,
  updateTaskStatus,
} = require("../services/taskService");

function addTask(req, res) {
  const newTask = createTask(req.body);

  res.status(201).json({
    message: "Task created successfully",
    task: newTask,
  });
}

function listTasks(req, res) {
  const tasks = getTasks();

  res.json({
    tasks: tasks,
  });
}
function removeTask(req, res) {
  const taskId = Number(req.params.id);

  const deletedTask = deleteTask(taskId);

  if (!deletedTask) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  res.json({
    message: "Task deleted successfully",
    task: deletedTask,
  });
}
function changeTaskStatus(req, res) {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  const updatedTask = updateTaskStatus(taskId, status);

  if (!updatedTask) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  res.json({
    message: "Task status updated successfully",
    task: updatedTask,
  });
}

module.exports = {
  addTask,
  listTasks,
  removeTask,
  changeTaskStatus,
};