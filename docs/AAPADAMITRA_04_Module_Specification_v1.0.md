AAPADAMITRA

04. MODULE SPECIFICATION

Responsibilities, submodules, workflows, permissions and acceptance criteria

Version 1.0  |  08 November 2026Initial pilot: Vishnupuri Dam, Nanded district, MaharashtraCloud deployment • React PWA • NestJS core • PostgreSQL

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-MOD-004 |
| Document title | Module Specification |
| Version | 1.0 |
| Status | Proposed baseline for team review |
| Audience | Product owner, frontend/backend developers, AI/ML developer, QA and deployment team |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture Document; 05 Database Design; 06 API Documentation; 07 AI/ML Specification; 08 Security & RBAC; 09 Testing Strategy; 10 Deployment & Operations |

Revision history

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 08 Nov 2026 | Initial module catalogue, responsibilities, workflows, permissions and acceptance criteria. |

How to use this document

This document defines the product modules and their boundaries. It complements the PRD, SRS and System Architecture Document; it does not replace detailed database schemas, API contracts, model cards or test cases. P0 means required for the first usable pilot/demo; P1 means important but can follow the core vertical slice; P2 means later expansion.

Status labels: CONFIRMED = agreed direction; PROPOSED = engineering design recommendation; OPEN = requires a later decision. A module being specified does not mean it has been implemented or integrated with a live authority.

1. Product and module design principles

Organize around disaster-management capabilities and business responsibilities, not just screens or database tables.

Keep the NestJS core as a modular monolith initially; each module owns its rules and exposes service interfaces.

Keep AI inference in a separate Python service; the core platform owns identity, authorization, workflow, persistence and alert approval.

Use PostgreSQL as the primary transactional database; PostGIS is the proposed extension for spatial data.

Make source, timestamp, unit, freshness and quality visible for observations; distinguish observed, reported, synthetic, derived and predicted data.

Apply least privilege and jurisdiction/organization scoping to every protected operation.

Design integrations behind adapters so providers can be replaced without rewriting domain logic.

Prioritize a complete, testable Nanded pilot workflow over implementing every hazard module superficially.

2. Module catalogue and priorities

| ID | Module | Primary responsibility | Priority |
| --- | --- | --- | --- |
| MOD-01 | Identity & Access Management | Authentication, users, organizations, roles and permissions | P0 |
| MOD-02 | Geography & GIS | Administrative geography, map layers, spatial search and alert zones | P0 |
| MOD-03 | Hazard Registry & Configuration | Hazard catalogue, severity definitions, thresholds and jurisdiction settings | P0 |
| MOD-04 | Infrastructure & Asset Registry | Dams, rivers, stations, sensors and asset relationships | P0 |
| MOD-05 | Observation & Data Ingestion | Manual/API/sensor observations, validation, provenance and freshness | P0 |
| MOD-06 | AI/ML Intelligence | Flood forecasts, dam intelligence, model lifecycle and risk assessments | P0 |
| MOD-07 | Incident & Event Management | Incident creation, classification, assignment, escalation and closure | P0 |
| MOD-08 | Citizen Reporting & SOS | Citizen reports, SOS intake, acknowledgement and triage | P0 |
| MOD-09 | Alert & Notification Management | Draft/review/approve/publish alerts and delivery tracking | P0 |
| MOD-10 | Response Coordination | Teams, resources, tasking, assignments and field status | P1 |
| MOD-11 | Recovery & Relief Management | Damage assessment, needs, relief allocation and recovery tracking | P1 |
| MOD-12 | Analytics, Audit & Reporting | Operational dashboards, traceability, exports and audit views | P1 |
| MOD-13 | Integration & Platform Operations | Provider adapters, background jobs, health, configuration and monitoring | P0 foundation |

3. Detailed module specifications

MOD-01 — Identity & Access Management

Priority: P0  |  Purpose: Provide secure identity, account lifecycle and permission enforcement for all user types.

Submodules / capabilities

Sign-in/sign-out and session refresh

User profile and account status

Organization and jurisdiction membership

Role and permission assignment

Administrative user management

Audit of privileged access and role changes

Role boundaries

| Role | Allowed scope | Boundary |
| --- | --- | --- |
| Citizen | Submit own reports/SOS; view own submission status and public alerts. | Cannot view other citizens' private submissions. |
| Responder | View assigned tasks and update permitted field status. | Cannot approve public alerts or manage roles. |
| Operator | Manage assigned asset observations within authorized scope. | Cannot issue public alerts unless separately granted. |
| Authority | Review incidents and approve alerts within assigned jurisdiction and permission scope. | Approval permission is separate from draft permission. |
| Administrator | Manage platform configuration and access assignments. | Administrative access does not automatically imply authority to approve operational alerts. |

