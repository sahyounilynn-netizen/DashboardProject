USE dashboard_project_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Run the statements below only if your existing tasks table
-- does not already contain user_id and the foreign key.

ALTER TABLE tasks
ADD COLUMN user_id INT NULL;

ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;
