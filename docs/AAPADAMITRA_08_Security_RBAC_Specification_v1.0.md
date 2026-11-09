AAPADAMITRA

08. SECURITY & RBAC SPECIFICATION

Identity, authorization, privacy, auditability and secure operations

Version 1.0  |  08 November 2026Initial pilot: Nanded district, MaharashtraReact PWA • NestJS • PostgreSQL/PostGIS • Python/FastAPI

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-SEC-008 |
| Version / status | 1.0 / Proposed engineering baseline; review against applicable laws, institutional policies and operational authority requirements before production. |
| Purpose | Define identity, authentication, authorization, privacy, data protection, audit, application security and operational security requirements. |
| Audience | Product owner, backend/frontend engineers, DevOps, QA, security reviewer and emergency-operation stakeholders. |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture; 04 Module Specification; 05 Database Design; 06 API Documentation; 07 AI/ML Specification; 09 Testing Strategy; 10 Deployment & Operations. |

1. Security objectives and principles

AAPADAMITRA processes citizen-submitted reports, location data, emergency workflows, geospatial exposure information, operational records and AI-generated decision-support outputs. Security controls must protect confidentiality, integrity, availability, accountability and safety.

Least privilege: users and services receive only the permissions needed for their current task.

Default deny: access is denied unless a specific policy grants it.

Separation of duties: reporting, reviewing, approving and publishing critical actions should not be concentrated in one role where practical.

Defense in depth: identity, application, database, infrastructure and monitoring controls reinforce one another.

Privacy by design: collect minimum necessary personal data and limit retention and access.

Human authority: AI predictions do not independently publish official alerts, order evacuations or operate infrastructure.

Traceability: privileged access and material changes are attributable to an authenticated actor or service identity.

Secure failure: authentication, authorization or validation failures must not reveal protected data or silently perform partial critical actions.

1.1 Scope

| In scope | Out of scope for this document |
| --- | --- |
| Citizen PWA, staff/admin portal, NestJS APIs, FastAPI internal service, database, object storage, integrations, secrets, logs and deployment controls. | Physical security of government facilities; dam/industrial control systems; formal legal opinion; certification or penetration-test attestation; provider-specific security guarantees. |

2. Threat model

| Threat / abuse case | Potential impact | Primary controls |
| --- | --- | --- |
| Account takeover / credential stuffing | Citizen or staff account misuse. | Argon2id, rate limits, MFA for privileged users, secure sessions, monitoring. |
| Privilege escalation / IDOR | Unauthorized access to reports, assets or operations. | Server-side policy checks, object-level authorization, tenant/geography scope. |
| False or manipulated emergency reports | Misrouted response, operational confusion. | Input validation, provenance, duplicate/spam controls, human verification. |
| Unauthorized alert publication | Public misinformation or unsafe action. | Dedicated publish permission, approval workflow, audit trail, two-person approval for configured critical actions. |
| Location/privacy exposure | Physical safety or privacy harm. | Data minimization, scoped access, aggregation, retention controls, encryption. |
| API abuse / denial of service | Service disruption during emergency. | Rate limits, quotas, WAF/API gateway, queue isolation, autoscaling and incident response. |
| Compromised AI service or model artifact | False predictions or data exfiltration. | Private networking, service identity, signed/verified artifacts, schema validation, model release gates. |
| Insider misuse | Unauthorized lookup or alteration of sensitive records. | Least privilege, audit, periodic access review, separation of duties. |
| Supply-chain compromise | Malicious dependency or build artifact. | Lockfiles, dependency scanning, image scanning, signed build artifacts and controlled deployment. |
| Ransomware / data loss | Loss of operational availability or records. | Backups, restore tests, least-privilege storage, immutable/offline backup strategy where supported. |

3. Identity and account model

3.1 Account types

