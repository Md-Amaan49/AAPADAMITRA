AAPADAMITRA

Architecture Consistency Review& Final Technical Blueprint

Document 11  |  Version 1.0  |  08 November 2026

Multi-Hazard Disaster Management & Emergency Coordination Platform

Implementation reference for the Nanded district pilot

Document Control

| Field | Value |
| --- | --- |
| Document ID | AAPADAMITRA-DOC-11 |
| Title | Architecture Consistency Review & Final Technical Blueprint |
| Version / Status | 1.0 / Baseline for implementation planning |
| Product | AAPADAMITRA — Multi-Hazard Disaster Management & Emergency Coordination Platform |
| Pilot geography | Nanded district, Maharashtra, India |
| Deployment target | Cloud-hosted; citizen experience delivered as a Progressive Web App (PWA) |
| Intended audience | Product owner, technical lead, frontend/backend engineers, AI/ML engineer, QA and deployment owner |
| Relationship to Documents 01–10 | Consolidating blueprint; implementation decisions here supersede inconsistent provisional examples, subject to formal change control |
| Important limitation | This is a synthesis of the established project decisions and document summaries. It is not a line-by-line audit of the source DOCX files. |

Revision History

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 08 Nov 2026 | Initial consolidated architecture baseline, decision register, module contracts and delivery plan. |

1. Executive Summary

AAPADAMITRA is a multi-hazard disaster-management and emergency-coordination platform intended to support the full disaster lifecycle: preparedness, monitoring, risk assessment, forecasting, authorized warning dissemination, citizen reporting, SOS intake, response coordination, and recovery tracking. The first implementation pilot is scoped to Nanded district, Maharashtra, with flood/dam risk as the first AI-enabled use case.

The recommended engineering approach is a modular monolith for the core platform, supported by independently deployable background workers and a separately isolated Python-based AI service where model/runtime needs justify it. This gives the four-person team clear module boundaries without the operational overhead of premature microservices. React PWA, NestJS, PostgreSQL/PostGIS, and a modular AI layer form the baseline.

The eight-day competition build must be treated as a demonstrable vertical slice, not a production-ready emergency service. It should demonstrate an end-to-end scenario with seeded or clearly labelled sample data, auditable human review of consequential alerts, and visible failure states. Field validation, official integrations, operational staffing, and safety certification remain outside the claim of a competition prototype.

2. Scope, Goals and Non-Goals

2.1 In scope

One integrated platform supporting multiple hazard categories, with flood/dam monitoring and risk forecasting prioritized for the pilot.

Role-based operational workflows for administrators, authorized officials, control-room operators, responders and citizens.

Geospatially aware incidents, affected areas, resources, shelters and response assignments.

Citizen-facing PWA for alerts, incident reporting and SOS submission, with clear connectivity and submission status.

AI/ML decision support with provenance, confidence/uncertainty, model version and human review.

Audit trails, notification records, operational dashboards, observability, backups and release controls.

2.2 Explicit non-goals for the eight-day build

No autonomous AI publication of official public warnings or direct control of dam gates, pumps or other critical infrastructure.

No claim of validated flood prediction accuracy without representative historical data, independent evaluation and field validation.

No nationwide production deployment, 24/7 staffed emergency operation, or guaranteed delivery through third-party SMS/push providers.

No microservices/Kubernetes platform unless a demonstrated requirement justifies the operational cost.

No replacement of official disaster-management authorities, emergency numbers or established command structures.

3. Architecture Decisions and Consistency Baseline

