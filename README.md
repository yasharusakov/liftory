# Liftory

A simple workout log app with a Go backend and a React (Vite) frontend.

## Structure

- `backend/` Go API service
- `frontend/` React UI

## Run guide (A to Z)

### 1) Prerequisites

- Go
- Node.js + npm
- Docker (optional, for Postgres)

### 2) Environment

Example `backend/.env.development`:

```dotenv
PORT=8080
APP_ENV=development
APP_ALLOWED_ORIGINS=*
TELEGRAM_BOT_TOKEN=replace-with-your-telegram-bot-token
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=db
POSTGRES_SSLMODE=disable
```

Example `frontend/.env.development`:

```dotenv
VITE_API_URL=/api
```

### 3) Database

```bash
cd backend
docker compose up -d
```

If you run Postgres locally, keep it aligned with `POSTGRES_*`.

### 4) Backend

```bash
cd backend
go run ./cmd/main.go
```

Migrations run automatically on start.

### 5) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6) Open the app

Use the URL printed by Vite. The dev server proxies `/api` to `http://localhost:8080`.
