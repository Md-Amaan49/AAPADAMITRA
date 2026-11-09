# AAPADAMITRA — Database Architecture & Setup Guide

**Milestone:** 02.1 — Database Architecture & Prisma Foundation  
**Primary Database:** PostgreSQL 16+ with PostGIS Spatial Extensions  
**ORM & Migrations:** Prisma ORM 6.19.3  
**Target Environment:** Windows 10 (PowerShell) / Cloud Hosting  

---

## 1. Architectural Overview & Design Principles

The AAPADAMITRA database foundation is engineered based on the official [Database Design Document (AAP-DB-005)](AAPADAMITRA_05_Database_Design_v1.0.md):

1. **Relational Integrity & Immutability:** Strict foreign key integrity across organizations, users, administrative areas, assets, stations, sensors, and observations.
2. **Separation of Observations and Predictions:** Measured facts (`observations`) are strictly decoupled from model inference outputs (`predictions`). An observation is never overwritten by a forecast.
3. **Multi-Hazard & Multi-Asset Support:** Infrastructure models support dams, barrages, weirs, embankments, river segments, evacuation shelters, hospitals, and control rooms without hardcoding Vishnupuri Dam.
4. **Geospatial Readiness (PostGIS):** Native PostGIS types (`geography(Point, 4326)`, `geometry(MultiPolygon, 4326)`) are paired with WGS 84 floating-point coordinates (`latitude`, `longitude`) and structured `boundaryGeoJson` for high-performance spatial indexing and client rendering.
5. **Security & Data Minimization:** Model binaries and large media are kept outside PostgreSQL (in object storage), with only URIs and checksums stored in relational tables. No plaintext secrets or passwords are saved.

---

