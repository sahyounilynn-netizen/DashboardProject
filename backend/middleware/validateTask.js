function validateTask(req, res, next) {
  const { title, priority, status } = req.body;

  const allowedPriorities = ["Low", "Medium", "High"];
  const allowedStatuses = ["Pending", "In Progress", "Completed"];

  if (!title || title.trim() === "") {
    return res.status(400).json({
      message: "Task title is required.",
    });
  }

  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Priority must be Low, Medium, or High.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be Pending, In Progress, or Completed.",
    });
  }

  next();
}

module.exports = validateTask;