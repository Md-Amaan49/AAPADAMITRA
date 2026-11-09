AAPADAMITRA

05. DATABASE DESIGN DOCUMENT

Logical data model, entities, relationships, constraints, indexes and data lifecycle

Version 1.0  |  08 November 2026Cloud deployment • PostgreSQL • PostGIS proposedNestJS modular backend • Python AI serviceInitial pilot: Nanded district, Maharashtra

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-DB-005 |
| Version / status | 1.0 / Proposed engineering baseline; review required before migrations |
| Purpose | Define the logical and physical database design baseline for AAPADAMITRA. |
| Audience | Backend, frontend, AI/data, QA, product and DevOps team |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture; 04 Module Specification; 06 API Documentation; 07 AI/ML Specification; 08 Security & RBAC; 09 Testing Strategy; 10 Deployment & Operations |

Revision history

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 08 Nov 2026 | Initial relational schema blueprint, key entities, relationships, constraints, indexing and lifecycle policies. |

Important implementation status

This is a design specification, not a claim that a database has already been provisioned. PostgreSQL is the selected database direction. PostGIS and Prisma are recommended design choices and should be formally confirmed by the team before the first production migration. Table and column names are proposed logical names; the team may refine them while preserving the documented domain boundaries.

1. Database objectives and principles

Provide a consistent system of record for users, organizations, geography, assets, observations, forecasts, incidents, SOS requests, alerts, response tasks and recovery records.

Use relational integrity for operational data and spatial types/indexes for geographic queries.

Preserve provenance: who/what created a record, source, observed/received/issued timestamps, units, verification state and model version where applicable.

Separate raw observations, derived indicators and model predictions; never overwrite an observation with a forecast.

Use explicit lifecycle status, audit history and soft deletion only where justified.

Enforce authorization in the application service layer and database access patterns; never rely on frontend hiding alone.

Support a single Nanded pilot while allowing future multi-district and multi-organization expansion.

Keep time-series volume manageable through indexes and a future partitioning strategy when measured scale justifies it.

2. Technology and conventions

| Area | Baseline / recommendation | Notes |
| --- | --- | --- |
| RDBMS | PostgreSQL | Primary transactional and relational store. |
| Spatial | PostGIS extension — proposed | Geometry/geography types, spatial predicates and GiST indexes. |
| ORM | Prisma — proposed | Use migrations; use parameterized SQL for PostGIS operations not well represented by ORM. |
| Primary keys | UUID | Generate UUIDs in application or database consistently. |
| Naming | snake_case tables and columns | Plural table names; explicit foreign-key names. |
| Time | timestamptz in UTC | Store instants in UTC; render in local timezone at UI boundary. |
| Coordinates | WGS 84 / EPSG:4326 | Confirm coordinate reference and source accuracy for every imported layer. |
| JSON | jsonb only for flexible metadata | Do not put core relationships or frequently queried fields only in JSON. |
| Money/quantities | numeric with defined precision and units | Avoid floating point for values requiring exact decimal storage. |
| Deletion | Restrict/cascade deliberately | Operational and audit records should generally be retained, not cascaded away. |

2.1 Naming and common columns

Recommended common columns for mutable domain tables: id UUID primary key; created_at timestamptz not null; updated_at timestamptz not null; created_by UUID nullable FK where system ingestion is possible; updated_by UUID nullable FK; and version integer for optimistic concurrency where concurrent editing is plausible. Do not add generic columns mechanically to immutable event/measurement tables if they have a more appropriate event timestamp and source identity.

Use *_at for timestamps, *_id for foreign keys, *_code for stable business codes, *_status for lifecycle state and *_unit for measurement units. Enumerated values should be implemented as PostgreSQL enums only when change is tightly controlled; otherwise use lookup tables or constrained text to simplify evolving workflows.

3. Logical data domains

