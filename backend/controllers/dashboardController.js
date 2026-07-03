const { getDashboardCards } = require("../services/dashboardService");

function getDashboardData(req, res) {
  const cards = getDashboardCards(req.range);

  res.json({
    cards: cards,
  });
}

module.exports = {
  getDashboardData,
};