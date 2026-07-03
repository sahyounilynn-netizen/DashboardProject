const express = require("express");
const { getDashboardData } = require("../controllers/dashboardController");
const validateDashboardRange = require("../middleware/validateDashboardRange");

const router = express.Router();

router.get("/", validateDashboardRange, getDashboardData);

module.exports = router;