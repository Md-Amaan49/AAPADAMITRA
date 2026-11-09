AAPADAMITRA

10. DEPLOYMENT & DEVOPS SPECIFICATION

Cloud infrastructure, CI/CD, operations, observability and recovery

Version 1.0  |  08 November 2026Initial pilot: Nanded district, MaharashtraReact PWA • NestJS • PostgreSQL/PostGIS • Python/FastAPI

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-OPS-010 |
| Version / status | 1.0 / Proposed baseline; cloud provider and service sizing remain deployment decisions. |
| Purpose | Define repeatable cloud deployment, environment separation, CI/CD, infrastructure security, monitoring, backups, scaling and operational recovery. |
| Audience | Product owner, frontend/backend engineers, AI/ML engineer, DevOps owner, QA and operational stakeholders. |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture; 04 Module Specification; 05 Database Design; 06 API Documentation; 07 AI/ML Specification; 08 Security & RBAC; 09 Testing Strategy. |

1. Objectives and operating principles

Deploy a secure and maintainable cloud-hosted pilot serving the initial Nanded geography.

Keep the initial operating model achievable by a four-person team; avoid unnecessary Kubernetes and premature microservice infrastructure.

Separate development, staging and production data, credentials, networks and deployment permissions.

Automate repeatable build, test, migration and deployment steps with approval gates.

Make failures observable and recoverable; define clear ownership, runbooks and rollback procedures.

Protect citizen, incident, SOS, location and operational data through least privilege and controlled retention.

Scale components independently when evidence from pilot traffic justifies it.

2. Deployment architecture overview

Recommended baseline: a managed cloud application platform or container runtime for the API and AI services, managed PostgreSQL with PostGIS, object storage for media and backups, a managed queue/cache where required, and a static/PWA hosting layer behind HTTPS. Select a cloud provider after comparing regional availability, data residency requirements, managed PostGIS support, security controls, support and total cost.

Citizens / Operators        |   HTTPS + DNS        | CDN / WAF / Static hosting        |                         | React PWA                 API Gateway / Load Balancer                                  |                           NestJS application                         /        |          \                PostgreSQL    Queue/Cache   Object Storage                 + PostGIS        |                                  |                           Background workers                                  |                         Python / FastAPI AI                                  |                    External data provider adapters

2.1 Logical deployment units

| Unit | Responsibility | Deployment guidance |
| --- | --- | --- |
| React PWA | Citizen and operational user interface. | Static build on CDN/HTTPS hosting; versioned assets and controlled service-worker updates. |
| NestJS API | Authentication, RBAC, business workflows, APIs and orchestration. | Containerized application; stateless where practical; health/readiness endpoints. |
| Background worker | Notifications, ingestion, scheduled tasks and asynchronous workflows. | Separate worker process/container; idempotent jobs, bounded retries and dead-letter handling. |
| Python AI service | Forecast inference, feature processing and model metadata. | Separate container/service; internal network access only unless a documented use case requires otherwise. |
| PostgreSQL + PostGIS | Transactional data, geospatial queries and audit records. | Managed database preferred; private networking, encryption, automated backups and monitoring. |
| Object storage | Citizen attachments, approved documents, model artifacts and exports. | Private buckets/containers; scoped access and signed URLs with short expiry. |
| Queue/cache | Asynchronous processing, rate control and caching where needed. | Managed service preferred; do not use cache as system of record. |
| Observability | Logs, metrics, traces, alerts and audit visibility. | Centralized access-controlled platform; redact sensitive fields. |

3. Cloud provider selection criteria

| Criterion | Evaluation questions |
| --- | --- |
| Region and residency | Are suitable regions available? What contractual and legal obligations apply to citizen data? |
| Managed PostgreSQL/PostGIS | Supported engine/version, extensions, backups, point-in-time recovery, replicas and maintenance controls? |
| Container hosting | Can API, worker and AI containers be deployed with health checks, secrets and autoscaling? |
| Network security | Private database connectivity, network policies, firewall rules, WAF and DDoS controls? |
| Storage and delivery | Private object storage, CDN, encryption, lifecycle rules and signed URLs? |
| Observability | Logs, metrics, tracing, alert routing and retention controls? |
| Cost transparency | Can fixed and variable costs be estimated, capped and monitored? |
| Operational fit | Does the team have skills and support to operate it reliably? |

Provider selection is intentionally not hard-coded in this baseline. Final choice must be recorded with cost estimates, region, service tiers, data handling terms and exit/migration considerations.

4. Environment strategy

