# C6macEye — UAV/Drone Fleet & Airspace Management SaaS

## Platform Vision

C6macEye is a FAA-approved airspace management platform connecting local drone rules
to national air traffic management. One mobile, desktop, and developer platform for
individual pilots, public safety, and the enterprise.

---

## Supported Personae

| Persona | Role | Key Capabilities |
|---------|------|-------------------|
| **Individual Pilot** | Recreational/Part 107 operator | B4UFLY checks, LAANC auth, flight logging, Remote ID compliance |
| **Enterprise UAS Manager** | Fleet program administrator | Fleet tracking, user management, reporting, SOC2/ISO27001 compliance |
| **Airspace/Local Agency** | Government/airspace authority | Rule authoring, geofence management, incident reporting, analytics |
| **Developer** | Third-party integrator | REST/GraphQL APIs, webhooks, SDK, sandbox environment |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Web App  │  │ Mobile   │  │ Desktop  │  │ Developer Portal │ │
│  │ (React)  │  │ (RN)     │  │ (Electron│  │ (API Docs/SDK)   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
└───────┼──────────────┼──────────────┼────────────────┼───────────┘
        │              │              │                │
┌───────▼──────────────▼──────────────▼────────────────▼───────────┐
│                    API GATEWAY / EDGE                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Rate Limiting │ JWT Validation │ mTLS │ Request Routing    │ │
│  │  WAF │ DDoS Protection │ API Versioning │ CORS             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    IDENTITY & ACCESS MANAGEMENT                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  AuthN   │  │  AuthZ   │  │  RBAC/   │  │  Federation      │ │
│  │  (OIDC/  │  │  (Policy │  │  ABAC    │  │  (SAML/OIDC      │ │
│  │  OAuth2) │  │  Engine) │  │  Engine  │  │  Enterprise SSO) │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  MFA     │  │  API Key │  │  Session  │  │  Audit Log       │ │
│  │  (TOTP/  │  │  Mgmt    │  │  Mgmt    │  │  (Immutable)     │ │
│  │  WebAuthn│  │          │  │          │  │                  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    CORE SERVICES (Microservices)                  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │  AIRSPACE       │  │  FLEET          │  │  MISSION           │ │
│  │  SERVICE        │  │  SERVICE        │  │  PLANNING          │ │
│  │                │  │                │  │  SERVICE           │ │
│  │  • UASFM Data  │  │  • Drone CRUD  │  │  • Route Planning  │ │
│  │  • TFR/NOTAM   │  │  • Telemetry   │  │  • Pre-flight      │ │
│  │  • Airspace     │  │  • Maintenance │  │    Checks          │ │
│  │    Classification│ │  • Remote ID   │  │  • Weather         │ │
│  │  • Geofencing   │  │  • Registration│  │    Integration     │ │
│  │  • B4UFLY       │  │  • Health Mgmt │  │  • Risk Assessment │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │  LAANC          │  │  COMPLIANCE    │  │  ANALYTICS         │ │
│  │  SERVICE        │  │  SERVICE       │  │  SERVICE           │ │
│  │                │  │                │  │                    │ │
│  │  • Auth Request│  │  • Part 107    │  │  • Flight Stats    │ │
│  │  • Near-Real-  │  │  • Remote ID   │  │  • Fleet Metrics   │ │
│  │    Time Auth   │  │  • SOC2 Controls│ │  • Anomaly Detect  │ │
│  │  • Further     │  │  • ISO27001    │  │  • AI Insights     │ │
│  │    Coordination│  │  • Audit Trail │  │  • Usage Reports   │ │
│  │  • DroneZone   │  │  • Export      │  │  • Dashboards      │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │  NOTIFICATION   │  │  AGENCY        │  │  DEVELOPER         │ │
│  │  SERVICE        │  │  SERVICE       │  │  PLATFORM          │ │
│  │                │  │                │  │  SERVICE           │ │
│  │  • Push/SMS    │  │  • Rule Author │  │  • API Gateway     │ │
│  │  • Email       │  │  • Geofence    │  │  • SDK Generation  │ │
│  │  • Webhooks    │  │    Management  │  │  • Sandbox Env     │ │
│  │  • Real-time   │  │  • Incident    │  │  • Webhook Mgmt    │ │
│  │    Alerts      │  │    Reporting   │  │  • Rate Limiting   │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    DATA LAYER                                    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │PostgreSQL│  │  Redis   │  │ PostGIS  │  │  TimescaleDB     │ │
│  │(Primary) │  │ (Cache/  │  │(Geospatial│ │  (Telemetry/     │ │
│  │          │  │  Pubsub) │  │  Queries)│  │   Time-series)   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────────┐│
│  │ S3/Blob  │  │  Event   │  │  Supabase (Auth + Realtime +    ││
│  │ Storage  │  │  Stream  │  │  PostgREST + Edge Functions)    ││
│  │          │  │ (Kafka)  │  │                                  ││
│  └──────────┘  └──────────┘  └──────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                          │
│                                                                  │
│  FAA LAANC API │ FAA UDDS │ ADS-B │ Weather APIs │ Remote ID    │
│  FAA DroneZone │ NOTAM API │ ArcGIS │ Satellite │ Cellular      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Trust Boundaries

```
BOUNDARY 1: Public Internet ←→ API Gateway
  - All traffic encrypted (TLS 1.3)
  - WAF + DDoS protection at edge
  - Rate limiting per API key / JWT subject

BOUNDARY 2: API Gateway ←→ Service Mesh
  - JWT validated & claims extracted
  - mTLS between all services
  - Request context propagated (tenant, user, permissions)

BOUNDARY 3: Service Mesh ←→ Data Layer
  - Service-specific database credentials (least privilege)
  - Encryption at rest (AES-256)
  - Row-Level Security (RLS) enforced at database level
  - Audit logging on all write operations

BOUNDARY 4: Platform ←→ FAA Systems
  - Dedicated service account per external API
  - Certificate-pinned connections
  - Request/response logging with PII redaction
  - Circuit breaker pattern for resilience

BOUNDARY 5: Platform ←→ Developer APIs
  - API key + OAuth2 scoped tokens
  - Per-key rate limiting and quota management
  - Sandbox isolation from production data
```

---

## Zero Trust Principles Applied

1. **Never trust, always verify** — Every API call authenticated and authorized
2. **Least privilege access** — RBAC/ABAC with granular permissions per resource
3. **Assume breach** — Immutable audit logs, encrypted data at rest/transit
4. **Microsegmentation** — Service-to-service mTLS, network policies
5. **Continuous verification** — Session revalidation, anomaly detection
6. **Blast radius reduction** — Tenant isolation, circuit breakers, bulkheads

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Web Frontend | React 19 + TypeScript + Vite | Modern, type-safe, fast builds |
| Mobile | React Native + Expo | Code sharing with web, native maps |
| Desktop | Electron (web wrapper) | Single codebase, offline capable |
| API Layer | Node.js + Hono | Edge-native, TypeScript, fast |
| Auth/Realtime | Supabase | Managed PostgreSQL + Auth + Realtime |
| Geospatial | PostGIS + Turf.js | Industry-standard spatial queries |
| Time-series | TimescaleDB (PG extension) | Telemetry, flight data |
| Cache/PubSub | Redis/Upstash | Real-time updates, session cache |
| Event Stream | Kafka/Redpanda | Reliable event processing |
| Object Storage | S3-compatible | Flight logs, documents, maps |
| Search | Meilisearch | Fast, typo-tolerant search |
| AI/ML | Claude API + custom models | Anomaly detection, analytics |
| Maps | Mapbox GL JS | Vector tiles, 3D terrain, airspace layers |
| IaC | Pulumi (TypeScript) | Type-safe infrastructure |
| CI/CD | GitHub Actions | Automated testing + deployment |
| Monitoring | Grafana + Prometheus + Sentry | Observability stack |

---

## FAA Compliance Matrix

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| B4UFLY Integration | Real-time airspace check via UASFM + TFR data | Core |
| LAANC Near-Real-Time Auth | Direct FAA LAANC API integration (USS protocol) | Core |
| LAANC Further Coordination | 72-hour advance submission workflow | Core |
| Remote ID (14 CFR Part 89) | Broadcast module tracking + network RID | Core |
| Part 107 Compliance | Certification tracking, waiver management | Core |
| UAS Facility Maps | 56-day cycle auto-refresh from FAA UDDS | Core |
| TFR/NOTAM Integration | Real-time ingestion + pilot notification | Core |
| TRUST Certification | Recreational flyer knowledge test tracking | Core |
| Registration (FAA DroneZone) | Registration status verification | Core |
| SOC 2 Type II | Access controls, audit logging, encryption | Enterprise |
| ISO 27001:2022 | ISMS framework, risk management | Enterprise |

---

## Security Controls (SOC 2 / ISO 27001)

### SOC 2 Trust Service Criteria
- **Security**: MFA, RBAC, encryption, vulnerability scanning
- **Availability**: Multi-region deployment, 99.9% SLA, disaster recovery
- **Processing Integrity**: Input validation, data checksums, reconciliation
- **Confidentiality**: Data classification, access controls, DLP
- **Privacy**: GDPR/CCPA compliance, data retention policies

### ISO 27001 Controls
- **A.5**: Information security policies (enforced via OPA)
- **A.6**: Organization of information security (separation of duties)
- **A.8**: Asset management (drone/sensor inventory)
- **A.9**: Access control (RBAC/ABAC with quarterly reviews)
- **A.10**: Cryptography (TLS 1.3, AES-256, key rotation)
- **A.12**: Operations security (automated patching, logging)
- **A.14**: System acquisition/development (SAST/DAST, code review)
- **A.16**: Incident management (automated detection, response playbooks)
- **A.18**: Compliance (regulatory mapping, audit trail)