| Domain | Core tables | Owning module |
| --- | --- | --- |
| Identity & tenancy | organizations, users, roles, permissions, user_roles, role_permissions | MOD-01 |
| Geography | administrative_areas, geographic_features, alert_zones | MOD-02 |
| Hazard configuration | hazard_types, severity_levels, hazard_thresholds | MOD-03 |
| Infrastructure | assets, rivers, monitoring_stations, sensors, asset_relationships | MOD-04 |
| Observations | data_sources, observations, ingestion_runs | MOD-05 |
| AI/ML | model_registry, inference_jobs, forecasts, forecast_values, risk_assessments | MOD-06 |
| Incident & citizen | incidents, incident_events, citizen_reports, sos_requests, attachments | MOD-07/08 |
| Alerts | alerts, alert_versions, alert_targets, notification_deliveries | MOD-09 |
| Response | response_teams, responders, resources, response_tasks, task_events | MOD-10 |
| Recovery | damage_assessments, relief_requests, relief_allocations, recovery_actions | MOD-11 |
| Governance | audit_logs, dashboard_snapshots/report_jobs as needed | MOD-12 |
| Platform | integration_providers, integration_events, outbox_events, idempotency_keys | MOD-13 |

4. Entity relationship overview

High-level relationships (not every optional relationship is shown):

| Parent entity | Relationship | Child entity / cardinality |
| --- | --- | --- |
| organizations | 1 to many | users, assets, response_teams, data_sources |
| users | many to many via join | roles through user_roles; organizations through memberships if multi-org access is enabled |
| administrative_areas | self-referencing 1 to many | child administrative_areas; 1 to many assets/incidents/alert_zones |
| hazard_types | 1 to many | incidents, forecasts, risk_assessments, alerts, hazard_thresholds |
| assets | 1 to many | monitoring_stations, observations, incidents (optional linked asset) |
| monitoring_stations | 1 to many | sensors and observations |
| data_sources | 1 to many | observations and ingestion_runs |
| model_registry | 1 to many | inference_jobs and forecasts |
| inference_jobs | 1 to many | forecasts or result records |
| incidents | 1 to many | incident_events, citizen_reports, sos_requests, response_tasks, damage_assessments |
| alerts | 1 to many | alert_versions, alert_targets, notification_deliveries |
| response_tasks | 1 to many | task_events |
| relief_requests | 1 to many | relief_allocations |

Use join tables for genuine many-to-many relationships. Avoid polymorphic foreign keys such as (entity_type, entity_id) for core relations when referential integrity matters; use explicit nullable FKs or dedicated link tables.

5. Core table specifications

5.1 Identity and access

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| organizations | id UUID PK; name; organization_type; code unique; parent_organization_id FK nullable; status; created_at; updated_at | Organization/agency/partner tenancy boundary. Seed a project/pilot organization; do not invent official government affiliation. |
| users | id UUID PK; email unique nullable; phone unique nullable; password_hash nullable for external auth; full_name; account_status; preferred_language; last_login_at; created_at; updated_at | Do not store plaintext passwords or OTPs. Require at least one verified login identifier for accounts that authenticate directly. |
| roles | id UUID PK; code unique; name; description; is_system_role | Examples: CITIZEN, RESPONDER, OPERATOR, AUTHORITY_REVIEWER, AUTHORITY_APPROVER, ADMIN. |
| permissions | id UUID PK; code unique; description | Fine-grained action permissions, e.g. alert.draft, alert.approve, asset.update. |
| user_roles | user_id FK; role_id FK; organization_id FK nullable; scope_area_id FK nullable; granted_by FK; granted_at; expires_at nullable; PK(user_id, role_id, organization_id, scope_area_id) | Scope role grants by organization and/or geography. Add uniqueness handling for nullable columns explicitly. |
| role_permissions | role_id FK; permission_id FK; PK(role_id, permission_id) | Permission mapping; application must enforce it on every protected action. |

5.2 Geography and GIS

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| administrative_areas | id UUID PK; parent_id self FK nullable; area_type; name; code; state_code; district_code; geom geometry(MultiPolygon,4326) nullable; source; source_updated_at; created_at; updated_at | Hierarchy such as state/district/taluka/village. Unique code within its parent where reliable. |
| geographic_features | id UUID PK; feature_type; name; geom geometry(Geometry,4326); properties jsonb; source_id FK nullable; validity dates | For rivers, boundaries or reference features not represented as operational assets. Keep frequently queried attributes relational. |
| alert_zones | id UUID PK; name; hazard_type_id FK; area_id FK nullable; geom geometry(MultiPolygon,4326); status; valid_from; valid_to; created_by FK | Version or retain historical zone definitions when alerts have been issued against them. |