| Account type | Description | Controls |
| --- | --- | --- |
| Citizen account | Public user using the PWA to access permitted citizen services and submit reports. | Verified contact method where needed, minimal profile, self-service session management. |
| Staff account | Responder, coordinator, reviewer or district administrator. | Invitation/provisioning workflow, verified organization affiliation, MFA where privileged. |
| Platform administrator | Technical operator managing configuration and infrastructure access. | Separate admin identity, MFA, just-in-time elevation, no routine use for citizen operations. |
| Service identity | Backend, worker, integration or AI service authenticating machine-to-machine. | Non-human identity, scoped credentials, rotation, no interactive login. |

3.2 Authentication requirements

Use a maintained identity/authentication library or managed identity provider where feasible; avoid custom cryptographic authentication code.

Hash passwords using Argon2id with current, reviewed parameters; never store plaintext or reversible passwords.

Use short-lived access tokens and rotating refresh tokens. Define exact lifetimes in deployment configuration and review them against threat and usability needs.

JWT validation must verify signature, issuer, audience, expiry, not-before and permitted algorithm; reject unsigned or unexpected algorithms.

Store refresh tokens securely as hashes or opaque server-side session references; rotate on use and detect reuse.

Require MFA for privileged staff, district administrators, platform administrators and sensitive approval roles.

Provide account recovery that does not weaken MFA or allow easy takeover; audit recovery events.

Rate-limit login, password reset, OTP and token refresh endpoints; apply progressive delays and abuse monitoring.

Do not reveal whether an email/phone number exists in public authentication error messages.

Support immediate session revocation after account disablement, suspected compromise or role change.

3.3 Session handling for React PWA

Prefer Secure, HttpOnly, SameSite cookies for browser refresh/session credentials where deployment architecture supports them.

Do not store long-lived bearer tokens in localStorage.

Protect cookie-authenticated state-changing requests against CSRF using an appropriate token/origin strategy.

Use strict Content Security Policy and avoid unsafe inline scripts where practical.

Clear local sensitive UI state on logout and account switch; do not rely on client-side clearing as the server-side revocation mechanism.

Set session expiry and idle timeout for privileged staff interfaces; show re-authentication before sensitive actions.

Use HTTPS only; configure HSTS after validating subdomain and deployment behavior.

4. Role-based access control model

RBAC is combined with attributes and resource scope. A role alone does not grant access to every record: policies also evaluate geography, assignment, ownership, resource status and action sensitivity.

4.1 Role catalogue

| Role code | Actor | Typical permissions | Restrictions |
| --- | --- | --- | --- |
| CITIZEN | Public citizen | Manage own profile; submit/view own permitted reports; receive public alerts; request assistance. | Cannot view other citizens' private records or internal operational dashboards. |
| FIELD_RESPONDER | Verified field responder | View assigned incidents; update field status; submit observations/evidence; acknowledge tasks. | Only assigned or explicitly scoped incidents/geographies; cannot publish official alerts. |
| CONTROL_ROOM_OPERATOR | Emergency/control-room operator | Monitor operational queues; validate and triage reports; prepare incident records; recommend escalation. | Cannot change platform security settings; alert publication may require separate permission. |
| INCIDENT_REVIEWER | Authorized reviewer | Review evidence, correct classifications, approve defined incident status transitions. | Limited to assigned geography/incident type; no blanket user administration. |
| ALERT_APPROVER | Authorized alert approver | Approve or reject alert drafts within delegated authority and scope. | Cannot approve outside assigned jurisdiction; approval is audited. |
| DISTRICT_ADMIN | District-level operational administrator | Manage staff assignments, local configuration, approved reference data and scoped operations. | No platform-wide infrastructure access; no access beyond district scope. |
| PLATFORM_ADMIN | Technical administrator | Manage technical configuration, deployment and platform-level account provisioning. | Should not routinely access citizen case content; privileged access logged and time-bound. |
| AI_SERVICE | Machine identity | Submit model results to authorized internal endpoints; read approved feature snapshots. | No human login, no alert publishing, no direct citizen messaging, no infrastructure control. |
| INTEGRATION_SERVICE | Machine identity | Exchange only explicitly permitted provider data. | Narrow scopes, source-specific credentials and rate limits. |