| Environment | Purpose | Controls |
| --- | --- | --- |
| Development | Daily coding and developer integration. | Synthetic data, local containers, developer-specific credentials, no production access by default. |
| CI / ephemeral | Automated verification for pull requests and builds. | Short-lived isolated resources, seeded test data, mocked third parties, teardown after run. |
| Staging | Production-like acceptance, E2E, migration and release-candidate validation. | Separate database and storage; synthetic/anonymized data; restricted access; production-like configuration. |
| Production / pilot | Live Nanded pilot workloads. | Strong authentication, least privilege, monitored access, approved secrets, backups, change approval and incident process. |

Never share database credentials or signing keys across environments.

Production data must not be copied into development or staging without approved anonymization and access controls.

Use separate cloud projects/accounts or subscriptions for production and non-production where feasible.

Restrict production access to named maintainers; use MFA and auditable privileged access.

Maintain a documented environment inventory and owner for every deployed service.

5. Containerization and application packaging

Use multi-stage Docker builds to keep runtime images small and exclude compilers, test fixtures and development dependencies.

Pin base images and dependency versions; scan images and dependencies for known vulnerabilities.

Run containers as non-root, use read-only filesystems where practical, and avoid embedding secrets in image layers.

Expose liveness and readiness checks; readiness must fail when required dependencies make the service unable to serve safely.

Set CPU/memory requests and limits based on measured usage; configure graceful shutdown and connection draining.

Tag images immutably using commit SHA and release version; do not rely on mutable latest tags for production.

5.1 Configuration and secrets

| Configuration type | Handling |
| --- | --- |
| Non-secret configuration | Environment-specific configuration variables managed through deployment configuration. |
| Database passwords / API keys | Cloud secret manager or equivalent; access limited to the service identity that needs the secret. |
| JWT signing keys | Dedicated secret with rotation plan; never stored in source control or frontend bundles. |
| Third-party provider credentials | Separate credentials per environment; scope to minimum permissions and rotate on compromise. |
| Model artifacts | Versioned storage with checksum, provenance and access policy; never accept untrusted executable artifacts. |

6. CI/CD pipeline

Developer branch  -> pull request + peer review  -> formatting / lint / type checks  -> unit + component tests  -> API / contract tests  -> dependency + secret scans  -> build immutable artifacts  -> integration + E2E tests  -> image scan + artifact publish  -> deploy to staging  -> smoke / acceptance checks  -> authorized production approval  -> deploy + post-deploy verification  -> monitor / rollback if release gates fail

Protect main/release branches; require reviewed pull requests and passing mandatory checks.

Build each artifact once and promote the same immutable artifact between environments.

Use workload identity or short-lived deployment credentials where supported; avoid long-lived cloud keys in CI.

Keep deployment logs and test reports associated with commit, artifact digest and release tag.

Use manual approval for production and for schema changes with high data risk.

Run database migrations as a controlled release step with backups and compatibility review.

7. Database operations and migrations

Use managed PostgreSQL with PostGIS where available; pin supported major version and extension versions.

Apply schema changes through version-controlled migrations; never make undocumented manual production edits.

Prefer backward-compatible expand/migrate/contract changes: add new fields, deploy compatible code, backfill, then remove obsolete fields in a later release.

Test migrations against a production-like dataset volume in staging; include rollback or forward-fix plan.

Use connection pooling and monitor connection count, locks, slow queries, disk growth and replication lag if replicas are used.

Restrict database network access to application/worker identities and approved administration paths.

Keep transactional records and audit history in the database; caches and queues are not authoritative records.

8. Networking, DNS and TLS

Serve all user-facing traffic over HTTPS; redirect HTTP to HTTPS and automate certificate renewal.

Use DNS records with documented ownership, TTL and recovery procedure.

Place databases and internal AI services on private network paths; do not expose database ports publicly.

Apply WAF/rate limits to public entry points and separate internal service ingress from citizen-facing APIs.

Restrict outbound traffic from services where practical; document external data and notification destinations.

Use secure CORS allowlists, appropriate security headers and environment-specific origins.

9. Storage, media and data lifecycle

Keep uploaded citizen media in private object storage, not public web directories.

Validate file size, extension, MIME type and content; consider malware scanning before staff access.

Use short-lived signed URLs with object-specific permissions; avoid permanent public links.

Define lifecycle/retention rules for uploads, generated reports, exports, model artifacts and temporary files.

Encrypt storage at rest and in transit; restrict administrative access and log sensitive access.

Back up configuration and critical metadata as well as database contents; test restoration of media objects.

