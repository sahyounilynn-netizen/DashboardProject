# React Dashboard Project

Full-stack dashboard project built with React, Express, and MySQL.

The app is structured as:

- `frontend/` for the Vite + React client
- `backend/` for the Express API
- `backend/sql/` for database setup scripts

The current deployment setup is:

- Vercel for the frontend
- Railway for the backend
- MySQL for persistence

## Features

- User registration and login
- User-owned tasks
- Dashboard metrics
- Calendar events
- Task checklist support in the database layer

## Environment Variables

### Frontend

Create `frontend/.env` locally:

```env
VITE_API_URL=http://localhost:5000/api
```

In Vercel, set `VITE_API_URL` to your Railway backend API base URL, for example:

```env
VITE_API_URL=https://your-railway-backend-domain/api
```

### Backend

Create `backend/.env` locally:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dashboard_project_db
```

In Railway, set the same database variables with your production MySQL values. Railway will provide `PORT` automatically, but keeping it in local `.env` is useful for development.

## Local Development

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Set up MySQL

Follow the full database guide in [MYSQL_SETUP.md](/C:/Users/User/OneDrive/Desktop/Cv%20and%20Work/coderaas/Dashboard%20Project/MYSQL_SETUP.md).

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks?userId=1`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id?userId=1`
- `GET /api/events?userId=1`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id?userId=1`
- `GET /api/dashboard?scope=my&userId=1`
- `GET /api/dashboard?scope=global`

## Deployment Notes

- The frontend already reads the API base URL from `VITE_API_URL`.
- The backend already reads its port from `process.env.PORT`, which matches Railway deployment expectations.
- `app.use(cors())` is currently open to all origins. That works for deployment, but if you want, the next improvement can be locking CORS down to your Vercel domain.