4.2 Permission catalogue

| Permission | Meaning |
| --- | --- |
| profile:read_own / profile:update_own | Access or modify own citizen profile. |
| report:create / report:read_own | Submit a report and view permitted own reports. |
| incident:read_assigned | Read incidents assigned to the authenticated responder. |
| incident:triage / incident:update | Triage or update incidents within assigned scope. |
| evidence:read / evidence:upload | Access or upload incident evidence under policy. |
| alert:draft / alert:review / alert:approve / alert:publish | Distinct alert lifecycle actions; never collapse into one generic alert permission. |
| staff:assign / staff:manage | Assign or manage staff within delegated geography. |
| reference_data:manage | Manage approved local thresholds, assets or reference datasets. |
| model:run / model:review | Request or review model outputs; does not authorize official warning publication. |
| audit:read | Read audit events within authorized scope; no edit/delete permission. |
| security:manage / platform:configure | Manage platform security or technical configuration. |

4.3 Authorization matrix (summary)

| Action | Citizen | Responder | Control room | Reviewer | Alert approver | District admin | Platform admin | AI service |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Create own report | Yes | No | No | No | No | No | No | No |
| Read own report | Yes | No | Scoped | Scoped | Scoped | Scoped | Exceptional | No |
| Read assigned incident | No | Yes | Yes | Yes | Scoped | Scoped | Exceptional | No |
| Update field status | No | Yes | Yes | Scoped | No | Scoped | No | No |
| Triage report | No | Scoped | Yes | Yes | No | Scoped | No | No |
| Draft alert | No | No | Yes | Scoped | Scoped | Scoped | No | No |
| Approve alert | No | No | No | No | Yes | Only if separately granted | No | No |
| Publish alert | No | No | No | No | Only if separately granted | Only if separately granted | No | No |
| Run AI inference | No | No | Scoped request | Scoped review | No | Scoped request | Technical only | Yes |
| Manage users/roles | No | No | No | No | No | Scoped staff | Platform roles | No |
| Read audit logs | No | No | Scoped | Scoped | Scoped | Scoped | Security scope | No |

Matrix is a baseline. Production permissions must be mapped to explicit policy rules and jurisdictional delegation. 'Exceptional' access requires a documented break-glass process and audit.

5. Attribute- and geography-based authorization

Every protected resource must carry an owning organization and, where applicable, district/region and assignment identifiers.

Policies must check action permission plus resource scope; do not rely only on frontend route hiding.

Citizens may read only their own records unless an explicit, lawful sharing or emergency workflow grants otherwise.

Responders may access assigned incidents and necessary operational context, not all citizen profiles.

District administrators are restricted to their delegated district and cannot grant themselves platform-wide access.

Geographic boundaries must use stable identifiers and validated spatial relationships; do not authorize using untrusted client-supplied district names.

Emergency break-glass access must require a reason, time limit, elevated audit severity and post-event review.

5.1 Example policy logic

allow(request) only when:  authenticated(request.actor)  AND permission_granted(request.actor, request.action)  AND resource_scope_matches(request.actor, request.resource)  AND assignment_or_ownership_check_passes(request.actor, request.resource)  AND resource_state_allows(request.action, request.resource)  AND no_explicit_deny_policy_matches(request)

6. Alert and emergency workflow security

Alert lifecycle actions have high safety impact and require distinct permissions, validation and traceability.

DRAFT -> SUBMITTED_FOR_REVIEW -> REVIEWED -> APPROVED -> PUBLISHED                    |          |          |                    +-> REJECTED / RETURNED_FOR_CORRECTIONAI result -> may inform draft/reviewAI result -X-> direct official publication

