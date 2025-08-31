# Smart API Playground

A full-stack web application built in short daily sessions with ChatGPT as my coding partner.  
The app demonstrates modern web development practices with CRUD, search, pagination, theming, and shared validation.

---

## 🚀 Features

- **CRUD Operations** for notes ("runs")
- **Search & Pagination** in run history
- **Optimistic UI** with SWR for instant feedback
- **Light/Dark Theme Toggle** (syncs with system preferences)
- **Zod Validation** shared between API and frontend
- **Toast Notifications** for user actions
- **Responsive UI** styled with Tailwind v4

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL (hosted on Render)
- Zod for validation

**Frontend**
- Next.js 15 + TypeScript
- Tailwind CSS v4
- SWR for data fetching
- Sonner for toasts
- next-themes for theming

**Hosting**
- Backend: Render
- Frontend: Vercel

**Monorepo Setup**
- `apps/api` → backend
- `apps/web` → frontend
- `packages/shared` → Zod schemas + types

---

## 📸 Screenshots

> Add screenshots of your app UI here (light mode, dark mode, run history, etc.)

Example:

![Run history list in dark mode](./docs/screenshots/run-history-dark.png)
![Form and light mode theme](./docs/screenshots/form-light.png)

---

## 🌍 Live Demo

- **Frontend:** [https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)  
- **Backend API:** [https://your-render-api.onrender.com](https://your-render-api.onrender.com)

---

## 🏗️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm / yarn / pnpm

### Installation
```bash
# Clone the repo
git clone https://github.com/your-username/smart-api-playground.git
cd smart-api-playground

# Install dependencies
npm install
```

### Configure Environment
```bash
# apps/api/.env
DATABASE_URL=your_postgres_connection_string
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
# Optional: simple IP rate limiting (defaults shown)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
```

### Database Setup
```sql
create extension if not exists pgcrypto;
create table if not exists runs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  note text
);
```

### Run locally
```bash
# Start backend
cd apps/api
npm run dev

# Start frontend
cd apps/web
npm run dev
```

---

## 📖 Development Log

This project was built incrementally in daily ~1 hour sessions.  
You can read the full **build log** in [Notion](#) (coming soon).

Highlights:
- **Day 1-2:** Backend API + frontend deployment
- **Day 3-4:** Delete & Edit functionality
- **Day 5-6:** Tailwind polish + optimistic updates
- **Day 7-8:** Theming + Search + Pagination
- **Day 9:** Shared Zod schemas + monorepo aliasing

---

## 🧑‍💻 Author

**Richard Marchetti**  
Solutions Architect | AI tinkerer | Indie dev at night  
