AAPADAMITRA

09. TESTING STRATEGY & QUALITY ASSURANCE

Verification, validation, reliability and release quality gates

Version 1.0  |  08 November 2026Initial pilot: Nanded district, MaharashtraReact PWA • NestJS • PostgreSQL/PostGIS • Python/FastAPI

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-QA-009 |
| Version / status | 1.0 / Proposed baseline; refine measurable thresholds with product owner, domain experts and pilot stakeholders. |
| Purpose | Define test levels, test environments, test data, acceptance criteria, AI validation, operational readiness and release gates. |
| Audience | Product owner, frontend/backend engineers, AI/ML engineer, QA, DevOps and domain reviewers. |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture; 04 Module Specification; 05 Database Design; 06 API Documentation; 07 AI/ML Specification; 08 Security & RBAC; 10 Deployment & Operations. |

1. Purpose and quality objectives

This specification defines how AAPADAMITRA will be verified as a dependable, secure and usable multi-hazard disaster-management platform. Testing must establish that requirements are implemented correctly, modules exchange data reliably, AI outputs are evaluated honestly, and critical workflows fail safely.

Functional correctness: features behave according to approved requirements and state transitions.

Safety: uncertain or unavailable predictions do not become authoritative public warnings automatically.

Reliability: critical services handle transient failures, retries and recovery without corrupting records.

Security and privacy: access boundaries and data handling are tested, not merely documented.

Usability and accessibility: citizens and operational users can complete essential tasks under realistic constraints.

Evidence: every release decision is supported by reproducible test results and traceable defects.

1.1 Scope and exclusions

| In scope | Out of scope |
| --- | --- |
| React PWA, NestJS APIs, PostgreSQL/PostGIS, workers/queues, FastAPI model services, integrations, maps, notifications, audit, deployment and backup/restore. | Certification of forecast models as official warning systems; field validation of evacuation decisions; testing real dam control; guarantee of public-network/provider uptime; formal regulatory certification. |

2. Quality strategy and test pyramid

| Test level | Purpose | Typical tools / approach |
| --- | --- | --- |
| Static checks | Catch defects before execution. | TypeScript compiler, ESLint, formatting, dependency and secret scanning. |
| Unit | Verify isolated business rules and functions. | Jest/Vitest; pytest; React Testing Library. |
| Component | Verify UI components and service modules. | React Testing Library; NestJS TestingModule; pytest fixtures. |
| Integration | Verify database, queue, storage and service boundaries. | Testcontainers, disposable PostgreSQL/PostGIS, mocked provider contracts. |
| API / contract | Verify request/response schemas, auth and compatibility. | Supertest, OpenAPI checks, Pact-style consumer/provider contracts where useful. |
| End-to-end | Verify real user journeys across modules. | Playwright on staging-like environment. |
| Non-functional | Verify performance, resilience, security and accessibility. | k6, OWASP ZAP, axe, fault injection and manual review. |

3. Test governance and traceability

Every P0/P1 requirement must map to one or more test cases and an acceptance result.

Each test case must have an ID, objective, preconditions, data, steps, expected result, actual result, status and evidence link.

Defects must be linked to the affected requirement, build, environment and reproduction steps.

Critical workflow tests must run on pull requests or protected release pipelines as appropriate.

Test outcomes must distinguish pass, fail, blocked, skipped and not applicable; skipped tests require a reason.

Use synthetic or anonymized data in non-production environments; production data requires explicit authorization and controls.

4. Environments and test data

| Environment | Purpose | Data / access rules |
| --- | --- | --- |
| Local development | Fast unit/component checks and feature development. | Synthetic fixtures; isolated local services; no production secrets. |
| CI ephemeral | Repeatable automated tests per change. | Disposable database/containers, deterministic seeds, mocked external services. |
| Staging | Integrated acceptance, E2E, performance rehearsal and release candidate checks. | Production-like configuration; synthetic or anonymized datasets; restricted staff access. |
| Production | Live pilot operation and smoke/monitoring checks. | Real data under approved access, retention, privacy and audit controls. |

4.1 Dataset and scenario management

Maintain versioned synthetic Nanded geography fixtures: district/taluka/village identifiers, river segments, sample assets and representative map layers.