AI output can create a recommendation or populate a draft only through a controlled workflow.

Alert draft, review, approval and publication are separate actions with separately assignable permissions.

Require two-person approval for configured high-impact alert categories or broad geographic distribution, subject to authority policy.

Before publication, validate hazard type, geography, issue time, expiry, language, source, approver and message template.

Published alerts must be versioned; corrections and cancellations must create new auditable events rather than silently overwriting history.

Emergency communications integrations must use scoped credentials and approved templates; log provider acknowledgement and delivery status.

Provide a rapid correction/retraction procedure for false or outdated alerts.

Do not let platform administrators silently impersonate an approver.

7. Citizen privacy and personal data protection

7.1 Data classification

| Class | Examples | Handling |
| --- | --- | --- |
| Public | Published alerts, approved public guidance, public map layers. | Integrity controls; publish only through authorized workflow. |
| Internal | Operational dashboards, non-public configuration, staff schedules. | Authenticated access; role and scope restrictions. |
| Confidential | Citizen contact details, private reports, precise user location, responder details. | Strict need-to-know access, encryption, access logging, retention policy. |
| Highly restricted | Credentials, signing keys, security secrets, sensitive vulnerability or protected operational data. | Dedicated secret store, very limited access, rotation, enhanced audit; never expose in logs. |

7.2 Data minimization and purpose limitation

Collect only the personal details needed for the selected feature or emergency workflow.

Request precise location only when necessary, explain the purpose and provide a less precise/manual option where feasible.

Do not expose a citizen's precise location in public maps or public incident feeds.

Separate identity/contact details from public incident summaries where feasible.

Use aggregation or spatial coarsening for analytics and public dashboards.

Do not use citizen data for model training by default. Require a documented purpose, lawful basis, minimization, de-identification and governance approval.

Provide a documented process for access, correction and deletion requests where applicable law and retention obligations permit.

7.3 Retention and deletion

Define retention schedules by data category with the responsible data owner and legal/operational reviewer. Emergency incident records may have statutory or evidentiary retention needs; do not promise immediate deletion without checking those obligations. When retention expires, delete or irreversibly anonymize data from primary stores and apply documented backup expiry processes.

| Data category | Policy to define |
| --- | --- |
| Authentication and security logs | Purpose, retention duration, restricted access and tamper-evidence. |
| Citizen profile/contact | Minimum fields, account lifecycle and lawful deletion/retention. |
| SOS and incident records | Operational/evidentiary retention, access scope, redaction and legal hold. |
| Location and media evidence | Purpose, precision, access, expiry and derivative-copy controls. |
| Model training datasets | Consent/lawful basis, de-identification, provenance, retention and deletion propagation. |

8. Encryption, secrets and key management

Enforce TLS for all external and internal network communication; use modern, supported TLS configuration.

Encrypt database volumes, object storage and backups at rest using managed encryption where available.

Use application-level field encryption only where threat model and search requirements justify it; manage keys separately from encrypted data.

Store secrets in a managed secret manager or protected deployment secret mechanism; never commit secrets to source control or container images.

Use separate credentials per environment and service; prohibit shared production credentials across developers.

Rotate credentials on schedule and immediately after suspected exposure, personnel departure or compromise.

Restrict key-management operations and audit key access, rotation and revocation.

Do not log access tokens, refresh tokens, passwords, OTPs, private keys, raw authorization headers or full sensitive payloads.

9. API and application security requirements

Validate all request bodies, query parameters, headers and uploaded files with server-side schemas and strict allowlists.

Use parameterized queries/ORM-safe patterns; prohibit unsafe string-built SQL.

Enforce object-level authorization on every read, update, download and delete operation.

Apply rate limits by route, identity, IP/device signals and risk; ensure emergency routes have capacity protection and abuse controls.

Configure CORS to explicit trusted origins; do not use wildcard origins with credentials.

Set security headers including CSP, HSTS, X-Content-Type-Options, frame protections and a suitable Referrer-Policy.

