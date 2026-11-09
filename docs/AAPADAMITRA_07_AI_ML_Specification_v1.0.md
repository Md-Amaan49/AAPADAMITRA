AAPADAMITRA

07. AI / ML SPECIFICATION

Model portfolio, data contracts, training, evaluation, serving and governance

Version 1.0  |  08 November 2026Initial pilot: Nanded district, MaharashtraNestJS orchestration • Python/FastAPI inference • PostgreSQL/PostGIS

Document Control

| Field | Details |
| --- | --- |
| Document ID | AAP-AIML-007 |
| Version / status | 1.0 / Proposed engineering baseline; data feasibility and model gates must be reviewed. |
| Purpose | Specify AI/ML capabilities, data requirements, modelling approaches, outputs, evaluation, deployment and operational controls. |
| Audience | AI/data engineer, backend engineer, product owner, domain reviewers, QA and DevOps |
| Related documents | 01 PRD; 02 SRS; 03 System Architecture; 04 Module Specification; 05 Database Design; 06 API Documentation; 08 Security & RBAC; 09 Testing Strategy; 10 Deployment & Operations |

1. Executive summary

AAPADAMITRA uses AI/ML to support multi-hazard preparedness, monitoring, forecasting, risk assessment and operational prioritization. The first implementation priority is flood and dam-related risk for the Nanded pilot. The system must combine historical observations, near-real-time measurements, weather forecasts, geospatial context and verified operational inputs where available.

The initial release should deliver a reliable, explainable baseline before attempting complex deep-learning models. Forecasting outputs are decision-support information, not official warnings or guarantees. Model outputs must carry provenance, issue time, valid time, units, quality flags, uncertainty and limitations. Authorized humans remain responsible for validating and publishing official alerts.

1.1 Confirmed decisions

| Decision | Baseline |
| --- | --- |
| Geography | Nanded district, Maharashtra; pilot boundary and sub-catchments to be confirmed with domain stakeholders. |
| First priority | Flood forecasting and dam-related downstream risk. |
| Forecast scope | Both water-level forecasting and derived flood-risk forecasting. |
| Data strategy | Hybrid: historical, real-time/near-real-time and external forecast/context data. |
| Horizons | Multi-horizon; operational values depend on data cadence and validation. |
| AI architecture | Modular models and hazard-specific pipelines. |
| Serving | Python inference service using FastAPI; NestJS is the client-facing orchestrator. |
| Storage | PostgreSQL/PostGIS for structured observations, model runs, forecasts and spatial references; object storage for model artefacts and larger files. |

1.2 What this document does not claim

It does not claim that live river, dam, rainfall or reservoir data access has been secured.

It does not establish an operational forecast accuracy before datasets and backtesting exist.

It does not authorize automated dam operations, evacuation orders or official warning publication.

It does not require every model listed below to be delivered in the first pilot.

It does not assume that a single model can predict every hazard or every location.

2. AI capability portfolio and delivery priorities

| Model / capability | Purpose | Priority | Initial delivery |
| --- | --- | --- | --- |
| Flood water-level forecasting | Estimate future level at supported gauge/river locations. | P0 | Baseline statistical/ML model + persistence benchmark. |
| Flood risk forecasting | Convert forecast hydrology and exposure context into interpretable risk bands. | P0 | Rule-based thresholds initially; calibrated model only with labelled data. |
| Dam-related downstream risk | Assess downstream risk using verified releases/inflow, river levels, rainfall and routing context. | P0 / data-gated | Decision-support assessment; no control of dam infrastructure. |
| Rainfall forecasting integration | Use authoritative forecast rainfall as model input; assess local bias/quality. | P0 input dependency | Provider ingestion and quality checks before custom rainfall ML. |
| Flood inundation / exposure | Estimate affected areas and exposed assets/population. | P1 | GIS overlays and scenario mapping; hydrodynamic modelling requires terrain/calibration. |
| Drought monitoring | Track rainfall deficit, dry spells, soil moisture and drought indicators. | P1 | Index-based baseline, then calibrated classification. |
| Multi-hazard risk assessment | Combine hazard likelihood, exposure and vulnerability transparently. | P1 | Weighted, auditable decision-support score; no opaque universal score. |
| Incident classification | Categorize citizen reports and prioritize triage for human review. | P2 | Rules + lightweight text classifier after labelled data exists. |
| Damage assessment assistance | Assist review of uploaded images/forms. | P2 / data-gated | Human-reviewed pilot only; do not automate benefit decisions. |