Create deterministic scenario packs for flood, heavy rainfall, drought, heatwave and other prioritized hazards.

Record source, collection period, units, spatial resolution, missingness, quality flags and license/usage constraints for every real dataset.

Separate training, validation and test data by time; avoid leakage from future observations into historical forecasts.

Keep a small, stable golden dataset for regression tests and a larger representative dataset for model evaluation.

Never place secrets, real personal identifiers or precise citizen locations in committed fixtures.

5. Unit and component testing

| Area | Test focus | Acceptance evidence |
| --- | --- | --- |
| Domain logic | Hazard thresholds, severity mapping, incident transitions, assignment and validation rules. | Boundary-value tests and branch coverage for critical rules. |
| NestJS services | DTO validation, guards, policy evaluation, exception handling and transactions. | Unit tests for allow/deny and valid/invalid payloads. |
| React PWA | Forms, validation, loading/error/offline states, accessibility and responsive layout. | Component tests with keyboard and screen-reader-oriented assertions. |
| Python AI services | Feature transformations, units, model input/output schemas and fallback behavior. | pytest results; deterministic fixtures; schema and bounds checks. |
| GIS utilities | Coordinate validation, geometry operations, spatial joins, distance/containment and CRS handling. | Known geometry fixtures with expected outputs and tolerance. |

6. Integration and API testing

Verify NestJS-to-PostgreSQL transactions, constraints, migrations and rollback behavior.

Verify worker/queue retries, dead-letter handling, duplicate delivery and idempotency.

Verify NestJS-to-FastAPI authentication, timeout handling, schema validation, correlation IDs and service unavailability fallback.

Verify external weather/data provider adapters using recorded fixtures and contract tests; test provider failure, stale data and malformed responses.

Verify notification adapters using sandbox/mocked providers; never send test emergency notifications to real public recipients.

Verify object storage upload/download authorization, signed URL expiry and file validation.

Verify API pagination, filtering, sorting, rate limiting, versioning and error response consistency.

6.1 API security test cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| API-001 | Call protected endpoint without token. | 401; no protected data returned. |
| API-002 | Use expired or revoked token. | 401; session rejected. |
| API-003 | Citizen requests another citizen's report by changing ID. | 403 or privacy-preserving 404; no data leakage. |
| API-004 | Responder accesses unassigned incident. | Denied by server-side policy. |
| API-005 | User supplies unauthorized district filter. | Filter does not broaden access; request denied or safely constrained. |
| API-006 | Submit unknown DTO fields or invalid geometry. | Validation rejects request; no partial write. |
| API-007 | Replay alert publication request. | Idempotent result; no duplicate public alert. |
| API-008 | Attempt injection or oversized upload. | Request rejected safely; service remains healthy. |

7. Frontend and PWA testing

Test sign-in, sign-out, token expiry, session revocation and role-dependent navigation.

Test report and SOS forms with valid, invalid, incomplete, duplicate and interrupted submissions.

Test geolocation permission denied, unavailable GPS, inaccurate coordinates and manual location selection.

Test map loading, empty layers, malformed features, slow networks and graceful fallback.

Test notification permission denied, unsupported browser and provider delivery failure.

Test offline/poor-connectivity behavior: clearly label queued versus submitted actions; never imply an SOS or report reached control room until server acknowledgement.

Test installability, service worker update, cache invalidation and prevention of sensitive data being cached inappropriately.

Test responsive behavior on common mobile sizes and desktop operational screens; test keyboard navigation and accessible labels.

8. AI/ML validation strategy

AI models are decision-support components. Evaluation must be hazard-specific and based on temporally held-out data. Model metrics do not, by themselves, establish operational safety or authority to issue warnings.

8.1 Flood forecasting

| Dimension | Evaluation |
| --- | --- |
| Regression error | MAE, RMSE and, where useful, bias for water-level/flow forecasts; report units. |
| Lead-time performance | Report metrics separately for each forecast horizon (for example short, medium and longer horizon defined in Document 07). |
| Event performance | Evaluate rising-water events, peaks, recession periods and threshold crossings separately. |
| Alert-threshold behavior | False alarm rate, missed-event rate, precision, recall and lead time for each defined threshold. |
| Baseline comparison | Compare with persistence, climatology or other simple baseline; complex model must demonstrate measurable value. |
| Uncertainty | Check prediction intervals or confidence calibration where implemented; flag out-of-distribution and low-quality inputs. |
| Generalization | Use chronological holdout and, where data permits, location/event holdout; do not randomly mix adjacent time samples across splits. |