| Area | Baseline decision | Rationale / constraint |
| --- | --- | --- |
| Product scope | Full disaster lifecycle; multi-hazard platform | Keep the product model extensible; deliver flood/dam first. |
| Pilot | Nanded district, Maharashtra | Use district/tehsil/village boundaries and locally relevant data sources. |
| Client | React Progressive Web App | One responsive citizen and operational web foundation; role-specific views. |
| Backend | NestJS modular monolith | Strong module boundaries and testability without distributed-system overhead. |
| Database | PostgreSQL + PostGIS | Transactional workflows, relational integrity, spatial queries and geospatial indexing. |
| AI/ML | Modular Python service; internal service boundary | Separate model lifecycle/runtime while keeping AI replaceable and non-authoritative. |
| Integration style | Synchronous REST for commands/queries; queue/events for background work | Keep request paths predictable and long-running tasks asynchronous. |
| Data strategy | Hybrid: official/partner feeds plus approved internal and clearly labelled demo data | Track provenance, freshness, licence and confidence for every feed. |
| Hosting | Cloud deployment; provider not yet selected | Select only after checking India region/data-residency, managed PostGIS, security and cost. |
| Safety | Human approval for operationally consequential alerts | AI is decision support; preserve authorized human accountability. |
| Delivery | Eight-day integrated vertical slice | Prioritize end-to-end flow over breadth of incomplete screens. |

Consistency rule: the architecture is modular, not microservices-first. A module is a code and ownership boundary; it does not automatically imply a separately deployed service. Split a module into a service only when scale, security isolation, release independence or runtime requirements make that trade-off worthwhile.

4. Target Logical Architecture

| Layer | Components | Responsibilities |
| --- | --- | --- |
| Experience | React PWA; citizen and operations workspaces | Authentication, accessible workflows, maps, dashboards, offline-tolerant drafts, status feedback. |
| Edge / API | TLS ingress / reverse proxy; NestJS API | Routing, validation, authentication, authorization, rate limits, API versioning. |
| Core domain | Identity & Access; Geography; Hazard Monitoring; Forecast; Incident; Alert; Citizen Report & SOS; Resource & Shelter; Response; Notification; Audit | Authoritative business rules, state transitions, transactions and audit records. |
| Async processing | Queue; worker processes; scheduler | Feed ingestion, geospatial processing, alert delivery, retries, report processing and scheduled jobs. |
| AI decision support | Python model service / model jobs | Feature preparation, forecast inference, evaluation metadata, uncertainty and model versioning. |
| Data | PostgreSQL/PostGIS; object storage; optional cache | Transactional records, spatial data, media evidence, short-lived cache and durable audit. |
| Operations | Central logs, metrics, traces, alerting, backup and deployment pipeline | Reliability, incident diagnosis, controlled releases and recovery. |

Deployment shape for the pilot: one web frontend, one NestJS API deployment, one or more worker processes, one PostgreSQL/PostGIS database, object storage, and an internal AI runtime/job container if required. A managed queue/cache may be added when justified. Keep the AI service inaccessible directly from the public internet.

5. Module Boundaries and Ownership

| Module | Owns | Key interfaces / events |
| --- | --- | --- |
| Identity & Access | Users, roles, permissions, sessions, account status | REST auth endpoints; UserRoleChanged; audit events |
| Geography & GIS | District hierarchy, boundaries, locations, spatial reference rules | Geography query API; spatial lookup |
| Hazard Monitoring & Data Ingestion | Feed registry, source metadata, observations, freshness and validation | Ingest jobs; ObservationReceived; FeedHealthChanged |
| Forecast & Risk | Forecast runs, model metadata, risk layers, confidence and review state | Forecast API; ForecastGenerated; ForecastReviewed |
| Incident Management | Incident records, classification, severity, status and timeline | Incident API; IncidentStatusChanged |
| Alert Management | Draft/approved/published/withdrawn alert lifecycle and target geography | Alert API; AlertApproved; AlertPublished |
| Citizen Reports & SOS | Citizen submissions, evidence metadata, triage and acknowledgement | Report API; SOSReceived; ReportTriaged |
| Resources & Shelters | Responder/resource availability, shelter capacity and status | Resource API; ResourceAvailabilityChanged |
| Response Coordination | Tasks, assignments, dispatch status, operational updates | Task API; TaskAssigned; TaskStatusChanged |
| Notifications | Delivery preferences, provider adapters, attempts and receipts | Notification jobs; NotificationDeliveryUpdated |
| Audit & Governance | Append-only business audit trail, approvals and sensitive access events | Audit append interface; audit search with permission checks |

Module rules: a module owns its tables and state transitions; other modules call its application interface rather than writing its tables directly. Cross-module side effects are emitted as domain events after a successful transaction (transactional outbox recommended). Avoid circular module dependencies.

6. Core End-to-End Workflows