P0 means required for the initial flood-focused pilot, subject to data availability. P1/P2 are staged capabilities. Priority does not mean production readiness.

3. System architecture and model lifecycle

Authoritative providers / sensors / operator inputs                  |          Ingestion & validation                  |      Canonical observations + GIS context                  |       Feature preparation / feature store                  |       Forecast job orchestrator (NestJS)                  |       Python AI service (FastAPI)       |         |          |   Flood ML   Risk logic   Hazard models       |         |          |       +---- validated result contract ----+                  |       PostgreSQL / PostGIS + artefact store                  |     Review workflow -> dashboards / alerts                  |       Authorized human decision and action

NestJS owns user-facing APIs, authorization, job orchestration, workflow state and persistence integration.

Python services own model-specific preprocessing, inference and model runtime; they must not become a second public API.

All training and evaluation datasets must be versioned and reproducible.

Model artefacts are immutable once released; each prediction records the exact model version.

Use asynchronous queues for forecasts and batch scoring. Do not run long inference inside ordinary HTTP request threads.

Keep deterministic risk rules separate from learned model predictions so reviewers can understand which component produced a result.

4. Data strategy and source governance

4.1 Data classes

| Data class | Examples | Required metadata |
| --- | --- | --- |
| Hydrological observations | River/gauge level, discharge, reservoir level, inflow/outflow where officially available. | Station/asset ID, source, timestamp, unit, method, quality flag, location. |
| Weather observations | Rainfall, temperature, humidity, wind where relevant. | Station/grid ID, observation time, unit, missingness and source. |
| Weather forecasts | Forecast precipitation and relevant meteorological variables. | Provider/model, issue time, valid time, lead time, grid/resolution, uncertainty if supplied. |
| Geospatial context | Catchments, river network, elevation, slope, land cover, drainage, settlements. | Dataset owner, CRS, resolution, version, effective date and licence. |
| Exposure and vulnerability | Population/settlement, roads, critical facilities, vulnerable groups in aggregated form. | Source, geography, date, confidence, privacy classification. |
| Dam/operations data | Reservoir level, inflow, release/discharge, gate status if officially provided. | Official source, timestamp, units, quality, access permissions. |
| Incident and impact labels | Flood occurrence, inundation extent, damage, response records. | Verification status, event ID, time, geography, label provenance. |

4.2 Hybrid data ingestion

Historical data supports training and backtesting; real-time data supports current state estimation; forecast products support future forcing variables.

Prefer authoritative government and recognized scientific sources. Confirm access terms, attribution, update frequency and operational permissions before integration.

Do not scrape or ingest restricted data without permission.

Retain source timestamp separately from ingestion timestamp to detect delayed feeds.

Normalize units, coordinate reference systems, station identifiers and time zones at ingestion.

Store raw or minimally transformed source snapshots when licensing and storage policy allow; retain normalized validated records for model use.

Attach quality flags: valid, suspect, missing, stale, corrected, estimated or rejected.

Define freshness thresholds per source. A stale input must be visible to model logic and to users.

4.3 Data feasibility gate

Before choosing a model, build a source inventory for each candidate gauge, dam/reservoir, weather feed and geography. Confirm historical depth, sampling interval, missingness, continuity, timestamps, units, station metadata, licence and access method. If reliable historical target labels or real-time feeds are unavailable, ship a transparent data-readiness and rules-based risk capability rather than claiming a trained predictive model.

| Data readiness | Interpretation | Permitted product behavior |
| --- | --- | --- |
| Green | Source authorized, sufficient history, quality and operational freshness demonstrated. | Candidate for model training/forecasting after validation. |
| Amber | Partial history, irregular cadence, gaps or uncertain operational reliability. | Experimental output; prominent caveat; human review; no automated warning. |
| Red | No permission, no reliable target data, unknown units or unusable quality. | Do not train or publish a prediction from this source. |

5. P0 model specification: flood water-level forecasting

5.1 Objective and target

