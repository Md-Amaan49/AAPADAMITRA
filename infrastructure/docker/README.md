# Infrastructure — Docker Configuration

This directory contains containerization assets and Compose templates for AAPADAMITRA services.

## Scope & Purpose
- Development container definitions (PostgreSQL + PostGIS, Redis).
- Production multi-stage Dockerfiles for `apps/web`, `apps/api`, and `services/ai-engine`.
- Local orchestration configs for multi-hazard simulation runs.

> **Note:** As per Milestone 01 specifications, Docker is optional for initial local setup. Container definitions and compose files will be introduced alongside database and message broker integration in subsequent engineering milestones.