MOD-02 — Geography & GIS

Priority: P0  |  Purpose: Provide a consistent geographic reference layer for assets, incidents, reports, resources and alerts.

Submodules / capabilities

Administrative hierarchy (state/district/taluka/village)

Point locations for dams, stations, incidents, SOS and resources

River line geometry where authoritative data is available

Polygon boundaries and alert/impact zones

Map filters, spatial search and feature detail

Coordinate validation and spatial indexing

Primary workflow

User selects geography/filter → map queries authorized features → API returns geometry and safe display properties → UI renders layers and feature details.

Acceptance criteria

Reject invalid coordinate ranges and unsupported geometry.

Every mapped record has a defined coordinate reference system.

Authorized users can filter assets/incidents by administrative area.

Map information has an accessible non-map list/table alternative.

MOD-03 — Hazard Registry & Configuration

Priority: P0  |  Purpose: Maintain the controlled catalogue of hazards and configurable operational metadata.

Submodules / capabilities

Hazard type and description

Severity levels and display labels

Threshold/rule configuration with units and effective dates

Jurisdiction-specific configuration

Hazard-to-module/model capability mapping

Configuration history and approval controls

Primary workflow

Administrator/authorized domain owner creates or updates hazard configuration → validates units and scope → publishes effective configuration → modules consume versioned settings.

Acceptance criteria

Hazard definitions are centrally managed rather than duplicated in screens.

Thresholds record units, scope, source/owner and effective dates.

Configuration changes are permission-controlled and audited.

Unsupported hazard capabilities are not presented as active prediction features.

MOD-04 — Infrastructure & Asset Registry

Priority: P0  |  Purpose: Maintain records for dams, rivers, monitoring stations, sensors and related infrastructure.

Submodules / capabilities

Asset profile and type

Dam metadata (name, river, location, capacity/levels where verified)

River and upstream/downstream relationships

Monitoring station and sensor registry

Asset operational status and ownership/operator

Asset history and attachments

Primary workflow

Create asset → validate required metadata and location → link river/stations/sensors → authorize operator access → display asset profile and observation history.

Acceptance criteria

Vishnupuri Dam can be registered as the first pilot asset.

Asset identity and location are unique within agreed rules.

Unknown or unverified values are marked as such, not fabricated.

Asset edits preserve change history.

MOD-05 — Observation & Data Ingestion

Priority: P0  |  Purpose: Receive, validate, normalize and store measurements and reports from approved sources.

Submodules / capabilities

Manual observation entry

Authenticated API/sensor ingestion adapter

Weather and hydrological observation adapters

Unit normalization and plausibility checks

Source provenance, timestamps and quality flags

Duplicate detection and ingestion error handling

Primary workflow

Receive payload → authenticate source → validate schema/asset/unit/time → normalize → flag quality/freshness → persist immutable observation → emit processing event.

Acceptance criteria

Every observation records source, observed time, received time and unit.

Duplicate submissions are safely handled.

Invalid data is rejected or quarantined with a reason.

Stale/missing data is visibly identified and not silently treated as current.

MOD-06 — AI/ML Intelligence

Priority: P0  |  Purpose: Orchestrate hazard-specific forecasts and assessments while preserving model provenance and safety boundaries.

Submodules / capabilities

Flood forecasting: river and dam-related downstream scope

Dam intelligence and trend/scenario assessment

Feature preparation and data-quality gates

Model registry/version metadata

Inference request/result history

Evaluation, monitoring and fallback status

Primary workflow

Core API selects capability → gathers validated inputs → calls AI service → validates response/schema → stores forecast with model/input metadata → presents advisory output for human review.

Acceptance criteria

Target forecast horizons are 1, 3, 6, 12 and 24 hours, enabled individually only after validation.

Synthetic data is clearly labelled and never represented as real observation.

Each output identifies model version, issue time, horizon, units, input references and quality/limitations.

Unavailable or poor-quality inputs produce a safe unavailable/fallback state.

AI cannot autonomously publish alerts or control infrastructure.

MOD-07 — Incident & Event Management

Priority: P0  |  Purpose: Provide the operational record for a reported or authority-created event.

Submodules / capabilities

Incident creation and unique reference

Hazard/category, severity and location

Status lifecycle and assignment

Related reports, observations and alerts