Estimate future water level at a supported river/gauge station for one or more lead times. The target is a measured level at a defined station and datum. A water-level forecast is not automatically a flood warning: station-specific thresholds, datum consistency, downstream geography and authority review are required.

5.2 Inputs and features

| Feature family | Candidate variables | Notes |
| --- | --- | --- |
| Target history | Lagged level at t-1, t-2, rolling means, rate of rise/fall. | Primary baseline; lags must respect actual sample cadence. |
| Rainfall | Recent observed rainfall totals and intensity; upstream/catchment rainfall. | Use catchment-relevant spatial aggregation, not nearest station blindly. |
| Forecast weather | Forecast precipitation by lead time and catchment. | Preserve forecast issue time to avoid training leakage. |
| Hydrology | Discharge/flow, upstream gauge levels, basin response indicators. | Only when verified data is available. |
| Dam/operations | Official reservoir level, inflow, release/outflow and scheduled release if provided. | Critical provenance; never infer missing releases. |
| Static basin context | Catchment area, elevation, slope, river distance and station metadata. | Version spatial features; ensure consistent station mapping. |
| Time features | Hour/day/season/monsoon phase. | Use cyclic encoding where appropriate; seasonality is not a substitute for hydrology. |

5.3 Recommended model progression

| Stage | Approach | Why / gate |
| --- | --- | --- |
| Baseline 0 | Persistence: future level equals latest valid level. | Mandatory benchmark; reveals whether ML adds value. |
| Baseline 1 | Seasonal/linear regression or autoregressive model. | Interpretable benchmark for each station. |
| Candidate 2 | Gradient-boosted trees (e.g. LightGBM/XGBoost) on engineered lag/weather/hydrology features. | Practical tabular model; requires enough representative events. |
| Candidate 3 | Sequence model (e.g. LSTM/Temporal CNN) only if dense, long, consistent multivariate data exists. | Higher complexity; must outperform simpler model on event-based holdout. |
| Advanced | Hydrological/hydrodynamic model integration or hybrid physics-ML. | Requires catchment, routing, calibration and domain expertise. |

Do not select a deep-learning architecture because it appears advanced. The selected model is the simplest model that beats appropriate baselines on time-separated and event-separated evaluation.

5.4 Forecast horizons

The product requires multi-horizon capability. Initial candidate horizons may be 1, 3, 6, 12 and 24 hours where input cadence and source forecast availability support them. These are design candidates, not guaranteed operational coverage. Final horizons must be selected per station after examining observation frequency, weather forecast lead times, latency and validation performance.

5.5 Output contract

{  "hazardCode": "flood",  "targetType": "gauge_water_level",  "stationId": "UUID",  "issuedAt": "ISO-8601",  "validTime": "ISO-8601",  "leadMinutes": 180,  "predictedValue": 0.0,  "unit": "m",  "predictionInterval": { "lower": 0.0, "upper": 0.0 },  "modelCode": "flood_level_baseline",  "modelVersion": "0.1.0",  "inputFreshness": "current|stale|partial",  "qualityFlags": [],  "limitations": []}

Zero values above are placeholders. Prediction intervals must only be returned when the model has a calibrated uncertainty method. Never manufacture confidence percentages.

5.6 Acceptance criteria

Training and evaluation data have station, datum, units and source provenance verified.

Chronological splits prevent future information leaking into training features.

Persistence and at least one suitable statistical baseline are evaluated.

Metrics are reported separately by station, lead time, season and event where sample size permits.

Model is not promoted unless it improves agreed operationally meaningful metrics over baseline and does not introduce unacceptable event underprediction.

Forecast API returns model version, issue time, valid time, lead time, units, data freshness and quality flags.

Missing/stale critical inputs produce a degraded/unavailable result, not a fabricated forecast.

Domain reviewer signs off thresholds and interpretation before pilot users see operational risk categories.

6. P0 model specification: flood risk and dam-related downstream risk

6.1 Separate prediction from risk interpretation

The system must keep three concepts separate: (1) forecast values such as water level or rainfall; (2) hazard interpretation such as threshold exceedance or rate-of-rise; and (3) impact risk based on exposure and vulnerability. Combining them into a single opaque score would make review and explanation difficult.

6.2 Initial risk engine

