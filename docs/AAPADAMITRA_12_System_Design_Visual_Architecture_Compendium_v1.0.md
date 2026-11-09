AAPADAMITRA

System Design & Visual ArchitectureCompendium

Document 12  |  Version 1.0  |  08 November 2026

Diagrams • ER Model • Data Flows • Sequence Flows • State Models • Actions • API Contracts

Nanded district pilot | Cloud deployment | React PWA | NestJS | PostgreSQL + PostGIS

Document purpose and authority

This document is the visual and interaction-oriented companion to Documents 01–11. It brings the system architecture, key entities, workflows, data movement, state transitions, user actions and integration contracts into one reference. It is intended for implementation, design reviews, team onboarding and competition demonstration planning.

This is a conceptual engineering baseline, not a certified operational design. Diagrams show logical relationships and representative flows; they do not replace detailed migration scripts, OpenAPI schemas, threat models, cloud-provider configuration or agency-approved emergency procedures.

| Attribute | Value |
| --- | --- |
| Document ID | AAPADAMITRA-DOC-12 |
| Title | System Design & Visual Architecture Compendium |
| Version | 1.0 |
| Pilot geography | Nanded district, Maharashtra, India |
| Architecture baseline | React PWA + NestJS modular monolith + PostgreSQL/PostGIS + workers + private modular AI |
| Primary hazard implementation | Flood/dam decision-support first; multi-hazard domain model |
| Safety boundary | AI is advisory; authorized human approval is required before public alert publication |
| Status | Conceptual baseline; confirm open ADRs before production implementation |

1. System context and actors

| Actor | Primary goals | Main actions |
| --- | --- | --- |
| Citizen | Receive information; report incidents; request help | View alerts, submit report/SOS, attach evidence, view permitted status |
| Control-room operator | Monitor conditions and triage incoming reports | Review observations/forecasts, triage SOS, create/link incidents |
| Authorized approving official | Make accountable warning decisions | Review evidence, approve/reject alerts, publish/withdraw |
| Responder | Receive and complete assigned response tasks | Accept assignment, update status, add operational notes/evidence |
| Administrator | Maintain platform configuration and access | Manage users/roles, reference data, sources, operational configuration |
| Data/AI operator | Maintain data and model quality | Monitor feed freshness, ingestion health, model versions and evaluation |

2. Target architecture diagram

Figure 1. Logical layered architecture. Core business modules remain within the NestJS modular monolith for the pilot.

2.1 Deployment components

| Component | Deployment responsibility | Failure isolation expectation |
| --- | --- | --- |
| React PWA | Static web hosting/CDN or web container | API outage should show clear unavailable state; preserve safe local drafts where implemented. |
| NestJS API | Containerized application service | Stateless replicas where needed; health/readiness endpoints. |
| Worker | Separate process/container using same codebase where suitable | Retries and dead-letter handling; API remains responsive during long jobs. |
| AI service | Private container/service or batch job | AI failure must not stop citizen report, incident or response workflows. |
| PostgreSQL/PostGIS | Managed database preferred | Backups, restricted network access, migration discipline and tested restore. |
| Object storage | Private bucket/container | Short-lived authorized access; lifecycle/retention policies. |
| Observability | Centralized logs, metrics, traces and alerts | Do not include secrets or unnecessary citizen PII in telemetry. |

3. Conceptual entity relationship diagram

Figure 2. Conceptual ER model. Relationship lines are indicative; exact cardinality and junction entities must be finalized in migrations.

3.1 Entity dictionary

| Entity | Purpose | Important fields / rules |
| --- | --- | --- |
| User | Platform identity | id, display_name, email/phone as required, status, created_at |
| Role / Permission | Authorization vocabulary | role key, permission key, scope; user-role junction supports multiple roles |
| AdministrativeArea | District/tehsil/village hierarchy | parent_id, area_type, code, geometry, SRID |
| DataSource | External or internal feed registry | name, source_type, licence, owner, polling policy, active status |
| Observation | Normalized measurement | source_id, area_id/location, observed_at, received_at, value, unit, quality |
| ForecastRun | One model execution | model_version, input window, horizon, generated_at, uncertainty, status |
| Alert | Controlled public warning record | severity, hazard, target area, state, version, approval metadata |
| Incident | Operational case | category, severity, status, location/area, opened_at, closed_at |
| CitizenReport | Citizen-submitted information | reporter reference if authenticated, category, location, evidence refs, triage state |
| ResponseTask | Action assigned to a responder/resource | incident_id, assignee/resource, due_at, status, completion evidence |
| AuditEvent | Trace of sensitive actions | actor_id, action, entity reference, timestamp, correlation_id |

