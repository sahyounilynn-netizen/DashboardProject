let tasks = [];

function createTask(taskData) {
  const newTask = {
    id: Date.now(),
    title: taskData.title,
    priority: taskData.priority,
    status: taskData.status,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  return newTask;
}

function getTasks() {
  return tasks;
}
function deleteTask(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  const deletedTask = tasks.splice(taskIndex, 1);

  return deletedTask[0];
}
function updateTaskStatus(taskId, newStatus) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return null;
  }

  task.status = newStatus;

  return task;
}

module.exports = {
  createTask,
  getTasks,
  deleteTask,
  updateTaskStatus,
};