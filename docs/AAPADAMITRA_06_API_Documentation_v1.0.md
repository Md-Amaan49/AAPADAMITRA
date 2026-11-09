AAPADAMITRA

06. API DOCUMENTATION

REST endpoint catalogue, contracts, authorization, validation and integration

Version 1.0  |  08 November 2026React PWA and dashboard • NestJS REST API • OpenAPI 3.xPostgreSQL/PostGIS • Python FastAPI AI serviceInitial pilot: Nanded district, Maharashtra

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-API-006 |
| Version / status | 1.0 / Proposed API contract baseline; review before implementation |
| Purpose | Define API conventions, endpoint inventory, request/response contracts, access rules and service integrations. |
| Audience | Frontend, backend, AI/data, QA, security and DevOps teams |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture; 04 Module Specification; 05 Database Design; 07 AI/ML Specification; 08 Security & RBAC; 09 Testing Strategy; 10 Deployment & Operations |

1. API design goals and boundaries

Expose stable, versioned APIs for citizen, operator, responder and administrator experiences.

Keep module ownership clear: modules expose application services and APIs; other modules do not query their tables directly.

Separate public citizen functions from authenticated operational functions and privileged authority actions.

Use asynchronous jobs for long-running inference, bulk ingestion, notification fan-out and report generation.

Make critical actions auditable, idempotent where retries are expected, and traceable through request/correlation IDs.

Treat AI outputs as decision support. Public warning publication requires the defined human approval workflow.

Never expose credentials, internal provider tokens, raw sensitive records or private responder/citizen data through public endpoints.

1.1 Out of scope

Final provider-specific API contracts until data providers and access permissions are confirmed.

Physical control of dams, gates, pumps or other infrastructure.

Guaranteeing emergency response, rescue dispatch or delivery of a notification.

Final authentication vendor choice, production hostnames, rate limits and service-level objectives; these remain deployment/security decisions.

2. API platform conventions

| Convention | Standard |
| --- | --- |
| Base path | /api/v1 |
| Transport | HTTPS only outside local development |
| Format | JSON; UTF-8 |
| Naming | lowercase kebab-case resource paths; camelCase JSON properties |
| Identifiers | UUID strings for internal resource IDs; human-readable reference codes for display |
| Time | ISO 8601 timestamps with timezone; persist UTC |
| Pagination | Cursor-based for large/event feeds; bounded page/limit where suitable |
| Filtering | Explicit query parameters; document allowed values and combinations |
| Sorting | Allowlisted sort fields only; default deterministic ordering |
| Versioning | Path versioning (/api/v1); additive compatible changes within v1 |
| Errors | Consistent application error envelope |
| Documentation | OpenAPI 3.x generated from NestJS decorators; publish Swagger UI only in approved environments |
| Traceability | Accept or generate X-Request-Id; propagate correlation ID to jobs and integrations |

2.1 HTTP method semantics

| Method | Use | Expected behavior |
| --- | --- | --- |
| GET | Read resource or collection | Safe; no state changes. |
| POST | Create resource or initiate command/job | Return created resource or accepted job. |
| PUT | Replace a resource representation | Use only where full replacement semantics are intended. |
| PATCH | Partial update or state transition | Validate allowed fields and transition rules. |
| DELETE | Remove/deactivate resource | Use sparingly; preserve audit and operational history. |

2.2 Response status codes

| Code | Meaning / use |
| --- | --- |
| 200 | Successful read or update. |
| 201 | Resource created. |
| 202 | Asynchronous job accepted; poll job status. |
| 204 | Successful operation with no response body. |
| 400 | Malformed request or invalid parameter. |
| 401 | Missing, invalid or expired authentication. |
| 403 | Authenticated but not authorized. |
| 404 | Resource not found or not visible to caller. |
| 409 | Conflict, duplicate or invalid state transition. |
| 422 | Well-formed request that fails domain validation. |
| 429 | Rate limit exceeded. |
| 500 | Unexpected internal error; do not leak stack traces. |
| 502/503/504 | Upstream dependency failure, unavailable service or timeout. |

