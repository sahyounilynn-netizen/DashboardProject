# Connect This Project to MySQL

This project is already wired to MySQL in code. The remaining setup is making sure your local database matches the current backend expectations for:

- `users`
- `tasks`
- `events`
- `task_checklist_items`

The auth and task ownership work now expects each task to belong to a user through `tasks.user_id`.

## 1. Confirm backend dependencies

From `backend/`:

```bash
npm install
```

The backend already includes:

- `mysql2`
- `bcrypt`
- `dotenv`

## 2. Create `backend/.env`

Add this file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dashboard_project_db
```

## 3. Create the database

Run this in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS dashboard_project_db;
USE dashboard_project_db;
```

## 4. Create or update the `tasks` table

If you are setting this project up from scratch, use this full table definition:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('pending', 'in-progress', 'completed') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  due_date DATETIME NULL,
  user_id INT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

If you already have an older `tasks` table from earlier work, make sure it includes these columns:

- `description`
- `due_date`
- `user_id`
- `is_deleted`

## 5. Create the `users` table and connect tasks to users

You can run the SQL in [`backend/sql/auth-and-user-tasks.sql`](/C:/Users/User/OneDrive/Desktop/Cv%20and%20Work/coderaas/Dashboard%20Project/backend/sql/auth-and-user-tasks.sql), or run this manually:

```sql
USE dashboard_project_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tasks
ADD COLUMN user_id INT NULL;

ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;
```

If `user_id` already exists, skip that `ALTER TABLE` line. If the foreign key already exists, skip the constraint line too.

## 6. Add calendar and checklist support

The dashboard no longer depends on `dashboard_cards`. Real dashboard numbers are calculated live from `users` and `tasks`.

If you want to start the next phase of the app, run [`backend/sql/events-and-checklists.sql`](/C:/Users/User/OneDrive/Desktop/Cv%20and%20Work/coderaas/Dashboard%20Project/backend/sql/events-and-checklists.sql).

That script adds:

- `events`
  - calendar items owned by a user
  - optional link to a task
  - start/end dates
  - colors, reminders, and recurrence fields
  - soft delete support through `events.is_deleted`
- `task_checklist_items`
  - sub-items inside a task
  - completion state
  - ordering for checklist display

## 7. Run the backend

From `backend/`:

```bash
npm run dev
```

Useful quick check:

```bash
curl http://localhost:5000/api/db-test
```

## 8. Run the frontend

From `frontend/`:

```bash
npm run dev
```

Then open the Vite URL shown in your terminal and:

1. Register a new user
2. Log in
3. Add a task
4. Change its status
5. Delete it

Each user should now only see their own tasks.

## 9. Current API routes

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/tasks?userId=1
POST   /api/tasks
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id?userId=1
GET    /api/dashboard?scope=my&userId=1
GET    /api/dashboard?scope=global
```

## Common Problems

### `Unknown database`

Create `dashboard_project_db`, then make sure `DB_NAME=dashboard_project_db`.

### `Access denied for user`

Check `DB_USER` and `DB_PASSWORD` in `backend/.env`.

### `Table 'users' doesn't exist`

Run [`backend/sql/auth-and-user-tasks.sql`](/C:/Users/User/OneDrive/Desktop/Cv%20and%20Work/coderaas/Dashboard%20Project/backend/sql/auth-and-user-tasks.sql).

### `Unknown column 'is_deleted'` or `Unknown column 'description'`

Your `tasks` table is still on the older schema. Update it to match step 4.

### Calendar or checklist tables are missing

Run [`backend/sql/events-and-checklists.sql`](/C:/Users/User/OneDrive/Desktop/Cv%20and%20Work/coderaas/Dashboard%20Project/backend/sql/events-and-checklists.sql).

### Deleted events still show up

Make sure the `events` table includes `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`, then run the updated events SQL script.

### Frontend loads but auth or tasks fail

Confirm the backend is running on `http://localhost:5000` and the database schema matches the current code.