Protect file uploads with size/type limits, generated object names, malware scanning where appropriate and non-executable storage.

Prevent SSRF: restrict outbound destinations, block private metadata endpoints and do not fetch arbitrary user-supplied URLs.

Use idempotency keys for critical retryable actions and transactional state transitions for alert publication.

Return generic client errors; keep stack traces and internal details in protected logs only.

Document API authentication scopes and permission requirements in OpenAPI.

9.1 NestJS implementation controls

Use authentication guards for identity verification and authorization guards/policies for permission and resource checks.

Use DTO validation with whitelist and rejection of unexpected fields.

Centralize policy evaluation in reusable services; avoid duplicating role checks across controllers.

Use explicit service identities and scoped credentials for internal calls.

Apply transactional database updates for approval/publication state transitions.

Ensure background workers re-check authorization context or trusted job provenance before performing privileged actions.

9.2 FastAPI / AI service controls

Expose inference endpoints only on private network paths or through authenticated service gateway.

Authenticate NestJS-to-FastAPI requests using short-lived service credentials or mutual TLS where practical.

Allow only registered model codes/versions and validated feature references.

Do not allow AI service to query arbitrary database tables or public URLs.

Validate model output schema, bounds, units and supported geography before persistence.

AI service has no alert:publish, user:manage, dam-control or citizen-notification permission.

Log model identity/version and correlation ID, not raw personal data or sensitive feature payloads.

10. Database and storage security

Use separate database roles for application runtime, migrations, read-only analytics and backup operations.

Application runtime must not connect as database superuser or owner.

Apply row-level security only as defense-in-depth; application authorization remains mandatory and must be tested.

Restrict PostGIS access to required schemas/functions and avoid exposing raw sensitive geometries to public roles.

Use foreign keys, constraints and transactions to preserve incident and alert workflow integrity.

Protect object storage with private buckets, short-lived signed URLs, content-type checks and least-privilege service policies.

Backups must be encrypted, access-restricted and periodically restore-tested.

Production data must not be copied to local development without approved masking or anonymization.

11. Audit logging and accountability

Audit records capture security-relevant and operationally material actions. Application logs and audit records serve different purposes; audit events require stronger integrity and access restrictions.

| Event | Required audit fields |
| --- | --- |
| Authentication success/failure | Actor/account ID if known, time, outcome, source context, correlation ID; avoid logging secrets. |
| Role/permission change | Initiator, target, old/new role or scope, reason, approval and time. |
| Sensitive record access | Actor, resource ID/type, action, purpose/reason where required, outcome and scope. |
| Incident state change | Actor/service, incident ID, prior/new state, timestamp, reason and source. |
| Alert review/approval/publication | Draft/version ID, each actor/action, decision, scope, content hash/reference and timestamps. |
| AI result use | Model code/version, job ID, result reference, reviewer/override and downstream action. |
| Break-glass access | Actor, reason, scope, start/end, records accessed and post-event reviewer. |
| Security configuration change | Actor, setting, old/new values (excluding secrets), approval and deployment reference. |

Use append-only or tamper-evident storage patterns; restrict modification/deletion privileges.

Synchronize clocks across services and retain timestamps in UTC.

Propagate correlation IDs across NestJS, workers, FastAPI and integrations.

Separate audit access from the ability to change audited data.

Define alerting for repeated failed logins, privilege changes, unusual exports, break-glass use and suspicious publication activity.

12. Infrastructure, deployment and supply-chain security

Separate development, staging and production accounts/projects, networks, databases and secrets.

Use private subnets for database, queue, object storage endpoints and AI inference where supported.

Expose only required ingress through a reverse proxy/API gateway/WAF.

Run containers as non-root with minimal base images, read-only filesystem where practical and resource limits.

Pin dependencies and use lockfiles; scan dependencies, source code, container images and infrastructure configuration.