5.3 Hazard configuration and assets

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| hazard_types | id UUID PK; code unique; name; description; active; created_at | Seed flood, drought, heatwave, cyclone, landslide and other catalogue entries as configured; catalogue presence does not imply model availability. |
| severity_levels | id UUID PK; hazard_type_id FK; code; label; sort_order; description; UNIQUE(hazard_type_id, code) | Severity semantics can differ by hazard; do not assume one universal numeric scale. |
| hazard_thresholds | id UUID PK; hazard_type_id FK; area_id FK nullable; asset_id FK nullable; metric_code; operator; threshold_value numeric; unit; effective_from; effective_to; source; approved_by FK nullable | Threshold values must have a source, unit, scope and validity period. Do not seed unverified operational thresholds. |
| assets | id UUID PK; organization_id FK nullable; asset_code unique; asset_type; name; description; area_id FK nullable; location geography(Point,4326) nullable; geom geometry(Geometry,4326) nullable; status; metadata jsonb; created_at; updated_at | Asset types include dam, gauge, shelter, hospital, control room and other infrastructure. For dam-specific facts use verified fields or a typed extension table. |
| rivers | id UUID PK; name; river_code unique nullable; geom geometry(MultiLineString,4326) nullable; source; metadata jsonb | River network reference. Do not infer hydrological connectivity from straight-line proximity. |
| asset_relationships | id UUID PK; from_asset_id FK; to_asset_id FK; relationship_type; directionality; source; valid_from; valid_to | Represents upstream/downstream, located_on, monitors, serves or associated-with relationships; require evidence/source for hydrological relationships. |
| monitoring_stations | id UUID PK; asset_id FK nullable; station_code unique; name; station_type; location geography(Point,4326); operator_org_id FK nullable; status; metadata jsonb | Station may be associated with an asset or river segment. |
| sensors | id UUID PK; station_id FK; sensor_code unique; sensor_type; metric_code; unit; installed_at; last_seen_at; status; metadata jsonb | Store sensor identity and configuration, not secrets. Provider credentials belong in secret management. |

5.4 Observation and ingestion

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| data_sources | id UUID PK; code unique; name; source_type; organization_id FK nullable; trust_level; configuration_ref; active; created_at | configuration_ref points to secret/configuration manager; never store raw API keys here. |
| ingestion_runs | id UUID PK; data_source_id FK; started_at; completed_at; status; records_received; records_accepted; records_rejected; error_summary | Operational record for batch/API ingestion. Avoid sensitive payload dumps in error_summary. |
| observations | id UUID PK; asset_id FK nullable; station_id FK nullable; sensor_id FK nullable; data_source_id FK; metric_code; value numeric; unit; observed_at; received_at; quality_status; provenance_type; raw_reference nullable; idempotency_key nullable; created_at | Immutable measurement fact. Exactly one appropriate source context should be present according to metric/source rules. Keep original payload in controlled object storage only if required. |

5.5 AI/ML and forecasts

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| model_registry | id UUID PK; model_code; version; hazard_type_id FK; model_family; artifact_uri; status; training_data_summary; evaluation_summary jsonb; approved_for_use boolean; created_at; UNIQUE(model_code, version) | Artifact URI references secured model storage. Store evaluation metadata, not unbounded binary artifacts in PostgreSQL. |
| inference_jobs | id UUID PK; model_id FK; requested_by FK nullable; status; input_window_start; input_window_end; requested_at; started_at; completed_at; input_snapshot_ref; error_code; error_summary | Track asynchronous inference execution and failure states. |
| forecasts | id UUID PK; inference_job_id FK; model_id FK; hazard_type_id FK; asset_id FK nullable; area_id FK nullable; issued_at; valid_from; valid_to; horizon_minutes; forecast_status; confidence numeric nullable; limitations text; provenance jsonb | A forecast is a model output, not an observed fact. Store confidence only if model output is calibrated and its meaning is documented. |
| forecast_values | id UUID PK; forecast_id FK; metric_code; value numeric; unit; target_time; lower_bound numeric nullable; upper_bound numeric nullable; location geography(Point,4326) nullable; quality_flag | One forecast can contain multiple time steps/metrics/locations. Define uniqueness for forecast_id + metric_code + target_time + location key as applicable. |
| risk_assessments | id UUID PK; hazard_type_id FK; incident_id FK nullable; asset_id FK nullable; area_id FK nullable; assessment_type; score numeric nullable; severity_level_id FK nullable; assessed_at; source_type; model_id FK nullable; evidence jsonb; reviewed_by FK nullable; review_status | Risk score meaning and scale must be documented; human review state must be explicit. |

