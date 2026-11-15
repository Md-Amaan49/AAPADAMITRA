# AAPADAMITRA — Hosted Multi-Hazard AI API Integration Architecture
**Milestone:** AI Integration Milestone  
**Document ID:** AAP-ENG-AI-001  
**Version:** 1.0.0  
**Status:** IMPLEMENTED & TESTED (Live Protected Calls Blocked Pending Key Rotation)  
**Target Environment:** NestJS Backend & React Authority Dashboard $\rightarrow$ Hosted FastAPI Model Service (`https://aapadamitra-model-api.onrender.com`)

---

## 1. Architectural Overview & Security Boundary

```mermaid
flowchart TD
    subgraph Client Tier ["Client Tier (Browser / PWA)"]
        UI["Authority Dashboard (React / Vite)"]
    end

    subgraph Backend Tier ["AAPADAMITRA Backend (NestJS Monolith)"]
        AICtrl["AiController (/api/v1/ai)"]
        Guard["AiAuthorizationGuard (RBAC: Operators / Admins)"]
        AISvc["AiService (Orchestrator)"]
        TriggerSvc["AiTriggerService (Deduplication, Cooldown, Fingerprinting)"]
        RegistrySvc["AiRegistryService (Governance Audit & Reconciler)"]
        HealthSvc["AiHealthService (Liveness vs Readiness)"]
        ProviderClient["AiProviderClient (HTTP Client, Header Scoping, Timeout)"]
        PrismaService["PrismaService (Conditional Persistence Layer)"]
    end

    subgraph Hosted AI Tier ["Hosted AI Model API (FastAPI / Render Free Tier)"]
        FastAPI["https://aapadamitra-model-api.onrender.com"]
        CycloneModel["Cyclone Model v3.0 (PROMOTED TO PRODUCTION)"]
        FloodModel["Flood Discharge RF v3.0 (DEMONSTRATION ONLY)"]
        LandslideModel["Landslide Calibrated RF v3.0 (DEMONSTRATION ONLY)"]
        TsunamiModel["Tsunami Classifier RF v3.0 (DEMONSTRATION ONLY)"]
    end

    subgraph Data Tier ["Primary Storage Layer"]
        Postgres[("PostgreSQL / PostGIS (Docker / Local)")]
    end

    UI -->|1. REST Request (No API Key)| AICtrl
    AICtrl --> Guard
    Guard --> AISvc
    AISvc --> TriggerSvc
    AISvc --> ProviderClient
    ProviderClient -->|2. Outbound HTTPS with X-API-Key| FastAPI
    FastAPI --> CycloneModel
    FastAPI --> FloodModel
    FastAPI --> LandslideModel
    FastAPI --> TsunamiModel
    AISvc -->|3. Conditional Persist (If Online)| PrismaService
    PrismaService --> Postgres
    AISvc -->|4. Normalized Response with Disclaimers| AICtrl
    AICtrl -->|5. Display Advisory Output| UI
```

### Key Architectural Guardrails
1. **Zero Direct Frontend Calls:** The browser never invokes `https://aapadamitra-model-api.onrender.com` directly. All requests pass through NestJS.
2. **Zero Key Exposure:** The `AI_MODEL_API_KEY` is loaded only in backend environment variables. It is never emitted to browser bundles, React code, logs, or error responses.
3. **Selective Header Attachment:** The `X-API-Key` header is attached strictly to protected prediction POST endpoints (`/api/v1/*/predict`). Public metadata routes (`/health`, `/models`, `/api/v1/hazards`, `/model-info`) are requested without credentials.
4. **Resilient Free-Tier Handling:** Render free-tier instances may sleep. Requests incorporate configurable timeouts (`AI_MODEL_API_TIMEOUT_MS=15000`), bounded retry, and clear provider-offline error categorization.

---

## 2. Hosted API Contract Mapping & Audit Reconciliations

### Live Verified Endpoints
During Phase A audit, live queries to `https://aapadamitra-model-api.onrender.com` confirmed:
* `GET /openapi.json` $\rightarrow$ Valid OpenAPI 3.1.0 schema (11 operational paths).
* `GET /health` $\rightarrow$ `HTTP 200 OK` (`status: "HEALTHY"`, `model_version: "v3.0"`).
* `GET /models` $\rightarrow$ Detailed registry metadata.
* `GET /api/v1/hazards` $\rightarrow$ Multi-hazard catalog.
* `GET /api/v1/{cyclone|flood|landslide|tsunami}/model-info` $\rightarrow$ In-depth model architectures, training splits, and metrics.

