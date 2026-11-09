AAPADAMITRA

SYSTEM ARCHITECTURE DOCUMENT

Version 1.0  |  08 November 2026

Multi-Hazard Disaster Management & Emergency Coordination Platform

Initial pilot: Vishnupuri Dam, Nanded district, Maharashtra

Status: Proposed architecture baseline — pending detailed review

Document Control

| Field | Value |
| --- | --- |
| Document ID | AAP-SAD-001 |
| Version / date | 1.0 / 08 November 2026 |
| Status | Proposed baseline for team review |
| Product | AAPADAMITRA |
| Initial geography | Nanded district, Maharashtra, India |
| Initial pilot | Vishnupuri Dam and relevant upstream/downstream observation points |
| Audience | Product owner, software developers, AI/ML developers, reviewers and future pilot stakeholders |
| Related documents | PRD v1.0; SRS v1.0; AI/ML Technical Design; Database Design; API Specification |

Revision History

| Version | Date | Description |
| --- | --- | --- |
| 1.0 | 08-Nov-2026 | Initial architecture baseline based on approved product, AI and technology decisions. |

Approval Status

This document records agreed direction and proposed implementation details. Only decisions explicitly approved by the product team should be treated as locked. Items marked 'Proposed' or 'To decide' require review before implementation.

1. Purpose and Scope

This System Architecture Document (SAD) defines the logical structure, major components, responsibilities, interfaces, deployment principles and key architectural decisions for AAPADAMITRA.

AAPADAMITRA is intended to connect authorized authorities, infrastructure operators, emergency responders and citizens through coordinated workflows spanning prevention and mitigation, preparedness, prediction and monitoring, alerting, response, and recovery.

1.1 In scope

React-based web application with a Progressive Web App experience for citizens and role-specific interfaces.

NestJS modular-monolith backend for core business workflows and APIs.

PostgreSQL as the primary operational database, with PostGIS recommended for geospatial capabilities.

A separately deployable Python AI service, with FastAPI proposed, for hazard-specific model inference.

Initial flood forecasting and dam intelligence capabilities, using Vishnupuri Dam as the first pilot.

Integration boundaries for weather data, maps/geocoding, notification providers, sensor gateways and object storage.

Cloud deployment, observability, security, auditability, backup and recovery principles.

1.2 Out of scope for this architecture baseline

A claim that all proposed integrations, sensors, datasets or models are currently available or operational.

Autonomous public emergency warnings, evacuation orders, disaster declarations or dam-gate control.

Replacing official government alerting systems or authority decision-making processes.

A nationwide production rollout or 24×7 emergency-service operating commitment.

A mandatory full microservices architecture at the initial stage.

2. Architectural Drivers and Constraints

| Driver | Architectural implication |
| --- | --- |
| Competition delivery and four-person team | Prefer a modular monolith for core workflows; avoid premature service proliferation. |
| Multi-hazard expansion | Keep hazard-specific intelligence and hazard domain rules modular behind stable contracts. |
| Geospatial workflows | Use PostgreSQL with PostGIS as the preferred operational geospatial store. |
| Human-authorized emergency decisions | Separate model recommendations from alert approval and dissemination permissions. |
| Data uncertainty and uneven availability | Track provenance, timestamp, freshness, quality, missingness and synthetic/real status. |
| Initial Vishnupuri pilot | Support dam/river assets and observation stations without hard-coding one dam into the domain model. |
| Cloud-first deployment | Containerize applications and keep configuration/secrets external to source code. |

3. Confirmed Decisions and Proposed Choices

| Area | Decision | Status |
| --- | --- | --- |
| Product direction | Multi-hazard disaster management and emergency coordination | Approved |
| Lifecycle | Prevent & Mitigate; Prepare; Predict & Monitor; Alert & Communicate; Respond; Recover & Learn | Approved |
| Initial geography | Nanded district, Maharashtra | Previously established |
| Pilot | Vishnupuri Dam first; architecture expandable to other dams | Approved |
| Frontend | React | Approved |
| Backend | NestJS / Node.js | Approved |
| Core architecture | Modular monolith plus separately deployable AI service | Approved direction |
| Primary database | PostgreSQL | Approved |
| Geospatial extension | PostGIS | Recommended; confirm |
| AI service framework | Python + FastAPI | Proposed |
| ORM | Prisma | Proposed |
| PWA tooling | Vite + PWA plugin or equivalent | Proposed |
| Cache / job queue | Redis + BullMQ when asynchronous jobs are needed | Optional proposal |
| Cloud provider | Not selected | To decide |