5.6 Incident, citizen report and SOS

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| incidents | id UUID PK; incident_number unique; hazard_type_id FK; severity_level_id FK nullable; title; description; status; area_id FK nullable; location geography(Point,4326) nullable; asset_id FK nullable; reported_at; occurred_at nullable; assigned_to FK nullable; created_by FK nullable; resolved_at nullable; closed_at nullable; created_at; updated_at | Operational event record. Incident number is human-readable; UUID remains the stable primary key. |
| incident_events | id UUID PK; incident_id FK; event_type; from_status; to_status; note; actor_user_id FK nullable; event_at; metadata jsonb | Append-only status/timeline events. |
| citizen_reports | id UUID PK; submitted_by FK nullable; incident_id FK nullable; report_type; description; location geography(Point,4326) nullable; area_id FK nullable; submitted_at; verification_status; privacy_level; contact_reference nullable | Allow guest submission only if explicitly approved in security design; keep contact data separated/restricted. |
| sos_requests | id UUID PK; citizen_report_id FK nullable; submitted_by FK nullable; sos_reference unique; category; location geography(Point,4326) nullable; status; submitted_at; acknowledged_at nullable; triaged_by FK nullable; incident_id FK nullable; urgency_reason nullable | Acknowledgement confirms receipt only; do not imply dispatch or rescue without an actual operational integration. |
| attachments | id UUID PK; owner_user_id FK nullable; incident_id FK nullable; citizen_report_id FK nullable; object_key; mime_type; size_bytes; checksum; uploaded_at; scan_status; access_classification | Store file bytes in object storage, not database blobs by default. Enforce size/type scanning and authorization. |

5.7 Alert and notification

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| alerts | id UUID PK; alert_number unique; hazard_type_id FK; severity_level_id FK nullable; title; status; issuer_org_id FK; created_by FK; approved_by FK nullable; approved_at nullable; published_at nullable; valid_from; valid_to; cancellation_reason nullable; created_at; updated_at | Alert parent record. Published content is versioned in alert_versions. |
| alert_versions | id UUID PK; alert_id FK; version_number; message; instructions; language_code; evidence_summary; created_by FK; created_at; UNIQUE(alert_id, version_number) | Retain exact content issued to users; edits create a new version. |
| alert_targets | id UUID PK; alert_id FK; area_id FK nullable; zone_id FK nullable; target_type; target_reference nullable | Define audience/area precisely. Add constraint that one valid targeting method is present. |
| notification_deliveries | id UUID PK; alert_id FK; alert_version_id FK; channel; provider_code; recipient_reference nullable; delivery_status; attempted_at; delivered_at nullable; provider_message_id nullable; failure_code nullable | Do not store unnecessary recipient personal data. Delivery receipt is not proof that a person read or acted on the alert. |

5.8 Response and recovery

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| response_teams | id UUID PK; organization_id FK; name; team_type; base_location geography(Point,4326) nullable; status; created_at | Teams belong to an organization. |
| responders | id UUID PK; user_id FK; team_id FK nullable; qualification_summary; availability_status; last_status_at | Restrict personal and sensitive qualification data. |
| resources | id UUID PK; organization_id FK; resource_type; name; quantity numeric nullable; unit nullable; location geography(Point,4326) nullable; availability_status; last_updated_at | Resource inventory and availability should be time-aware. |
| response_tasks | id UUID PK; incident_id FK; team_id FK nullable; assigned_to FK nullable; resource_id FK nullable; task_type; priority; status; instructions; assigned_at; accepted_at nullable; completed_at nullable; created_by FK | Task state changes should be recorded in task_events. |
| task_events | id UUID PK; response_task_id FK; event_type; from_status; to_status; actor_user_id FK; event_at; note | Append-only task timeline. |
| damage_assessments | id UUID PK; incident_id FK; area_id FK nullable; asset_id FK nullable; assessor_id FK; assessment_type; severity; estimated_impact jsonb; verification_status; assessed_at; evidence_ref nullable | Clearly distinguish estimate from verified assessment. |
| relief_requests | id UUID PK; incident_id FK; requested_by FK; category; quantity numeric nullable; unit nullable; status; priority; requested_at; reviewed_by FK nullable | Beneficiary details, if required, should be in a restricted data structure with minimal collection. |
| relief_allocations | id UUID PK; relief_request_id FK; resource_id FK nullable; approved_by FK; quantity numeric; unit; allocated_at; distribution_status; distributed_at nullable | Track approval and distribution separately. |
| recovery_actions | id UUID PK; incident_id FK; area_id FK nullable; action_name; description; owner_org_id FK; status; start_date nullable; target_date nullable; completed_at nullable; progress numeric nullable | Post-event recovery action tracking. |