10. Observability and alerting

| Signal | Minimum operational view |
| --- | --- |
| Application logs | Structured JSON logs with timestamp, severity, service, environment, request/correlation ID and safe error context. |
| Metrics | Request rate, latency percentiles, error rate, CPU/memory, restarts, database connections, queue depth and worker failures. |
| Distributed tracing | Trace requests across NestJS, workers and AI services where instrumentation is practical. |
| Business workflow metrics | SOS acknowledgement, report intake, alert approval/publish transitions, job backlog and stale-data indicators. |
| AI service metrics | Model version, inference latency, input freshness, missingness, output status and model-quality monitoring when labels are available. |
| Audit trail | Separate protected audit events for authentication, permissions, alert actions, incident assignment and sensitive data access. |

Never log passwords, tokens, full personal identifiers, private SOS details or unnecessary precise citizen coordinates.

Alert on service unavailability, elevated error rates, queue backlog, database capacity, backup failures and stale critical data feeds.

Every alert must have an owner, severity, response expectation and runbook.

Distinguish platform monitoring alerts from public disaster warnings; infrastructure alerts must never be republished as hazard alerts.

11. Backup, restore and disaster recovery

| Asset | Protection approach |
| --- | --- |
| PostgreSQL | Automated backups and point-in-time recovery where supported; encrypted storage and restricted restore permissions. |
| Object storage | Versioning or replication where justified; lifecycle policy and restore test for representative objects. |
| Application configuration | Version-controlled non-secret configuration plus protected backup of required operational metadata. |
| Secrets | Provider-managed secret backup/recovery procedures; rotation and break-glass process. |
| Model artifacts | Versioned, checksummed artifacts with reproducible metadata and a known last-good version. |

Set Recovery Point Objective (RPO) and Recovery Time Objective (RTO) with the product/operations owner; record them in the service runbook.

Perform restore drills in an isolated environment and verify record counts, constraints, spatial data and media references.

Document recovery order: infrastructure/network, database, storage, secrets/configuration, API/workers, AI service and frontend.

After restoration, run smoke tests and reconcile any queued or in-flight jobs before resuming normal operations.

Maintain a manual operating procedure for essential emergency coordination if AAPADAMITRA is unavailable.

12. Scaling and capacity management

Start with measured pilot capacity; avoid autoscaling policies without resource and queue metrics.

Scale stateless API instances horizontally when request load and latency justify it.

Scale background workers based on queue depth and job age, with concurrency limits to protect downstream services.

Scale AI inference independently; schedule heavier training/batch work separately from latency-sensitive inference.

Use database indexes, query optimization and connection pooling before considering complex database sharding.

Cache only safe, non-sensitive and time-bounded data; clearly display freshness for cached hazard information.

Review storage growth, map payload size, external provider quotas and notification rate limits.

13. Security and operational access

Enforce MFA for cloud consoles, source control, CI/CD and privileged operational accounts.

Apply least privilege to human users, service identities, database roles and storage permissions.

Separate deployment permission from routine application operation; log privileged actions.

Patch runtime images, frameworks and operating systems on a defined schedule; prioritize actively exploited vulnerabilities.

Use approved incident procedures for credential compromise, suspected data exposure and unauthorized deployment.

Conduct periodic access reviews and remove access promptly when team membership or responsibilities change.

14. Release, rollback and change management

Every release has a version, commit, artifact digest, change summary, migration status, test report and named approver.

Deploy progressively where supported; verify health, error rate and key workflows after each rollout.

Rollback application artifacts when safe; database changes require a compatible rollback or forward-fix plan.

Do not automatically roll back irreversible data migrations; take backups and use tested recovery steps.

Pause deployment if smoke tests fail, error rates exceed agreed thresholds or critical workflows become unsafe.

Maintain a release calendar and communicate planned maintenance to operational stakeholders.

15. Incident response and runbooks

| Incident | Initial response |
| --- | --- |
| API outage | Check health, recent release, dependency status and logs; rollback or fail over according to runbook. |
| Database unavailable | Check provider status, connections and capacity; protect data integrity; restore only through approved recovery steps. |
| AI service unavailable | Mark forecasts unavailable/stale, retain last valid result with timestamp, route to human review and do not fabricate outputs. |
| Queue backlog | Inspect worker health, poison messages and provider throttling; scale cautiously and preserve idempotency. |
| Suspected data breach | Restrict affected credentials/access, preserve evidence, notify designated security owner and follow applicable response obligations. |
| Bad deployment | Stop rollout, assess data migration compatibility, roll back application or apply forward fix, then run critical smoke tests. |
| Notification provider failure | Show delivery status accurately, retry within limits and provide approved alternate communication procedure. |