4. Architecture Overview

The system is organized into four major layers: user experience, core application services, intelligence services, and data/integration infrastructure.

4.1 Logical component view

CITIZEN PWA       AUTHORITY DASHBOARD       RESPONDER INTERFACE      \                    |                       /                 HTTPS / REST API                         |                NESTJS CORE APPLICATION     Auth | Users | Geography | Hazards | Assets | Observations     Incidents | SOS | Alerts | Response | Recovery | Audit             /              |                 \            /               |                  \   PostgreSQL + PostGIS   Python AI API     Integration adapters   operational records   flood/dam models   weather/maps/notifications            |               |                  |       backups/indexes   model artifacts    external providers

The diagram is conceptual. It does not prescribe a specific cloud vendor, network topology or final deployment sizing.

4.2 Presentation layer

React + TypeScript is the selected frontend direction.

The citizen experience should be installable as a PWA and usable on common mobile browsers.

Authority and responder experiences may share a frontend codebase while applying role- and permission-specific navigation and actions.

The frontend must not be trusted to enforce authorization; all permissions must be checked by the backend.

Offline behavior, if introduced, must clearly distinguish queued citizen reports from confirmed server-side submissions.

4.3 Core backend layer

NestJS hosts the core application as a modular monolith. Modules are separated by domain responsibility and communicate through explicit service interfaces or application events. Modules should not directly manipulate another module's internal tables or bypass its business rules.

| Backend module | Primary responsibility |
| --- | --- |
| Auth & Identity | Authentication, sessions/tokens, roles, permissions and account lifecycle. |
| Organizations | Agency, department, operator and responder organization records. |
| Geography | District/taluka/village references, locations, zones and geospatial queries. |
| Hazards | Hazard catalogue, hazard-specific configuration and classifications. |
| Infrastructure | Dams, river segments, stations and other critical assets. |
| Observations | Validated observations, source metadata, timestamps and data-quality flags. |
| Intelligence | AI job orchestration, risk assessments, model metadata and prediction history. |
| Incidents | Incident creation, triage, status transitions and ownership. |
| SOS & Citizen Reports | Citizen-originated emergency requests and public reports. |
| Alerts | Drafting, review, approval, targeting, delivery and cancellation workflow. |
| Response | Teams, resources, dispatch assignments and operational status. |
| Recovery | Damage assessment, relief requests, allocations and recovery tracking. |
| Notifications | Provider adapters and delivery status handling. |
| Analytics & Audit | Operational summaries, immutable-style audit events and reports. |

4.4 AI / intelligence layer

AI capabilities are hazard-specific. The initial release prioritizes river flood forecasting and dam intelligence. The AI service is separately deployable to isolate Python dependencies, model runtimes and model release cycles from the NestJS application.

NestJS remains the system orchestrator and source of truth for access control and persisted business records.

The AI service receives validated, purpose-limited input payloads and returns structured results with model/version, data timestamp, horizon, quality indicators and limitations.

The AI service must not directly send citizen notifications or approve alerts.

The AI service should not connect directly to the production database in the initial design.

If model inference is unavailable, the core application must remain usable and show an explicit unavailable/stale state; approved rule-based checks may remain available where designed.

5. Data Architecture

5.1 Primary data store

PostgreSQL is the primary transactional database. PostGIS is recommended to support point, line and polygon data and spatial operations such as point-in-zone, distance searches and affected-area intersection.

The database should preserve relational integrity for users, organizations, incidents, alerts, assignments, infrastructure assets, observations and audit records. Spatial fields should use appropriate SRIDs and documented coordinate conventions.

5.2 Data ownership principles

The NestJS application owns operational records and controls all authorized writes.

AI model artifacts and training datasets should be stored in controlled object storage or a versioned model/data repository, not as large binary blobs in transactional tables.

Prediction outputs should be persisted as versioned assessment records linked to the input observation window and model version.

Raw observations should retain source, observed_at, ingested_at, unit, validation status and provenance.

Synthetic observations must carry an explicit synthetic indicator and must never be presented as real measurements.

5.3 Core data domains

