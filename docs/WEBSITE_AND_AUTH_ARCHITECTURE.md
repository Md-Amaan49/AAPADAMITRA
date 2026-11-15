# AAPADAMITRA — Website, Authentication & Role-Based Dashboards Architecture

**Document Version:** 1.0.0  
**Status:** Approved & Implemented  
**Date:** November 2026  
**Environment:** Monorepo (`apps/web` + `apps/api` + `packages/contracts`)

---

## 1. Executive Summary

This architecture establishes the primary web application and authentication foundation for **AAPADAMITRA (आपदामित्र)** — a Multi-Hazard Disaster Management and Emergency Coordination Platform.

The platform provides a responsive, accessible, government-grade user interface catering to four primary user tiers:
1. **District Authority / Administrator** (`DISTRICT_AUTHORITY` / `ADMIN`): Strategic incident command, infrastructure oversight, personnel directory, and statutory human-in-the-loop (HITL) alert authorization.
2. **Monitoring Operator** (`MONITORING_OPERATOR` / `CONTROL_ROOM_OPERATOR`): Telemetry ingestion, Vishnupuri Dam level and gate monitoring, sensor registry, operational logging, and AI multi-hazard simulation triggers.
3. **Emergency Responder** (`EMERGENCY_RESPONDER` / `FIELD_RESPONDER`): Tactical incident queue, response unit readiness (boats/pumps/ambulances), status updates, and field situation report (SITREP) transmissions.
4. **Citizen** (`CITIZEN`): Authenticated statutory alerts, community incident reporting, emergency SOS distress calls with deliberate confirmation, and DDMA relief camp directories.

---

## 2. Technology Stack & Directory Structure

| Layer | Technology | Key Dependencies |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | `react-router-dom`, `lucide-react` |
| **Styling** | Government-Grade CSS Design System | Custom CSS variables, responsive grid, emergency alert palettes |
| **Backend** | NestJS, TypeScript | `bcryptjs`, `jsonwebtoken`, `@nestjs/common` |
| **Shared Contracts** | TypeScript Monorepo Package | `@aapadamitra/contracts` |
| **Database ORM** | Prisma 6, PostgreSQL | Additive User, Role, UserRole, Hazard, Alert schemas |

### Frontend File Organization (`apps/web/src/`)
```
apps/web/src/
├── components/
│   ├── common/
│   │   ├── Navbar.tsx             # Public header, emergency ticker, auth status
│   │   ├── Footer.tsx             # Statutory helplines, official disclaimers
│   │   ├── Sidebar.tsx            # Dynamic role-tailored dashboard navigation
│   │   └── DashboardLayout.tsx    # Responsive shell, UTC/IST clock, status badge
│   ├── guards/
│   │   └── ProtectedRoute.tsx     # JWT auth verification & role whitelist guard
│   ├── AiPredictionsDashboard.tsx # Multi-hazard model UI diagnostics
│   ├── Header.tsx                 # Diagnostic header
│   └── SystemStatusCard.tsx       # System health monitor
├── context/
│   └── AuthContext.tsx            # Session state, login, citizen registration, logout
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx           # Multi-hazard hero, pilot highlights, workflow
│   │   ├── AboutPage.tsx          # Institutional mission, Vishnupuri pilot context
│   │   ├── HazardsPage.tsx        # 7-hazard registry, AI vs telemetry distinction
│   │   ├── PreparednessPage.tsx   # NDMA/SDMA standard operating procedures & kit
│   │   └── ContactPage.tsx        # DEOC desk, site offices, non-emergency form
│   ├── auth/
│   │   ├── LoginPage.tsx          # Sign-in form with quick evaluator login buttons
│   │   ├── RegisterPage.tsx       # Citizen self-registration with terms validation
│   │   ├── ForgotPasswordPage.tsx # Password recovery token trigger
│   │   └── ResetPasswordPage.tsx  # Secure token-based password reset
│   ├── dashboard/
│   │   ├── AuthorityDashboard.tsx # Command overview, HITL alert approval desk
│   │   ├── OperatorDashboard.tsx  # Dam telemetry, AI simulation triggers, logs
│   │   ├── ResponderDashboard.tsx # Incident queue, unit readiness, SITREPs
│   │   └── CitizenDashboard.tsx   # Verified alerts, reporting form, SOS modal
│   └── errors/
│       ├── UnauthorizedPage.tsx   # 401 insufficient clearance screen
│       ├── ForbiddenPage.tsx      # 403 forbidden action screen
│       └── NotFoundPage.tsx       # 404 resource not found screen
├── services/
│   └── apiClient.ts               # Authenticated REST client for NestJS backend
├── index.css                      # Design system variables, cards, buttons, badges
└── App.tsx                        # Master React Router configuration
```

---

## 3. Authentication & Security Architecture

### 3.1 Token Lifecycle
- **Access Token:** Short-lived JSON Web Token (15 minutes / 900 seconds) carrying user ID, email, and normalized operational role.
- **Refresh Token:** Long-lived secure token (7 days / 604,800 seconds) allowing seamless token rotation.
- **Storage:** Stored in `sessionStorage` (default) or `localStorage` when "Keep me signed in" is enabled.

