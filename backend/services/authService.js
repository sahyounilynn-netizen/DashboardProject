const bcrypt = require("bcrypt");
const db = require("../config/db");

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

async function registerUser(userData) {
  const name = userData.name ? userData.name.trim() : "";
  const email = userData.email ? userData.email.trim().toLowerCase() : "";
  const password = userData.password || "";

  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const [existingUsers] = await db.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existingUsers.length > 0) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await db.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES (?, ?, ?)`,
    [name, email, passwordHash]
  );

  const [rows] = await db.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

async function loginUser(credentials) {
  const email = credentials.email ? credentials.email.trim().toLowerCase() : "";
  const password = credentials.password || "";

  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await db.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
};
