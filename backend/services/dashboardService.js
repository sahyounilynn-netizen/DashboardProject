const db = require("../config/db");

function toCard(title, value) {
  return {
    title,
    value: String(value),
  };
}

async function getMyDashboardCards(userId) {
  const [rows] = await db.query(
    `SELECT
       COUNT(*) AS totalTasks,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedTasks,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingTasks,
       SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS inProgressTasks
     FROM tasks
     WHERE user_id = ? AND is_deleted = FALSE`,
    [userId]
  );

  const metrics = rows[0];

  return [
    toCard("My Total Tasks", metrics.totalTasks ?? 0),
    toCard("Completed Tasks", metrics.completedTasks ?? 0),
    toCard("Pending Tasks", metrics.pendingTasks ?? 0),
    toCard("In Progress Tasks", metrics.inProgressTasks ?? 0),
  ];
}

async function getGlobalDashboardCards() {
  const [[userMetrics], [taskMetrics]] = await Promise.all([
    db.query("SELECT COUNT(*) AS totalUsers FROM users"),
    db.query(
      `SELECT
         COUNT(*) AS totalTasks,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedTasks,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingTasks
       FROM tasks
       WHERE is_deleted = FALSE`
    ),
  ]);

  const users = userMetrics[0];
  const tasks = taskMetrics[0];

  return [
    toCard("Total Users", users.totalUsers ?? 0),
    toCard("Total Tasks", tasks.totalTasks ?? 0),
    toCard("Completed Tasks", tasks.completedTasks ?? 0),
    toCard("Pending Tasks", tasks.pendingTasks ?? 0),
  ];
}

async function getDashboardCards({ scope, userId }) {
  if (scope === "global") {
    return getGlobalDashboardCards();
  }

  return getMyDashboardCards(userId);
}

module.exports = {
  getDashboardCards,
};
