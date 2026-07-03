const express = require("express");
const { addTask, listTasks } = require("../controllers/taskController");
const validateTask = require("../middleware/validateTask");

const router = express.Router();

router.get("/", listTasks);
router.post("/", validateTask, addTask);

module.exports = router;