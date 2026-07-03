const { createTask, getTasks } = require("../services/taskService");

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

module.exports = {
  addTask,
  listTasks,
};