# BudgetFlow 💰

A modern personal finance management web application with a fintech-style dashboard.

## Features

- 📊 **Dashboard** – Summary cards, financial health score, spending charts, smart insights
- 💳 **Transactions** – Add, edit, delete transactions with auto-categorization, search, filters, CSV export
- 📋 **Budgets** – Set monthly spending limits by category with progress tracking and alerts
- 📈 **Analytics** – Pie charts, bar charts, savings area chart, detailed financial insights
- 🎯 **Savings Goals** – Set and track savings goals with animated progress bars
- 🔐 **Auth** – JWT-based registration & login with protected routes
- ✨ **Premium UI** – Glassmorphism, Framer Motion animations, responsive design

## Tech Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React (Vite) | Node.js / Express | MongoDB (local) |
| TailwindCSS | JWT Authentication | Mongoose ODM |
| Framer Motion | bcrypt Password Hashing | |
| Recharts | REST API | |
| Zustand | Rate Limiting | |
| React Query | | |

## Prerequisites

- **Node.js** 18+
- **MongoDB** installed and running locally on port 27017

## Getting Started

### 1. Clone and Setup

```bash
cd budgetflow
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

The API server starts at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.

### 4. Open the App

Visit `http://localhost:5173` in your browser. Register a new account and start tracking!

## Environment Variables

Backend `.env`:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/budgetflow
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/transactions | Yes | List transactions |
| POST | /api/transactions | Yes | Create transaction |
| PUT | /api/transactions/:id | Yes | Update transaction |
| DELETE | /api/transactions/:id | Yes | Delete transaction |
| GET | /api/transactions/export | Yes | Export CSV |
| GET | /api/budgets | Yes | List budgets |
| POST | /api/budgets | Yes | Create budget |
| DELETE | /api/budgets/:id | Yes | Delete budget |
| GET | /api/goals | Yes | List goals |
| POST | /api/goals | Yes | Create goal |
| PUT | /api/goals/:id | Yes | Update goal |
| DELETE | /api/goals/:id | Yes | Delete goal |
| GET | /api/analytics/summary | Yes | Financial summary |
| GET | /api/analytics/charts | Yes | Chart data |
| GET | /api/analytics/insights | Yes | Smart insights |

## Project Structure

```
budgetflow/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers  
│   ├── middleware/      # Auth, error handler, rate limiter
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── layouts/    # Dashboard layout
│       ├── lib/        # Utilities
│       ├── pages/      # Route pages
│       ├── services/   # API client
│       └── store/      # Zustand state
└── README.md
```