5.9 Audit, integration and reliability

| Table | Proposed columns / keys | Design notes |
| --- | --- | --- |
| audit_logs | id UUID PK; actor_user_id FK nullable; organization_id FK nullable; action_code; entity_type; entity_id UUID nullable; occurred_at; request_id; ip_hash nullable; before_summary jsonb nullable; after_summary jsonb nullable | Append-only for application roles; avoid storing passwords, tokens, full sensitive payloads or unnecessary personal data. |
| integration_providers | id UUID PK; provider_code unique; provider_type; status; configuration_ref; created_at; updated_at | Configuration/secret references only. |
| integration_events | id UUID PK; provider_id FK; direction; event_type; external_event_id nullable; status; received_at; processed_at nullable; retry_count; error_code nullable; correlation_id | Idempotency key should prevent duplicate processing where provider supports it. |
| outbox_events | id UUID PK; aggregate_type; aggregate_id UUID; event_type; payload jsonb; created_at; published_at nullable; attempts; status | Transactional outbox prevents database commit and event publish from drifting apart. |
| idempotency_keys | id UUID PK; key unique; actor_user_id FK nullable; operation; request_hash; response_reference nullable; created_at; expires_at | Use for retryable client submissions and external callbacks; never use as authorization. |

6. Key constraints and integrity rules

Every FK must have an intentional ON DELETE rule. Prefer RESTRICT for operational history; use CASCADE only for dependent join/configuration rows whose deletion is safe.

Use NOT NULL for required business fields and CHECK constraints for positive quantities, valid ranges, start/end ordering and supported status values.

Use unique constraints for stable codes, human-readable incident/SOS/alert references, model_code + version, alert_id + version_number and source idempotency keys.

Use partial unique indexes where only active records must be unique, and define how soft-deleted rows affect uniqueness.

Use transactions for multi-row workflows such as alert approval/publication and relief allocation.

Do not store calculated status summaries as the only source of truth; retain the underlying event history.

All measurement values must have a unit. Unit conversion must be explicit and tested.

Forecast valid_to must be greater than valid_from; horizon must be positive.

Alert valid_to must be greater than valid_from; publication requires approval metadata.

Prevent unauthorized cross-organization and cross-jurisdiction references at service validation and, where feasible, database constraints.

7. Indexing strategy

| Table / column | Index recommendation | Why |
| --- | --- | --- |
| All FK columns | B-tree index where not already covered by PK/unique index | Join and referential lookup performance. |
| users.email / users.phone | Unique indexes on normalized verified identifiers | Account lookup and duplicate prevention. |
| assets.asset_code | Unique B-tree | Asset lookup. |
| assets.location / stations.location | GiST spatial index | Nearby/spatial queries. |
| administrative_areas.geom / alert_zones.geom | GiST spatial index | Point-in-polygon and zone intersection. |
| observations(asset_id, metric_code, observed_at DESC) | Composite B-tree | Latest observations by asset and metric. |
| observations(station_id, observed_at DESC) | Composite B-tree | Station time-series retrieval. |
| observations(data_source_id, idempotency_key) | Unique/partial unique as appropriate | Deduplicate provider retries. |
| forecasts(asset_id, issued_at DESC) | Composite B-tree | Latest asset forecasts. |
| forecast_values(forecast_id, metric_code, target_time) | Composite B-tree | Forecast series retrieval. |
| incidents(status, created_at DESC) | Composite B-tree | Operational incident queues. |
| incidents(area_id, status, created_at DESC) | Composite B-tree | Jurisdiction-scoped queues. |
| alerts(status, valid_from, valid_to) | B-tree | Current and scheduled alert lookup. |
| audit_logs(entity_type, entity_id, occurred_at DESC) | Composite B-tree | Audit timeline. |
| integration_events(status, received_at) | Composite B-tree | Retry and failure processing. |

