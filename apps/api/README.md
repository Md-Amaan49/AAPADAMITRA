# AAPADAMITRA — Backend API Service

Modular NestJS backend REST API for the AAPADAMITRA platform.

## Features
- **Framework:** NestJS + TypeScript
- **Global API Prefix:** `/api/v1`
- **Swagger Documentation:** `/api/docs`
- **Health Check Endpoint:** `GET /api/v1/health`

## Environment Variables
Configured via `.env` or root `.env`:
- `API_PORT` (default: 3000)
- `API_GLOBAL_PREFIX` (default: `/api/v1`)
- `CORS_ORIGIN` (default: `http://localhost:5173`)
- `DATABASE_URL` (reserved for subsequent database milestone)

## Running Locally

```powershell
# Development mode with hot-reload
pnpm --filter @aapadamitra/api start:dev

# Production build
pnpm --filter @aapadamitra/api build

# Run production build
pnpm --filter @aapadamitra/api start:prod
```