Use verified station-specific danger/alert thresholds only when supplied or approved by the responsible authority.

Calculate distance to threshold, rate of rise, forecast threshold exceedance and duration above threshold where inputs support it.

Include data freshness and confidence/quality state as explicit modifiers or flags, not hidden model features.

Overlay hazard extent or relevant river/catchment zones with exposed settlements, roads and critical facilities using validated GIS layers.

Use named risk bands only after thresholds and definitions are approved by domain authorities; display the basis for each band.

Allow 'insufficient data' and 'unknown' outcomes. Do not force every location into low/medium/high.

6.3 Dam-related downstream risk

Dam-related risk analysis is data-gated. Candidate inputs include official reservoir level, inflow, outflow/release, downstream river gauges, forecast rainfall, catchment routing and official operating notices. If any key input is unavailable, the platform must explicitly state that dam operational data is unavailable and avoid estimating gate state or release values.

| Component | Required behavior |
| --- | --- |
| Input provenance | Only authorized official/verified feeds or signed operator inputs. |
| Scenario assessment | Scenario calculations must identify assumptions and be labelled as scenarios, not actual releases. |
| Downstream propagation | Requires validated river network, routing time and hydraulic/hydrologic method. |
| Risk output | Potential downstream concern areas with input sources, assumptions, time window and uncertainty. |
| Human review | Domain/authority review required before operational use or public warning. |
| Safety boundary | No direct gate, dam, pump or infrastructure control endpoint. |

6.4 Acceptance criteria

Thresholds have documented owner, units, datum, effective date and approval.

Dam operational inputs are traceable to source and freshness.

Every risk output includes factors contributing to the assessment.

Unknown, stale or conflicting inputs are surfaced as explicit quality flags.

Scenario output is visually and semantically distinguished from measured or forecast data.

Public alerts cannot be automatically published from the risk engine.

7. Rainfall forecast integration and quality

For the first pilot, integrating an authorized weather forecast may be more feasible than training a custom rainfall forecasting model. The platform should preserve forecast issue time, valid time, spatial resolution, provider/model identifier and precipitation units.

Evaluate forecast rainfall against local observations where sufficient overlapping records exist.

Track bias, MAE/RMSE and categorical event skill for rainfall thresholds relevant to flood modelling.

Check spatial representativeness and grid-to-catchment aggregation.

Do not treat forecast precipitation as observed rainfall.

Only develop local bias correction or custom rainfall ML after sufficient independent data exists.

8. P1 model: flood inundation and exposure assessment

The initial practical deliverable is GIS-based exposure overlay using approved flood extents or scenario polygons. A true inundation forecast requires terrain, river cross-sections, hydrological boundary conditions, roughness, hydraulic calibration and validation against observed flood extents.

| Level | Capability | Data / evidence |
| --- | --- | --- |
| P1-A | Overlay official or historical flood extent with settlements, roads and facilities. | Authoritative flood polygon, geocoded exposure layers, dates and scale. |
| P1-B | Scenario mapping from validated depth/extent surfaces. | DEM quality, hydrology/hydraulic assumptions, boundary conditions and calibration. |
| P1-C | Operational dynamic inundation forecast. | Validated model chain, timely inputs, uncertainty and independent event validation. |

Never present a static historical flood footprint as a real-time predicted inundation map.

Show source date, spatial resolution and scenario/observed status.

Report exposed assets as estimates with data vintage and coverage limitations.

Keep population exposure aggregated and privacy-safe.

9. P1 model: drought monitoring and classification

Drought monitoring should begin with transparent indices and data completeness checks. Drought is multi-dimensional; meteorological, agricultural and hydrological drought are not interchangeable.

| Indicator | Use | Caveat |
| --- | --- | --- |
| Standardized Precipitation Index (SPI) | Rainfall anomaly over selected accumulation windows. | Requires consistent rainfall series and distribution fitting. |
| Rainfall anomaly / percentile | Compare recent rainfall with long-term climatology. | Baseline period and missing data handling must be documented. |
| Soil moisture anomaly | Agricultural drought context. | Requires trusted soil-moisture observations or validated gridded product. |
| Reservoir/groundwater indicators | Hydrological stress context. | Requires authorized, representative, quality-controlled data. |
| Vegetation index anomaly | Agricultural condition proxy. | Cloud cover, crop calendar and land-use interpretation matter. |

