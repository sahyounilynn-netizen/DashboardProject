const express = require("express");
const { addTask, listTasks, removeTask } = require("../controllers/taskController");
const validateTask = require("../middleware/validateTask");

const router = express.Router();

router.get("/", listTasks);
router.post("/", validateTask, addTask);
router.delete("/:id", removeTask);

module.exports = router;