6.1 Flood/dam forecast to authorized public alert

Ingestion worker obtains a source observation or approved sample feed and records source, timestamp, unit, location, quality and freshness.

Validation checks schema, plausible ranges, duplicate records, timestamp ordering and source health; rejected data is retained with a reason where appropriate.

Forecast job builds features and invokes the internal AI service or baseline model; it stores forecast horizon, model version, input provenance, uncertainty and generated-at time.

Forecast/risk result is displayed to an authorized reviewer with map context, thresholds, supporting observations and known limitations.

An authorized official reviews, edits if necessary, approves or rejects the proposed alert. The approval identity and timestamp are audited.

Only the Alert Management workflow can publish an approved alert. Notifications are queued and delivery outcomes are recorded separately from publication.

The platform tracks acknowledgement, updates, expiry or withdrawal; a correction is a new auditable state transition, not silent mutation.

6.2 Citizen report / SOS to response task

Citizen submits a report or SOS with location (if permitted), category, description, timestamp and optional evidence.

API validates, rate-limits and records the submission; user receives a reference/status response even if downstream processing is delayed.

Triage queue presents the item to an authorized operator; duplicates, urgency and location quality are assessed.

Operator acknowledges, classifies and converts the item into an incident or links it to an existing incident.

Authorized coordinator creates and assigns a response task to an appropriate responder/resource.

Responder updates status and completion evidence; the incident timeline and citizen-facing status are updated subject to privacy policy.

6.3 Recovery and closure

Record impact assessments, relief/recovery activities, shelter/resource closure and unresolved needs.

Close an incident only through an authorized transition with a reason and timestamp.

Preserve operational history and metrics for after-action review; apply retention rules to personal data and media.

7. Data Architecture and Canonical Domain Model

Use relational integrity for operational records and PostGIS for geometry. Store timestamps in UTC; render in the user's/local operational timezone. Store quantities with explicit units and normalize source values at ingestion. Every external observation and forecast must carry provenance and freshness metadata.

| Entity group | Core entities (illustrative) | Key relationships / constraints |
| --- | --- | --- |
| Identity | User, Role, Permission, UserRole, Session | Users have scoped roles; least privilege; deactivate rather than hard-delete operational actors. |
| Geography | AdministrativeArea, Boundary, Location, Geofence | Administrative hierarchy; geometry uses declared SRID; spatial indexes on frequently queried geometry. |
| Data ingestion | DataSource, IngestionRun, Observation, DataQualityIssue | Observation links to source and location; store observed_at, received_at, unit, quality and raw reference. |
| AI/forecast | ModelVersion, ForecastRun, ForecastValue, RiskAssessment, ReviewDecision | Forecast links to model and input window; retain horizon, uncertainty, provenance and review status. |
| Operations | Incident, IncidentEvent, Report, SOSRequest, ResponseTask, Assignment | Incidents have status history; report may link to incident; assignments reference actor/resource. |
| Alerting | Alert, AlertVersion, AlertTarget, Approval, NotificationAttempt | Publication requires approval; target geometry/scope explicit; delivery attempts separate from alert state. |
| Resources | Resource, ResourceType, Shelter, ShelterCapacitySnapshot | Availability and capacity are time-sensitive; record who updated and when. |
| Governance | AuditEvent, Attachment, Consent/Preference, RetentionRecord | Sensitive access and state changes are auditable; media stored outside database with controlled metadata. |

7.1 Data integrity rules

Use UUID primary keys for externally referenced records; use foreign keys and appropriate unique constraints.

Use created_at, updated_at, created_by and status fields consistently; add version/optimistic concurrency for high-conflict workflows.

Use explicit status enums or constrained reference tables; document allowed transitions in the owning module.

Use PostGIS geometry/geography deliberately; document SRID and coordinate order at every API boundary.

Never infer that missing data means zero, safe, no incident or no risk.

Separate raw source payload/reference from normalized observations; do not overwrite source evidence during normalization.

Store attachment binaries in object storage; database stores metadata, ownership, checksum, content type, size and access policy.

7.2 Suggested indexes

B-tree indexes on foreign keys, status, created_at, observed_at, forecast_run_id and source_id where query patterns require them.