16. Cost management

Create a monthly cost estimate and budget alert for compute, database, storage, bandwidth, logs, maps, messaging and AI inference.

Tag resources by environment, service, owner and project.

Set log retention and object lifecycle policies appropriate to operational and legal needs.

Use smaller development/staging resources and schedule non-production shutdown where safe.

Track cost per active user, per forecast run and per notification batch as pilot usage becomes measurable.

Require approval before enabling high-cost managed services, replicas, GPUs or always-on large instances.

17. Recommended repository and infrastructure layout

AAPADAMITRA/  apps/    web/    api/  services/    ai/    worker/  infra/    docker/    environments/      dev/      staging/      production/    scripts/    monitoring/  database/    migrations/    seeds/  .github/    workflows/  docs/    runbooks/    architecture/    release-checklists/    disaster-recovery/

18. Initial eight-day DevOps implementation plan

| Day | Work | Deliverable |
| --- | --- | --- |
| 1 | Choose provider candidate; create repo conventions, environment inventory and cost estimate. | Decision record and deployment plan. |
| 2 | Dockerize React build, NestJS API, worker and AI service; local compose setup. | Repeatable local stack. |
| 3 | Provision development cloud environment, private database and object storage. | Secure development deployment. |
| 4 | Configure CI lint/test/build/scan pipeline and immutable artifacts. | Automated CI pipeline. |
| 5 | Deploy staging, configure DNS/TLS, environment secrets and migrations. | Staging environment. |
| 6 | Add logs, metrics, health checks, alerts and basic runbooks. | Operational visibility. |
| 7 | Test backup/restore, rollback, provider outage and service restart. | Recovery evidence. |
| 8 | Deploy pilot candidate, run smoke tests, review access/cost and sign off. | Pilot release checklist. |

This schedule is a competition/pilot bootstrap plan. Production hardening, independent security review, load testing, recovery drills and stakeholder approvals remain necessary before relying on the platform for real emergency operations.

19. Acceptance criteria

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| OPS-001 | Environment isolation | P0 | Development, staging and production have separate data stores, secrets and access policies. |
| OPS-002 | Containerized services | P0 | API, worker and AI service build and run reproducibly with health checks. |
| OPS-003 | Automated CI | P0 | Pull requests run mandatory lint, type, test and security checks. |
| OPS-004 | Controlled deployment | P0 | Staging deploy is repeatable; production deployment requires authorized approval. |
| OPS-005 | Database migration safety | P0 | Migrations are versioned, tested and have documented recovery/forward-fix approach. |
| OPS-006 | Transport and network security | P0 | HTTPS enforced; database and internal services are not publicly exposed. |
| OPS-007 | Secrets management | P0 | No production secrets in source control, images or frontend bundles. |
| OPS-008 | Observability | P1 | Logs, service health, error/latency and queue metrics are visible to authorized operators. |
| OPS-009 | Backup and restore | P0 pilot readiness | A restore drill succeeds and integrity checks are documented. |
| OPS-010 | Rollback and incident runbooks | P1 | Release rollback and critical dependency outage procedures are documented and rehearsed. |
| OPS-011 | Cost controls | P1 | Budget estimate, resource ownership and budget alerts are configured. |
| OPS-012 | Operational sign-off | P0 pilot readiness | Named owner approves access, monitoring, backup, recovery and manual fallback readiness. |

20. Decisions required before production deployment

| Decision | Owner / input |
| --- | --- |
| Cloud provider, region and account structure | Product owner + DevOps; compare service fit, cost, data terms and support. |
| Domain name and DNS ownership | Product owner / organization. |
| Expected pilot users and peak load | Product owner and pilot stakeholders. |
| RTO, RPO and backup retention | Product owner + operations owner. |
| Data retention and media lifecycle | Product owner + privacy/security reviewer. |
| Monitoring/incident contact roster | Operations owner and project team. |
| Approved external providers and quotas | Backend/AI owners; document fallback behavior. |
| Production go-live authorization | Named operational stakeholder; separate from competition demo approval. |

Final deployment principle

AAPADAMITRA must be deployable repeatedly, observable during operation and recoverable after failure. Cloud hosting alone does not make a system production-ready. A pilot release requires verified security boundaries, tested backups, clear operational ownership, truthful degraded states and a documented manual fallback for critical emergency workflows.