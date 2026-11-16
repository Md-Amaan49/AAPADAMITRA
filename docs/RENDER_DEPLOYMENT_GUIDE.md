# AAPADAMITRA — Render Deployment Guide

This guide outlines the steps required to deploy the **AAPADAMITRA Multi-Hazard Disaster Management & Emergency Coordination Platform** to [Render](https://render.com).

---

## 1. System Architecture on Render

```
                                      ┌──────────────────────────────────────────────────┐
                                      │  Hosted Multi-Hazard AI Model API                │
                                      │  https://aapadamitra-model-api.onrender.com      │
                                      └────────────────────────┬─────────────────────────┘
                                                               │ (Protected internal proxy)
                                                               ▼
┌─────────────────────────────────┐        REST API       ┌─────────────────────────────────┐
│  AAPADAMITRA Web Frontend       │ ────────────────────► │  AAPADAMITRA Backend API Core   │
│  (React 18 + Vite SPA)          │                       │  (NestJS + Prisma Engine)       │
│  https://aapadamitra-web.onrender.com                   │  https://aapadamitra-api.onrender.com
└─────────────────────────────────┘                       └────────────────┬────────────────┘
                                                                           │
                                                                           ▼
                                                          ┌─────────────────────────────────┐
                                                          │  Render Managed PostgreSQL      │
                                                          │  (PostGIS-compatible database)  │
                                                          └─────────────────────────────────┘
```

---

## 2. Method 1: 1-Click Blueprint Deployment (Recommended)

Render Blueprints allow you to provision the entire monorepo stack (API, Web, and Database) with a single click using the included [`render.yaml`](file:///c:/Users/hp/OneDrive/Desktop/AAPADAMITRA/render.yaml).

### Step 1: Push Changes to GitHub
Ensure all recent commits are pushed to your GitHub repository:
```bash
git push origin feature/web-auth-dashboards
```
*(Or merge into your default `main` branch).*

### Step 2: Open Render Dashboard
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click the **New +** button in the top navigation and select **Blueprint**.

### Step 3: Connect Your Repository
1. Select your repository: `Md-Amaan49/AAPADAMITRA`.
2. Give the Blueprint instance a name (e.g. `aapadamitra-production`).
3. Render will parse [`render.yaml`](file:///c:/Users/hp/OneDrive/Desktop/AAPADAMITRA/render.yaml) and automatically detect three resources:
   - **`aapadamitra-api`** (Web Service — Node.js)
   - **`aapadamitra-web`** (Static Site — React/Vite)
   - **`aapadamitra-db`** (Managed PostgreSQL)

### Step 4: Apply Blueprint
1. Review the generated configuration and environment variables.
2. Click **Apply**.
3. Render will automatically build and deploy all services in the correct sequence.

---

## 3. Method 2: Manual Dashboard Configuration

If you prefer configuring each service individually in the Render Dashboard:

### Service A: Backend API (`aapadamitra-api`)
1. Click **New +** ➔ **Web Service**.
2. Connect your GitHub repository: `Md-Amaan49/AAPADAMITRA`.
3. Fill in the service configuration:
   - **Name:** `aapadamitra-api`
   - **Region:** `Oregon (US West)` (or closest region)
   - **Branch:** `main` (or `feature/web-auth-dashboards`)
   - **Root Directory:** *(leave blank — monorepo root)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     corepack enable && pnpm install && pnpm --filter @aapadamitra/contracts build && pnpm --filter @aapadamitra/api prisma:generate && pnpm --filter @aapadamitra/api build
     ```
   - **Start Command:**
     ```bash
     pnpm --filter @aapadamitra/api start:prod
     ```
   - **Plan:** `Free`
4. Expand **Advanced** and set:
   - **Health Check Path:** `/api/v1/health`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_VERSION` | `22` | Uses Node.js 22 runtime |
   | `NODE_ENV` | `production` | Production optimizations |
   | `API_PORT` | `10000` | Port assigned by Render |
   | `API_GLOBAL_PREFIX` | `/api/v1` | REST endpoint prefix |
   | `CORS_ORIGIN` | `*` | Or your frontend URL |
   | `AI_MODEL_API_BASE_URL` | `https://aapadamitra-model-api.onrender.com` | Hosted Multi-Hazard Model API |
   | `JWT_ACCESS_SECRET` | *(generate a strong 64-char key)* | Auth token signing |
   | `JWT_REFRESH_SECRET` | *(generate a strong 64-char key)* | Refresh token signing |
   | `DATABASE_URL` | *(your PostgreSQL connection URL)* | Render DB or external |

---

### Service B: Frontend Web App (`aapadamitra-web`)
1. Click **New +** ➔ **Static Site**.
2. Connect your GitHub repository: `Md-Amaan49/AAPADAMITRA`.
3. Fill in the static site configuration:
   - **Name:** `aapadamitra-web`
   - **Branch:** `main` (or `feature/web-auth-dashboards`)
   - **Root Directory:** *(leave blank — monorepo root)*
   - **Build Command:**
     ```bash
     corepack enable && pnpm install && pnpm --filter @aapadamitra/contracts build && pnpm --filter @aapadamitra/web build
     ```
   - **Publish Directory:** `apps/web/dist`
4. Under **Redirects/Rewrites**, add a rewrite rule for client-side routing:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_VERSION` | `22` | Node.js 22 build environment |
   | `VITE_API_BASE_URL` | `https://aapadamitra-api.onrender.com/api/v1` | Point to your deployed API service |

---

### Service C: Managed PostgreSQL Database (`aapadamitra-db`)
1. Click **New +** ➔ **PostgreSQL**.
2. Configure:
   - **Name:** `aapadamitra-db`
   - **Database:** `aapadamitra`
   - **User:** `aapadamitra_user`
   - **Region:** `Oregon (US West)` (match your API region)
   - **Plan:** `Free`
3. After creation, copy the **Internal Database URL** and paste it as `DATABASE_URL` in `aapadamitra-api`.

---

## 4. Post-Deployment Verification Checklist

Once Render finishes deploying:

- [ ] **API Health Check:** Visit `https://aapadamitra-api.onrender.com/api/v1/health`  
  *Expected response:* `{"status":"ok","timestamp":"...","uptime":...}`
- [ ] **OpenAPI / Swagger Documentation:** Visit `https://aapadamitra-api.onrender.com/api/docs`  
  *Expected result:* Interactive Swagger UI listing all alert, hazard, auth, and AI routes.
- [ ] **Hosted Model API Gateway:** Visit `https://aapadamitra-api.onrender.com/api/v1/ai/health`  
  *Expected response:* Confirms connectivity between NestJS and `https://aapadamitra-model-api.onrender.com`.
- [ ] **Web Application:** Visit `https://aapadamitra-web.onrender.com`  
  *Expected result:* Clean command-center theme, live district hazard radar with ticking countdown timers, and citizen incident dispatch desk.
- [ ] **Authentication Flow:** Test login with standard role credentials:
  - Authority: `authority@aapadamitra.gov.in` / `Authority@123`
  - Operator: `operator@aapadamitra.gov.in` / `Operator@123`
  - Responder: `responder@aapadamitra.gov.in` / `Responder@123`
  - Citizen: `citizen@aapadamitra.gov.in` / `Citizen@123`