3.2 Cardinality and integrity notes

A user can hold multiple roles; implement UserRole as a junction table and scope roles by geography or organization where required.

An administrative area can contain child areas; observations, incidents and alerts may reference an area and/or point geometry.

A data source can produce many observations; each observation must reference exactly one recorded source.

A forecast run can consume many observations and produce many forecast values; persist an input manifest or reproducible reference set.

An incident can have multiple reports, response tasks, timeline events and audit events.

An alert can have multiple versions, target areas, approvals and notification attempts; publication history must be retained.

A task may be assigned to a user, team or resource; define a single canonical assignment model before schema freeze.

4. Data flow diagrams

4.1 Observation to forecast

Figure 3. Data flow from source ingestion to a traceable forecast result.

Required data lineage at each stage: source identity, source timestamp, ingestion timestamp, units, location, quality flags, transformation version, feature window, model version and forecast generation timestamp.

4.2 Citizen SOS/report to response

Figure 4. Citizen report/SOS workflow through triage, incident linkage and responder task.

The citizen acknowledgement means the platform received the submission; it must not be worded as confirmation that emergency services have been dispatched unless an authorized dispatch integration confirms that outcome.

5. Sequence diagram — forecast review and alert publication

Figure 5. Representative sequence. Alert publication is gated by an authorized human decision.

5.1 Action and authorization matrix

| Action | Citizen | Operator | Approver | Responder | Admin |
| --- | --- | --- | --- | --- | --- |
| View public alerts | Yes | Yes | Yes | Yes | Yes |
| Submit report / SOS | Yes | If permitted | If permitted | If permitted | Yes |
| Triage report | No | Yes | Yes | No | Yes |
| Create incident | No | Yes | Yes | Limited / assigned | Yes |
| Generate/view forecast | Public summary only | Yes | Yes | Scoped summary | Yes |
| Approve public alert | No | No unless explicitly authorized | Yes | No | Only if separately authorized |
| Publish/withdraw alert | No | No unless explicitly authorized | Yes | No | Only if separately authorized |
| Accept/update response task | No | Assign/coordinate | Coordinate | Assigned task only | Yes |
| Manage roles/configuration | No | No | No | No | Yes |

6. State models

6.1 Alert lifecycle

Figure 6. Proposed alert states. Rejection/return and versioning rules must be encoded in backend transitions.

6.2 Other recommended state vocabularies

| Object | Suggested states | Guardrails |
| --- | --- | --- |
| Forecast | queued, running, generated, reviewed, superseded, failed, unavailable | Persist run metadata; stale forecasts are visibly labelled. |
| Citizen report/SOS | received, acknowledged, under_triage, linked_to_incident, resolved, rejected_with_reason | Acknowledgement is not dispatch confirmation; preserve status history. |
| Incident | open, assessing, active_response, monitoring, closed | Closure requires authorized actor and reason. |
| Response task | unassigned, assigned, accepted, in_progress, blocked, completed, cancelled | Assignment and status changes are audited. |
| Notification attempt | queued, submitted, delivered, failed, expired, unknown | Do not equate provider acceptance with citizen receipt. |

7. Functional action catalogue

