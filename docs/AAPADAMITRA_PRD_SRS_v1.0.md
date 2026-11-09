AAPADAMITRA

PRODUCT REQUIREMENTS DOCUMENT v1.0SOFTWARE REQUIREMENTS SPECIFICATION v1.0

Multi-Hazard Disaster Management & Emergency Coordination Platform

Cloud-first • Citizen PWA • Initial geography: Nanded district, Maharashtra

Version 1.0 | Baseline draft for team review | 08 November 2026

DOCUMENT CONTROL

| Field | Value |
| --- | --- |
| Product | AAPADAMITRA |
| Document set | PRD v1.0 + SRS v1.0 |
| Status | Proposed baseline; approval pending |
| Deployment | Cloud-first |
| Citizen access | Responsive Progressive Web App (PWA) |
| Initial geography | Nanded district, Maharashtra |
| Team | Four developers |
| Initial delivery constraint | Eight-day competition build |

Interpretation: “shall” denotes a testable requirement. P0 = essential for the first coherent demo; P1 = important but may be simplified/deferred; P2 = future. A feature is not implemented merely because a screen or mockup exists. Simulated data and unvalidated model outputs must be labelled.

PART A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

1. Product summary

AAPADAMITRA is a unified multi-hazard disaster-management and emergency-coordination platform intended to connect authorities, infrastructure operators, emergency responders and citizens through a shared workflow for risk monitoring, preparedness, alerting, response and recovery.

1.1 Vision and mission

Vision: enable informed, coordinated and timely disaster-management decisions by bringing relevant hazard information, incidents, stakeholders and response activities into one accessible platform.

Provide role-appropriate dashboards and a shared operational view.

Support risk monitoring for hazards with forecastable or observable indicators.

Enable rapid incident reporting and coordination for sudden-onset disasters.

Support authorized alert creation, publication tracking and acknowledgement.

Coordinate SOS requests, response teams and available resources.

Record damage, relief and recovery activities with traceability.

Create a modular foundation that can expand beyond the Nanded demonstration.

1.2 Product boundaries / non-goals

The platform complements existing authorities and warning systems; it does not replace NDMA, SDMA, DDMA, IMD, CWC, police, fire, health or emergency services.

No autonomous disaster declaration, evacuation order, public warning authorization or dam-gate control.

No claim of scientifically validated prediction for every hazard.

No guarantee of SMS/WhatsApp/push delivery when a provider or network is unavailable.

No production emergency dispatch or certified life-critical operation in the first release.

No integration with restricted government systems without authorization and documented interfaces.

2. Problem, need and motivation

Disasters involve multiple agencies, infrastructure operators, responders and affected communities. Information can be distributed across sources and channels. The challenge is not only detecting a hazard; it is converting information into an authorized decision, communicating actionable information, coordinating field response and tracking recovery. AAPADAMITRA proposes a shared coordination and decision-support layer. The initial Nanded demonstration is geographically bounded; local workflows and data access must be validated with relevant stakeholders before operational use.

3. Users and stakeholders

| User / actor | Primary need | Platform capability |
| --- | --- | --- |
| Platform administrator | Manage accounts, roles and configuration | User/organization administration, audit access |
| Authorized authority | Review risks/incidents and authorize alerts | Situation dashboard, review queue, approval, reports |
| Infrastructure operator | Observe assets and readings | Asset profile, observations, threshold flags |
| Emergency coordinator | Coordinate incidents, teams and resources | Incident board, assignment, status tracking |
| Rescue team member | Receive and update tasks | Assignment view and field status updates |
| Citizen | Receive alerts and report emergencies | PWA alerts, incident report, SOS and reference ID |

The exact authority hierarchy and legal permissions require stakeholder confirmation. These are proposed application roles, not official government designations.

4. Product modules and initial scope

| Module | Purpose | Competition-release scope |
| --- | --- | --- |
| Identity & access | Users, organizations, roles | Login, role-based access, basic profiles |
| Hazard catalogue | Standard hazard types | Configurable list: flood, drought, cyclone, landslide, heatwave, earthquake, fire, industrial accident |
| Incident management | Record and manage events requiring action | Create, review, assign, update, close, history |
| Risk assessment | Represent hazard-specific risk indicators | Transparent rules/demo assessment; source, timestamp, limitations |
| Infrastructure | Critical assets and observations | Asset register and manual/sample readings; dam demonstration if data exists |
| GIS | Map assets, incidents and affected locations | Map markers, filters, geolocation capture |
| Alert management | Create, approve and track alerts | Draft, approve, publish in-app/PWA, status tracking |
| SOS & citizen reports | Collect emergency requests | PWA submission, location, category, description |
| Response coordination | Coordinate teams/resources | Team register, assignment, status updates |
| Damage & recovery | Record impact and relief activity | Basic damage and relief records |
| Reports & audit | Trace operations | Incident lists, status history, audit records |