### Model Governance Discrepancy Reconciliation
* **Discrepancy:** The hosted `/models` and `/api/v1/hazards` endpoints report `active_hazard_count: 1` alongside `demonstration_hazard_count: 4` (total hazards = 4).
* **Explanation for API Owner:** All four models currently have `demo_enabled: true` in the backend provider database. However, under Phase 3 scientific audit governance, **Cyclone v3.0** is the **sole production-promoted model**. Flood, Landslide, and Tsunami are strictly demonstration research models.
* **Reconciliation:** NestJS normalizes this metadata by maintaining explicit `is_demonstration_only` flags and applying bold `DEMONSTRATION ONLY` labels in UI contracts.

---

## 3. Hazard Feature Readiness Matrix

A hosted prediction endpoint requires specific environmental and telemetry features in its POST request body. The table below audits current AAPADAMITRA feature readiness:

| Hazard | Required Input Feature | Unit / Range | Target Statutory / Provider Source | AAPADAMITRA Pipeline Status | Readiness Category |
|---|---|---|---|---|---|
| **Cyclone** | `current_latitude` | $-90^\circ$ to $+90^\circ$ | IMD GTS / RSMC Cyclone Bulletins | Telemetry parser planned | `PARTIAL` |
| | `current_longitude` | $-180^\circ$ to $+180^\circ$ | IMD GTS / RSMC Cyclone Bulletins | Telemetry parser planned | `PARTIAL` |
| | `current_wind_speed_kts_3min` | $10 - 200$ kts | IMD Dvorak T-number / NWP | External ingest required | `EXTERNAL_PENDING` |
| | `current_central_pressure_hpa` | $850 - 1050$ hPa | IMD Automated Weather Stations | External ingest required | `EXTERNAL_PENDING` |
| | `dist2land_km` | $0 - 5000$ km | GIS Coastline Computation (PostGIS) | Calculable from PostGIS | `DERIVED_CAPABLE` |
| | `translation_speed_kts` | $0 - 100$ kts | Track Kinematics ($\Delta \text{dist} / \Delta t$) | Calculable from track history | `DERIVED_CAPABLE` |
| | `heading_degrees` | $0^\circ - 360^\circ$ | Azimuthal Track Kinematics | Calculable from track history | `DERIVED_CAPABLE` |
| | `sea_surface_temperature_c` | $10 - 40 ^\circ\text{C}$ | NOAA OISST / INCOIS Satellite SST | Gridded ingest required | `EXTERNAL_PENDING` |
| | `vertical_wind_shear_kts` | $0 - 150$ kts | GFS / ECMWF 200–850 hPa Wind Shear | Gridded NWP ingest required | `EXTERNAL_PENDING` |
| | `relative_humidity_700hpa_pct`| $0 - 100\%$ | GFS / ECMWF Mid-troposphere RH | Gridded NWP ingest required | `EXTERNAL_PENDING` |
| **Flood** | `q_t` (Current Discharge) | $\text{m}^3/\text{s}$ ($\ge 0$) | CWC Gauging Station Telemetry | Gauge connector required | `EXTERNAL_PENDING` |
| | `q_lag1` ($t - 1$ Discharge) | $\text{m}^3/\text{s}$ ($\ge 0$) | Local Observation DB (Historical) | Schema supported (`Observation`) | `STORAGE_READY` |
| | `q_lag2` ($t - 2$ Discharge) | $\text{m}^3/\text{s}$ ($\ge 0$) | Local Observation DB (Historical) | Schema supported (`Observation`) | `STORAGE_READY` |
| | `q_lag3` ($t - 3$ Discharge) | $\text{m}^3/\text{s}$ ($\ge 0$) | Local Observation DB (Historical) | Schema supported (`Observation`) | `STORAGE_READY` |
| | `zero_gauge_m` | Meters AMSL | CWC Station Metadata | Static station property | `STORAGE_READY` |
| | `catchment_sqkm` | $\text{km}^2$ | CWC Basin Atlas / PostGIS Area | Static basin property | `STORAGE_READY` |
| **Landslide**| `elevation_dem_m` | $-500$ to $9000$ m | CartoDEM / ALOS 30m DEM | DEM raster pipeline required | `EXTERNAL_PENDING` |
| | `slope_degrees` | $0^\circ - 90^\circ$ | Derived from DEM ($1^{\text{st}}$ derivative) | DEM processing required | `DERIVED_CAPABLE` |
| | `aspect_degrees` | $0^\circ - 360^\circ$ | Derived from DEM (Compass direction)| DEM processing required | `DERIVED_CAPABLE` |
| | `profile_curvature` | $-100$ to $+100$ | Derived from DEM ($2^{\text{nd}}$ derivative) | DEM processing required | `DERIVED_CAPABLE` |
| | `topographic_wetness_index` | $0 - 35$ | TWI = $\ln(a / \tan \beta)$ | DEM processing required | `DERIVED_CAPABLE` |
| | `antecedent_rainfall_3d_mm` | $0 - 2000$ mm | IMD AWS / GPM Satellite IMERG | Rainfall aggregator required | `EXTERNAL_PENDING` |
| | `antecedent_rainfall_7d_mm` | $0 - 3000$ mm | IMD AWS / GPM Satellite IMERG | Rainfall aggregator required | `EXTERNAL_PENDING` |
| | `soil_moisture_0_7cm_m3m3` | $0 - 1\text{ m}^3/\text{m}^3$ | SMAP / ERA5-Land Reanalysis | Soil grid ingest required | `EXTERNAL_PENDING` |
| | `soil_moisture_rootzone_m3m3`| $0 - 1\text{ m}^3/\text{m}^3$ | SMAP / ERA5-Land Reanalysis | Soil grid ingest required | `EXTERNAL_PENDING` |
| **Tsunami** | `magnitude` | $4.0 - 10.0\text{ Mw}$ | INCOIS-ITEWC / USGS Quake Feed | Seismic feed connector needed | `EXTERNAL_PENDING` |
| | `focal_depth_km` | $0 - 700$ km | INCOIS-ITEWC / USGS Quake Feed | Seismic feed connector needed | `EXTERNAL_PENDING` |
| | `epicenter_latitude` | $-90^\circ$ to $+90^\circ$ | INCOIS-ITEWC / USGS Quake Feed | Seismic feed connector needed | `EXTERNAL_PENDING` |
| | `epicenter_longitude` | $-180^\circ$ to $+180^\circ$ | INCOIS-ITEWC / USGS Quake Feed | Seismic feed connector needed | `EXTERNAL_PENDING` |
| | `gebco_bathymetry_m` | $-12000$ to $+100$ m | GEBCO 15-arc-second Grid | Bathymetry lookup service | `EXTERNAL_PENDING` |
| | `distance_to_nearest_coast_km`| $0 - 20000$ km | PostGIS `ST_Distance(epicenter, coastline)` | Spatial geometry lookup | `DERIVED_CAPABLE` |