3. Authentication and authorization contract

Authentication implementation is not finalized. The API must support a pluggable identity provider. The following is the recommended bearer-token contract if JWT-based access tokens are selected.

Authorization: Bearer <access_token>X-Request-Id: <client-generated-uuid>Idempotency-Key: <unique-key-for-retryable-POST>

Access tokens must be short-lived and validated for signature, issuer, audience, expiry and intended use.

Refresh tokens, if used, must be securely stored and rotated/revoked according to the selected identity-provider design.

Never accept user_id, role or organization scope supplied in a request body as proof of identity or authorization.

Resolve actor identity and scoped roles from validated claims and server-side membership/permission data.

Enforce organization and geographic scope on every read and write; apply deny-by-default behavior.

Require stronger authentication or additional approval controls for privileged alert publication and authority administration, as decided in Document 08.

Public endpoints must have abuse controls, input validation and privacy-aware response fields.

3.1 Role and permission shorthand

| Role shorthand | Typical API access |
| --- | --- |
| PUBLIC | Read published public information; submit permitted public reports/SOS. |
| CITIZEN | Manage own profile and own submissions; view public alerts. |
| RESPONDER | View assigned tasks/incidents; update own task progress; limited operational data. |
| OPERATOR | Manage observations, draft incidents/alerts and operational records within scope. |
| AUTHORITY_REVIEWER | Review evidence, validate incident/forecast and review alert drafts. |
| AUTHORITY_APPROVER | Approve/publish/cancel alerts within explicitly granted jurisdiction. |
| ADMIN | Manage configuration and access only within assigned administrative scope; admin is not automatically an alert approver. |

4. Common request and response patterns

4.1 Resource response

{  "data": {    "id": "7a3d9d8e-0d32-4b18-a7bd-1ef3f0d6d0e1",    "status": "active",    "createdAt": "2026-11-08T09:30:00Z"  },  "meta": {    "requestId": "8d2a3a30-7a5f-43b4-8b10-1d80b3a15e55"  }}

4.2 Collection response

{  "data": [],  "meta": {    "requestId": "8d2a3a30-7a5f-43b4-8b10-1d80b3a15e55",    "pagination": {      "nextCursor": null,      "hasMore": false    }  }}

4.3 Error response

{  "error": {    "code": "VALIDATION_ERROR",    "message": "The request contains invalid fields.",    "details": [      { "field": "validTo", "issue": "must be later than validFrom" }    ]  },  "meta": {    "requestId": "8d2a3a30-7a5f-43b4-8b10-1d80b3a15e55"  }}

Error messages must be safe for end users. Detailed stack traces and provider responses belong in protected logs, not API responses.

4.4 Pagination and filtering

GET /api/v1/incidents?status=open&hazardType=flood&limit=25&cursor=<opaque>GET /api/v1/observations?assetId=<uuid>&metricCode=water_level&from=2026-11-01T00:00:00Z&to=2026-11-08T00:00:00Z

Set a server-enforced maximum page size (recommended initial cap: 100).

Use opaque cursors; do not expose raw database offsets for high-volume event streams.

Validate date ranges and impose a maximum query window for expensive time-series endpoints.

Apply authorization scope before pagination so totals and cursors do not reveal inaccessible records.

5. API endpoint catalogue

The endpoints below are the proposed v1 inventory. They are design contracts, not evidence that routes have already been implemented. All protected endpoints require authentication and server-side permission checks unless explicitly marked public.

5.1 Health and platform

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | /health/live | None | Liveness probe; no sensitive dependency details. |
| GET | /health/ready | Internal/monitoring | Readiness including required dependencies. |
| GET | /api/v1/meta | PUBLIC | API version and supported public configuration. |

5.2 Identity and user profile

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| POST | /api/v1/auth/session | PUBLIC | Initiate login with selected identity provider. |
| POST | /api/v1/auth/session/refresh | PUBLIC/refresh credential | Refresh session if provider design supports it. |
| POST | /api/v1/auth/session/logout | Authenticated | Revoke current session/token where supported. |
| GET | /api/v1/users/me | Authenticated | Read current user's profile and scoped roles. |
| PATCH | /api/v1/users/me | CITIZEN/own profile | Update allowlisted profile fields. |
| GET | /api/v1/users/me/permissions | Authenticated | Return effective UI permission hints; server remains authoritative. |