Timeline, notes and attachments

Escalation, resolution and closure

Primary workflow

Report/SOS or authorized user creates event → triage/classify → assign owner → update status and evidence → resolve/close with outcome → retain audit timeline.

Acceptance criteria

Every incident has a unique reference and creation timestamp.

Status transitions are validated and attributable to a user.

Duplicate reports can be linked to an existing incident.

Only authorized users can change restricted status/severity fields.

MOD-08 — Citizen Reporting & SOS

Priority: P0  |  Purpose: Enable citizens to submit incident reports and requests for assistance through the PWA.

Submodules / capabilities

Citizen report form

SOS submission with location and category

Optional media attachment subject to limits

Submission acknowledgement and tracking reference

Triage queue for authorized personnel

Citizen-visible status updates that do not expose private responder data

Primary workflow

Citizen submits → API validates and stores → returns tracking reference → authorized triage → create/link incident → status updates are exposed safely to submitter.

Acceptance criteria

Citizen receives an acknowledgement that submission was received, not a guarantee that rescue is dispatched.

Private personal/location details are not public by default.

Duplicate or repeated submissions are handled without losing evidence.

The form remains usable on mobile and explains location permission/fallback.

MOD-09 — Alert & Notification Management

Priority: P0  |  Purpose: Manage controlled public/operational alert authoring, approval, distribution and lifecycle.

Submodules / capabilities

Alert draft with hazard, severity, area and validity

Review/approval/rejection workflow

Publish/update/cancel lifecycle

Channel adapter interface (PWA/in-app first; SMS/IVR later subject to provider approval)

Delivery attempts, failures and acknowledgement where supported

Alert history and audit

Primary workflow

Assessment/authorized user proposes alert → reviewer checks evidence and scope → authorized approver approves → system publishes through configured channel → delivery outcomes tracked → alert updated/cancelled as needed.

Acceptance criteria

Drafting and approval are separate permissions.

Unapproved alerts cannot be published.

Every published alert records approver, time, audience/area, validity and message version.

Delivery status is not misrepresented as confirmed receipt or reading.

No autonomous AI-generated public alert publication.

MOD-10 — Response Coordination

Priority: P1  |  Purpose: Help authorized coordinators organize response teams, resources and task assignments.

Submodules / capabilities

Team and responder directory

Resource registry and availability status

Assignment/task creation and priority

Dispatch/accepted/en-route/on-scene/completed status where operationally applicable

Field update and handover notes

Incident-linked activity timeline

Primary workflow

Coordinator reviews incident → selects available team/resource → assigns task → responder acknowledges and updates status → coordinator monitors completion.

Acceptance criteria

Only authorized coordinators can create/modify assignments.

Responders can update only their own/assigned tasks.

Assignment history and timestamps are retained.

Availability is labelled with last update time.

MOD-11 — Recovery & Relief Management

Priority: P1  |  Purpose: Track post-event impact, needs, relief and recovery activities.

Submodules / capabilities

Damage assessment records and evidence

Affected population/asset summaries where verified

Relief request and eligibility/status

Inventory/allocation and distribution record

Recovery activity, owner and progress

Post-event review and lessons learned

Primary workflow

Authorized field user records assessment → reviewer validates → needs are recorded → relief allocation is approved → distribution/progress is updated → event recovery is reviewed.

Acceptance criteria

Assessment source and verification status are visible.

Relief allocation changes are auditable.

Sensitive beneficiary information is access-controlled.

Unverified estimates are distinguished from confirmed counts.

MOD-12 — Analytics, Audit & Reporting

Priority: P1  |  Purpose: Provide role-appropriate summaries and a traceable history of platform activity.

Submodules / capabilities

Operational dashboard metrics

Incident and alert trend summaries

Asset and observation status views

AI forecast history and model performance summaries

Audit search for privileged actions

Export/report generation with access controls

Primary workflow

Authorized user selects scope/time range → API applies jurisdiction and permission filters → aggregates records → displays provenance/time window → export is logged.

Acceptance criteria

Dashboard totals can be traced to underlying records and time windows.

Personal data is excluded or masked unless necessary and authorized.

Audit records cannot be edited through normal application workflows.

Synthetic/demo data is labelled in charts and exports.

MOD-13 — Integration & Platform Operations

Priority: P0 foundation  |  Purpose: Provide shared infrastructure for external connectivity, asynchronous work and service health.

Submodules / capabilities

Weather/map/notification/sensor provider adapters

Inbound webhook/API authentication

Background job scheduling and retries if queue adopted