5. Complete disaster-management lifecycle

| Stage | AAPADAMITRA support | Boundary |
| --- | --- | --- |
| Prevent & mitigate | Hazard-prone area and asset context | Not engineering certification or land-use authority |
| Prepare | Preparedness notes, resource inventory, readiness | Not replacement for statutory plans |
| Predict & monitor | Forecastable-hazard indicators, readings and risk assessment | No prediction claims for unsupported hazards |
| Alert & communicate | Authorized alert workflow and channel status | Only designated roles publish public alerts |
| Respond | SOS triage, team/resource assignment, updates | Not emergency dispatch replacement |
| Recover & learn | Damage, relief, recovery records and reports | Not a complete financial aid/beneficiary system |

6. Key user journeys

6.1 Authority alert workflow

Authorized user signs in and reviews incident/risk data with source and timestamp.

User drafts an alert with hazard, affected geography, message, severity and validity.

A user with approval permission reviews and approves it.

System publishes through enabled channels and records provider response or in-app publication status.

Authorized users inspect delivery and acknowledgement where supported.

6.2 Citizen SOS workflow

Citizen opens PWA and selects SOS/report incident.

PWA requests location permission; manual location is available if denied.

Citizen submits category, description and available contact details.

System validates and stores the request with unique reference and timestamp.

Authorized operator reviews, triages and assigns it.

Status is exposed to the citizen only when safe and supported.

6.3 Infrastructure monitoring workflow

Operator selects an assigned asset.

System displays available readings with source, unit and timestamp.

Configured threshold/risk rules are applied.

Stale or invalid data is flagged.

Operator records review or escalates to an authorized authority.

7. Success measures

| Measure | Evidence / initial target |
| --- | --- |
| End-to-end workflow | Incident → review → assignment → closure demonstrated in acceptance test |
| Alert governance | Public alert cannot publish without required permission/approval |
| Traceability | Key actions record actor, action, target and timestamp |
| GIS correctness | Test assets/incidents appear at known coordinates |
| Data provenance | Risk/readings show source and observation time |
| Demo reliability | No unresolved critical defects in agreed demo path |

Set numerical performance targets only after hosting and load baselines are measured. Do not invent model accuracy, response-time or disaster-impact reduction claims.

8. Release strategy

| Release | Scope |
| --- | --- |
| Competition release — 8 days | Authentication, roles, incident workflow, GIS, SOS/reporting, controlled alerts, basic response assignment and bounded risk demonstration |
| Post-competition v1 | Security hardening, notifications, recovery workflows, data quality and stakeholder-validated processes |
| Future | Validated forecasting, more hazard-specific models, sensor ingestion, offline/edge support and approved integrations |

9. Assumptions and dependencies

Cloud hosting and internet connectivity are available for the initial demo.

Citizen access is a responsive PWA; native apps are excluded from the first release.

Nanded is the initial demonstration geography, not a claim of district-wide adoption.

Weather, map, SMS, WhatsApp and government integrations depend on provider access, terms, credentials and authorization.

Sample/synthetic data may be used only when clearly labelled.

Four developers and eight days require strict P0 scope control.

Real public alerting requires an authorized operational process and is disabled by default in a competition prototype.

10. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Scope expansion | Freeze P0; defer P1/P2 |
| Unverified data | Show source/time; label sample data; flag stale/invalid values |
| AI overclaim | Use transparent rules first; document model validation and limitations |
| Unauthorized alert | RBAC, approval workflow, audit trail; no real dispatch by default |
| Provider failure | Integration adapters, graceful failure and labelled demo fallback |
| Integration conflicts | Shared API contracts, PRs, daily integration and test environment |
| Citizen data exposure | Data minimization, access control, retention policy and HTTPS |

PART B — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

11. SRS conventions