5.3 Geography and GIS

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | /api/v1/geography/areas | PUBLIC | Browse approved administrative geography. |
| GET | /api/v1/geography/areas/{areaId} | PUBLIC | Area metadata and parent/child summary. |
| GET | /api/v1/geography/areas/{areaId}/risk-summary | PUBLIC, sanitized | Published risk summary only. |
| GET | /api/v1/geography/zones | PUBLIC, published only | List active public alert zones. |
| GET | /api/v1/geography/features | PUBLIC, allowlisted | Query approved map features by bbox/type. |

5.4 Hazard catalogue and assets

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | /api/v1/hazards | PUBLIC | List supported hazard types. |
| GET | /api/v1/hazards/{hazardCode} | PUBLIC | Hazard description and supported data indicators. |
| GET | /api/v1/assets | Scoped operator | Search assets within authorized geography. |
| POST | /api/v1/assets | asset.create | Create asset with validated source and location. |
| GET | /api/v1/assets/{assetId} | Scoped read | Read asset details. |
| PATCH | /api/v1/assets/{assetId} | asset.update | Update permitted asset fields. |
| GET | /api/v1/assets/{assetId}/observations | Scoped read | Time-series observations. |
| GET | /api/v1/assets/{assetId}/forecasts | Scoped read | Forecasts associated with asset. |

5.5 Data ingestion and observations

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| POST | /api/v1/ingestion/runs | ingestion.manage | Start an approved ingestion run. |
| GET | /api/v1/ingestion/runs/{runId} | ingestion.read | Run status and counts. |
| POST | /api/v1/observations | observation.create | Submit validated observation; source provenance required. |
| GET | /api/v1/observations | Scoped read | Filter by asset/station/metric/time. |
| GET | /api/v1/observations/{observationId} | Scoped read | Read one observation and quality metadata. |

5.6 AI/ML, forecasts and risk

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| POST | /api/v1/ai/forecast-jobs | forecast.request | Request supported forecast job; returns 202 and job ID. |
| GET | /api/v1/ai/jobs/{jobId} | Scoped read | Poll asynchronous inference status. |
| GET | /api/v1/forecasts | Scoped read | Query forecasts by hazard, area, asset and valid time. |
| GET | /api/v1/forecasts/{forecastId} | Scoped read | Read forecast, model provenance and limitations. |
| GET | /api/v1/risk-assessments | Scoped read | Read risk assessments and review state. |
| POST | /api/v1/risk-assessments/{assessmentId}/review | risk.review | Record human review decision and rationale. |

5.7 Incidents and citizen reporting

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| POST | /api/v1/citizen-reports | PUBLIC with abuse controls | Submit a report with optional location and attachment references. |
| GET | /api/v1/citizen-reports/mine | CITIZEN | List own reports only. |
| GET | /api/v1/citizen-reports/{reportId} | Owner or scoped operator | Read report subject to privacy policy. |
| POST | /api/v1/sos-requests | PUBLIC with strong abuse controls | Submit SOS request; receipt is not dispatch confirmation. |
| GET | /api/v1/sos-requests/mine | CITIZEN | View own SOS requests. |
| GET | /api/v1/incidents | incident.read | List incidents within scope. |
| POST | /api/v1/incidents | incident.create | Create incident from verified/authorized workflow. |
| GET | /api/v1/incidents/{incidentId} | incident.read | Read incident and permitted timeline. |
| PATCH | /api/v1/incidents/{incidentId} | incident.update | Update allowlisted fields with state validation. |
| POST | /api/v1/incidents/{incidentId}/events | incident.update | Append timeline event; no silent history rewrite. |