| Domain | Representative entities |
| --- | --- |
| Identity | User, Role, Permission, Organization, Membership |
| Geography | AdministrativeArea, GeoZone, Location |
| Hazard | HazardType, HazardConfiguration |
| Infrastructure | InfrastructureAsset, Dam, RiverSegment, MonitoringStation |
| Monitoring | Observation, DataSource, Sensor, DataQualityRecord |
| Intelligence | Model, ModelVersion, PredictionRun, RiskAssessment |
| Operations | Incident, IncidentReport, SOSRequest, Alert, AlertDelivery |
| Response | ResponseTeam, Resource, Assignment |
| Recovery | DamageAssessment, ReliefRequest, ReliefAllocation |
| Governance | AuditLog, ApprovalRecord, Attachment |

6. Key Runtime Workflows

6.1 Flood / dam intelligence workflow

An authorized provider, operator or sensor gateway submits an observation.

The backend authenticates the source, validates schema, units, timestamps and asset association, then records the observation and quality status.

A scheduled or event-triggered backend process determines whether an inference run is warranted.

NestJS builds a versioned request and calls the AI service with the required observations, asset metadata and forecast horizons.

The AI service returns forecasts and assessment metadata, including model version, data window, quality warnings and uncertainty information where available.

NestJS validates the response and persists it as a prediction/risk-assessment record.

The authority dashboard displays the assessment as decision support, not as a confirmed event or instruction.

An authorized official independently reviews evidence and may initiate the alert workflow under configured permissions.

6.2 Alert authorization workflow

An authorized user creates an alert draft linked to a hazard, incident or risk assessment.

The system validates target geography, message content, severity, validity period and supporting evidence.

A reviewer/approver with the required permission approves, rejects or requests changes.

Only an approved alert can be handed to configured delivery adapters.

Delivery attempts, provider responses, failures and cancellations are recorded.

The system displays delivery status without implying that every recipient received or acted on the alert.

6.3 Citizen SOS workflow

The citizen submits an SOS request with available location, category and optional details.

The backend records the request and returns a submission identifier and current status.

Authorized coordinators triage, verify where possible, and assign responders/resources.

Status changes and actions are auditable; the citizen sees only information permitted for public access.

7. Interface and Communication Design

| Interface | Protocol / pattern | Design notes |
| --- | --- | --- |
| Browser/PWA to NestJS | HTTPS REST; JSON | Version API routes; validate all inputs; document with OpenAPI. |
| NestJS to AI service | Private HTTPS REST initially | Use service authentication, timeouts, bounded retries and schema versioning. |
| NestJS to PostgreSQL | TLS database connection | Use migrations, least-privilege DB role and connection pooling. |
| NestJS to job queue | Redis/BullMQ if adopted | Use idempotent jobs and dead-letter/retry strategy. |
| Provider integrations | Provider-specific HTTPS APIs/webhooks | Hide vendor specifics behind adapters. |
| Sensor ingestion | HTTPS/MQTT gateway as a future option | Do not expose database access to devices; authenticate and validate gateway messages. |

7.1 API principles

Use a consistent /api/v1 prefix for externally consumed REST endpoints.

Use stable resource identifiers and consistent pagination, filtering and error formats.

Use idempotency keys for operations where duplicate submissions could create harmful effects, such as SOS ingestion or provider delivery requests.

Use correlation/request IDs to trace a workflow across backend, AI and provider calls.

Never expose internal stack traces, secrets or sensitive operational metadata in public API responses.

7.2 AI request/response contract principles

The detailed JSON schema belongs in the API Specification and AI/ML Technical Design. At minimum, each request should include request_id, asset/station identifiers, observation values with units and timestamps, requested horizons, data-quality metadata and schema_version. Each response should include model_id, model_version, generated_at, forecast entries, units, quality warnings, limitations and uncertainty fields where supported.

8. Security Architecture

Use role-based access control with granular permissions for sensitive actions; roles alone must not imply unrestricted access.

Enforce authorization server-side for every protected endpoint and every alert approval/delivery action.

Use secure password hashing, short-lived access tokens and a controlled refresh-token/session strategy.

Apply TLS in transit and encryption at rest where supported by the selected cloud/database services.

Store secrets in a cloud secret manager or protected deployment environment; never commit secrets to source control.

Apply rate limits and abuse controls to public-facing authentication, SOS and report endpoints.

Record security-sensitive actions, approval decisions, model releases and alert delivery events in audit logs.

