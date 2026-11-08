# AAPADAMITRA — Architectural Design Document

## 1. Executive Summary

**AAPADAMITRA** is an open, modular, multi-hazard disaster management and emergency coordination platform. It is engineered to unify early warning systems, hydrological modeling, citizen alerts, emergency responder dispatching, and infrastructure monitoring into a cohesive digital platform.

While the validation pilot focuses on the **Vishnupuri Dam** in Nanded district, Maharashtra, the core architecture is strictly generalized across hazard domains (floods, cyclones, earthquakes, landslides, industrial accidents) and geographic regions.

---

## 2. High-Level System Architecture

```text
+------------------------------------------------------------------+
|                     Client Presentation Tier                     |
|  - apps/web (React 18 + TypeScript + Vite)                       |
|  - Future Mobile/Citizen PWA                                     |
+---------------------------------+--------------------------------+
                                  |
                        REST / HTTP / WebSocket
                                  |
                                  v
+------------------------------------------------------------------+
|                      Core API Gateway & Orchestrator             |
|  - apps/api (NestJS + TypeScript)                                |
|  - Global prefix: /api/v1                                        |
|  - OpenAPI / Swagger documentation: /api/docs                    |
|  - Modular sub-domains: Health, Hazards, Telemetry, Alerts       |
+-------------------+------------------------------------+---------+
                    |                                    |
          HTTP / Async Jobs                        SQL / PostGIS
                    |                                    |
                    v                                    v
+---------------------------------------+  +-----------------------+
|          AI & Simulation Tier         |  |      Data Layer       |
|  - services/ai-engine (FastAPI)       |  |  - PostgreSQL         |
|  - Hydrological models & inference    |  |  - Spatial (PostGIS)  |
|  - Modular per-hazard service modules |  |  - Redis (future)     |
+---------------------------------------+  +-----------------------+
```

---

## 3. Technology Stack Rationale

| Layer | Technology | Decision Driver |
|---|---|---|
| **Frontend** | React + TypeScript + Vite | Component modularity, rich geospatial visualization support, rapid HMR in development. |
| **Backend API** | NestJS + Node.js | Strict modularity, TypeScript type-safety, built-in dependency injection, native OpenAPI integration. |
| **Shared Contracts** | TypeScript Package (`@aapadamitra/contracts`) | Single source of truth for cross-tier data transfer objects and interfaces. |
| **AI / Machine Learning** | Python + FastAPI | Scientific Python ecosystem (NumPy, SciPy, PyTorch, GDAL), asynchronous high-throughput inference API. |
| **Database (Planned)** | PostgreSQL + PostGIS | Enterprise spatial queries, ACID compliance, proven reliability for civil defense infrastructure. |
| **Package Management** | pnpm Workspaces | Fast, disk-efficient symlinked node_modules, seamless monorepo dependency tracking. |

---

## 4. Multi-Hazard Architectural Principles

1. **Domain Abstraction:** Incidents, sensors, alert thresholds, and evacuations inherit from abstract disaster contracts rather than dam-specific models.
2. **Pluggable Hazard Modules:** Future hazard engines (cyclone tracking, earthquake seismology, flood routing) plug into the AI service through unified inference interfaces.
3. **Decoupled AI Engine:** The Python AI service communicates via standardized REST endpoints and contract schemas, preventing tight framework coupling with the Node.js backend.