5.8 Alerts and notifications

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | /api/v1/alerts | PUBLIC, published only | List current/recent public alerts. |
| GET | /api/v1/alerts/{alertId} | PUBLIC, published only | Read published alert version and instructions. |
| POST | /api/v1/alerts | alert.draft | Create draft alert. |
| PATCH | /api/v1/alerts/{alertId} | alert.draft | Edit draft; published content is versioned. |
| POST | /api/v1/alerts/{alertId}/submit-review | alert.submit | Submit draft for review. |
| POST | /api/v1/alerts/{alertId}/approve | alert.approve | Approve alert with reviewer/approver separation as configured. |
| POST | /api/v1/alerts/{alertId}/publish | alert.publish | Publish approved version and enqueue notification outbox event. |
| POST | /api/v1/alerts/{alertId}/cancel | alert.cancel | Cancel with reason and audit event. |
| GET | /api/v1/alerts/{alertId}/deliveries | alert.delivery.read | Authorized delivery status summary; no unnecessary recipient PII. |

5.9 Response coordination

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | /api/v1/response/teams | response.read | List teams within scope. |
| GET | /api/v1/response/resources | response.read | Resource inventory and availability. |
| POST | /api/v1/response/tasks | task.create | Create task linked to incident. |
| GET | /api/v1/response/tasks | task.read | List tasks within scope or assigned to user. |
| GET | /api/v1/response/tasks/{taskId} | task.read | Read task and timeline. |
| PATCH | /api/v1/response/tasks/{taskId}/status | task.update.assigned | Apply permitted state transition. |
| POST | /api/v1/response/tasks/{taskId}/events | task.update.assigned | Append task progress event. |

5.10 Recovery and relief

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| POST | /api/v1/recovery/damage-assessments | recovery.assess | Create assessment with evidence and verification status. |
| GET | /api/v1/recovery/damage-assessments | recovery.read | List assessments within scope. |
| POST | /api/v1/recovery/relief-requests | relief.request | Create relief request. |
| GET | /api/v1/recovery/relief-requests | relief.read | List requests within scope. |
| POST | /api/v1/recovery/relief-requests/{requestId}/allocations | relief.allocate | Approve and record allocation. |
| GET | /api/v1/recovery/actions | recovery.read | Read recovery programme progress. |

5.11 Analytics, audit and administration

| Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- |
| GET | /api/v1/analytics/overview | analytics.read | Aggregated, scope-filtered operational summary. |
| POST | /api/v1/reports | report.create | Start report generation; return job ID. |
| GET | /api/v1/reports/{reportId} | report.read | Report job status and authorized download reference. |
| GET | /api/v1/audit-logs | audit.read | Restricted audit search. |
| GET | /api/v1/admin/roles | access.manage | List configurable roles. |
| POST | /api/v1/admin/users/{userId}/role-grants | access.manage | Grant scoped role with expiry where appropriate. |
| DELETE | /api/v1/admin/users/{userId}/role-grants/{grantId} | access.manage | Revoke role grant and audit action. |

6. Key request/response contracts

6.1 Create citizen report

POST /api/v1/citizen-reports{  "reportType": "flooding",  "description": "Water accumulation reported near the stated location.",  "location": { "latitude": 19.15, "longitude": 77.30, "accuracyMeters": 25 },  "areaId": "UUID",  "attachmentIds": []}201 Created{  "data": {    "id": "UUID",    "reference": "CR-2026-000001",    "verificationStatus": "pending",    "submittedAt": "2026-11-08T09:30:00Z"  },  "meta": { "requestId": "UUID" }}

The example location is illustrative, not a verified incident location. Public submission endpoints need throttling, spam detection, attachment scanning, consent/privacy notices and a clear report-receipt message.

6.2 Request a forecast

POST /api/v1/ai/forecast-jobs{  "hazardCode": "flood",  "areaId": "UUID",  "assetId": "UUID",  "requestedHorizons": ["short_term", "medium_term"],  "requestedAt": "2026-11-08T09:30:00Z"}202 Accepted{  "data": {    "jobId": "UUID",    "status": "queued",    "statusUrl": "/api/v1/ai/jobs/UUID"  },  "meta": { "requestId": "UUID" }}