Do not add every possible index at launch. Confirm query patterns with API/UI use cases, inspect EXPLAIN ANALYZE on representative data and monitor write overhead. Spatial indexes accelerate candidate selection; exact spatial predicates are still required.

8. Spatial data rules

Use geometry with SRID 4326 for administrative boundaries and lines; use geography(Point,4326) where distance in metres is a common query. Choose consistently per column and query.

Validate incoming longitude/latitude ordering and coordinate ranges at API boundaries.

Record the source, capture time, accuracy if known, and coordinate reference system of imported features.

Use ST_Intersects/ST_Contains or suitable geography distance operations for spatial filtering; never infer upstream/downstream river relationships from proximity alone.

Do not expose sensitive responder or citizen exact locations on public maps by default.

Store authoritative source attribution and version/effective date for boundary datasets.

9. Data lifecycle, retention and privacy

| Data class | Lifecycle recommendation | Protection |
| --- | --- | --- |
| User identity and access | Retain while account active; deactivate rather than hard-delete where audit obligations exist; define account closure process. | Restrict PII; hash passwords using a modern password hashing scheme or delegate to identity provider. |
| Observations | Append-only; corrections should create superseding/correction records or explicit quality updates with audit trail. | Source provenance, timestamps and unit required. |
| Forecasts and inference | Retain model/input references and results according to evaluation and operational needs; define retention after pilot. | Restrict raw input snapshots and model artifacts. |
| Incidents, SOS and reports | Retain according to approved operational/legal policy; minimize personal details and restrict access. | Field-level or separate-table controls for contact details and precise locations. |
| Alerts and versions | Retain published versions and delivery outcomes for accountability. | Immutable published content history. |
| Audit logs | Append-only; retention period set by policy and applicable law. | No secrets or unnecessary personal data. |
| Attachments | Object storage with malware scanning, access expiry and lifecycle rules. | Private by default; signed, short-lived access URLs. |

Exact retention periods, consent language, legal basis, data residency and disclosure policy are OPEN decisions. Obtain appropriate institutional/legal review before production use. This document does not claim regulatory compliance.

10. Transactions, concurrency and event handling

Use database transactions for state changes that must be atomic (e.g. alert approval plus version activation and outbox event creation).

Use optimistic concurrency (version column or updated_at check) for records edited by multiple operators.

Use the transactional outbox for reliable publication of domain events to background workers or notification adapters.

Make ingestion and webhook handlers idempotent using provider event IDs or idempotency keys.

Use background jobs for model inference, notifications, report generation and bulk imports; keep long-running work out of HTTP request transactions.

Do not hold database transactions open while calling external providers or AI inference services.

11. Backup, recovery and operational database management

Automate encrypted backups and periodically test restoration into a separate environment.

Define RPO and RTO targets with the team and hosting provider before production; do not invent guarantees.

Use separate database credentials for migration, application runtime, read-only reporting and operations where practical.

Keep secrets in the deployment secret manager, not source control or database configuration tables.

Apply migrations through reviewed, version-controlled scripts; never make unreviewed schema changes directly in production.

Monitor connection pool saturation, slow queries, disk growth, replication/backup status and failed migrations.

Use connection pooling appropriate to the hosting environment and ORM.

12. Migration and seed-data strategy

Create PostgreSQL development/test environments and enable required extensions (PostGIS if approved).

Define baseline schema migration and UUID/time conventions.

Implement identity, organization and role tables first.

Add geography, hazard catalogue, asset and station tables.

Add observation and ingestion tables with source/provenance constraints.

Add forecast/model tables after agreeing the AI service contract.

Add incidents, citizen reports, SOS, alerts and approval history.

Add response, recovery, audit and integration reliability tables.

Seed only reference data approved by the product team; mark demo fixtures as synthetic.

Run migration tests on a clean database and on a copy of the previous schema before release.

12.1 Pilot seed-data safeguards

Vishnupuri Dam may be seeded as a pilot asset only with verified metadata and source attribution.

Do not insert invented dam levels, discharge, rainfall, capacity, warning thresholds or live sensor readings.

Use clearly labelled synthetic fixture datasets for UI and model development.

Keep demo tenant and production tenant data separate.

Do not describe a manual sample entry as a live sensor feed.

13. Suggested initial ERD (logical)

The following compact Mermaid ER diagram shows the principal pilot relationships. It is intentionally simplified; the table definitions above remain authoritative for the full logical design.

