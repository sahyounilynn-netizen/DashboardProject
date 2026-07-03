function validateDashboardRange(req, res, next) {
  const allowedRanges = ["today", "week", "month"];
  const range = req.query.range || "today";

  if (!allowedRanges.includes(range)) {
    return res.status(400).json({
      message: "Invalid range. Allowed values are: today, week, month.",
    });
  }

  req.range = range;
  next();
}

module.exports = validateDashboardRange;