> [!CRITICAL]
> Because upstream external connectors (IMD GTS, CWC telemetry, CartoDEM raster, USGS feed) are not yet fully piped into NestJS, **automatic prediction execution is default-disabled for all four hazards** in `AiTriggerService`. Missing features are never fabricated with arbitrary zeros.

---

## 4. Model Governance & Non-Negotiable Safety Boundaries

### Statutory Authority Alignment
Under the Disaster Management Act, 2005 and national standard operating procedures:
* **Cyclone:** Official warnings and track bulletins are issued exclusively by **IMD RSMC New Delhi**.
* **Flood:** Official river stage and flood advisories are issued exclusively by **Central Water Commission (CWC)**.
* **Landslide:** National slope susceptibility warnings are issued exclusively by **Geological Survey of India (GSI)**.
* **Tsunami:** Indian Ocean tsunami bulletins and watches are issued exclusively by **INCOIS - ITEWC**.

### Mandatory Safety Guardrails
1. **No Autonomous Alerts:** AAPADAMITRA predictions will **NEVER** autonomously generate public alert notifications, push messages, or SMS broadcasts.
2. **No Evacuation Triggers:** Model inferences must not initiate automated evacuation directives.
3. **No Infrastructure Actuation:** Model outputs must never automate dam spillway gate operations, weir sluice movement, or electrical sub-station disconnects.
4. **Mandatory Human-in-the-Loop:** All downstream operational responses require manual review, cross-verification with official statutory bulletins, and approval by authorized emergency personnel (`ALERT_APPROVER`).