erDiagram  ORGANIZATIONS ||--o{ USERS : has  USERS ||--o{ USER_ROLES : assigned  ROLES ||--o{ USER_ROLES : grants  ROLES ||--o{ ROLE_PERMISSIONS : contains  PERMISSIONS ||--o{ ROLE_PERMISSIONS : maps  ADMINISTRATIVE_AREAS ||--o{ ASSETS : contains  HAZARD_TYPES ||--o{ INCIDENTS : classifies  ASSETS ||--o{ MONITORING_STATIONS : monitored_by  MONITORING_STATIONS ||--o{ SENSORS : hosts  DATA_SOURCES ||--o{ OBSERVATIONS : supplies  ASSETS ||--o{ OBSERVATIONS : measured_for  MODEL_REGISTRY ||--o{ INFERENCE_JOBS : executes  MODEL_REGISTRY ||--o{ FORECASTS : generates  INCIDENTS ||--o{ INCIDENT_EVENTS : records  INCIDENTS ||--o{ SOS_REQUESTS : links  INCIDENTS ||--o{ RESPONSE_TASKS : coordinates  ALERTS ||--o{ ALERT_VERSIONS : versions  ALERTS ||--o{ NOTIFICATION_DELIVERIES : sends  INCIDENTS ||--o{ DAMAGE_ASSESSMENTS : assesses

14. Open decisions before implementation

| Decision | Current recommendation | Owner / resolution |
| --- | --- | --- |
| PostGIS approval | Recommended for GIS, alert zones and proximity queries. | Team/architecture review |
| Prisma approval | Recommended for NestJS data access and migrations; use raw parameterized SQL for spatial operations as needed. | Backend owner |
| Authentication provider | Decide managed identity vs NestJS-managed credentials. | Backend/security owner |
| Multi-tenancy enforcement | Organization + optional administrative-area scope; finalize exact access rules. | Product/security owner |
| Measurement catalogue | Agree metric codes, units, conversion rules and valid ranges. | AI/data + domain reviewer |
| Dam metadata and source | Collect verified Vishnupuri metadata and source attribution. | Product/data owner |
| Official feeds | Confirm availability, permissions, formats, update rates and terms. | Integration owner |
| Retention and privacy policy | Set periods and personal-data handling after institutional review. | Product/security owner |
| Partitioning | Start unpartitioned; evaluate time partitioning after volume/query measurements. | Backend/DevOps owner |
| Forecast schema details | Confirm spatial/time-series output shape with AI/ML specification. | AI/data + backend owner |

15. Database design acceptance checklist

Every core entity has a defined owner module and primary key.

Relationships and foreign keys are defined for all core operational entities.

All measurements include value, unit, observed timestamp, received timestamp and provenance.

Predictions are stored separately from observations and identify model/version/horizon.

Alert approval and published content versions are traceable.

Citizen SOS/report data has explicit privacy and access controls.

Spatial entities use a consistent SRID and suitable spatial indexes.

Critical constraints, uniqueness rules and deletion policies are documented.

Indexes align with known API query patterns and have been performance-tested.

Migrations, seed fixtures, backup/restore and audit handling are covered by implementation tasks.

Appendix A — Suggested PostgreSQL/PostGIS setup (illustrative)

-- Run only after confirming PostGIS is approved and available in the target PostgreSQL service.CREATE EXTENSION IF NOT EXISTS postgis;-- Illustrative table pattern; final migrations should be generated/reviewed by the team.CREATE TABLE assets (  id uuid PRIMARY KEY,  asset_code text NOT NULL UNIQUE,  asset_type text NOT NULL,  name text NOT NULL,  location geography(Point, 4326),  status text NOT NULL,  created_at timestamptz NOT NULL DEFAULT now(),  updated_at timestamptz NOT NULL DEFAULT now());CREATE INDEX assets_location_gix  ON assets USING GIST (location);-- Illustrative latest-observation query index:-- CREATE INDEX observations_asset_metric_time_idx--   ON observations (asset_id, metric_code, observed_at DESC);

Appendix B — Safety-critical data principle

AAPADAMITRA is a decision-support and coordination platform. Database records and model outputs do not themselves constitute official warnings, evacuation orders or dam-operation instructions. Any public alert must pass the documented human approval workflow. No application or model component may directly control dam gates or other physical infrastructure.