GiST indexes on frequently queried PostGIS geometry columns.

Composite indexes aligned to real list filters, for example (status, created_at) or (area_id, observed_at).

Use partitioning only after measured data volume/query pressure justifies it; do not add it speculatively for the prototype.

8. API and Event Contracts

Expose versioned REST endpoints under /api/v1. Use consistent pagination, validation, error envelopes, request IDs and idempotency for retryable commands. Keep public/citizen endpoints separate in policy from privileged operations endpoints even if served by the same API deployment.

| Area | Example endpoints | Access / notes |
| --- | --- | --- |
| Identity | POST /api/v1/auth/login; POST /api/v1/auth/refresh; GET /api/v1/me | Public login with rate limits; authenticated profile. |
| Forecast | GET /api/v1/forecasts; GET /api/v1/forecasts/{id}; POST /api/v1/forecasts/{id}/review | Read scope by geography; review restricted to authorized roles. |
| Alerts | POST /api/v1/alerts; POST /api/v1/alerts/{id}/approve; POST /api/v1/alerts/{id}/publish; POST /api/v1/alerts/{id}/withdraw | Approval and publish are distinct guarded actions; audit each transition. |
| Reports / SOS | POST /api/v1/reports; POST /api/v1/sos; GET /api/v1/reports/{id} | Citizen submission; protect PII and location; abuse controls. |
| Incidents | GET /api/v1/incidents; POST /api/v1/incidents; PATCH /api/v1/incidents/{id}/status | Operational scope and state-transition policy. |
| Response | POST /api/v1/tasks; POST /api/v1/tasks/{id}/assign; PATCH /api/v1/tasks/{id}/status | Coordinator/responder permissions; assignment audit. |
| Resources | GET /api/v1/resources; GET /api/v1/shelters; PATCH /api/v1/shelters/{id}/capacity | Authorized updates; freshness displayed. |

Example event envelope: event_id, event_type, occurred_at, producer, schema_version, correlation_id, actor_id (when applicable), aggregate_type, aggregate_id, payload, and sensitivity classification. Events are internal integration contracts, not a public promise until versioned and documented.

| Event | Producer | Consumers / effect |
| --- | --- | --- |
| ObservationReceived | Ingestion | Forecast scheduler; data-quality dashboard |
| ForecastGenerated | Forecast | Risk dashboard; reviewer queue |
| AlertApproved | Alert | Publication workflow |
| AlertPublished | Alert | Notification worker; audit/analytics |
| SOSReceived | Citizen Reports & SOS | Triage queue; operator dashboard |
| IncidentStatusChanged | Incident | Operations dashboard; permitted citizen status view |
| TaskAssigned | Response Coordination | Responder workspace; notification worker |
| NotificationDeliveryUpdated | Notifications | Alert delivery status view |

8.1 API conventions

Use ISO 8601 timestamps with timezone offsets in API payloads; persist canonical UTC timestamps.

Validate request bodies with DTO/schema validation; reject unknown or malformed critical fields.

Return 401 for unauthenticated, 403 for unauthorized, 404 for inaccessible/nonexistent resources where disclosure is unsafe, 409 for state conflicts, 422 for semantic validation, and 429 for rate limiting.

Use idempotency keys for SOS/report submissions and publication/dispatch commands where clients may retry.

Never expose internal stack traces, secrets, model artifacts or unrestricted object-storage URLs.

9. Technology Stack and Repository Blueprint

| Concern | Recommended baseline | Selection note |
| --- | --- | --- |
| Frontend | React + TypeScript; Vite; responsive PWA | Choose a UI component system and map library once; avoid multiple competing libraries. |
| Backend | NestJS + TypeScript; REST/OpenAPI | Use modules, DTO validation, guards, interceptors and service-layer tests. |
| Database | PostgreSQL + PostGIS | Managed service preferred if cost and region fit; migrations committed to source control. |
| ORM/data access | One selected TypeScript ORM/query layer | Prisma or TypeORM are candidates; choose one and standardize migration ownership. |
| AI service | Python + FastAPI or worker-based inference | Keep private/internal; use a baseline model before advanced ML. |
| Async | Queue abstraction plus worker | Start with a managed queue or a lightweight supported queue; avoid adding Redis unless needed. |
| Object storage | S3-compatible or cloud-native object storage | Private by default; signed, short-lived access after authorization. |
| Testing | Jest/Vitest, API integration tests, Playwright or equivalent | Automate critical workflows and regression cases. |
| Packaging | Docker for API, worker and AI runtime | Keep local development reproducible. |
| CI/CD | GitHub Actions or equivalent | Lint, typecheck, test, build, scan, migrate and deploy with approval gates. |
| Observability | Structured logs, metrics, tracing and error reporting | Avoid logging sensitive citizen/SOS data. |

