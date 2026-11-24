# Advanced Admin Dashboard

A learning-oriented full-stack admin dashboard with React + Vite and Express + MongoDB.

## Requirements
- Node.js 20+ (18.18+ should also work)
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Configure the backend
```bash
cd backend
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`. Edit `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

Install and start:
```bash
npm install
npm run seed:admin
npm run dev
```
Backend runs at http://localhost:5000. Health check: http://localhost:5000/api/health

The seed command creates:
- Email: `admin@example.com`
- Password: `Admin123!`

Change this password after your first login. The seed command will not overwrite an existing account with that email.

## 2. Start the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173).

## 3. First login
Use `admin@example.com` / `Admin123!`.

You can register a regular user from the login screen. Public registration always creates the `user` role. Only an administrator can create or promote accounts through the user-management screen; the backend enforces this too.

## Features
- JWT login and current-user endpoint
- Protected frontend routes
- Role-aware navigation and controls
- Server-side user search, role/status filtering and pagination
- User create, update and delete
- Dashboard metrics
- Client-side form validation
- Loading, empty and error states
- Responsive layout

## Important security notes
This is a practical learning starter, not a production-ready security review. It stores the access token in `localStorage` for simplicity. For production, prefer secure HttpOnly cookies with an appropriate CSRF strategy, add refresh-token rotation, email verification, password reset, audit logging, stricter rate limits, centralized validation, tests, and deployment secrets management. Never commit `.env`.

## Project layout
```text
advanced-admin-dashboard/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      scripts/
      utils/
  frontend/
    src/
      components/
      context/
      pages/
      services/
      styles/
```
