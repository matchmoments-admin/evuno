# evuno — Claude Code Context

## What this is

evuno is a four-product EV charging platform targeting Australia and Chile first.

| Product | What it does | Revenue model |
|---------|-------------|---------------|
| **evuno Charge** | White-label OCPP charging station management SaaS | $49-199/mo + 1.5% per-session |
| **evuno Navigate** | EV trip planner with real-time charger availability | Freemium $4.99/mo |
| **evuno Scout** | Free property ROI assessment — "should I install chargers?" | Lead gen → Charge conversions |
| **evuno Shop** | EV accessories (Shopify hosted — not in this repo) | Product margins |

## Architecture decisions (locked)

| Decision | Choice | Why |
|----------|--------|-----|
| Payments | **Stripe only** (MVP) | Works in AU + CL. Add dLocal later if needed for Khipu/WebPay. |
| OCPP | **CitrineOS** (separate Docker service) | Apache-2.0. Standalone CSMS — NOT a library. `packages/ocpp/` is a REST client. |
| Multi-tenancy | Shared DB + **RLS** | PostgreSQL Row-Level Security. Every tenant-scoped table has `tenant_id`. |
| Server | **Hetzner CX43** (8 vCPU, 16GB) | ~€17/mo. CX42 discontinued Feb 2026. CAX31 (ARM) is alternative. |
| Database | **PostgreSQL 16 + TimescaleDB** | Self-hosted. Three databases: `evuno`, `evuno_auth`, `evuno_citrine`. |
| ORM | **Drizzle** (not Prisma) | Raw SQL control for TimescaleDB hypertables. |
| Auth | **Keycloak 24** (own database) | Self-hosted OIDC. Groups-based multi-tenancy. No per-MAU cost. |
| Mobile | **Expo SDK 55** | Current version. OTA updates via EAS. |
| i18n | **next-intl** (es + en) | Non-negotiable for Chile + AU. Default locale: `es` for CL, `en` for AU. |
| CSS | **Tailwind CSS 3** + **shadcn/ui** | JIT mode. Radix primitives. |
| Cache | **Valkey** | Redis-compatible. |
| Broker | **RabbitMQ** | CitrineOS native. MQTT plugin enabled. |
| File storage | **MinIO** (local) / **Cloudflare R2** (prod) | CitrineOS requires S3-compatible storage. |
| Reverse proxy | **Caddy** | Auto HTTPS, WebSocket support. |
| CI/CD | **GitHub Actions** | 2,000 min/mo free. |
| Monitoring | **Grafana + Prometheus** | Self-hosted. |

## Tech stack versions

- Node.js >= 20
- pnpm 9.x (never npm or yarn)
- Turborepo (monorepo orchestration)
- Next.js 14 (App Router, React Server Components)
- NestJS 10 (API server)
- TypeScript 5.4+
- React 18.3
- Zod (validation, shared with API)
- React Hook Form (forms)
- Mapbox GL JS (maps)
- Resend (email)

## Repository structure

```
evuno/
├── apps/
│   ├── charge/        Next.js 14 — operator dashboard (port 3000)
│   ├── navigate/      Next.js 14 — trip planner (port 3001)
│   ├── scout/         Next.js 14 — ROI tool (port 3002)
│   └── mobile/        Expo SDK 55 — driver app
├── packages/
│   ├── api/           NestJS API (port 4000)
│   ├── db/            Drizzle ORM schemas + migrations
│   ├── ocpp/          CitrineOS REST client (NOT the CSMS itself)
│   ├── payments/      Stripe integration
│   ├── shared/        Types, constants, ROI formula
│   └── ui/            Shared shadcn/ui components
├── infrastructure/
│   ├── caddy/         Caddyfile
│   ├── keycloak/      Realm export JSON
│   ├── postgres/      init.sql (3 databases + RLS)
│   └── rabbitmq/      Plugin config
└── scripts/           setup.sh, seed.ts, migrate.ts
```

## Docker services (local dev)