Provide separate meteorological, agricultural and hydrological indicators rather than one unexplained drought label.

Use seasonally appropriate accumulation windows; define them with domain experts.

Compare indicators with local historical drought events and official assessments.

Do not infer household-level water availability from coarse regional indices.

Clearly label drought status as monitoring/assessment, not a guarantee of future water supply.

10. P1 model: multi-hazard risk assessment

The multi-hazard layer should combine independently computed hazard indicators with exposure and vulnerability. Begin with an explainable, configurable scoring framework; use learned fusion only when reliable historical impact labels and validation data exist.

Risk assessment record (conceptual):- hazard: flood | drought | heat | storm | ...- geography: area / grid / asset- likelihood_or_intensity: value + unit + source- exposure: affected people/assets estimate + dataset vintage- vulnerability: approved indicator set + rationale- score_or_band: versioned rule set- contributing_factors: list- uncertainty_and_data_quality: flags- reviewed_by / reviewed_at: optional human review

Do not add unlike physical quantities without normalization and documented rationale.

Keep each hazard score independently inspectable.

Version weights, thresholds and input datasets.

Provide missing-data handling and sensitivity analysis.

Do not use sensitive personal attributes as vulnerability predictors without lawful basis, necessity and explicit governance.

11. P2 model: incident classification and triage assistance

Candidate task: classify text reports into hazard category, urgency suggestion and routing queue.

Start with rules and controlled labels; progress to a supervised classifier only after a representative, consented and reviewed labelled dataset exists.

Return suggested category, model version, confidence/calibration status and explanation tokens/features where safe.

Low-confidence, ambiguous, multilingual or high-impact reports must route to human review.

Never automatically reject an SOS, deny assistance, assign blame or make eligibility decisions based on a classifier.

Support local language workflows only after language coverage and evaluation are demonstrated.

| Evaluation | Requirement |
| --- | --- |
| Class metrics | Per-class precision, recall, F1 and confusion matrix; macro averages for imbalance. |
| Critical class recall | Track missed urgent reports separately; agree minimum threshold with operational stakeholders. |
| Calibration | Assess whether confidence scores correspond to observed correctness. |
| Bias/error review | Evaluate language, geography, spelling, device/network and demographic proxies where lawful and ethically appropriate. |
| Human override | Record correction and reason; use approved feedback for future retraining. |

12. Dataset construction and leakage prevention

Create a source register and data dictionary before feature engineering.

Define target variable, station/area, timestamp semantics, units and observation quality.

Deduplicate records and resolve station ID changes and datum shifts.

Handle missingness explicitly; never replace missing readings with zero unless zero is a valid measured value.

Align weather forecasts by issue time: a training example may only use forecast products that would have been available at prediction time.

Use chronological train/validation/test splits; keep entire flood events or seasons separated where feasible.

Fit scalers, imputers, encoders and feature selection only on training data.

Maintain a dataset version, code version, source snapshot references and split manifest for every experiment.

Review extreme-event coverage; average performance can hide dangerous underprediction during rare severe events.

12.1 Recommended split strategy

| Split | Purpose | Rule |
| --- | --- | --- |
| Train | Fit model parameters. | Earlier chronological period; no future leakage. |
| Validation | Tune hyperparameters and select model. | Later period than train; preserve event separation where possible. |
| Test | Final unbiased estimate. | Held-out latest period or event groups; used once for release decision. |
| Backtest | Simulate historical operational issue times. | Reconstruct only inputs available at each simulated issue time. |

13. Model evaluation framework

| Task | Primary metrics | Additional analysis |
| --- | --- | --- |
| Water-level regression | MAE, RMSE, bias. | Lead-time-wise error, station-wise error, peak-level error, rate-of-rise error. |
| Flood threshold/event prediction | Precision, recall, F1, PR-AUC; event detection lead time. | False alarm ratio, missed-event rate, contingency table, event duration. |
| Probabilistic forecasts | Pinball loss / quantile loss; interval coverage and width. | Calibration by lead time and event severity. |
| Rainfall forecast | MAE/RMSE and threshold categorical skill. | Bias, spatial aggregation and extreme rainfall performance. |
| Drought classification | Macro F1, per-class recall, confusion matrix. | Seasonal and geographic stability. |
| Incident triage | Per-class precision/recall, macro F1, calibration. | Critical-report miss rate, human override rate and language slices. |