Requirement IDs are stable references. FR = functional; NFR = non-functional; INT = integration; DATA = data; SEC = security. Acceptance criteria are observable pass conditions. P0 requirements must be implemented and tested for the first coherent demo; P1 may be simplified/deferred; P2 is future scope.

12. Functional requirements

12.1 Identity and access

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-AUTH-001 | System shall allow registered users to sign in with valid credentials. | P0 | Valid credentials open authorized dashboard; invalid credentials are rejected. |
| FR-AUTH-002 | System shall enforce role-based access on protected pages and API operations. | P0 | Unauthorized API request is rejected; hiding UI controls alone is insufficient. |
| FR-AUTH-003 | Administrator shall create, deactivate and assign roles to users. | P1 | Authorized admin succeeds; other roles are denied. |
| FR-AUTH-004 | System shall support logout and invalidate the active session/token. | P0 | Protected requests using logged-out session/token are rejected. |
| FR-AUTH-005 | System shall audit security-relevant account and permission changes. | P1 | Audit record contains actor, action, target and timestamp. |

12.2 Geography and GIS

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-GEO-001 | System shall store incident/asset locations in a defined coordinate reference system. | P0 | Latitude/longitude bounds are validated and returned consistently. |
| FR-GEO-002 | System shall support Nanded as initial demo boundary and permit geographic expansion. | P0 | Nanded demo records can be filtered; geography is configurable, not hard-coded in UI. |
| FR-GEO-003 | System shall display incidents and assets on an interactive map. | P0 | Known test coordinates render correctly and open the matching record. |
| FR-GEO-004 | System shall filter mapped records by hazard, status and time where data exists. | P1 | Map and list results update consistently when filters change. |

12.3 Hazard catalogue and risk

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-HAZ-001 | System shall maintain a configurable catalogue of hazard types. | P0 | Configured hazard types have stable IDs and retrievable names. |
| FR-RISK-001 | System shall store assessment hazard, area/asset, time, inputs/source and result. | P0 | Saved assessment exposes required provenance fields. |
| FR-RISK-002 | System shall support a transparent rule-based assessment for at least one forecastable hazard in demo. | P0 | Documented test inputs produce expected risk category/index. |
| FR-RISK-003 | System shall distinguish simulated, manually entered and live/provider data. | P0 | UI/API show data mode; sample data never appears as live sensor data. |
| FR-RISK-004 | System shall show data freshness and assessment limitations with risk output. | P0 | Risk view displays source, timestamp and limitation text. |
| FR-RISK-005 | System shall use hazard-specific assessment methods. | P1 | Unsupported hazard does not receive an invented prediction. |
| FR-RISK-006 | System shall retain historical risk assessments. | P1 | Authorized user retrieves assessments by hazard, asset/area and time. |

12.4 Infrastructure and observations

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-INF-001 | System shall maintain infrastructure assets with type, name and location. | P0 | Authorized create/view/update succeeds with required fields validated. |
| FR-INF-002 | System shall associate readings with asset, metric, value, unit, timestamp and source. | P0 | Reading without provenance/unit fields is rejected. |
| FR-INF-003 | System shall flag invalid or stale readings using configured rules. | P1 | Test stale/invalid readings are flagged and excluded from current status where configured. |
| FR-INF-004 | System shall support dam-specific attributes without requiring them for all assets. | P1 | Dam profile stores dam fields; non-dam asset remains valid. |

12.5 Incidents and citizen reports

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-INC-001 | Authorized operator shall create an incident. | P0 | Record has unique ID, hazard, description, location, status and creation time. |
| FR-INC-002 | Authorized user shall review, update, assign and close incidents. | P0 | Valid status transitions persist and appear in history. |
| FR-INC-003 | System shall maintain incident status history. | P0 | Each transition records previous/new status, actor and timestamp. |
| FR-INC-004 | Citizen PWA shall submit incident category, description and location. | P0 | Valid submission returns reference ID; invalid fields show errors. |
| FR-INC-005 | PWA shall allow manual location if geolocation permission is denied. | P0 | Report can be submitted in both permission scenarios. |
| FR-INC-006 | System shall support controlled evidence attachment upload. | P1 | File type/size are validated and unauthorized access is blocked. |
| FR-INC-007 | System shall distinguish unverified reports from verified incidents. | P0 | New citizen reports remain unverified until authorized review. |