### 3.2 Role Hierarchy & Normalization
The system normalizes roles between canonical administrative tiers and field operational aliases:
- `DISTRICT_AUTHORITY` $\equiv$ `ADMIN`
- `MONITORING_OPERATOR` $\equiv$ `CONTROL_ROOM_OPERATOR`
- `EMERGENCY_RESPONDER` $\equiv$ `FIELD_RESPONDER`
- `CITIZEN` (strictly assigned upon public self-registration)

### 3.3 Security Guardrails
1. **Generic Authentication Failures:** Prevents user enumeration by returning identical generic error messages for invalid passwords and non-existent email addresses.
2. **Citizen Self-Registration Restriction:** Public self-registration strictly assigns the `CITIZEN` role. Users cannot self-elevate to administrative or operator roles.
3. **Bcrypt Password Hashing:** All passwords are salted and hashed using bcrypt (10 rounds). Plaintext passwords are never persisted.
4. **Route Protection:** Both client-side `<ProtectedRoute allowedRoles={[...]} />` and server-side `@Roles(...)` + `RolesGuard` validate permissions on every turn.

---

## 4. Role-Specific Dashboards

### 4.1 District Authority / Administrator (`/dashboard/authority`)
- **Situational Awareness:** Real-time summary of Vishnupuri Dam reservoir levels, catchment weather watch, active emergency missions, and personnel on duty.
- **Human-in-the-Loop (HITL) Alert Desk:** Review incoming machine-generated risk models and sensor breaches. Authorized officials can approve and broadcast alerts to public channels or reject/archive them.
- **Critical Infrastructure:** Vishnupuri Barrage technical specifications (355.00m FRL, 80.79 MCM capacity, 18 radial gates) and connected telemetry health.
- **Directory & Audit:** Overview of registered personnel and tamper-evident audit logs.

### 4.2 Monitoring Operator (`/dashboard/operator`)
- **Vishnupuri Dam Telemetry:** Real-time reservoir stage, gross storage percentage, upstream inflow, downstream outflow, and active crest gate positions.
- **Multi-Hazard AI Model Trigger:** Interactive execution interface calling backend AI endpoints for Flood, Cyclone, Landslide, and Tsunami. Model predictions display severity, confidence, and disclaimers, with a one-click action to forward results to District Authority as an alert proposal.
- **Sensor Network:** Status of ultrasonic water level sensors, hydrostatic pressure gauges, and tipping-bucket rain gauges.
- **Operational Log Entry:** Digital logging of hourly gate maneuvers and siren tests.

### 4.3 Emergency Responder (`/dashboard/responder`)
- **Incident Queue:** Prioritized incident tasks (P1 Critical, P2 High, P3 Standard) with location markers and timestamp tracking.
- **Status Progression:** Field units can update incident states from `ASSIGNED` $\rightarrow$ `EN_ROUTE` $\rightarrow$ `ON_SCENE` $\rightarrow$ `RESOLVED`.
- **Readiness Tracking:** Inventory of deployed inflatable rescue boats (IRB), life vests, dewatering pumps, and ambulances.
- **SITREP Transmissions:** Direct electronic submission of on-ground situation reports to the DEOC.

### 4.4 Citizen Portal (`/dashboard/citizen`)
- **Verified Official Alerts:** Only displays alerts vetted and authorized by statutory authorities. Zero simulated or experimental AI panics.
- **Incident Reporting:** Allows residents to report localized waterlogging or hazardous situations with photos and landmarks. Disclaims that false reporting is punishable under Section 54 of the Disaster Management Act, 2005.
- **Emergency Distress SOS:** High-visibility distress button with a **deliberate confirmation modal** to prevent accidental triggers. Connects directly to DEOC and 112 emergency dispatchers.
- **DDMA Shelters & Checklist:** Verified relief camp directory (polytechnics, schools, community halls) and interactive family preparedness checklist.

---

## 5. Pre-Seeded Development & Evaluator Accounts

For rapid evaluation and testing, four synchronized operational accounts are pre-seeded:

| Role | Email | Password | Intended Dashboard |
|---|---|---|---|
| **District Authority** | `admin@aapadamitra.gov.in` | `AuthorityPass123!` | `/dashboard/authority` |
| **Monitoring Operator** | `operator@aapadamitra.gov.in` | `OperatorPass123!` | `/dashboard/operator` |
| **Emergency Responder** | `responder@aapadamitra.gov.in` | `ResponderPass123!` | `/dashboard/responder` |
| **Citizen** | `citizen@aapadamitra.gov.in` | `CitizenPass123!` | `/dashboard/citizen` |

*Note: The login page includes one-click evaluator buttons that automatically populate credentials and log in.*

---

## 6. Verification and Test Results

- **Backend Auth & RBAC Suite:** 39 tests passing across 15 test suites with 0 failures (`apps/api/test/auth.test.js`).
- **Frontend Monorepo Build:** `@aapadamitra/web` compiles cleanly in 4.48s with TypeScript 5.8 and Vite 6.4.
- **Monorepo Build:** Full monorepo build (`@aapadamitra/contracts`, `@aapadamitra/api`, `@aapadamitra/web`) verified with 0 errors.