No universal pass score is specified here because operational thresholds depend on data volume, local authority requirements and consequence of error. The product owner and domain reviewers must approve release gates before pilot use.

13.1 Model comparison and release gate

Compare against persistence, climatology, threshold/rule-based and other relevant simple baselines.

Report confidence intervals or variability across event folds where sample size permits.

Review false negatives and false positives with domain experts; do not optimize a single aggregate metric.

Document performance by lead time, season, station and severity class.

Release only if the model is reproducible, operationally useful, data-quality-aware and approved for its intended use.

Use an 'experimental' label when evidence is limited; do not display experimental results as official forecasts.

14. Prediction confidence, uncertainty and explainability

Distinguish model confidence, prediction interval, input data quality and forecast skill; they are not interchangeable.

Only expose calibrated probability or prediction intervals when calibration has been evaluated on held-out data.

Show forecast issue time, target valid time, horizon, source freshness and model version.

Expose material drivers such as recent rainfall, upstream levels, release input availability and threshold proximity where supported.

Use explicit states: available, partial_inputs, stale_inputs, insufficient_data, model_unavailable and experimental.

Do not display a fabricated confidence percentage or imply certainty from a model score.

Provide human reviewers with model limitations and the evidence behind a risk band.

15. Model serving and API contract

15.1 Service responsibilities

| Component | Responsibility |
| --- | --- |
| NestJS AI orchestration module | Authorize request, validate scope, create job, enqueue work, track status, persist normalized outputs and expose API. |
| Python FastAPI inference service | Load approved model artefact, validate internal request, run preprocessing/inference and return schema-compliant result. |
| Queue/worker | Execute asynchronous jobs, bounded retries, dead-letter failures and idempotent processing. |
| Model registry / artefact store | Store immutable model package, metadata, checksums, dependencies and approval state. |
| PostgreSQL/PostGIS | Persist job metadata, forecasts, model version, input references, quality flags and review decisions. |

15.2 Internal request example

{  "jobId": "UUID",  "modelCode": "flood_level_baseline",  "modelVersion": "0.1.0",  "target": { "stationId": "UUID" },  "issueTime": "2026-11-08T10:00:00Z",  "horizonsMinutes": [60, 180, 360],  "featureSnapshotRef": "opaque-reference",  "correlationId": "UUID"}

15.3 Internal response example

{  "jobId": "UUID",  "status": "completed",  "modelCode": "flood_level_baseline",  "modelVersion": "0.1.0",  "issuedAt": "2026-11-08T10:00:00Z",  "results": [],  "inputQuality": {    "status": "partial",    "flags": ["rainfall_feed_delayed"]  },  "limitations": ["Illustrative schema; no live prediction."]}

Use shared JSON schemas or generated types to prevent drift between NestJS and FastAPI. Internal endpoints must use service authentication and private networking. The AI service must not accept arbitrary public URLs or database connection strings from callers.

16. Model registry, versioning and reproducibility

| Metadata | Required content |
| --- | --- |
| Identity | Model code, semantic version, hazard, task, owner and status. |
| Training provenance | Dataset version, source snapshot references, date range and split manifest. |
| Code/runtime | Git commit, Python version, dependency lockfile, container image digest. |
| Evaluation | Metrics, test events, lead-time breakdown, baseline comparison and reviewer approval. |
| Artefact | Immutable model file/package URI, checksum and schema compatibility. |
| Operational | Created time, approval time, deployed environment, rollout percentage and rollback target. |
| Limitations | Supported stations/geographies, horizons, known failure modes and prohibited uses. |

Never overwrite an artefact that is already referenced by a production prediction.

Promote through development -> experiment -> candidate -> approved -> deployed -> retired.

Rollback must restore a previously approved artefact and compatible preprocessing pipeline.

Record the exact model version used for every prediction and every displayed risk result.

17. Monitoring, drift and retraining