12.6 SOS

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-SOS-001 | Citizen PWA shall provide an identifiable SOS submission flow. | P0 | SOS can be submitted and returns a reference ID. |
| FR-SOS-002 | System shall capture location when available and accept user-entered location otherwise. | P0 | Both location paths pass acceptance test. |
| FR-SOS-003 | SOS requests shall appear in an authorized review queue. | P0 | Queue shows submission time, location and reference. |
| FR-SOS-004 | Authorized operator shall triage and assign SOS requests. | P1 | Status and team assignment persist with history. |
| FR-SOS-005 | PWA shall state that submission does not guarantee emergency dispatch. | P0 | Disclaimer is visible in SOS flow/result. |

12.7 Alerts

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-ALT-001 | Authorized user shall draft alert with hazard, message, geography, severity and validity. | P0 | Required fields validated; draft is not publicly visible. |
| FR-ALT-002 | System shall require approval before public alert publication. | P0 | User without approval permission cannot publish. |
| FR-ALT-003 | System shall record creator, approver, publication time and status. | P0 | Published alert has complete audit metadata. |
| FR-ALT-004 | Citizen PWA shall display active published alerts. | P0 | Valid test alert appears to configured audience. |
| FR-ALT-005 | System shall expire or mark alert expired after validity period. | P1 | Expired alert is no longer displayed as active. |
| FR-ALT-006 | System shall record external provider response for each enabled channel. | P1 | Status distinguishes accepted, failed, pending and unsupported; never falsely says delivered. |
| FR-ALT-007 | System shall track acknowledgement when channel supports it. | P1 | Acknowledgement links to alert/recipient; unsupported channel is identified. |
| FR-ALT-008 | System shall support configured geographic targeting. | P1 | Test recipients inside target boundary are selected; outside recipients excluded. |

12.8 Response coordination

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-RES-001 | System shall maintain response-team records and availability. | P0 | Authorized user creates/views team with validated fields. |
| FR-RES-002 | System shall maintain a basic resource register. | P1 | Resource type, quantity/availability and location are stored. |
| FR-RES-003 | Coordinator shall assign a team to incident or SOS. | P0 | Assignment links target/team and records actor/time. |
| FR-RES-004 | Authorized team/coordinator shall update assignment status. | P0 | Allowed status transitions persist and appear in history. |
| FR-RES-005 | Authorized operational users shall see current assignment status. | P0 | Latest persisted status is displayed to permitted roles. |

12.9 Damage and recovery

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-REC-001 | Authorized user shall record basic damage assessment linked to incident/location. | P1 | Record includes category, description, assessor and time; estimates are labelled. |
| FR-REC-002 | Authorized user shall record relief needs/requests. | P1 | Request is retrievable with location, need and status. |
| FR-REC-003 | System shall record relief allocation/delivery status. | P1 | Allocation links to request/resource and retains status history. |
| FR-REC-004 | System shall provide consolidated recovery view. | P2 | Authorized user can view linked damage and relief records. |

12.10 Reporting and audit

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-REP-001 | System shall provide filtered incident lists. | P0 | Filters by status, hazard and date return matching records. |
| FR-REP-002 | System shall provide basic operational summary for selected geography. | P1 | Summary counts match filtered source records. |
| FR-AUD-001 | System shall audit significant actions including approve, publish, assign and close. | P0 | Audit includes actor, action, target and timestamp. |
| FR-AUD-002 | Audit records shall be accessible only to authorized roles. | P0 | Unauthorized API access is rejected. |