Protect CI/CD with least-privilege service identities, protected branches, reviewed changes and environment approvals.

Do not place production secrets in CI logs or build artefacts.

Maintain infrastructure-as-code and review security-sensitive changes.

Use centralized monitoring, security alerting and tested backup/restore procedures.

13. Incident response and account compromise

Detect and classify the event: suspected account takeover, data exposure, service compromise, false alert, malicious upload or availability incident.

Contain: revoke sessions/credentials, disable compromised accounts, isolate affected service or integration and preserve relevant evidence.

Assess scope: affected records, users, geographies, model artefacts, integrations and operational workflows.

Recover: rotate secrets, restore known-good artefacts/data, patch the cause and verify integrity.

Communicate: notify designated owners and affected parties according to applicable legal, contractual and operational requirements.

Review: document timeline, root cause, impact, corrective actions and lessons learned.

Maintain named incident owners and contact paths outside the application. The platform must not depend on an administrator being able to log in through the potentially compromised system to initiate containment.

14. Security testing and verification

| Test area | Minimum verification |
| --- | --- |
| Authentication | Password hashing, token expiry/signature, refresh rotation/reuse detection, MFA, recovery and rate limiting. |
| Authorization | Role matrix, object-level access, cross-district access, assignment boundaries, default-deny and privilege escalation. |
| Alert workflow | Unauthorized draft/review/approve/publish attempts; approval separation; replay and duplicate publication. |
| Privacy | Citizen-to-citizen isolation, precise-location access, export/download controls, log redaction and retention. |
| API security | Input validation, injection, IDOR, CORS, CSRF, SSRF, upload abuse, rate-limit and error leakage. |
| AI service | Private access, service identity, model allowlist, schema validation, no direct alert publication and data minimization. |
| Infrastructure | TLS, secret exposure, container permissions, network boundaries, dependency/image scanning and backup restore. |
| Audit | Required events emitted, actor attribution, time consistency, tamper resistance and access restriction. |

Before a real operational deployment, conduct an independent security review and penetration test appropriate to the system's risk and applicable procurement/organizational requirements.

15. Functional and non-functional security requirements

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| SEC-FR-001 | Authenticate citizen and staff identities. | P0 | Protected APIs reject missing, invalid, expired or revoked credentials. |
| SEC-FR-002 | Enforce role and resource authorization. | P0 | Automated tests prove unauthorized role/scope/object access is denied. |
| SEC-FR-003 | Enforce geography and assignment scope. | P0 | Users cannot retrieve records outside permitted geography/assignment by changing IDs or query filters. |
| SEC-FR-004 | Require MFA for privileged roles. | P0 | Privileged access is blocked until configured MFA challenge succeeds. |
| SEC-FR-005 | Separate alert draft, review, approval and publication. | P0 | Each transition requires distinct permission; all actions are audited. |
| SEC-FR-006 | Prevent AI from publishing alerts or controlling infrastructure. | P0 | AI service credentials cannot call protected publication/control operations. |
| SEC-FR-007 | Protect tokens and secrets. | P0 | No secrets in repository, logs, browser persistent storage or client error responses. |
| SEC-FR-008 | Protect sensitive citizen data. | P0 | Data access is scoped, encrypted in transit/at rest and logged where required. |
| SEC-FR-009 | Record security and privileged actions. | P0 | Audit records include actor, action, target, time, result and correlation ID. |
| SEC-FR-010 | Support session revocation. | P0 | Disabled/compromised account sessions are rejected within the configured revocation window. |
| SEC-FR-011 | Secure file uploads and downloads. | P1 | Unauthorized access denied; file limits/type checks and safe storage enforced. |
| SEC-FR-012 | Provide break-glass access. | P1 | Temporary access requires reason, expiry and post-event review. |
| SEC-FR-013 | Automate security scanning in CI/CD. | P1 | Build pipeline reports dependency and container findings and blocks configured critical issues. |
| SEC-FR-014 | Enforce retention and deletion policy. | P1 | Retention jobs are documented, tested and produce auditable outcomes. |

