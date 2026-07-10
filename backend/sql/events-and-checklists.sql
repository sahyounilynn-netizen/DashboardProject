USE dashboard_project_db;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT 'blue',
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule VARCHAR(255) NULL,
  reminder_minutes INT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_events_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_events_time
    CHECK (end_at >= start_at)
);

CREATE INDEX idx_events_user_start ON events(user_id, start_at);
CREATE INDEX idx_events_task ON events(task_id);

ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS task_checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_checklist_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_checklist_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_checklist_task_order
  ON task_checklist_items(task_id, sort_order, id);