The service must reject unsupported hazard/horizon combinations and report data sufficiency. The API must not promise that a forecast will be available or accurate for every location and time.

6.3 Draft and publish an alert

POST /api/v1/alerts{  "hazardCode": "flood",  "title": "Flood risk information",  "message": "Approved public-facing message goes here.",  "instructions": ["Follow instructions from authorized local authorities."],  "target": { "areaIds": ["UUID"] },  "validFrom": "2026-11-08T10:00:00Z",  "validTo": "2026-11-08T18:00:00Z",  "languageCode": "en"}Workflow:draft -> submitted_for_review -> approved -> published                                  \-> rejectedpublished -> cancelled (with reason and audit trail)

Draft creation does not notify the public.

Approval and publication must be separate auditable actions where staffing permits; enforce separation of duties for high-impact alerts.

Publishing creates an immutable version and an outbox event in the same database transaction.

Notification delivery is asynchronous; API response must distinguish queued, provider-accepted, delivered and failed states.

Only authorized officials may issue official warnings. The platform must clearly label advisory or model-generated content.

6.4 Update responder task status

PATCH /api/v1/response/tasks/{taskId}/status{  "status": "in_progress",  "note": "Task accepted and work commenced."}200 OK{  "data": {    "taskId": "UUID",    "status": "in_progress",    "updatedAt": "2026-11-08T10:10:00Z"  },  "meta": { "requestId": "UUID" }}

The backend validates the transition against the state machine and caller's assignment/scope, then appends a task event. Clients cannot set arbitrary completed/verified fields without the required workflow.

7. API validation rules

Validate all request bodies using DTO validation; reject unknown fields for privileged commands where practical.

Validate UUID formats, enum values, string lengths, array sizes and numeric ranges.

Validate latitude [-90, 90], longitude [-180, 180], coordinate order and optional accuracy.

Require explicit units for all physical measurements and reject incompatible metric/unit pairs.

Validate time windows: end after start, supported forecast horizons and maximum query spans.

Validate state transitions in domain services; do not accept a status value simply because it is a valid enum.

Sanitize rich text and never trust client-provided HTML.

Apply file type, file size, malware scan and private object-storage controls to attachments.

Use allowlisted sort/filter fields to avoid unsafe query construction.

8. AI service integration contract

The NestJS API is the client-facing system boundary. The Python FastAPI service is an internal service and should not be called directly by the public PWA.

| Direction | Contract |
| --- | --- |
| NestJS -> AI service | Authenticated internal request containing job ID, hazard, model selection, area/asset scope, input references, horizons and correlation ID. |
| AI service -> NestJS | Structured job status and result reference; include model/version, generated time, input window, metric/unit, horizon, quality flags and limitations. |
| Result persistence | NestJS validates the response contract and persists approved result structures in forecast/risk tables, or delegates through a clearly owned persistence adapter. |
| Failure handling | Timeout, retry with bounded policy, dead-letter/manual review for repeated failure; preserve job failure reason. |
| Security | Private network/service identity, least privilege, schema validation and no public AI-service exposure. |

Internal result shape (illustrative):{  "jobId": "UUID",  "model": { "code": "flood_forecast", "version": "0.1.0" },  "status": "completed",  "issuedAt": "2026-11-08T10:00:00Z",  "inputWindow": {    "from": "2026-11-07T00:00:00Z",    "to": "2026-11-08T00:00:00Z"  },  "forecasts": [{    "metricCode": "water_level",    "value": 0,    "unit": "m",    "targetTime": "2026-11-08T12:00:00Z",    "qualityFlag": "illustrative"  }],  "limitations": ["Example contract only; not a live forecast."]}

The numeric value above is a schema placeholder, not a real measurement or prediction. Document 07 must define hazard-specific model inputs, outputs, evaluation and confidence semantics.

9. External provider integrations

Create one adapter per provider; normalize provider payloads into internal observation/event contracts.

Keep provider credentials in a secret manager and reference them by configuration identifier.

Record provider name, external record ID, retrieval time, source timestamp, unit, quality status and raw payload reference when permitted.