9.1 Suggested monorepo structure

aapadamitra/  apps/    web/                    # React PWA: citizen + operations workspaces    api/                    # NestJS modular monolith    worker/                 # ingestion, notifications, scheduled jobs    ai-service/             # private Python inference / evaluation service  packages/    api-contracts/          # shared OpenAPI-generated types / schemas    ui/                     # reusable design system components    config/                 # shared lint, TypeScript and formatting config  database/    migrations/             # versioned schema migrations    seeds/                  # synthetic/demo seed data only  infra/    docker/                 # Dockerfiles and local compose    deployment/             # environment-specific deployment manifests    scripts/                # backup, restore, smoke-test utilities  docs/    architecture/    api/    runbooks/    decisions/  tests/    e2e/    fixtures/  .github/workflows/  README.md  CONTRIBUTING.md  SECURITY.md  .env.example

9.2 Backend module layout

apps/api/src/modules/<module-name>/  <module>.module.ts  <module>.controller.ts  <module>.service.ts  dto/  entities-or-repositories/  policies/  events/  tests/

Do not create a folder for every speculative future service. Keep module code cohesive, enforce import boundaries, and expose application interfaces for cross-module use.

10. Security, Privacy and Safety Controls

Enforce server-side RBAC and geographic/data scope on every privileged operation; UI hiding is not authorization.

Use least privilege, secure password/session handling, MFA for privileged roles where feasible, and short-lived access tokens with controlled refresh.

Require explicit authorized approval before an alert can be published; separate draft, reviewed, approved, published, expired and withdrawn states.

Record who created, reviewed, approved, published, assigned or changed a sensitive operational record and when.

Encrypt traffic in transit and use managed encryption at rest; keep secrets in a secret manager, never in source control.

Minimize citizen PII collection; protect precise location, contact details, SOS content and evidence attachments with role-scoped access and retention limits.

Rate-limit and abuse-protect public report/SOS endpoints; validate uploads, constrain size/type, scan where available and store privately.

Use synthetic data for demos. Do not use real personal or emergency data in screenshots, public repositories or test fixtures.

Show data freshness and uncertainty. Distinguish a platform notification from an official warning and label simulated/demo content clearly.

Maintain a manual fallback and display service degradation honestly; never imply an SOS has been dispatched if only received by the platform.

11. AI/ML Integration and Governance

The AI layer is advisory. It may generate candidate forecasts and risk assessments, but the core platform owns workflow state, authorization and public alert publication.

Input contract: timestamped observations with source, units, coordinates/area, quality flags and freshness.

Output contract: forecast run ID, hazard, geography, horizon, predicted value/risk category, units, uncertainty/confidence, model version, generated_at, input window and limitations.

Begin with a transparent baseline and reproducible evaluation; compare advanced models against the baseline rather than assuming complexity is better.

Use time-aware train/validation/test splits; avoid leakage across adjacent time windows or events.

Evaluate MAE/RMSE for continuous levels/flows where applicable, and event-based detection, false alarm, missed event and lead-time metrics for warning thresholds.

Record model/data version, feature definition, training period, evaluation results and deployment approval.

Monitor input drift, missingness, latency, forecast error when labels become available and model failures; provide a safe degraded mode.

Do not train on unconsented sensitive SOS/report content for the pilot.