Minimize citizen personal data, restrict access, define retention and deletion rules, and avoid exposing reporter identity unnecessarily.

Separate development, staging and production environments and credentials.

This SAD provides architectural controls, not a completed security certification or legal compliance assessment.

9. Deployment Architecture

The system is cloud-first and container-friendly. The cloud provider and exact service sizing remain undecided.

Internet  |HTTPS entry point / managed load balancer  |  +---- React static assets / PWA hosting + CDN  |  +---- NestJS API container(s)  |        |---- PostgreSQL + PostGIS (managed DB preferred)  |        |---- Redis / queue (optional)  |        |---- Object storage  |        |---- External provider APIs  |  +---- Python FastAPI AI container(s)           |---- Versioned model artifacts           |---- Controlled inference logs/metrics

9.1 Environment strategy

| Environment | Purpose | Data policy |
| --- | --- | --- |
| Development | Local developer workflows and integration | Synthetic or approved test data only. |
| Staging | Pre-release validation and end-to-end testing | Masked or synthetic data; restricted access. |
| Production / pilot | Controlled pilot operations | Authorized operational data, access controls, backups and monitoring. |

9.2 Container and release principles

Provide separate Docker images for web build/hosting, NestJS API and Python AI service.

Pin dependencies and use reproducible build steps.

Run database migrations as a controlled release step with backup and rollback planning.

Use health/readiness checks and graceful shutdown.

Keep configuration environment-specific and external to images.

Deploy backward-compatible API/database changes where feasible; document any breaking migration.

10. Reliability, Performance and Observability

| Concern | Architectural approach |
| --- | --- |
| AI service outage | Core platform remains available; show inference unavailable and last successful result timestamp. |
| External provider outage | Adapter-level timeout, bounded retry, delivery status and manual fallback process. |
| Duplicate messages/jobs | Idempotency keys and deduplication at workflow boundaries. |
| Database failure | Managed database where feasible, automated backups and tested restore process. |
| Slow inference | Timeouts, asynchronous jobs for longer runs and explicit processing status. |
| Traceability | Structured logs, correlation IDs, metrics and audit events. |
| Stale data | Freshness thresholds and visible stale/unknown states; never silently treat stale values as current. |

10.1 Observability minimum

Application logs in structured format with request/correlation ID.

Metrics for API latency, error rate, queue depth, database health and AI inference latency/failure.

AI metrics for model version usage, prediction volume, input data quality and validation performance.

Alerts for critical service failures, backup failures and repeated provider delivery errors.

No secrets, passwords, tokens or unnecessary citizen personal data in logs.

11. AI Safety and Operational Boundaries

Forecasts and risk scores are decision-support outputs, not official warnings or guaranteed outcomes.

The platform must distinguish observation, forecast, model inference, operator assessment and approved alert.

No autonomous dam-gate actuation, evacuation order, disaster declaration or public alert publication.

A risk score from 0–100, if used, is an index unless calibrated and validated as a probability; it must not be labelled as probability by default.

Model performance must be measured on independent time-based test data and reported by forecast horizon and relevant event conditions.

Synthetic-data performance must not be represented as real-world predictive accuracy.

When input data is missing, stale, out of range or inconsistent, the system must flag the limitation and suppress unsupported confidence claims.

Operational thresholds and safety procedures must be reviewed by competent domain authorities before any real pilot use.

12. Architecture Quality Attributes

| Attribute | Target design principle | Verification approach |
| --- | --- | --- |
| Maintainability | Domain modules with explicit ownership and interfaces. | Code review; module boundary tests. |
| Scalability | Scale API and AI workloads independently when required. | Load tests and deployment metrics. |
| Availability | Graceful degradation for non-core dependencies. | Failure-injection and recovery tests. |
| Security | Least privilege, server-side authorization and audited approvals. | Security tests and access-control test matrix. |
| Interoperability | Versioned REST contracts and provider adapters. | Contract tests. |
| Data integrity | Relational constraints, validation and provenance. | Migration, validation and consistency tests. |
| Explainability | Expose model version, inputs window, limitations and warnings. | Prediction record inspection and UI review. |
| Portability | Containerized services and infrastructure configuration. | Deploy to clean environment from documented steps. |

