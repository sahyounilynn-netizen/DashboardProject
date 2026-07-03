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

module.exports = {
  createTask,
  getTasks,
};