| AI failure / uncertainty | Required platform behavior |
| --- | --- |
| Missing or stale inputs | Mark forecast unavailable or degraded; show source freshness; do not silently substitute zero. |
| Low confidence / out-of-domain | Show uncertainty and reviewer warning; allow human rejection or request for more evidence. |
| Model service unavailable | Keep core incident/report/response workflows operational; show last valid forecast with timestamp and stale label. |
| Model version changed | Persist version per run; compare against baseline and retain rollback capability. |
| Potentially consequential risk | Route to authorized human review; no autonomous public publication. |

12. Team Operating Model and Responsibilities

For a four-person team, assign one clear accountable owner per workstream. People may pair, but every module and release gate must have one named owner in the team's working tracker.

| Role (suggested) | Primary ownership | Must coordinate with |
| --- | --- | --- |
| 1. Technical lead / backend & integration | Architecture, NestJS core, API contracts, auth/RBAC, integration and merge/release decisions | All owners; QA |
| 2. Frontend / PWA engineer | React app, role-based views, maps, forms, accessibility and client API integration | Backend; product/UX |
| 3. AI/ML & data engineer | Data adapters, data quality, flood baseline/forecast pipeline, model evaluation and AI contract | Backend; domain reviewer |
| 4. QA / DevOps / platform engineer | Test automation, CI/CD, Docker/cloud setup, observability, security checks and demo reliability | All owners |

If team members have different strengths, reassign work but retain the ownership boundaries. The product/technical lead must maintain a single prioritized backlog and reject parallel implementations of the same capability.

13. Prioritized Implementation Backlog

| Priority | Work item | Definition of done |
| --- | --- | --- |
| P0 | Repository, environments and CI | One-command local setup; lint/typecheck/test/build pipeline passes. |
| P0 | Identity, roles and seeded demo accounts | Citizen, operator, responder and admin paths are permission-checked server-side. |
| P0 | Core geography and map view | Nanded pilot area renders with clearly labelled demo boundaries/locations. |
| P0 | Observation ingestion and freshness | At least one documented feed or synthetic feed ingests, validates and shows provenance. |
| P0 | Flood forecast/risk baseline | One reproducible horizon/result with units, timestamp, model/version and limitations. |
| P0 | Human-reviewed alert lifecycle | Draft → review → approve → publish/withdraw with audit trail; no AI bypass. |
| P0 | Citizen report/SOS flow | Submit → acknowledgement/reference → operator triage → incident link. |
| P0 | Incident and response task flow | Create incident, assign task/resource, update status and show timeline. |
| P0 | End-to-end demo and failure states | A scripted scenario works from seeded data through alert/report/response; demo labels visible. |
| P1 | Notification provider integration | Provider adapter, delivery attempt tracking and clear demo fallback. |
| P1 | Shelter/resource capacity management | Authorized update and freshness timestamp visible. |
| P1 | Offline draft and retry UX | Draft survives temporary network loss; user can see pending/sent/failed state. |
| P2 | Advanced flood ML and additional hazards | Only after data adequacy, baseline evaluation and measurable acceptance criteria. |
| P2 | Advanced analytics, external integrations and scale-out | Prioritized from pilot evidence and operational partner requirements. |

P0 is the competition demonstration baseline. P1/P2 must not displace the complete vertical slice. Avoid building a large dashboard with nonfunctional buttons or fabricated live data.

14. Eight-Day Execution Plan

| Day | Primary objective | Expected evidence / exit gate |
| --- | --- | --- |
| 1 | Freeze scope, create repo, environment, architecture decisions, API contracts and database migrations | Team can run app/API/DB locally; CI green; demo scenario agreed. |
| 2 | Identity/RBAC, geography seed, app shell and core API modules | Role-based navigation and server-side authorization demonstrated. |
| 3 | Observation ingestion, data provenance, map layer and flood baseline | A timestamped observation and forecast result appear with units/freshness. |
| 4 | Forecast review and alert lifecycle | Authorized approval required; audit trail visible; no AI auto-publish path. |
| 5 | Citizen report/SOS, incident triage and response assignment | A report can become an incident and assigned task. |
| 6 | Notification adapter, resilience states, security checks and integrated E2E tests | Critical workflow tests pass; provider failures are handled visibly. |
| 7 | Deploy staging/demo, seed data, rehearse scenario, fix defects | Repeatable deployment and demo script; no critical defects. |
| 8 | Freeze, regression, presentation evidence, backup and contingency rehearsal | Release candidate tagged; limitations disclosed; demo can run without live external feeds. |