Configuration and secret references

Health/readiness endpoints and structured logs

Operational metrics, error tracking and backup hooks

Primary workflow

Adapter receives request/event → validates provider identity and payload → maps to internal contract → invokes module service → records outcome → retries transient failures safely.

Acceptance criteria

Provider credentials are never exposed to browser clients.

External outages do not corrupt core records.

Retryable operations are idempotent or deduplicated.

Service health and integration failure are observable.

4. Cross-module workflows and dependencies

| Workflow | Modules involved | Key handoff |
| --- | --- | --- |
| Asset monitoring to forecast | MOD-04 → MOD-05 → MOD-06 | Asset/station identity and validated observations become inference inputs. |
| Forecast to alert | MOD-06 → MOD-09 → MOD-13 | Advisory assessment enters human approval workflow; approved alert is distributed through adapters. |
| Citizen SOS to response | MOD-08 → MOD-07 → MOD-10 → MOD-13 | SOS is triaged into incident; coordinator assigns response resource; updates are recorded. |
| Incident map view | MOD-07 + MOD-02 + MOD-12 | Incident geometry and authorized map layers feed dashboards and spatial filtering. |
| Event recovery | MOD-07 → MOD-11 → MOD-12 | Closed/ongoing event links damage, relief and recovery records to reporting. |
| Governance traceability | All modules → MOD-12/MOD-13 | Sensitive actions and integration outcomes produce audit/operational records. |

4.1 Dependency rules

MOD-06 depends on MOD-04 and MOD-05 for asset context and validated observations.

MOD-09 depends on MOD-01 for approval permissions and MOD-02 for geographic targeting.

MOD-08 depends on MOD-01, MOD-02 and MOD-07 for identity, location and incident linkage.

MOD-10 depends on MOD-07 and MOD-01 for incident ownership and role-scoped assignments.

MOD-11 depends on MOD-07 and MOD-01 for event linkage and access control.

MOD-12 reads authorized data from domain modules; it must not bypass their access policies.

5. Shared domain rules and status models

5.1 Observation classification

| Class | Meaning | Required display treatment |
| --- | --- | --- |
| OBSERVED | Measured value from identified instrument/provider. | Show source, observed timestamp, unit and freshness. |
| MANUAL_REPORTED | Entered by an authorized human or submitted by a citizen. | Show reporter/source and verification status. |
| SYNTHETIC | Artificial sample/test/demo record. | Prominent DEMO/SYNTHETIC label; exclude from real-world accuracy claims. |
| DERIVED | Calculated from one or more observations/known parameters. | Show calculation/method and input references. |
| PREDICTED | Generated by a model for a future time/horizon. | Show model/version, issue time, horizon and limitations. |

5.2 Suggested lifecycle states

| Entity | Suggested states |
| --- | --- |
| Incident | NEW → TRIAGED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED; allow CANCELLED with reason. |
| SOS request | RECEIVED → UNDER_REVIEW → LINKED_TO_INCIDENT / ACTIONED / CLOSED; retain acknowledgement separately. |
| Alert | DRAFT → IN_REVIEW → APPROVED → PUBLISHED → UPDATED / EXPIRED / CANCELLED; rejection returns to DRAFT or REJECTED. |
| Response assignment | CREATED → OFFERED → ACCEPTED → IN_PROGRESS → COMPLETED; allow DECLINED / CANCELLED with reason. |
| Data ingestion | RECEIVED → VALIDATED → STORED; invalid payload may be REJECTED or QUARANTINED. |
| Inference job | QUEUED → RUNNING → SUCCEEDED / FAILED / REJECTED_INPUT / TIMED_OUT. |

These states are proposed controlled vocabularies. Exact transitions, permitted actors and terminal-state rules must be finalized in the API and database documents.

6. Team ownership suggestion

For a four-person team, assign clear module ownership while keeping integration responsibilities shared. The project lead should not become the sole integrator or reviewer.

| Team role | Primary ownership | Shared responsibility |
| --- | --- | --- |
| Member 1 — Product/Integration lead | Requirements, workflow consistency, authority dashboard integration, release coordination | Architecture reviews, demo narrative, acceptance sign-off |
| Member 2 — Frontend/PWA | React interfaces, maps, citizen and responder flows, API client and UI states | Accessibility, responsive testing and integration |
| Member 3 — Backend/Database | NestJS modules, PostgreSQL schema/migrations, authentication, incidents, alerts and APIs | API contracts, audit and security testing |
| Member 4 — AI/Data | Python service, data ingestion/preprocessing, flood/dam model experiments and evaluation | Data provenance, model tests and AI integration |