13. Architecture Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Insufficient real hydrological data | Forecast models may not generalize or validate. | Data inventory first; synthetic data only for pipeline/demo; seek authorized historical records. |
| Incorrect assumptions about travel time | Downstream arrival estimates may be unsafe. | Treat field estimates as hypotheses; obtain measured data and hydrological validation. |
| Overengineering with microservices | Delivery and operations burden for a small team. | Start with modular monolith; extract only when justified by scaling/ownership needs. |
| Poor geospatial source data | Incorrect affected-area and proximity results. | Validate boundaries, coordinate reference systems and source quality. |
| External notification failure | Alerts may not reach recipients. | Track provider delivery, support fallback channels and never equate API acceptance with receipt. |
| Unauthorized alert publication | Potential public harm and loss of trust. | Permission checks, multi-step approval, audit trail and negative tests. |
| Model service failure | Forecast unavailable. | Graceful degradation, timeouts, monitoring and clear unavailable state. |
| Sensitive citizen data exposure | Privacy and safety harm. | Minimize data, restrict access, retention controls and secure logging. |

14. Implementation Sequence

| Phase | Focus | Exit criteria |
| --- | --- | --- |
| A — Foundation | Repository, environments, CI checks, auth skeleton, database migrations | Team can build, run and deploy a basic end-to-end slice. |
| B — Core platform | Users/roles, geography, assets, observations, incidents | Core records and role-protected workflows work. |
| C — Intelligence | AI service contract, flood/dam data pipeline, baseline models | Inference can be run, stored, inspected and evaluated with provenance. |
| D — Alerts and response | Alert approvals, citizen SOS, assignments, notifications | Authorized workflow passes end-to-end tests. |
| E — Pilot hardening | GIS validation, security, observability, backup/restore, user testing | Documented pilot acceptance criteria are met. |

The competition demonstration may use a narrower vertical slice. The demo must label simulated data and incomplete integrations accurately; it must not imply operational deployment.

15. Open Architecture Decisions

| ID | Decision required | Current recommendation / next action |
| --- | --- | --- |
| ADR-001 | Cloud provider and region | Compare cost, managed PostgreSQL/PostGIS, object storage, secrets and deployment simplicity. |
| ADR-002 | PostGIS adoption | Adopt unless a documented constraint emerges; validate hosting support. |
| ADR-003 | ORM and migrations | Prisma proposed; confirm support for required PostGIS features and use raw SQL where needed. |
| ADR-004 | AI service framework | FastAPI proposed; confirm team familiarity and inference workload. |
| ADR-005 | Queue/cache | Start without Redis unless asynchronous workloads require it; add BullMQ when justified. |
| ADR-006 | Authentication implementation | Choose managed identity vs application-managed auth after threat and delivery review. |
| ADR-007 | Weather and notification providers | Select only after availability, terms, coverage, cost and integration testing. |
| ADR-008 | Realtime updates | Begin with polling or server-sent events if needed; evaluate WebSockets only for concrete use cases. |
| ADR-009 | Data retention and privacy | Define policy with stakeholder and applicable legal review before real citizen data collection. |

16. Acceptance Checklist for This SAD

☐ The team agrees on the modular-monolith core and separate AI-service boundary.

☐ PostgreSQL is the primary operational database; PostGIS decision is recorded.

☐ Each backend module has a clear responsibility and data ownership boundary.

☐ AI outputs are separated from official alert authorization.

☐ Observation and prediction provenance, timestamps and data-quality status are represented.

☐ Cloud deployment environments and secret-management approach are documented.

☐ Failure behavior is defined for AI, database and external notification dependencies.

☐ Open architecture decisions have owners and target review dates.

Appendix A — Glossary

| Term | Meaning |
| --- | --- |
| PWA | Progressive Web App; a web application with installable/app-like capabilities. |
| NestJS | Node.js framework used for the modular core backend. |
| PostGIS | PostgreSQL extension for storing, indexing and querying geospatial data. |
| Inference | Using a trained model to generate an output from input data. |
| Observation | A measured or reported value, distinct from a forecast. |
| Prediction run | A recorded execution of a specific model version on a defined input window. |
| RBAC | Role-based access control; permissions assigned through roles and policies. |
| Graceful degradation | Keeping essential functions available when a dependent component fails. |

Appendix B — Review Notes

Recommended review order: (1) confirmed decisions and open decisions; (2) logical component boundaries; (3) data ownership and geospatial approach; (4) AI and alert safety boundaries; (5) deployment and reliability. Update this document after each approved architectural decision and maintain a corresponding decision record.