Use bounded retries with exponential backoff and jitter; respect provider rate limits and terms.

Deduplicate callbacks and repeated data using external event IDs or stable idempotency keys.

Do not treat an integration outage as evidence that the hazard is absent; surface data freshness and unavailable-source status.

Maintain a provider capability register: data type, geography, update frequency, authentication, licence/permission, uptime expectation and owner.

10. Security, privacy and abuse prevention

Enforce TLS, secure headers, strict CORS allowlists and safe cookie settings if cookies are used.

Apply authentication and authorization guards at controller/service boundaries; test object-level authorization to prevent IDOR.

Rate-limit login, OTP, SOS, citizen reports, search and expensive analytics endpoints.

Use idempotency keys for retryable create/command endpoints and prevent replay of sensitive actions.

Log actor, action, target, time, outcome and request ID; redact tokens, passwords, OTPs, precise citizen details and sensitive payloads.

Restrict precise location, contact information and attachments to authorized roles and legitimate purpose.

Validate webhook signatures and timestamps; reject replayed or unsigned callbacks.

Set payload-size limits, request timeouts, safe file upload rules and dependency timeouts.

Return generic authentication errors and avoid confirming whether an account/phone number exists.

Conduct threat modelling and security testing before public pilot launch.

11. Reliability, observability and performance

| Concern | Required behavior |
| --- | --- |
| Request tracing | Generate/propagate request and correlation IDs across NestJS, AI jobs and providers. |
| Structured logs | JSON logs with route template, actor ID where permitted, latency, status and trace ID; no secrets. |
| Metrics | Request rate, latency, error rate, job queue depth, inference duration, provider freshness, delivery outcomes and DB pool health. |
| Timeouts | Set explicit per-route and per-provider timeouts; async work returns 202 rather than holding a request open. |
| Retries | Retry only safe/idempotent operations or operations protected by idempotency keys. |
| Caching | Cache public read-mostly catalogues and approved map layers; never cache private responses across users. |
| Degradation | Display stale/unavailable source indicators; do not silently present stale data as live. |
| Health endpoints | Separate liveness from readiness; do not expose internal dependency details publicly. |

12. NestJS implementation structure

src/  main.ts  app.module.ts  common/    auth/ guards/ decorators/    dto/ filters/ interceptors/ pipes/    pagination/ validation/ tracing/  modules/    identity/    geography/    hazards/    assets/    ingestion/    observations/    ai-orchestration/    forecasts/    incidents/    citizen-reports/    sos/    alerts/    notifications/    response/    recovery/    analytics/    audit/    integrations/  infrastructure/    prisma/    queue/    object-storage/    secrets/    telemetry/  openapi/

Each module owns its controller, DTOs, application service, domain rules and persistence adapter/repository.

Controllers handle HTTP concerns; application services orchestrate use cases; domain services enforce business invariants.

Use DTOs as external contracts; never expose Prisma/database models directly as API responses.

Use explicit mapping between persistence entities and response DTOs.

Publish domain events through an outbox/queue for asynchronous cross-module work.

13. OpenAPI and developer workflow

Implement DTOs and response schemas before or alongside controller code.

Annotate routes, authentication schemes, parameters, status codes and examples using NestJS Swagger decorators.

Generate the OpenAPI document in CI and validate it for breaking changes.

Publish versioned API docs for the frontend and QA team.

Generate typed frontend API clients from the OpenAPI specification where practical.

Maintain mock responses and seed fixtures for frontend work before all backend modules are complete.

Require endpoint contract tests for high-risk workflows such as SOS submission, alert approval/publication and task transitions.

13.1 Example OpenAPI security declaration (illustrative)

components:  securitySchemes:    bearerAuth:      type: http      scheme: bearer      bearerFormat: JWTsecurity:  - bearerAuth: []paths:  /api/v1/incidents:    get:      summary: List incidents visible to the caller      responses:        '200':          description: Incident collection        '401':          description: Authentication required        '403':          description: Insufficient permission

14. API acceptance criteria