Ownership is a starting proposal. Each P0 module needs a named primary owner and a backup reviewer. The same person should not be the only author and approver of a safety-critical workflow.

7. Recommended implementation sequence

| Phase | Build outcome | Modules |
| --- | --- | --- |
| Phase 0 — Foundation | Repository, environments, lint/test pipeline, database connection, API conventions and shared types. | MOD-01 foundation, MOD-13 foundation |
| Phase 1 — Pilot asset and observations | Nanded geography, Vishnupuri asset profile, station/sensor placeholders, manual observation capture and map view. | MOD-02, MOD-03, MOD-04, MOD-05 |
| Phase 2 — Intelligence vertical slice | Data-quality checks, baseline forecast/rule pipeline, AI service contract, model metadata and forecast dashboard. | MOD-06 |
| Phase 3 — Incident and alert workflow | Incident lifecycle, citizen report/SOS, alert draft/review/approval and demo notification adapter. | MOD-07, MOD-08, MOD-09 |
| Phase 4 — Response and reporting | Team/resource assignment, basic recovery records, audit and operational dashboards. | MOD-10, MOD-11, MOD-12 |

7.1 Definition of done for a module

Module purpose, owner, dependencies and permissions are documented.

DTOs/contracts and validation rules are defined.

Database changes have migrations and appropriate constraints/indexes.

Unit and integration tests cover normal, invalid and unauthorized cases.

Errors and important state changes are logged without leaking sensitive data.

UI shows loading, empty, error, stale and success states as applicable.

Acceptance criteria are demonstrated using labelled sample data.

Module documentation and API contract are updated.

8. Global acceptance criteria for the first pilot

A platform administrator can create/activate users and assign scoped roles.

An authorized operator can register Vishnupuri Dam and attach available monitoring metadata.

An authorized operator can enter a timestamped water-level or related observation with source and unit.

The system flags missing, stale, malformed or synthetic data appropriately.

The intelligence workflow can return a forecast or an explicit safe unavailable state; it does not fabricate values.

Forecast outputs identify horizon, model version, issue time, input provenance and limitations.

An authorized authority user can review a risk assessment and approve/reject an alert.

An unapproved alert cannot be published, and approval/publication actions are auditable.

A citizen can submit an SOS/report and receive a tracking reference.

An authorized coordinator can triage an SOS-linked incident and assign a response task.

All demo data and non-live integrations are visibly labelled.

The pilot can be demonstrated without claiming official operational status or validated public-warning capability.

9. Open decisions to resolve in companion documents

| Decision | Current position | Resolve in |
| --- | --- | --- |
| PostGIS extension and coordinate reference system | Recommended; not yet formally approved | 05 Database Design |
| Prisma ORM and migration workflow | Proposed | 05 Database Design / 03 Architecture |
| Exact role/permission matrix and jurisdiction inheritance | Concept defined; granular matrix pending | 08 Security & RBAC |
| Exact REST endpoints and error schema | Not defined here | 06 API Documentation |
| Model algorithms, dataset sources and feature definitions | Candidate approach only; dependent on data audit | 07 AI/ML Specification |
| Cloud provider, region and notification vendors | Open | 10 Deployment & Operations |
| Numerical performance, availability and retention targets | Open pending pilot assumptions | 02 SRS / 10 Deployment |
| Official data feeds and authority integrations | Require access and authorization | 06 API / 10 Deployment |

10. Approval checklist

Confirm module catalogue and P0/P1 priorities.

Confirm P0 pilot workflows and exclusions.

Review role boundaries, especially alert approval and citizen privacy.

Review module dependencies and four-person ownership proposal.

Approve or amend the shared status models.

Identify the first vertical slice to implement and its acceptance-test owner.

Appendix A — Naming conventions

Module identifiers use MOD-XX and remain stable across revisions.

API route names should use plural resource nouns and versioned prefixes.

Database identifiers should use consistent snake_case naming unless the team formally selects another convention.

Every observation, forecast, alert and incident should have a stable identifier and created/updated timestamps.

External provider identifiers must be stored separately from internal primary identifiers.

Appendix B — Key safety and operational note

AAPADAMITRA is a decision-support and coordination platform. In the initial release, no model or automated rule may directly operate dam gates, issue evacuation orders, declare an emergency or publish an unreviewed public warning. Public-safety use requires validated data, documented operating procedures, authorized human oversight, tested delivery channels and approval by the responsible authority.