| Module | User/system action | Input | Result / side effect |
| --- | --- | --- | --- |
| Identity | Sign in / refresh session | Credentials or refresh token | Authenticated session; audit security events. |
| Geography | Select/map an area | Area ID or coordinates | Scoped map and area context. |
| Ingestion | Run feed ingestion | Source ID, schedule/manual trigger | Ingestion run, observations, quality issues. |
| Forecast | Generate forecast | Input window, area, horizon, model version | Forecast run and values with uncertainty. |
| Forecast | Review forecast | Run ID, reviewer decision, notes | Review record and audit event. |
| Alert | Create alert draft | Hazard, severity, message, target area, evidence | Draft alert version. |
| Alert | Approve / reject | Alert version, decision, reason | Approval/rejection record; state transition. |
| Alert | Publish / withdraw | Approved alert ID or withdrawal reason | Notification job or withdrawal event. |
| Citizen | Submit SOS/report | Category, description, location, evidence | Reference ID and acknowledgement. |
| Incident | Triage/link report | Report ID, incident decision | Incident creation/link and timeline update. |
| Response | Assign task | Incident, assignee/resource, priority | Task assignment and notification request. |
| Responder | Update task | Task ID, status, note/evidence | Task history and incident timeline. |
| Admin | Manage user/role | User ID, role, scope | Access update and audit event. |

8. API surface and representative payloads

| Domain | Representative REST endpoints | Authorization notes |
| --- | --- | --- |
| Auth | POST /api/v1/auth/login; POST /api/v1/auth/refresh; GET /api/v1/me | Rate-limited; session lifecycle protected. |
| Forecast | GET /api/v1/forecasts; GET /api/v1/forecasts/{id}; POST /api/v1/forecasts/{id}/review | Area scope; reviewer permission for decisions. |
| Alerts | POST /api/v1/alerts; POST /api/v1/alerts/{id}/approve; POST /api/v1/alerts/{id}/publish; POST /api/v1/alerts/{id}/withdraw | Approval and publication are separate guarded actions. |
| Citizen | POST /api/v1/reports; POST /api/v1/sos; GET /api/v1/reports/{id} | PII minimization, rate limits, idempotency. |
| Incidents | GET /api/v1/incidents; POST /api/v1/incidents; PATCH /api/v1/incidents/{id}/status | Operational role and scope. |
| Response | POST /api/v1/tasks; POST /api/v1/tasks/{id}/assign; PATCH /api/v1/tasks/{id}/status | Coordinator/responder permissions. |
| Resources | GET /api/v1/resources; GET /api/v1/shelters; PATCH /api/v1/shelters/{id}/capacity | Authorized updates and timestamped capacity. |

8.1 Example forecast response (illustrative)

{  "id": "forecast-run-uuid",  "hazard": "flood",  "areaId": "area-uuid",  "generatedAt": "2026-11-08T16:00:00Z",  "horizon": { "value": 6, "unit": "hours" },  "model": { "name": "flood-baseline", "version": "0.1.0" },  "result": { "riskCategory": "moderate", "predictedLevel": null, "unit": null },  "uncertainty": { "method": "to-be-defined", "value": null },  "dataFreshness": "demo",  "provenance": ["source-observation-id"],  "limitations": ["Illustrative schema; not an operational forecast"]}

9. Event and asynchronous processing map

| Event | Producer | Consumers | Reliability rule |
| --- | --- | --- | --- |
| ObservationReceived | Ingestion | Forecast scheduler, data quality UI | Persist event/outbox; deduplicate by source key. |
| ForecastGenerated | Forecast | Reviewer queue, dashboard | Store model and input provenance before event publication. |
| AlertApproved | Alert | Publication workflow | Approval identity and alert version required. |
| AlertPublished | Alert | Notification worker, audit/analytics | Publication transaction and outbox must be consistent. |
| SOSReceived | Citizen reporting | Triage queue | Idempotent intake; durable receipt before async processing. |
| IncidentStatusChanged | Incident | Operations UI, permitted citizen status | Status history is authoritative. |
| TaskAssigned | Response | Responder workspace, notification worker | Assignment remains valid even if notification fails. |
| NotificationDeliveryUpdated | Notification | Alert delivery status UI | Record each attempt and provider response safely. |

9.1 Event envelope

Every internal event should carry event_id, event_type, schema_version, occurred_at, producer, aggregate_type, aggregate_id, correlation_id, sensitivity classification and a validated payload. Use an outbox pattern for database changes that must reliably publish events. Consumers must be idempotent and tolerate duplicate delivery.