8.2 Other hazard models

| Model / capability | Recommended evaluation |
| --- | --- |
| Rainfall forecast integration | Provider/source validation, bias/error by horizon, freshness, missing data and geographic coverage. |
| Flood-risk classification | Confusion matrix, precision, recall, F1, class imbalance, calibration and spatial validation. |
| Drought monitoring | Agreement with documented reference indices/ground observations, seasonal robustness and missing-data sensitivity. |
| Incident classification | Per-class precision/recall/F1, confusion matrix, abstention/uncertain class and human correction rate. |
| Geospatial exposure mapping | Geometry validity, spatial overlap correctness, coordinate reference checks and expert-reviewed sample areas. |

8.3 AI acceptance gates

Document the dataset provenance, time range, units, exclusions and known quality limitations.

Freeze preprocessing and model artifacts for each evaluation run; record code, configuration and model version.

Use a chronological holdout dataset that is not used for feature selection or tuning.

Report metrics by horizon, location/event where possible, season and relevant operating condition; do not report only one aggregate score.

Compare against a simple baseline and document whether the model adds practical value.

Validate missing, stale, impossible and out-of-range input behavior; the service must return an explicit degraded/unknown status rather than fabricate a forecast.

Define model-specific acceptance thresholds with domain reviewers after inspecting dataset quality and operational requirements; do not invent a universal accuracy threshold.

Require human review for operationally consequential outputs; record overrides and reasons.

Do not promote a model to pilot use solely because offline metrics look good; require shadow-mode evaluation and documented sign-off.

8.4 AI regression and monitoring

Run golden-input regression tests on every model or preprocessing change.

Check schema, units, plausible bounds, NaN/Infinity, latency and deterministic behavior where expected.

Monitor input freshness, missingness, feature distribution drift, prediction distribution and observed error when labels become available.

Separate data drift from concept drift; trigger investigation, not automatic retraining/publication.

Retain model version, input data timestamp, output timestamp, prediction horizon and quality flags for reproducibility.

9. Geospatial and map testing

Validate coordinate ranges, coordinate reference systems, geometry validity and expected spatial units.

Test point-in-polygon and line/polygon intersections against known reference fixtures.

Test boundary conditions on district/taluka edges and points near river/flood polygon boundaries.

Test empty, overlapping, self-intersecting and very large geometries.

Verify map layers clearly communicate timestamp, source, resolution and uncertainty where applicable.

Check that public map outputs do not reveal protected citizen coordinates or restricted infrastructure details.

Ensure spatial queries use indexes and remain within agreed performance budgets on representative data.

10. End-to-end disaster lifecycle scenarios

| Scenario ID | Journey | Expected outcome |
| --- | --- | --- |
| E2E-FLD-001 | Rainfall/water-level data arrives → validation → forecast job → result persisted → authorized operator reviews. | Traceable forecast with source time, horizon, model version and quality status; no automatic official alert. |
| E2E-FLD-002 | Forecast indicates elevated risk → operator drafts alert → reviewer/approver acts → authorized publication. | Only permitted actors complete each transition; public message shows correct geography, time and status; full audit trail. |
| E2E-CIT-001 | Citizen opens PWA → submits incident report with location/media → receives acknowledgement. | Report stored once, reference returned, private details protected and triage queue updated. |
| E2E-SOS-001 | Citizen initiates SOS → backend acknowledges → control room sees request → responder assigned → status updates. | Clear acknowledgement states, assignment history and audit; failure to submit is never shown as success. |
| E2E-RSC-001 | Operator triages incident → assigns responder → responder submits field update/evidence → operator closes or escalates. | Only assigned/authorized users update; state history and evidence retained per policy. |
| E2E-DRT-001 | Drought indicators/data collected → classification/monitoring result → reviewer checks dashboard. | Data provenance, time period, uncertainty and limitations visible; unsupported claims not presented as certainty. |
| E2E-FAIL-001 | Weather provider or AI service unavailable during workflow. | System marks data stale/unavailable, preserves last valid result with timestamp and avoids false certainty. |
| E2E-REC-001 | Application/database/queue interruption → recovery and replay. | No duplicate alert or report; jobs recover safely; integrity and audit records verified. |