14.1 Daily execution rules

Start each day with a 10-minute blocker and dependency review; end with a working integrated build.

Merge small pull requests continuously; no long-lived integration branches.

A feature is not done until it is integrated, tested, permission-checked and represented in the demo flow.

Use seeded synthetic data when live feeds are unavailable; label it visibly and never describe it as live.

Reserve the final day for stabilization, not major new features.

15. Quality, Release and Operational Gates

| Gate | Minimum acceptance |
| --- | --- |
| Architecture | Module ownership and API/event contracts documented; no direct cross-module table writes. |
| Functional | Critical end-to-end flood alert and citizen SOS/response scenarios pass. |
| Security | RBAC negative tests pass; privileged actions audited; secrets absent from repository; public endpoints rate-limited. |
| Data | Source, timestamp, units, quality and freshness visible for observations and forecasts. |
| AI governance | Model version and uncertainty/limitations shown; human approval required for public alert. |
| Reliability | Core report/incident workflows remain usable if AI or notification provider is unavailable. |
| Deployment | Repeatable build/deploy; migrations versioned; backup/restore approach documented. |
| Demo integrity | Simulated data and non-production limitations are clearly labelled; no unsupported accuracy claims. |

A competition-ready prototype is not a production emergency-response system. Before operational deployment, require formal security review, privacy/legal review, disaster-management authority engagement, data-sharing approvals, field exercises, accessibility review, independent model validation, high-availability design, tested disaster recovery and staffed operational procedures.

16. Consistency Review: Risks and Resolutions

| Potential inconsistency / risk | Resolution in this blueprint | Status |
| --- | --- | --- |
| MongoDB vs relational/spatial needs | PostgreSQL + PostGIS is the baseline for transactional and GIS integrity. | Decision baseline; verify any existing implementation before migration. |
| Modular monolith vs microservices | Keep core platform modular in one NestJS deployment; separate worker/AI runtime only where useful. | Resolved for pilot. |
| AI prediction vs official alert authority | Forecast is advisory; authorized human approval is mandatory before publication. | Safety-critical invariant. |
| Full multi-hazard ambition vs eight-day delivery | Multi-hazard domain model, flood/dam first vertical slice. | Resolved for competition scope. |
| Live data assumptions | Hybrid feeds; all data has provenance/freshness; synthetic demo data labelled. | Source agreements remain open. |
| Notification delivery vs alert publication | Publication and provider delivery are separate states and records. | Resolved. |
| Cloud provider not selected | Use provider-neutral containers and managed-service selection criteria. | Open decision. |
| ORM/queue/map library not finalized | Select one option per concern and record ADR before implementation. | Open decision. |
| Production readiness implied by polished demo | Explicit prototype boundary and production gates. | Resolved as communication rule. |

17. Architecture Decision Records to Finalize

| ADR | Decision required | Recommended selection criteria | Owner / deadline |
| --- | --- | --- | --- |
| ADR-001 | Cloud provider and India region | Data residency, PostGIS, managed containers, IAM, object storage, cost, support | Tech lead / Day 1 |
| ADR-002 | ORM and migration tooling | Team familiarity, PostGIS support, migration safety, type safety | Backend / Day 1 |
| ADR-003 | Queue and scheduler | Retry, dead-letter support, managed option, local developer simplicity | Backend + DevOps / Day 2 |
| ADR-004 | Map and geospatial frontend library | Licensing, offline needs, layer support, performance, developer familiarity | Frontend / Day 2 |
| ADR-005 | Identity/session strategy | Secure password/session lifecycle, MFA options, operational simplicity | Backend / Day 2 |
| ADR-006 | Notification providers | India coverage, delivery receipts, cost, consent, fallback | DevOps / before live integration |
| ADR-007 | Official data-source agreements | Authority, access method, licence, latency, quality, permitted use | Product/data owner / before pilot |

Record each ADR with context, options considered, decision, consequences, date and owner. Do not allow a library/provider choice to remain implicit across multiple branches.

18. Open Questions Before Production

Which district/state/central agencies are the operational owners and authorized alert approvers?