13. Non-functional requirements

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| NFR-PERF-001 | Core workflows shall meet performance targets agreed after hosting baseline. | P1 | Load test records environment, load and measured response times; targets approved before sign-off. |
| NFR-AVAIL-001 | Cloud web/API services shall expose health checks. | P0 | Health endpoint reports service health and deployment can detect failure. |
| NFR-SEC-001 | Deployed client-service traffic shall use HTTPS. | P0 | Valid TLS certificate; insecure access redirected/rejected as configured. |
| NFR-SEC-002 | Passwords shall never be stored in plaintext. | P0 | Database contains password hashes; auth tests pass. |
| NFR-SEC-003 | Backend shall validate and authorize every protected operation. | P0 | Tests cover missing/invalid credentials and insufficient permissions. |
| NFR-PRIV-001 | System shall collect only citizen data needed for the workflow. | P0 | Form and stored fields have documented purpose; unnecessary fields are optional/omitted. |
| NFR-PRIV-002 | System shall define access and retention for citizen reports, SOS and attachments. | P1 | Policy exists and access follows it before real pilot use. |
| NFR-REL-001 | External provider failure shall not crash core incident workflows. | P1 | Provider failure returns controlled status; incident APIs remain usable. |
| NFR-UX-001 | Citizen PWA shall be responsive on common mobile viewports. | P0 | Core alert/report/SOS journeys pass mobile viewport checks. |
| NFR-UX-002 | Critical actions shall show success, failure or pending states clearly. | P0 | Acceptance tests distinguish all three outcomes. |
| NFR-MAINT-001 | Code shall separate business modules and provider-specific integrations. | P0 | Module boundaries and adapter interfaces are identifiable in repository. |
| NFR-OBS-001 | Application shall produce structured logs with request/correlation IDs. | P1 | Test request can be traced without logging secrets or unnecessary personal data. |
| NFR-BACKUP-001 | Database backup and restore approach shall be documented before pilot. | P1 | Restore test documented before production/pilot designation. |
| NFR-ACCESS-001 | Critical UI controls shall have labels and status shall not rely on colour alone. | P1 | Manual accessibility review verifies labels and text status. |

14. External interfaces

| Interface | Purpose | Constraints |
| --- | --- | --- |
| Weather provider | Observed and forecast weather inputs | Document source, units, timestamps, API limits and licence |
| Map/geocoding provider | Map tiles and optional address lookup | Respect usage policy; do not assume unlimited free production use |
| SMS/WhatsApp/push | External alert delivery | Approved credentials/provider required; record provider response |
| Python inference API | Hazard-specific model/rule evaluation | Authenticated internal API; validated schemas, timeout and failure handling |
| Sensor gateway | Infrastructure readings | Document device identity, payload, units, timestamp and authentication |

14.1 Proposed AI request/response contract

| Field | Meaning |
| --- | --- |
| request_id | Unique correlation ID |
| hazard_type | Supported hazard identifier |
| area_or_asset_id | Assessment target |
| observations | Measurements with units and timestamps |
| forecast_inputs | Optional forecast values with source and valid time |
| method_version | Rule/model identifier |
| result | Risk category/index and explanatory factors |
| limitations | Data gaps, stale inputs and model limitations |
| created_at | Assessment time |

A 0–100 risk index is a score, not automatically a percentage probability. Do not output an unqualified probability unless calibration and validation support it.

15. Data model — initial entity catalogue

| Entity | Proposed key attributes / relationships |
| --- | --- |
| User | id, name, email/phone, password_hash, status; belongs to organization; has roles |
| Role / Permission | id, name, permission_key; role-permission mapping |
| Organization | id, name, type, geographic scope |
| HazardType | id, code, name, category |
| Incident | id, hazard_type_id, description, status, location, creator, timestamps |
| IncidentReport | id, incident_id, reporter, verification status, evidence refs |
| SOSRequest | id, reporter/contact, location, status, submitted_at |
| InfrastructureAsset | id, type, name, location, owner organization |
| Observation | id, asset_id, metric, value, unit, observed_at, source |
| RiskAssessment | id, hazard, area/asset, method/version, result, input reference, time |
| Alert | id, hazard, message, geography, severity, validity, status, creator/approver |
| AlertDelivery | id, alert, channel, provider status, recipient reference, timestamps |
| ResponseTeam / Resource | team and resource type, organization, location, availability |
| Assignment | incident/SOS reference, team, status, assigned_by, timestamps |
| DamageAssessment | incident, category, description, assessor, time |
| ReliefRequest / Allocation | location, need, quantity, status, delivery/allocation references |
| AuditLog | actor, action, target type/id, timestamp |

This is an entity catalogue, not the final normalized schema. ERD, field types, constraints, indexes, retention and migrations are a separate deliverable.

16. Core status models

| Object | Proposed lifecycle | Rule |
| --- | --- | --- |
| Incident | NEW → UNDER_REVIEW → VERIFIED → ACTIVE_RESPONSE → RESOLVED → CLOSED | Role-controlled transitions; rejected/duplicate may be added |
| Citizen report | SUBMITTED → UNDER_REVIEW → VERIFIED / REJECTED / DUPLICATE | Submission is not automatic verification |
| SOS | SUBMITTED → TRIAGED → ASSIGNED → IN_PROGRESS → RESOLVED / CLOSED | Human-authorized triage |
| Alert | DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → EXPIRED / CANCELLED | No direct draft-to-published transition |
| Assignment | ASSIGNED → ACCEPTED → EN_ROUTE → ON_SCENE → COMPLETED / CANCELLED | Only authorized team/coordinator updates |