16. Recommended implementation structure

src/  auth/    auth.module.ts    strategies/    guards/    token/    session/  authorization/    authorization.module.ts    decorators/    policies/    permission-catalog/    scope-resolvers/  users/  roles/  staff-assignments/  alerts/    alert-workflow/    approval/  audit/  privacy/  security/    rate-limit/    upload-validation/    security-events/  integrations/  ai-orchestration/

Keep permission definitions centralized and version-controlled. Controllers declare required permissions; policy services resolve resource ownership, geography, assignment and workflow state. Frontend checks are for usability only and never replace backend enforcement.

17. Initial implementation checklist

| Stage | Implementation tasks | Evidence |
| --- | --- | --- |
| Foundation | Choose identity provider/library; define account lifecycle; create permission catalogue; configure Argon2id, JWT/session strategy and MFA plan. | Architecture decision record and auth test suite. |
| Authorization | Implement guards, policy engine, ownership checks, geography scope and default-deny behavior. | Automated role/resource matrix tests. |
| Emergency workflow | Implement alert state machine, approval separation, publication audit and correction path. | Workflow integration tests and sample audit trail. |
| Privacy | Classify fields, minimize profile/location data, configure access scopes, retention and redaction. | Data inventory and privacy review. |
| Service security | Create separate FastAPI service identity, private network path, secrets and model permissions. | Negative tests proving AI cannot publish alerts. |
| Operations | Configure monitoring, audit storage, backup/restore, incident response and CI scans. | Operational runbook and test evidence. |

18. Open decisions requiring stakeholder approval

| Decision | Why it matters | Owner / action |
| --- | --- | --- |
| Identity provider | Affects login, MFA, account recovery and session management. | Technical lead to compare managed provider vs self-hosted identity. |
| Staff identity verification | Prevents fraudulent responder/operator accounts. | District/organizational authority to define onboarding evidence. |
| Jurisdictional role delegation | Defines who may review and publish official alerts. | Authorized disaster-management stakeholders to approve role map. |
| Two-person approval policy | Determines which alert classes and geographies require dual control. | Operational authority to specify. |
| Retention schedule | Must balance privacy, evidence and legal obligations. | Data owner and legal/privacy reviewer. |
| Applicable legal framework | Requirements depend on deployment entity, data types and jurisdiction. | Obtain current legal/compliance review; do not treat this document as legal advice. |
| Break-glass authority | Defines emergency access and review process. | Security owner and district administrator. |
| Security service levels | Defines incident response and revocation targets. | Operations owner to set measurable SLAs. |

Appendix A — Example permission policy

{  "role": "FIELD_RESPONDER",  "permissions": ["incident:read_assigned", "incident:update", "evidence:upload"],  "scope": {    "assignmentRequired": true,    "geographyIds": ["authorized-geography-id"]  },  "denied": [    "alert:approve",    "alert:publish",    "user:manage",    "security:manage",    "dam:control"  ]}

Illustrative policy only. Production role assignments and scope must be stored and evaluated server-side; never trust a role or geography claim supplied by the browser.

Appendix B — Security review sign-off

| Review area | Reviewer | Status / date | Notes |
| --- | --- | --- | --- |
| Authentication and account lifecycle |  |  |  |
| RBAC and geographic scope |  |  |  |
| Alert approval and publication controls |  |  |  |
| Citizen privacy and retention |  |  |  |
| API and service-to-service security |  |  |  |
| Database, storage and encryption |  |  |  |
| Audit and incident response |  |  |  |
| Independent security testing |  |  |  |

Final security principle

AAPADAMITRA must ensure that the right person or service can perform only the right action, on the right resource, within the right jurisdiction, at the right time—and that sensitive actions remain reviewable. Security is a product requirement and an operational safety control, not a final-stage add-on.