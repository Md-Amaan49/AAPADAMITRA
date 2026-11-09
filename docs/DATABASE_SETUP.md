# AAPADAMITRA — Database Architecture & Setup Guide

**Milestone:** 02.1 & 02.1.1 — Database Architecture, Prisma Foundation & PostGIS Integration Verification  
**Primary Database:** PostgreSQL 16+ (tested on PostgreSQL 18.3) with PostGIS Spatial Extensions  
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

### Step 1: Install PostgreSQL & PostGIS Spatial Extension

#### PostgreSQL Installation
Ensure PostgreSQL is installed and its Windows Service is running:
```powershell
Get-Service -Name "*postgres*"
```

#### Installing PostGIS on Windows (StackBuilder)
PostGIS extension binaries are distributed separately from base PostgreSQL.
1. Launch StackBuilder:
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\stackbuilder.exe"
   ```
2. Select your PostgreSQL installation (`PostgreSQL 18 on port 5432`).
3. Expand **Spatial Extensions** and check **PostGIS Bundle**.
4. Complete the installation wizard.
5. Verify that `postgis.control` exists in `C:\Program Files\PostgreSQL\18\share\extension\`.

### Step 2: Create Application Database & Superuser Verification
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

### Step 3: Configure `apps/api/.env`
In `apps/api/.env`, supply your actual local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:your_actual_password@localhost:5432/aapadamitra?schema=public"
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

## 5. PostGIS Compatibility & Prisma v6 Integration Pattern

### Known Limitations of Prisma v6 with PostGIS
Prisma v6 does not have first-class spatial type primitives (like `Point` or `Polygon`). To support PostGIS natively while retaining Prisma's type-safe query engine for relational fields:
1. Spatial columns are declared as `Unsupported(...)` in `schema.prisma`:
   - Points: `geom Unsupported("geography(Point, 4326)")?`
   - MultiPolygons: `geom Unsupported("geometry(MultiPolygon, 4326)")?`
2. Dual-representation pattern:
   - For points, standard scalar fields `latitude Float` and `longitude Float` are maintained on the model for rapid UI access and serialization.
   - The native PostGIS `geom` column is indexed using GiST for sub-millisecond bounding box, distance, and intersection queries.
3. Spatial operations (writes and queries) utilize parameterized raw SQL via `prisma.$queryRaw` and `prisma.$executeRaw`.

### Spatial Write Pattern (Insert / Update with PostGIS Point)

```typescript
import { PrismaService } from '../prisma/prisma.service';

// Insert an infrastructure asset with synchronized spatial coordinates
async function createAssetWithSpatialPoint(prisma: PrismaService, assetData: any) {
  const { id, assetCode, assetType, name, latitude, longitude, orgId, areaId } = assetData;
  
  // Longitude FIRST, Latitude SECOND in ST_SetSRID(ST_MakePoint(lon, lat), 4326)
  await prisma.$executeRaw`
    INSERT INTO "infrastructure_assets" (
      "id", "asset_code", "asset_type", "name", 
      "latitude", "longitude", "geom", 
      "organization_id", "area_id", "updated_at"
    ) VALUES (
      ${id}::uuid, ${assetCode}, ${assetType}::"AssetType", ${name},
      ${latitude}, ${longitude}, 
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${orgId}::uuid, ${areaId}::uuid, CURRENT_TIMESTAMP
    );
  `;
}
```

### Spatial Query Examples

#### 1. Proximity Query: Assets within Distance of a Coordinate (`ST_DWithin`)
```typescript
// Find all infrastructure assets within 25 km (25,000 meters) of Vishnupuri Dam coordinates
const targetLongitude = 77.2831;
const targetLatitude = 19.1256;
const radiusMeters = 25000;

const nearbyAssets = await prisma.$queryRaw<Array<{ id: string; name: string; distance_meters: number }>>`
  SELECT 
    id, 
    name, 
    asset_code,
    ST_Distance(
      geom, 
      ST_SetSRID(ST_MakePoint(${targetLongitude}, ${targetLatitude}), 4326)::geography
    ) AS distance_meters
  FROM "infrastructure_assets"
  WHERE ST_DWithin(
    geom, 
    ST_SetSRID(ST_MakePoint(${targetLongitude}, ${targetLatitude}), 4326)::geography, 
    ${radiusMeters}
  )
  ORDER BY distance_meters ASC;
`;
```

#### 2. Containment Query: Assets within Administrative Boundary (`ST_Intersects`)
```typescript
// Find assets situated inside a specific administrative district polygon
const districtId = 'a1000000-0000-0000-0000-000000000001';

const assetsInDistrict = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
  SELECT a.id, a.name, a.asset_code
  FROM "infrastructure_assets" a
  JOIN "administrative_areas" d ON d.id = ${districtId}::uuid
  WHERE ST_Intersects(a.geom::geometry, d.geom);
`;
```

---

## 6. Database Verification & Diagnostic Queries

Execute the following diagnostic SQL script to verify database version, active extensions, and table counts:

```sql
-- 1. Database Engine Version
SELECT version();

-- 2. PostGIS Full Version & Subcomponents
SELECT PostGIS_Full_Version();

-- 3. Verify Active Extensions
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('postgis', 'uuid-ossp');

-- 4. Count Deployed Tables in Public Schema (Target: 14 core tables)
SELECT COUNT(*) AS total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 5. Verify GiST Spatial Indexes
SELECT 
    schemaname, 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE indexdef ILIKE '%gist%';
```

---

## 7. Verification & Health Monitoring

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

---

## 8. Troubleshooting & Common Issues

| Issue | Cause | Solution |
|---|---|---|
| `P1000: Authentication failed against database server` | Incorrect password or username in `apps/api/.env` | Update `DATABASE_URL` with your local PostgreSQL password. Verify authentication using `psql -U postgres -h localhost`. |
| `ERROR: extension "postgis" is not available` | PostGIS binaries not installed in PostgreSQL instance | Launch StackBuilder (`stackbuilder.exe`), expand *Spatial Extensions*, install *PostGIS Bundle*, then rerun `CREATE EXTENSION postgis;`. |
| `SCRAM authentication requires password` | `pg_hba.conf` is configured for `scram-sha-256` | Ensure the password specified in `DATABASE_URL` matches the SCRAM password set during PostgreSQL installation. |
| `relation "..." does not exist` | Migrations have not been applied | Run `pnpm --filter @aapadamitra/api prisma migrate deploy`. |