10. AI model lifecycle and safety flow

Acquire and register permitted source data with provenance and licence/usage constraints.

Validate units, timestamps, missingness, spatial coverage and quality; quarantine invalid data.

Create versioned feature datasets and time-aware training/validation/test splits.

Train or configure baseline and candidate models; compare candidates to baseline.

Evaluate event detection, false alarms, missed events, lead time and continuous error metrics as appropriate.

Register model artefact, code/config version, training window, metrics and limitations.

Deploy to a non-public inference endpoint; run shadow or controlled evaluation before use in review workflows.

Monitor input drift, output distribution, latency, failures and eventual forecast error; rollback if thresholds are breached.

No model should directly publish an official warning. Forecast confidence is not a probability of safety unless formally calibrated and validated for that exact interpretation.

11. Failure paths and degraded-mode behavior

| Failure | Expected behavior | User-facing wording principle |
| --- | --- | --- |
| AI service unavailable | Keep reports, incidents and response tasks working; show last valid forecast only with timestamp and stale label. | Forecast temporarily unavailable; do not imply current risk is zero. |
| Feed stale or missing | Flag source freshness and suppress misleading forecast updates. | Data is delayed or unavailable; last observation time shown. |
| Notification provider fails | Alert remains published if authorized; retry and record attempt; offer configured fallback procedure. | Published in platform; external delivery status is failed/unknown. |
| Citizen loses network | Preserve local draft where safe; retry with idempotency; show pending state. | Not submitted until server acknowledgement is received. |
| Database unavailable | Fail safely; do not claim a submission was accepted; alert operators through monitoring. | Service temporarily unavailable; retry safely. |
| Duplicate SOS/report | Use idempotency and duplicate detection; retain traceability. | Submission already received or being processed. |
| Unauthorized approval attempt | Reject with 403; log security event; do not change alert state. | You do not have permission for this action. |

12. Security and privacy control map

Authentication and server-side authorization on every protected endpoint.

Geographic and organizational scope checks, not only role-name checks.

Separate approval from publication permissions; use step-up authentication/MFA for privileged users where feasible.

Private object storage, validated uploads, size limits, malware scanning where available and expiring authorized access.

Encryption in transit and at rest; managed secrets; rotation and no secrets in source control.

Minimize PII, precise location and sensitive evidence; define consent, retention and deletion rules before pilot use.

Audit sensitive reads and all consequential state transitions; protect audit logs from ordinary mutation.

Rate limiting, anti-abuse controls, input validation and security monitoring on citizen-facing endpoints.

13. Observability and operational dashboard figures

| Operational view | Measures to show | Action when abnormal |
| --- | --- | --- |
| Feed health | Last successful ingest, source age, failed runs, quality rejection count | Investigate source/adapter; mark data stale. |
| Forecast health | Run latency, success/failure, model version, input freshness, evaluation trend | Disable or roll back model; use safe degraded state. |
| Alert operations | Draft/review queue age, approval time, published/withdrawn counts | Escalate pending review; verify approver availability. |
| Notification health | Queued/sent/delivered/failed/unknown by provider | Retry safely; activate approved fallback channel. |
| SOS/incident operations | New intake, triage age, unassigned tasks, task age | Escalate to control-room lead; rebalance assignments. |
| Platform health | API latency/error rate, worker queue depth, DB connections, storage and uptime | Scale or mitigate; use runbooks and incident process. |

Dashboards must distinguish operational counts from impact claims. Do not show fabricated lives-saved, prediction-accuracy or response-time improvements without a defensible measurement method and evidence.

14. Test and acceptance scenario catalogue