| Service | Image | Port | Database |
|---------|-------|------|----------|
| postgres | timescale/timescaledb:latest-pg16 | 5432 | evuno, evuno_auth, evuno_citrine |
| valkey | valkey/valkey:latest | 6379 | — |
| rabbitmq | rabbitmq:3-management | 5672, 15672 | — |
| minio | minio/minio:latest | 9000, 9001 | — |
| keycloak | keycloak:24.0 | 8080 | evuno_auth |
| citrineos | citrineos/citrineos:latest | 8081, 8082, 9110 | evuno_citrine |

## Database rules

- Every operator-scoped table: `tenant_id uuid NOT NULL REFERENCES tenants(id)`
- Every table: `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`
- UUIDs as primary keys (never auto-increment)
- Sessions table: TimescaleDB hypertable partitioned by `started_at`
- Never store raw card numbers — payment tokens only
- RLS enforces tenant isolation at DB level

## Payment routing (MVP)

```
Country in STRIPE_COUNTRIES (AU, CL, US, GB, etc.) → Stripe
Country not in list → throw UnsupportedCountryError
```

No dLocal integration at MVP. Add later for local payment methods.

## i18n rules

- Use next-intl for all Next.js apps
- Message files in `apps/*/messages/{en,es}.json`
- Default locale: `es` (Chilean operators), `en` (Australian operators)
- All user-facing strings must be in message files — no hardcoded text

## Design system

### Colors (dark mode — operator dashboard)
```
--bg: #0A0A0F
--surface: #111118
--surface-hover: #1A1A24
--border: #1E1E2E
--text: #E8E8F0
--text-muted: #6E6E8A
--accent: #00E5A0 (evuno green)
--danger: #FF4444
--warning: #FFB800
```

### Typography
- DM Sans (headings + body) + DM Mono (technical data, OCPP IDs, amounts)
- Weights: 400, 500, 600
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48px

### Spacing
- Multiples of 4px only: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 6px (dashboard), 8px (consumer/driver)

## Markets

### Chile (primary)
- Currency: CLP (no decimals, period as thousands separator: $1.234.567)
- Timezone: America/Santiago
- Date: dd/mm/yyyy
- Charging: Type 2 (AC), CCS2 (DC)
- OCPP 1.6 and 2.0.1

### Australia (secondary)
- Currency: AUD
- Timezone: Australia/Sydney
- Date: dd/mm/yyyy
- Charging: Type 2 (AC), CCS2 (DC)

## External APIs

| API | Use | Domain |
|-----|-----|--------|
| Chargetrip | EV routing + SoC estimation | chargetrip.com |
| Open Charge Map | Charger locations (global) | api.openchargemap.io |
| NREL AFDC | US charger data | **developer.nlr.gov** (NOT nrel.gov — migrated April 2026) |
| Mapbox | Maps + navigation | mapbox.com |
| Google Places | Address autocomplete (Scout) | maps.googleapis.com |
| Open-Meteo | Weather (range impact) | open-meteo.com |
| Resend | Transactional email | resend.com |

## What NOT to build (deferred)

- V2G, carbon credits, OCPI roaming, smart load balancing — Phase 3+
- Fleet module, AI operator assistant — Phase 4
- dLocal Go payments — add when needed for local methods
- MercadoLibre/Amazon integration — Phase 2+
- Shopify storefront — hosted externally
- Directus — deprecated in CitrineOS 1.6, do not use

## Backups (production)

- Daily pg_dump → Hetzner Storage Box (~€4/mo)
- Weekly Hetzner Snapshots (~€2/mo)
- Cloudflare R2 for CitrineOS file assets (free 10GB)

## Commands

```bash
pnpm install          # Install all workspace deps
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages and apps
pnpm db:migrate       # Run Drizzle migrations
pnpm db:seed          # Seed development data
docker compose up -d  # Start infrastructure services
docker compose down   # Stop infrastructure services
./scripts/setup.sh    # One-command local setup
```