11. Performance, load and scalability testing

| Workload | What to measure |
| --- | --- |
| Citizen traffic spike | Concurrent sessions, PWA/API latency, error rate, resource use and login throttling. |
| SOS/report burst | Acknowledgement latency, queue depth, processing delay, duplicate rate and priority handling. |
| Alert distribution | Draft-to-publish workflow latency, provider submission/acknowledgement and retry behavior. |
| Forecast batch | Job duration, queue backlog, data retrieval time, model inference latency and resource use. |
| GIS dashboard | Spatial query latency, map payload size, rendering time and behavior under large feature sets. |
| Database | Connection pool saturation, slow queries, locks, index usage and transaction failures. |

Set numerical service-level objectives only after defining expected pilot user counts, peak-event assumptions, provider limits and deployment capacity. Record baseline and target values in the operational readiness plan; do not treat unmeasured estimates as proven capacity.

12. Security, privacy and accessibility testing

Run automated dependency, secret, static-analysis and container scans in CI.

Test RBAC, geography scope, IDOR, privilege escalation, session revocation, MFA and break-glass audit.

Test CSRF, XSS, injection, SSRF, CORS, upload abuse, rate limits and error leakage.

Verify sensitive fields are absent from analytics, application logs, browser caches and public API responses.

Verify data retention, export, correction and deletion workflows against approved policy.

Run accessibility checks for semantic labels, keyboard navigation, focus order, contrast and error announcements; supplement automation with manual checks.

Arrange independent penetration testing before operational deployment and after major security-sensitive changes.

13. Resilience, backup and recovery testing

Simulate database connection loss, queue outage, provider timeout, AI service crash and object-storage failure.

Verify retry limits, exponential backoff, dead-letter handling, circuit breakers and operator-visible degraded status.

Test worker restart and job replay without duplicate side effects.

Restore database and object-storage backups in an isolated environment; verify referential and file integrity.

Test disaster recovery runbook, restore sequence, secret availability and service dependency ordering.

Define and test recovery time objective (RTO) and recovery point objective (RPO) with the deployment owner.

Ensure emergency workflows have a documented manual fallback when the platform is unavailable.

14. Defect management and severity

| Severity | Definition | Release handling |
| --- | --- | --- |
| S0 Critical | Safety-critical incorrect behavior, unauthorized alert publication, severe data exposure, widespread outage or unrecoverable corruption. | Stop release; immediate containment and incident process. |
| S1 High | Major core workflow broken, authorization bypass, significant forecast/data integrity issue or no viable workaround. | Block release until fixed and regression-tested. |
| S2 Medium | Important feature impaired with workaround; limited scope or non-critical data issue. | Fix before release where practical; otherwise documented owner and deadline. |
| S3 Low | Minor visual, copy or low-impact usability defect. | May be deferred with product owner approval. |

15. Release gates and exit criteria

| Gate | Minimum exit criteria |
| --- | --- |
| Code merge | Lint/type checks pass; unit/component tests pass; no unresolved critical static/security findings; review completed. |
| Integration complete | Critical API and database integration tests pass; migration and rollback behavior checked; service contracts validated. |
| Release candidate | P0/P1 acceptance tests pass; critical E2E flows pass; no open S0/S1 defects; security and privacy checks completed. |
| AI pilot readiness | Dataset provenance and holdout evaluation reviewed; baseline comparison documented; shadow-mode results and domain sign-off recorded; fallback behavior tested. |
| Pilot deployment | Monitoring, audit, backups, restore evidence, incident contacts, rollback and manual fallback documented; authorized operational owner signs off. |
| Post-release | Smoke tests pass; error/latency/queue/model freshness dashboards reviewed; rollback triggers monitored. |

16. Test automation and CI/CD pipeline

