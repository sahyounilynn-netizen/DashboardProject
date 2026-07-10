const express = require("express");
const { loginUser, registerUser } = require("../services/authService");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to register user",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await loginUser(req.body);

    res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to log in",
    });
  }
});

module.exports = router;