| Monitoring area | Signals | Response |
| --- | --- | --- |
| Data quality | Missingness, delayed feeds, outliers, unit/schema changes, station downtime. | Flag or suppress forecasts; alert data owner. |
| Model performance | Error when ground truth arrives, bias, event recall, interval coverage. | Investigate degradation; compare against baseline. |
| Drift | Feature distribution changes, seasonal shift, station relocation or sensor changes. | Review data pipeline and retrain only after validation. |
| Service health | Latency, error rate, queue depth, memory/CPU, model load failures. | Scale, restart, rollback or mark service unavailable. |
| Operational use | Human overrides, alert review outcomes, ignored/incorrect outputs. | Review workflow fit and model limitations. |

Retraining should be triggered by evidence and a documented schedule, not automatically deployed whenever drift is detected. Every retrained model repeats the full validation and approval gate.

17.1 Safe fallback behavior

If AI service is unavailable, continue showing last known observation with its timestamp and stale indicator; do not relabel it as a forecast.

If forecast inputs are stale or incomplete, return a degraded/unavailable state with explicit reasons.

If model output fails schema or plausibility checks, quarantine it and do not publish it.

If the model is outside its supported geography/horizon, return unsupported rather than extrapolating silently.

Keep deterministic, authority-approved threshold logic available as a separate fallback where its required inputs are valid.

18. Privacy, security and responsible AI

Use only data necessary for the modelling purpose and with a lawful, documented basis.

Minimize or de-identify citizen reports before model training; exclude personal contact details and precise identity attributes unless strictly justified and approved.

Restrict access to sensitive location, incident and vulnerability data by role and geography.

Protect model artefacts, training data and internal inference endpoints; scan dependencies and container images.

Document intended use, prohibited use, known limitations, affected groups and human oversight for each model.

Review potential geographic or language performance disparities before operational deployment.

Maintain audit trails for model version changes, manual overrides and decisions influenced by predictions.

19. Pilot implementation roadmap

| Phase | Build scope | Exit evidence |
| --- | --- | --- |
| Phase 0 — Data discovery | Source inventory, permissions, station/asset mapping, quality profiling, historical event catalogue. | Approved source register and feasibility report. |
| Phase 1 — Reliable baseline | Observation ingestion, freshness checks, persistence/threshold baselines, forecast job API and dashboard integration. | End-to-end pipeline works with labelled demo/test data; no unsupported live claims. |
| Phase 2 — Flood model candidate | Feature pipeline, time-aware training, candidate ML model, backtesting and error analysis. | Candidate beats agreed baselines and passes domain review. |
| Phase 3 — Risk interpretation | Approved thresholds, downstream context, GIS exposure overlay and review workflow. | Traceable risk assessment with uncertainty and human review. |
| Phase 4 — Controlled pilot | Limited users/geography, monitoring, feedback, rollback and incident procedure. | Pilot sign-off and documented limitations. |
| Phase 5 — Expand hazards | Drought indicators, multi-hazard assessment, incident triage and advanced inundation as data permits. | Hazard-specific validation and approval per capability. |

19.1 Suggested first 8-day build focus

| Day | Deliverable |
| --- | --- |
| 1 | Data-source inventory, schema and feasibility; confirm what data is actually accessible. |
| 2 | Ingestion/CSV or authorized API adapter, unit normalization, data-quality report. |
| 3 | Baseline forecast notebook/script with persistence and threshold comparisons. |
| 4 | Train one candidate tabular model only if sufficient clean data exists; otherwise improve baseline and clearly label. |
| 5 | Wrap inference in FastAPI with request/response validation and model metadata. |
| 6 | Connect NestJS job orchestration and persist forecast result with provenance. |
| 7 | Build dashboard visualization with observed vs forecast distinction, timestamps, freshness and caveats. |
| 8 | Backtest/demo scenarios, failure tests, reviewer walkthrough and documentation of known limitations. |

This short plan is a competition/pilot prototype plan, not a claim that a fully validated operational disaster forecasting system can be built in eight days. If usable historical and live data are not available, prioritize a credible end-to-end demonstrator using clearly labelled sample/replay data.