Pull request:  format + lint + typecheck  -> unit/component tests  -> API/contract tests  -> dependency + secret scan  -> build artifactMain / release candidate:  -> integration tests (PostgreSQL/PostGIS, queue, storage)  -> E2E critical journeys  -> migration checks  -> container/image scan  -> AI golden-set regression (when model code/data pipeline changes)  -> publish test report + traceability  -> protected approval for deploymentStaging / pilot:  -> smoke tests  -> performance and resilience rehearsal as scheduled  -> release sign-off  -> production deployment + monitoring

17. Recommended test repository structure

apps/  web/    src/    tests/  api/    src/    test/      unit/      integration/      e2e/services/  ai/    app/    tests/      unit/      integration/      golden/tests/  contracts/  scenarios/    flood/    drought/    citizen-report/    sos/    rescue/    alerting/  fixtures/    synthetic-nanded/  performance/  security/docs/  test-plans/  test-reports/  release-checklists/

18. Initial eight-day implementation testing plan

| Day | Testing work | Deliverable |
| --- | --- | --- |
| 1 | Create test tooling, environments, fixtures and requirement-to-test traceability. | CI checks and test skeleton. |
| 2 | Unit tests for auth, RBAC, report/incident domain rules and DTO validation. | Critical backend unit suite. |
| 3 | Database/PostGIS integration, migrations, queue and service contract tests. | Integration suite. |
| 4 | React PWA component tests and citizen report/SOS E2E happy paths. | Frontend and initial E2E evidence. |
| 5 | Flood data pipeline, AI schema, baseline model evaluation and golden tests. | AI evaluation report with limitations. |
| 6 | Alert workflow, role boundaries, GIS and failure/degraded-mode scenarios. | Critical workflow and negative tests. |
| 7 | Performance smoke, security checks, backup/restore rehearsal and defect fixes. | Readiness findings and resolved blockers. |
| 8 | Full regression, release checklist, demo rehearsal and sign-off. | Versioned test report and go/no-go decision. |

This eight-day plan is a competition-focused minimum, not a substitute for production-grade validation. Use synthetic/demo data and clearly label simulated outputs; do not claim field-validated forecasting or operational readiness without evidence.

19. Acceptance criteria summary

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| QA-001 | Traceability for approved requirements. | P0 | Every P0/P1 requirement maps to test case(s) and result. |
| QA-002 | Automated unit/component suite. | P0 | Critical domain rules and UI states have repeatable automated tests. |
| QA-003 | Authorization regression suite. | P0 | Cross-user, cross-role and cross-geography unauthorized access tests are denied. |
| QA-004 | Critical disaster lifecycle E2E suite. | P0 | Forecast review, alert approval, citizen report, SOS and responder assignment journeys pass. |
| QA-005 | AI model validation evidence. | P0 for AI pilot | Temporal holdout, baseline comparison, horizon-specific metrics, limitations and reviewer sign-off recorded. |
| QA-006 | Degraded-mode behavior. | P0 | Stale/unavailable data and failed dependencies are clearly represented; no false success state. |
| QA-007 | Audit coverage. | P0 | Sensitive workflow and privilege events emit attributable audit records. |
| QA-008 | Backup and restore verification. | P1 pilot readiness | A documented restore test completes and integrity checks pass. |
| QA-009 | Performance baseline. | P1 | Representative pilot workload measured; target thresholds approved and results recorded. |
| QA-010 | Accessibility and usability review. | P1 | Core citizen and operator journeys reviewed on mobile and keyboard navigation. |

20. Open decisions

| Decision | Required input |
| --- | --- |
| Pilot user/concurrency estimates | Product owner and district stakeholders define expected normal and peak usage. |
| API and PWA SLOs | Engineering/operations set measurable latency, availability and error budgets. |
| AI model acceptance thresholds | AI engineer and hydrology/domain expert define thresholds from data quality and intended use. |
| RTO/RPO | Deployment owner and product owner approve recovery objectives. |
| Device/browser support matrix | Product owner defines minimum mobile/browser support. |
| Independent security test scope | Security reviewer defines penetration-test scope and remediation policy. |

Final quality principle

AAPADAMITRA is ready for a pilot only when its critical workflows are demonstrably correct, its failure states are honest, its sensitive data is protected, and its AI outputs are validated within clearly stated limits. A successful demo is not a substitute for test evidence.