Every implemented route is included in the generated OpenAPI specification with request, response, status and permission documentation.

All routes are versioned under /api/v1 except explicitly internal health/monitoring routes.

Authentication and object-level authorization tests prevent cross-user, cross-organization and cross-area data leakage.

All write endpoints validate DTOs and domain constraints; invalid state transitions return consistent errors.

Collection endpoints implement bounded pagination and server-side scope filtering.

Long-running AI, notification, ingestion and report workflows return asynchronous job identifiers and expose status endpoints.

Alert draft, review, approval, publication, cancellation and notification outcomes are separately traceable.

SOS and citizen-report endpoints include abuse controls, privacy safeguards and clear receipt semantics.

Request IDs and structured logs correlate frontend requests with internal jobs and provider calls.

OpenAPI schema validation and critical API contract tests run in CI.

15. Four-member team implementation split (proposal)

| Owner | Primary API responsibilities | Collaboration |
| --- | --- | --- |
| Member 1 — Backend lead | NestJS foundation, identity, authorization, geography, assets, Prisma and API conventions. | Reviews contracts and database integration. |
| Member 2 — Frontend | React PWA/dashboard integration, typed API client, auth/session UI, citizen and operator workflows. | Uses OpenAPI/mock server; reports contract gaps. |
| Member 3 — AI/data | Python FastAPI service, forecast job contract, ingestion adapters, model provenance and data quality. | Coordinates with backend on inference schema. |
| Member 4 — Full-stack/QA/DevOps | Incident/alert/response endpoints or assigned backend module, API tests, CI, deployment, observability and integration testing. | Owns end-to-end verification and release checklist. |

The split is a starting point, not a fixed assignment. One person should own each module's contract, and another should review critical authorization and alert workflows.

16. Decisions required before implementation

| Decision | Current position | Must resolve |
| --- | --- | --- |
| Identity provider and session strategy | JWT bearer contract documented; vendor/flow undecided. | Before auth implementation. |
| Permission catalogue and scope rules | Role shorthand proposed; detailed matrix belongs in Document 08. | Before protected endpoints. |
| API hostname and environments | Not set. | Before deployment. |
| Provider list and contracts | Adapters planned; providers not confirmed. | Before live ingestion. |
| AI job/result schema | Illustrative contract only. | Jointly with Document 07. |
| Rate limits and SLOs | Safe defaults required; numeric production targets not committed. | Before public pilot. |
| SOS operating process | Submission/receipt only until real responder workflow is approved. | Before citizen-facing SOS release. |
| Alert authority workflow | Human approval required; exact approving organization and jurisdiction must be confirmed. | Before public alert publication. |

Appendix A — Standard error code catalogue

| Error code | Typical HTTP | Meaning |
| --- | --- | --- |
| VALIDATION_ERROR | 400/422 | Request or domain validation failed. |
| AUTHENTICATION_REQUIRED | 401 | Valid authentication is required. |
| PERMISSION_DENIED | 403 | Caller lacks required permission or scope. |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist or is not visible. |
| STATE_TRANSITION_INVALID | 409 | Requested lifecycle transition is not allowed. |
| DUPLICATE_REQUEST | 409 | Idempotency key or unique business reference already processed. |
| DATA_SOURCE_UNAVAILABLE | 503 | Required provider is unavailable. |
| FORECAST_NOT_SUPPORTED | 422 | Hazard, location or horizon is not supported. |
| FORECAST_DATA_INSUFFICIENT | 422 | Required input data is missing or unsuitable. |
| RATE_LIMIT_EXCEEDED | 429 | Caller exceeded configured request limit. |
| INTERNAL_ERROR | 500 | Unexpected server failure. |

Appendix B — Safety-critical API rule

AAPADAMITRA is a disaster information, decision-support and coordination platform. No endpoint in this specification may directly operate dam gates or other physical infrastructure. AI predictions must be identified as model-generated, carry provenance and limitations, and must not automatically become official public warnings. Alert publication requires an authorized human approval workflow. SOS receipt must never be represented as confirmed dispatch or rescue.