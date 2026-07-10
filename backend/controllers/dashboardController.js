const { getDashboardCards } = require("../services/dashboardService");

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

async function getDashboardData(req, res) {
  try {
    const scope = req.query.scope === "global" ? "global" : "my";
    const userId = parseUserId(req.query.userId);

    if (scope === "my" && userId == null) {
      return res.status(400).json({
        message: "userId is required when scope is 'my'.",
      });
    }

    const cards = await getDashboardCards({
      scope,
      userId,
    });

    res.json({
      cards,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard cards",
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardData,
};