17. Security, privacy and safety

Enforce least-privilege RBAC server-side; UI hiding is not authorization.

Use secure password hashing and a properly secured session/token strategy.

Keep secrets in deployment environment configuration; never commit credentials.

Validate inputs and restrict upload size/type; protect uploaded files.

Use HTTPS; keep database and AI inference services off public exposure unless explicitly secured.

Audit alert approval/publication, incident transitions, assignments and admin changes.

Restrict precise citizen location/contact data to roles with operational need.

Define privacy notice, retention and deletion rules before real citizen data collection.

State that the prototype is not an official emergency channel and does not guarantee dispatch.

Never autonomously issue evacuation orders, control infrastructure or override authorized human decisions.

18. Acceptance test catalogue

| Test | Scenario | Expected result |
| --- | --- | --- |
| AT-001 | Valid and invalid login | Valid user enters permitted dashboard; invalid user rejected |
| AT-002 | Citizen report with location permission denied | Manual location path succeeds and returns reference ID |
| AT-003 | Citizen SOS submission | SOS appears in authorized queue with time and location |
| AT-004 | Unprivileged user publishes alert | API rejects; no public alert is created |
| AT-005 | Authorized approval and publication | Alert appears in PWA; approval/publication audit stored |
| AT-006 | Incident with known coordinates | Marker and list item point to correct incident |
| AT-007 | Stale/invalid reading | Reading is flagged and not presented as current valid data |
| AT-008 | Team assigned to incident | Assignment and status history visible to authorized users |
| AT-009 | Notification provider unavailable | Failure recorded; core incident workflow remains available |
| AT-010 | Synthetic risk result displayed | Clearly labelled simulated/demo with method, time and limitations |

19. Exclusions and deferred scope

| Excluded from first release | Reason / condition to reconsider |
| --- | --- |
| Official government alert-system integration | Requires authorization, interface agreement, security review and testing |
| Mass public SMS/IVR broadcasting | Requires approved provider, sender/telecom setup, cost and operational authorization |
| Autonomous dam-gate/infrastructure control | Safety-critical and outside decision-support role |
| Earthquake/fire prediction claims | No defensible generalized prediction capability established for this release |
| Validated nationwide multi-hazard AI | Requires hazard-specific datasets, validation and domain review |
| Native Android/iOS applications | PWA selected for first citizen interface |
| Offline-first field operations / edge deployment | Future capability; not assumed in cloud-first release |
| Satellite/drone AI damage analysis | Requires data access, models and validation |
| Full financial aid/beneficiary management | Outside initial incident and recovery tracking scope |
| Production 24×7 emergency operations | Requires operational owner, service levels, staffing, drills and approvals |

20. Traceability and change control

Each requirement must map to a module, data entities, API/UI workflow, developer owner and test case. Changes to P0 scope, alert authority, sensitive data, status models or external integrations require technical-lead review and document revision.

| Traceability field | Example |
| --- | --- |
| Requirement | FR-ALT-002 |
| Module | Alert Management |
| API | POST /api/v1/alerts/{id}/approve — illustrative only |
| Data | Alert, approval/audit record |
| Owner | Backend developer |
| Tests | AT-004 and AT-005 |
| Status | Proposed / In progress / Implemented / Verified |

21. Open decisions to resolve

Select weather provider and confirm API access/usage limits for Nanded.

Confirm whether flood-risk demo uses transparent rules or an available validated dataset/model.

Select map tile/geocoding provider and check its usage policy.

Decide whether notifications are in-app only, mocked for demo, or connected to an authorized provider.

Define which demo role can approve alerts.

Identify an available and licensed district/taluka/village boundary dataset.

Define citizen data fields, access roles, retention and deletion.

22. Definition of done

A P0 requirement is complete only when code is merged, validation and authorization exist, its acceptance test passes, error states are handled, API/UI behaviour is documented and the deployed demo is checked. A mockup, hard-coded screen or unlabelled simulation does not satisfy “done”. The release is presentation-ready when the agreed end-to-end workflow works reliably, no known critical authorization defect remains, sample data is labelled, dependencies have a fallback and the team can clearly explain implemented versus planned capabilities.