---

## 5. Manual & Automatic Trigger Workflows

### Manual Trigger Flow
1. User with authorized operational role (`CONTROL_ROOM_OPERATOR`, `ALERT_APPROVER`, `ADMIN`) submits input via Dashboard.
2. NestJS `AiAuthorizationGuard` validates permissions.
3. NestJS `ValidationPipe` checks payload against strict class-validator DTO constraints (rejecting NaN, infinities, out-of-range bounds).
4. `AiTriggerService` computes deterministic SHA-256 snapshot fingerprint and logs manual trigger event.
5. `AiProviderClient` dispatches authenticated HTTPS POST request with `X-API-Key` to hosted FastAPI endpoint.
6. `AiService` normalizes response, attesting model governance, scientific caveats, and statutory disclaimers.
7. `PrismaService` conditionally writes prediction record if PostgreSQL is reachable.
8. Normalized JSON is delivered to the frontend client.

### Automatic Trigger Guardrails
* **Deduplication:** Computes SHA-256 fingerprint on invariant feature subsets. Identical snapshots arriving within the cooldown window (30 to 720 minutes depending on hazard) are skipped with code `DUPLICATE_SNAPSHOT`.
* **Staleness Check:** Observations older than the maximum allowable age (e.g. 6 hours for Cyclone, 2 hours for Tsunami) are rejected with code `STALE_DATA`.
* **Disabled-by-Default:** Per-hazard auto-triggers remain dormant (`skipCode: DISABLED`) until upstream telemetry pipelines are certified.

---

## 6. Security & Credential Hygiene

1. **Compromised Key Rotation:** The previously shared static key is invalidated. The hosted service must use a rotated key configured in Render environment variables.
2. **Local Environment:** Configured via `apps/api/.env` (`AI_MODEL_API_KEY=`). The `.env` file is strictly excluded by `.gitignore` and has never been committed to Git.
3. **Audit History:** Verified `git log --all --full-history -- "**.env*"` confirming zero credentials exist in repository history.
4. **Sanitized Error Output:** Internal HTTP timeouts, gateway failures, and database disconnection logs are sanitized before reaching external HTTP clients.

---

## 7. Testing & Verification Summary

* **Automated Test Suite:** Built with native Node.js 22 test runner (`node --test test/*.test.js`).
* **Test Count:** 26 tests across 10 suites.
* **Pass Rate:** **100% (26 / 26 passing)**.
* **Coverage Areas:**
  * Request DTO validation bounds & data type enforcement.
  * Governance constant immutability & safety flag checks.
  * Trigger deduplication, fingerprinting, and staleness rejection.
  * Authorization guard role whitelisting & citizen rejection.
  * Provider client error handling, key omission, and secret masking.
  * Service normalization across all four hazards with simulated responses.
  * Graceful fallback when PostgreSQL is disconnected (`persistence_status: 'DATABASE_UNAVAILABLE'`).

---

## 8. Architecture Decision Records (ADRs)

* **ADR-AI-001 (Independent FastAPI Hosting):** Keep AI services deployed independently on Python/FastAPI rather than embedding Python engines in NestJS.
* **ADR-AI-002 (Reverse Proxy Architecture):** Route all frontend model invocations through NestJS to enforce RBAC, audit logging, and prevent API key leakage to browser clients.
* **ADR-AI-003 (Strict Governance Tiering):** Enforce distinction between production-promoted model (Cyclone) and demonstration models (Flood, Landslide, Tsunami).
* **ADR-AI-004 (Dual-State Persistence):** Prediction service functions seamlessly whether PostgreSQL is online (full relational persistence) or offline (stateless normalized response with `DATABASE_UNAVAILABLE` audit flag).
* **ADR-AI-005 (Disabled-by-Default Automated Ingestion):** Automatic prediction pipelines remain disabled until verified statutory telemetry connectors are implemented.