20. AI/ML functional requirements and acceptance criteria

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| AIML-FR-001 | Register and version model metadata. | P0 | Every run references immutable model code/version and artefact. |
| AIML-FR-002 | Validate data provenance and freshness. | P0 | Missing/stale/untrusted inputs are flagged; source and timestamps are retained. |
| AIML-FR-003 | Generate multi-horizon flood level forecasts where supported. | P0 | Returns valid time, lead time, unit, model version and quality flags for supported stations. |
| AIML-FR-004 | Maintain baseline comparisons. | P0 | Persistence and relevant simple baseline metrics are recorded. |
| AIML-FR-005 | Produce explainable flood-risk assessment. | P0 | Risk factors, threshold provenance, data quality and review status are visible. |
| AIML-FR-006 | Assess dam-related risk only from verified inputs. | P0 | No inferred gate/release values; missing inputs block or qualify assessment. |
| AIML-FR-007 | Serve inference asynchronously. | P0 | API returns job ID; status/result can be retrieved; retries are bounded. |
| AIML-FR-008 | Prevent AI from publishing official alerts. | P0 | Publication requires authorized human workflow and audit trail. |
| AIML-FR-009 | Provide GIS exposure overlay. | P1 | Map distinguishes observed, historical and scenario extents with source date. |
| AIML-FR-010 | Provide drought indicators. | P1 | Indicator window, baseline, source and limitations are displayed. |
| AIML-FR-011 | Provide multi-hazard risk assessment. | P1 | Hazard components and scoring rules are versioned and inspectable. |
| AIML-FR-012 | Assist incident classification. | P2 | Low-confidence and high-impact cases route to human review; no automatic rejection. |

21. Risks, assumptions and open decisions

| Item | Risk / open question | Action required |
| --- | --- | --- |
| Historical flood labels | Insufficient events or inconsistent station records can make supervised learning unreliable. | Inventory event history, station continuity and impact labels. |
| Live feeds | Real-time data permissions and reliability may be unavailable. | Confirm provider access, cadence, licence and fallback. |
| Dam operational data | Release/inflow data may be restricted or delayed. | Obtain official access and define safe missing-data behavior. |
| Thresholds and datum | Incorrect thresholds or inconsistent gauge datum can create dangerous risk categories. | Get station-specific values and sign-off from competent authority. |
| Forecast weather | Different providers/resolutions may produce inconsistent inputs. | Select source and evaluate local performance. |
| Geospatial data | DEM, river network and exposure layers may be outdated or coarse. | Record resolution, vintage and validation. |
| Ground truth | Observed inundation and damage labels may be incomplete. | Create verified event catalogue and confidence labels. |
| Operational authority | Who reviews and approves public warnings? | Confirm jurisdiction, approver roles and escalation process. |
| Model performance targets | No local evidence yet to set defensible numeric thresholds. | Agree release gates after baseline backtesting. |

Appendix A — Model card template

| Field | Required entry |
| --- | --- |
| Model name / code |  |
| Intended use / prohibited use |  |
| Hazard / geography / supported horizons |  |
| Training data sources and date range |  |
| Label definition and quality |  |
| Feature list and preprocessing version |  |
| Model algorithm and baseline comparisons |  |
| Evaluation split and event coverage |  |
| Metrics by station, horizon and event severity |  |
| Uncertainty/calibration method |  |
| Known limitations and failure modes |  |
| Human review and escalation |  |
| Owner, version, approval and deployment date |  |

Appendix B — Glossary

| Term | Meaning |
| --- | --- |
| Issue time | Time at which a forecast was generated or published. |
| Valid time | Future or target time to which a forecast value applies. |
| Lead time / horizon | Time between issue time and valid time. |
| Data leakage | Use of information during training that would not have been available at prediction time. |
| Calibration | Agreement between predicted probabilities/intervals and observed frequencies/coverage. |
| Drift | Change in input data patterns or relationship between inputs and target over time. |
| Backtesting | Replay of historical issue times using only information available at each time. |
| Exposure | People, assets or services located where a hazard may occur. |
| Vulnerability | Factors affecting susceptibility to harm; must be defined and governed carefully. |

Final engineering principle

AAPADAMITRA must prefer trustworthy, traceable and appropriately cautious outputs over impressive-looking but unsupported AI predictions. Every operational model must prove data readiness, beat relevant baselines, communicate uncertainty, preserve provenance and remain subject to human authority. The platform's credibility depends as much on knowing when not to predict as on generating a prediction.