| Test ID | Scenario | Expected result |
| --- | --- | --- |
| AT-01 | Citizen submits SOS twice with same idempotency key | One logical request is created; duplicate is safely acknowledged. |
| AT-02 | Citizen submits report with invalid coordinates | Validation rejects or requests correction; no invalid geometry is stored. |
| AT-03 | Stale source data is ingested | Freshness is flagged; forecast cannot be presented as current without warning. |
| AT-04 | AI returns a forecast with uncertainty | Run stores model version, horizon, provenance and uncertainty. |
| AT-05 | Unauthorized user attempts alert approval | 403; no state change; security/audit record. |
| AT-06 | Authorized official approves then publishes alert | Both transitions are separately recorded and audited. |
| AT-07 | Notification provider returns failure | Alert state remains distinct; failed attempt is visible and retryable. |
| AT-08 | AI service is offline | Citizen reporting and incident/response workflows continue. |
| AT-09 | Operator links report to incident and assigns task | Incident timeline and task assignment are visible. |
| AT-10 | Responder completes assigned task | Only authorized assignee/role can update; completion is audited. |
| AT-11 | Database migration is applied to clean environment | Schema builds reproducibly and migration history is recorded. |
| AT-12 | Backup is restored in a test environment | Restore evidence and recovery steps are recorded. |

15. Implementation mapping for the four-person team

| Owner lane | Primary deliverables | Cross-team contract |
| --- | --- | --- |
| Technical lead / backend | NestJS module skeleton, auth/RBAC, domain services, API contracts, integration | Owns API and event contracts; approves merges and architecture changes. |
| Frontend / PWA | Citizen/operations app shell, map, forecast review, alerts, report/SOS and task screens | Consumes documented API; handles pending/error states; no client-side authorization assumptions. |
| AI / data | Feed adapter, data validation, flood baseline, evaluation, inference contract and provenance | Provides typed input/output schema and repeatable sample dataset; documents model limits. |
| QA / DevOps | CI, containers, cloud demo environment, test automation, observability, backup and rehearsal | Maintains green integrated build and release checklist. |

16. Diagram index and implementation caveats

| Figure | Title | Use |
| --- | --- | --- |
| 1 | Target logical architecture | Component and layer boundaries. |
| 2 | Conceptual ER diagram | Initial entity relationships; not final physical schema. |
| 3 | Observation to forecast data flow | Ingestion, validation, AI inference and provenance. |
| 4 | Citizen SOS to response workflow | Citizen intake through responder update. |
| 5 | Forecast review and alert publication sequence | Human approval and notification handoff. |
| 6 | Alert state model | Allowed alert lifecycle transitions. |

Before production, replace conceptual diagrams with version-controlled source diagrams (for example Mermaid or PlantUML) and generate them from the same repository as API contracts and migrations. This avoids documentation drift.

17. Final implementation principles

One integrated vertical slice before broad module expansion.

A module owns its data and state transitions; cross-module communication uses interfaces/events.

Every observation and forecast carries provenance and freshness.

AI advises; authorized humans decide and publish.

Publication, provider submission and citizen receipt are different states.

Core incident/report/response workflows degrade gracefully if AI or notifications fail.

Use synthetic demo data honestly; do not present prototype output as an official operational warning.

Do not call the system production-ready until agency, security, privacy, model and field validation gates are complete.

Appendix A — Glossary

| Term | Meaning |
| --- | --- |
| PWA | Progressive Web App; installable web application with selected offline capabilities. |
| PostGIS | PostgreSQL spatial extension for geometry/geography storage and queries. |
| RBAC | Role-based access control; permissions enforced by backend policies. |
| Outbox pattern | Persist domain change and event record in one transaction, then publish asynchronously. |
| Idempotency | Repeated request with the same key produces one logical operation. |
| Forecast horizon | Future time interval for which a model produces an estimate. |
| Provenance | Traceable origin, transformation and version history of data/results. |
| Degraded mode | Reduced but safe functionality when a dependency is unavailable. |

Appendix B — Freeze checklist

Confirm cloud provider, region, database hosting and object-storage strategy.

Select ORM/migration tool and confirm PostGIS compatibility.

Select queue/scheduler and map library; record ADRs.

Freeze entity cardinalities, junction tables, status enums and API schemas.

Agree alert approval roles and official operational authority.

Confirm data-source access rights, units, freshness and retention.

Define PII/consent/retention policy for citizen SOS and evidence.

Run all critical acceptance scenarios before public demonstration.