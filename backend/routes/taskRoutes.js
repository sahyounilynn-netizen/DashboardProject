const express = require("express");
const {
  addTask,
  listTasks,
  removeTask,
  changeTaskStatus,
} = require("../controllers/taskController");
const validateTask = require("../middleware/validateTask");

const router = express.Router();

router.get("/", listTasks);
router.post("/", validateTask, addTask);
router.delete("/:id", removeTask);
router.patch("/:id/status", changeTaskStatus);
module.exports = router;