## 2. Entity Relationship Overview (12 Core Domains)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : members
    ORGANIZATIONS ||--o{ INFRASTRUCTURE_ASSETS : owns
    ORGANIZATIONS ||--o{ MONITORING_STATIONS : operates
    ORGANIZATIONS ||--o{ DATA_SOURCES : maintains
    
    USERS ||--o{ USER_ROLES : assigned
    ROLES ||--o{ USER_ROLES : grants
    ROLES ||--o{ ROLE_PERMISSIONS : includes
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : maps
    
    ADMINISTRATIVE_AREAS ||--o{ ADMINISTRATIVE_AREAS : parent_child
    ADMINISTRATIVE_AREAS ||--o{ INFRASTRUCTURE_ASSETS : bounds
    ADMINISTRATIVE_AREAS ||--o{ PREDICTIONS : scopes
    ADMINISTRATIVE_AREAS ||--o{ USER_ROLES : scopes
    
    HAZARD_TYPES ||--o{ SEVERITY_LEVEL_DEFINITIONS : defines
    HAZARD_TYPES ||--o{ HAZARD_THRESHOLDS : regulates
    HAZARD_TYPES ||--o{ MODEL_VERSIONS : applies_to
    HAZARD_TYPES ||--o{ PREDICTIONS : categorizes
    
    INFRASTRUCTURE_ASSETS ||--o{ MONITORING_STATIONS : monitored_by
    INFRASTRUCTURE_ASSETS ||--o{ HAZARD_THRESHOLDS : bounds
    INFRASTRUCTURE_ASSETS ||--o{ OBSERVATIONS : measured_at
    INFRASTRUCTURE_ASSETS ||--o{ PREDICTIONS : forecasted_for
    
    MONITORING_STATIONS ||--o{ SENSORS : hosts
    MONITORING_STATIONS ||--o{ OBSERVATIONS : reports
    SENSORS ||--o{ OBSERVATIONS : measures
    
    DATA_SOURCES ||--o{ OBSERVATIONS : feeds
    
    MODEL_VERSIONS ||--o{ PREDICTIONS : executes
    PREDICTIONS ||--o{ PREDICTION_VALUES : contains
```

### Domain Mapping & Relationships

| Domain | Entity | Core Responsibility & Relations |
|---|---|---|
| **1. Identity** | `Organization` | Organization tenancy (agencies, operators, NGOs). Self-referential hierarchy. |
| **2. Identity** | `User` | User profile, hashed password, scoped to an organization. |
| **3. Access** | `Role` | Standard roles (`CITIZEN`, `FIELD_RESPONDER`, `CONTROL_ROOM_OPERATOR`, `ALERT_APPROVER`, `ADMIN`). |
| **4. Access** | `Permission` | Granular capability keys (`alert:draft`, `alert:approve`, `observation:create`). |
| **5. Geography** | `AdministrativeArea` | Multi-tier boundaries (`STATE` $\rightarrow$ `DISTRICT` $\rightarrow$ `TALUKA_TEHSIL` $\rightarrow$ `VILLAGE_BLOCK`). |
| **6. Hazard** | `HazardType` | Multi-hazard definitions (`FLOOD`, `CYCLONE`, `LANDSLIDE`, `DROUGHT`, `HEATWAVE`, `EARTHQUAKE`). |
| **7. Infrastructure** | `InfrastructureAsset` | Critical assets (`DAM`, `BARRAGE`, `SHELTER`, `HOSPITAL`) with location & variable properties. |
| **8. Ingestion** | `MonitoringStation` & `Sensor` | Gauge, radar, weather stations and individual sensors measuring physical metrics. |
| **9. Telemetry** | `DataSource` | Ingestion channel registry (`GOVERNMENT_API`, `IOT_GATEWAY`, `SYNTHETIC_SIMULATOR`). |
| **10. Observation** | `Observation` | Immutable physical measurements (`water_level`, `rainfall`, `discharge`) with units, timestamps, provenance. |
| **11. AI/ML** | `ModelVersion` | Model registry with `artifactUri`, lifecycle status (`EXPERIMENTAL`, `APPROVED_PILOT`), evaluation metrics. |
| **12. Forecasting** | `Prediction` & `PredictionValue` | Time-series multi-horizon forecast outputs (1h, 3h, 6h, 12h, 24h), risk categories, and confidence intervals. |

---

## 3. Environment Configuration

The database connection URL is configured via environment variables.

### Template (`apps/api/.env.example`)
```env
# PostgreSQL connection string
# Format: postgresql://<username>:<password>@<host>:<port>/<database>?schema=<schema>
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>?schema=public"
```

> [!IMPORTANT]
> Never commit `.env` files containing real database passwords to version control. The `.gitignore` file is strictly configured to exclude all `.env` files.

---

## 4. Setup & Migration Guide (Windows 10 / PowerShell)

### Step 1: Install PostgreSQL 16+ & PostGIS
1. Ensure PostgreSQL is installed (Windows installer includes PostGIS extension via StackBuilder).
2. Start the PostgreSQL Windows Service:
   ```powershell
   Get-Service -Name "*postgres*"
   ```

### Step 2: Create Application Database & Enable Extensions
Using `psql` (typically located in `C:\Program Files\PostgreSQL\<version>\bin`):
```powershell
# Connect as superuser
psql -U postgres -h localhost

# Run SQL commands:
CREATE DATABASE aapadamitra;
\c aapadamitra
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Step 3: Configure `.env`
In `apps/api/.env`, supply your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/aapadamitra?schema=public"
```

### Step 4: Validate Prisma Schema
From repository root:
```powershell
pnpm db:validate
```

### Step 5: Run Database Migrations
Apply the initial migration containing all 12 domains, enums, tables, and PostGIS GiST spatial indexes:
```powershell
# Using Prisma CLI in apps/api
pnpm --filter @aapadamitra/api prisma migrate deploy

# OR in development mode:
pnpm db:migrate
```

### Step 6: Generate Prisma Client
```powershell
pnpm db:generate
```

### Step 7: Inspect Database with Prisma Studio
```powershell
pnpm db:studio
```
Prisma Studio opens an interactive web UI at `http://localhost:5555`.

---

## 5. Verification & Health Monitoring

The NestJS backend provides dedicated health probe routes:
- **Application Liveness:** `GET http://localhost:3000/api/v1/health`
  ```json
  {
    "status": "ok",
    "service": "aapadamitra-api"
  }
  ```
- **Database Connectivity:** `GET http://localhost:3000/api/v1/health/database`
  - Connected:
    ```json
    {
      "status": "connected",
      "latencyMs": 4
    }
    ```
  - Disconnected (Service gracefully degrades without crashing):
    ```json
    {
      "status": "disconnected",
      "error": "Authentication failed against database server..."
    }
    ```