Which official dam, rainfall, river gauge, weather and forecast feeds are available, with what latency and usage rights?

What are the approved alert thresholds, escalation rules, target geographies and communication templates?

What personal data is necessary for citizen reports/SOS, what consent is required, and what are retention/deletion obligations?

Which languages are required for citizen-facing alerts and accessibility?

What are the operational service levels, staffing model, escalation contacts and manual fallback channels?

What recovery objectives (RTO/RPO), availability target, data residency and security certification are required?

What field validation dataset and independent domain experts will be used to assess flood forecast quality?

19. Definition of Done for Document 11

The team agrees to the architecture baseline and records unresolved choices as ADRs.

Every P0 capability has an owner, acceptance criteria and dependency order.

Frontend, backend, AI/data and QA/DevOps owners agree on contracts and the demo scenario.

A repository skeleton, environment setup and CI pipeline are ready to implement.

The end-to-end workflow has explicit human approval, audit, data provenance and degraded-mode behavior.

All competition materials accurately distinguish prototype evidence from production claims.

20. Final Technical Recommendation

Build AAPADAMITRA as one coherent, modular platform with a React PWA, NestJS modular monolith, PostgreSQL/PostGIS, asynchronous workers and a private modular AI component. Deliver a flood/dam decision-support vertical slice for Nanded while keeping the domain model extensible to other hazards. Make provenance, freshness, uncertainty, authorization and auditability first-class features—not later additions.

The most important engineering priority is not the number of screens or models. It is a reliable, testable end-to-end chain: validated observation → traceable forecast → human-reviewed alert → transparent notification status, alongside citizen SOS/report → triage → incident → assigned response task. If that chain works repeatedly and honestly under demo conditions, the team has a credible foundation for subsequent field validation and expansion.

Appendix A — Suggested Demo Scenario

Load a clearly labelled synthetic rainfall/river-level observation for a selected Nanded pilot location.

Run the baseline forecast and show forecast horizon, units, generated time, source freshness and model version.

Open the forecast review queue as an authorized operator; inspect map and uncertainty; approve a proposed alert.

Publish the approved alert and show notification attempts/delivery state without claiming guaranteed receipt.

Submit a citizen SOS/report from the PWA; show acknowledgement/reference and pending triage state.

Triage the report, link/create an incident, assign a responder task and update task status.

Show the incident timeline and audit trail; demonstrate what happens when AI or notification provider is unavailable.

Appendix B — Naming and Status Vocabulary

| Concept | Recommended vocabulary |
| --- | --- |
| Forecast | generated, reviewed, superseded, unavailable, degraded |
| Alert | draft, submitted_for_review, approved, published, expired, withdrawn, rejected |
| Report/SOS | received, acknowledged, under_triage, linked_to_incident, resolved, rejected_with_reason |
| Incident | open, assessing, active_response, monitoring, closed |
| Task | unassigned, assigned, accepted, in_progress, blocked, completed, cancelled |
| Notification attempt | queued, submitted, delivered, failed, expired, unknown |

Status names are a proposed canonical vocabulary. Final enum names should be frozen in API contracts and database migrations before parallel implementation.

Appendix C — Document Set Relationship

| Document | Role in the engineering baseline |
| --- | --- |
| 01 — Product Requirements Document | Product goals, users, scope and success criteria. |
| 02 — Software Requirements Specification | Functional/non-functional requirements and traceability. |
| 03 — System Architecture | High-level system components and architectural rationale. |
| 04 — Module Specification | Module capabilities and boundaries. |
| 05 — Database Design | Entity model, schema and relationships. |
| 06 — API Documentation | External/internal API definitions. |
| 07 — AI/ML Specification | Data, model lifecycle, evaluation and governance. |
| 08 — Security & RBAC Specification | Identity, authorization, privacy and threat controls. |
| 09 — Testing Strategy & QA Specification | Test levels, scenarios, quality gates and acceptance. |
| 10 — Deployment & DevOps Specification | Environments, CI/CD, operations, backup and recovery. |
| 11 — Architecture Consistency Review & Final Technical Blueprint | Consolidated decisions, cross-module contracts, implementation order and unresolved decision register. |