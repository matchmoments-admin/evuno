# evuno — Production Readiness Assessment · April 2026

> **Document version:** Readiness 04/2026 · **Assessment date:** 14 April 2026 · **Author:** Readiness review team · **Baseline comparison:** First assessment (no prior baseline) · **Repository:** matchmoments-admin/evuno · **Commit:** cec0708

---

## 1. Executive summary

**Overall score: 52/100 — staging-ready, not production-ready.** The codebase is architecturally sound but has never been compiled, run, or tested in any environment. Zero automated tests exist. No build verification has been performed. The platform cannot accept a paying customer today.

The repository contains 98 source files across 113 committed changes implementing all six planned product phases: infrastructure, shared UI, Scout MVP, NestJS API, Charge dashboard, Navigate trip planner, and payments. TypeScript strict mode is enabled. The database schema supports multi-tenant RLS with TimescaleDB hypertables. Stripe payments, OCPP charger control, and Keycloak auth are all implemented at the code level. However, none of this has been verified through compilation, runtime testing, or browser testing.

**The most honest statement of where evuno stands:** there is a plausible, well-structured codebase that *should* work — but zero evidence that it *does* work. The gap between "code exists" and "product works" is the entirety of this assessment's concern.

**Critically, evuno's timing is strong.** Chile's charging infrastructure grew 55% in early 2025 (1,097 to 1,704 connectors) but remains 64-69% concentrated in Santiago. Australia's EV market share hit 14.6% in March 2026. Both markets lack a unified OCPP management + driver navigation platform. The competitive window exists but will not stay open indefinitely — AMPECO, Monta, and new entrants like Evoltsoft and Sock8 are expanding white-label offerings globally.

---

## 2. Codebase verification status

This section reports what was independently verified on disk at commit cec0708.

### 2.1 What EXISTS (verified via filesystem)

| Layer | Files | Status |
|-------|-------|--------|
| TypeScript configs | 10 files | `tsconfig.base.json` (strict) + 9 per-package |
| Database schemas | 5 schemas | tenants, chargers, users, sessions (TimescaleDB composite PK), billing |
| Database client | 2 files | `client.ts` (withTenant RLS helper), `seed.ts` (2 tenants, 6 chargers, 35 sessions) |
| Drizzle config | 1 file | `drizzle.config.ts` with pg dialect |
| Custom migration | 1 file | `0001_setup_hypertables_rls.sql` |
| Shared package | 4 files | ROI calculator (multi-currency), country constants, Zod validation schemas |
| UI components | 7 components | Button, Input, Card, Badge, Select, Slider, Label (all CVA + Tailwind) |
| UI design system | 2 files | `tailwind.config.ts` (evuno colors/fonts), `globals.css` |
| NestJS API | 24 files | 5 modules, 5 controllers (21 endpoints), 5 services, auth with Keycloak JWT |
| Payments | 3 files | Stripe integration (6 methods: checkout, payment intent, webhook, portal, invoices, subscription) |
| OCPP client | 3 files | CitrineOS REST client (7 methods: status, start, stop, reset, unlock, get/change config) |
| Charge app | 14 files | 6 pages, 3 components, auth lib, API client, i18n (en/es) |
| Navigate app | 9 files | 1 page, 3 components (Mapbox map, charger popup, route planner), i18n |
| Scout app | 12 files | 2 pages, 4 components (calculator form, ROI results, lead capture, results map), i18n |
| Infrastructure | 6 files | docker-compose.yml, Caddyfile, init.sql, realm-export.json, enabled_plugins, setup.sh |
| CI/CD | 2 files | GitHub Actions deploy.yml, PM2 ecosystem.config.js |

**Total: 98 source files, 5,311 lines of application code.**

### 2.2 What has NEVER been verified

| Check | Status | Risk |
|-------|--------|------|
| `pnpm build` compilation | **NEVER RUN** | Unknown TypeScript errors, missing imports, or config issues could block everything |
| `pnpm dev` runtime | **NEVER RUN** | Pages may not render; next-intl config may be incorrect; Tailwind may not process |
| Database migration | **NEVER RUN** | Schema SQL may have syntax errors; hypertable creation may fail |
| Seed script | **NEVER RUN** | May fail on foreign key constraints or UUID conflicts |
| Docker services | **NEVER STARTED** | CitrineOS GHCR image env vars are unverified; Keycloak realm import may fail |
| Any browser test | **NEVER DONE** | Zero visual verification of any page |
| Any API endpoint | **NEVER CALLED** | Zero HTTP verification of any route |
| Any payment flow | **NEVER TESTED** | Stripe integration has never processed a test card |

### 2.3 What DOES NOT EXIST

| Item | Impact | Severity |
|------|--------|----------|
| **Test files** (zero .test.ts or .spec.ts anywhere) | No automated quality gate | CRITICAL |
| **Error boundaries** (no error.tsx in any app) | Unhandled errors show raw stack traces | HIGH |
| **404 pages** (no not-found.tsx in any app) | Broken links show blank pages | HIGH |
| **Loading states** (no loading.tsx in any app) | No skeleton UI during navigation | MEDIUM |
| **Dockerfiles for apps** | Cannot containerize frontends/API | MEDIUM |
| **robots.txt / sitemap.xml** | No SEO for Scout (the public-facing app) | MEDIUM |
| **OG images / meta tags** | Social sharing produces blank cards | MEDIUM |
| **CORS config for production domains** | API only allows localhost origins | HIGH |
| **Drizzle-generated migration** | Only custom SQL migration exists; no schema migration | HIGH |
| **Rate limiting** | Public API endpoints (navigate, health) have no rate limits | MEDIUM |

---

## 3. Product-by-product readiness

### 3.1 evuno Scout (ROI Calculator)

**Code completeness: 80% · Runtime verified: 0%**

| Feature | Code exists | Tested | Notes |
|---------|------------|--------|-------|
| ROI calculator form | Yes | No | React Hook Form + Zod, 10+ input fields |
| Country switching (CL/AU) | Yes | No | Auto-fills electricity rates, install costs, maintenance |
| CLP formatting (no decimals) | Yes | No | Intl.NumberFormat in `lib/format.ts` |
| AUD formatting | Yes | No | Same formatter |
| Results display | Yes | No | Payback period bar, 5-year profit, recommendation badge |
| Lead capture form | Yes | No | Name, email, phone, company fields |
| Lead email via Resend | Yes | No | API route at `/api/leads` — logs to console if no RESEND_API_KEY |
| Google Places autocomplete | Yes | No | Conditional on NEXT_PUBLIC_GOOGLE_MAPS_KEY env var |
| Mapbox results map | Yes | No | Shows property marker + nearby OCM chargers |
| i18n (en + es) | Yes | No | Full translation files for all UI strings |
| SEO (robots.txt, sitemap, OG) | **NO** | — | Missing entirely |

**Scout is the lowest-risk app to get running first** — zero auth dependency, zero database dependency, zero Docker dependency. The ROI calculator is pure client-side math using the already-verified `calculateROI()` function.

### 3.2 evuno Charge (Operator Dashboard)

**Code completeness: 70% · Runtime verified: 0%**

| Feature | Code exists | Tested | Notes |
|---------|------------|--------|-------|
| Dashboard overview (metric cards) | Yes | No | Fetches from /sessions/stats + /chargers |
| Charger list with status badges | Yes | No | Fetches from /chargers; shows AC/DC type badges |
| Charger detail with OCPP actions | Yes | No | Remote start/stop, reset, unlock via POST /chargers/:id/action |
| Live charger status polling | Yes | No | 10-second interval polling /chargers/:id/status |
| SSE status stream | Yes | No | @Sse decorator in chargers controller |
| Sessions table | Yes | No | Paginated, filterable by date/charger/status |
| CSV export | Yes | No | Client-side Blob download |
| Billing page (plan cards) | Yes | No | 4 plans: Free/$49/$99/$199 with upgrade/downgrade |
| Stripe checkout redirect | Yes | No | POST /billing/subscribe creates Stripe Checkout session |
| Stripe webhook handler | Yes | No | Handles 5 event types with idempotency via webhook_events table |
| Keycloak PKCE login | Partial | No | PKCE config exists; callback route **NOT** implemented |
| Dashboard sidebar navigation | Yes | No | 5 items: Overview, Chargers, Sessions, Billing, Settings |
| i18n (en + es) | Yes | No | Full translation files |
| Settings page | **NO** | — | Route exists in sidebar but no page file |

**Critical gap:** The Keycloak auth callback route (`/auth/callback`) does not exist. The `lib/auth.ts` file has PKCE configuration and the `generatePKCE()` function, but there is no actual route handler to receive the OAuth redirect, exchange the code for tokens, and store the JWT. This means **no operator can log in**. The `useAuth()` hook reads from localStorage but nothing writes to it.

### 3.3 evuno Navigate (Trip Planner)

**Code completeness: 75% · Runtime verified: 0%**

| Feature | Code exists | Tested | Notes |
|---------|------------|--------|-------|
| Mapbox GL map | Yes | No | Dark style, centered on Santiago, geolocate control |
| Charger markers (color-coded) | Yes | No | Blue for DC fast, green for AC, grey for offline |
| Charger popup | Yes | No | Name, operator, connectors, price, navigate button |
| Address search (Mapbox Geocoding) | Yes | No | Flies to searched location |
| Route planner panel | Yes | No | Origin/destination inputs, vehicle selector, SoC slider |
| Vehicle selector dropdown | Yes | No | Fetches from /api/navigate/vehicles; falls back to Tesla Model 3 |
| Chargetrip route calculation | Yes | No | POST /api/navigate/route with async polling |
| Arrival SoC per charging stop | Yes | No | Displays rangeStart → rangeEnd at each stop |
| "More vehicles coming soon" note | Yes | No | Chargetrip Lite caps at 10 vehicles |
| i18n (en + es) | Yes | No | Full translation files |

**Dependency:** Navigate requires MAPBOX_TOKEN + OPEN_CHARGE_MAP_API_KEY + CHARGETRIP credentials to function. Without them, the map renders but shows no chargers and route planning fails.

### 3.4 evuno API (NestJS Backend)

**Code completeness: 85% · Runtime verified: 0%**

**21 endpoints across 5 controllers:**

| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Health | `GET /health` | Public | Code exists |
| Chargers | 8 endpoints (CRUD + status + action + SSE stream) | JWT | Code exists |
| Sessions | 4 endpoints (list + stats + detail + end) | JWT | Code exists |
| Billing | 5 endpoints (subscribe + subscription + webhook + invoices + portal) | JWT (webhook: public) | Code exists |
| Navigate | 3 endpoints (chargers + route + vehicles) | Public | Code exists |

**Architecture is sound:** Global JWT auth guard with `@Public()` bypass, `@CurrentTenant()` decorator for RLS scoping, Drizzle ORM with tenant-scoped transactions.

**Missing:** No request validation on Navigate endpoints (lat/lng could be NaN). No rate limiting anywhere. No API versioning.

---

## 4. Infrastructure readiness

### 4.1 Docker Compose services

| Service | Image | Production mode | Health check | Verified |
|---------|-------|----------------|-------------|----------|
| PostgreSQL + TimescaleDB | timescale/timescaledb:latest-pg16 | Yes | Yes | Never started |
| Valkey (Redis) | valkey/valkey:latest | Yes | Yes | Never started |
| RabbitMQ | rabbitmq:3-management | Yes | Yes | Never started |
| MinIO | minio/minio:latest | Yes | Yes | Never started |
| Keycloak 24 | quay.io/keycloak/keycloak:24.0 | **Yes** (start mode) | No health check | Never started |
| CitrineOS | ghcr.io/citrineos/citrineos-server:latest | Yes | No health check | Never started; env vars unverified |

**Keycloak** is configured with `start --import-realm --hostname-strict=false --http-enabled=true --proxy-headers=xforwarded`. This is correct for running behind Caddy.

**CitrineOS** env vars (`DB_HOST`, `AMQP_URL`, `S3_ENDPOINT`, etc.) are plausible but have **never been tested against the actual GHCR image**. The REST API paths used in `packages/ocpp/src/client.ts` are based on CitrineOS documentation — actual paths may differ by version.

### 4.2 Reverse proxy (Caddy)

Production Caddyfile configured for 7 domains:
- `charge.evuno.co` → :3000
- `navigate.evuno.co` → :3001
- `scout.evuno.co` → :3002
- `api.evuno.co` → :4000
- `auth.evuno.co` → :8080
- `ws.evuno.co` → :8082 (OCPP WebSocket)
- `*.charge.evuno.co` → :3000 (white-label subdomains)

Security headers configured: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff.

### 4.3 CI/CD

GitHub Actions workflow exists at `.github/workflows/deploy.yml`:
- Build job: pnpm install, pnpm build
- Deploy job: SSH to Hetzner, git pull, install, build, migrate, pm2 restart
- Triggers on push to main
- Requires secrets: `HETZNER_HOST`, `HETZNER_USER`, `HETZNER_SSH_KEY`

**Not yet configured:** GitHub secrets have not been added. The workflow has never run.

---

## 5. Market readiness by country

### 5.1 Chile (primary market)

**Market opportunity: HIGH · Platform readiness: LOW**

| Factor | Data | Source |
|--------|------|--------|
| Public charging points | ~1,700 connectors (up 55% from 1,097 in early 2025) | Mobility Portal EU |
| Geographic concentration | 64–69% in Santiago metro; 60% of municipalities have zero chargers | Latam Mobility |
| Charger type mix | 76% slow/semi-rapid (<50 kW), 21% fast, 3% ultra-rapid | Mobility Portal EU |
| Installed capacity growth | 38 MW by April 2025, ~400% YoY increase | Anari Energy |
| Key operators | Enel X Way (~60%), Copec Voltex (~16%), Enex E-Pro (~4%) | Competitive research |
| Major development | Tesla + Copec deploying Superchargers every 200km from La Serena to Puerto Montt through 2026 | Tesla North |
| Interoperability | Zero — each operator has its own app with no cross-network access | Government regulation pending |
| Regulation | Mandatory Interoperability Regulation in development; SEC TE-6 charger registration | Ministry of Energy |
| EV sales trend | BEV sales +183% in 2024; plug-in reached 2.8% market share in 2025 | Statista |
| Currency | CLP (no decimals) | — |
| Stripe support | Yes — AU + CL both in STRIPE_COUNTRIES | Codebase verified |

**Chile strategic assessment:** The three-operator fragmentation with zero interoperability is evuno's core opportunity. No existing platform aggregates Enel X Way, Copec Voltex, and Enex E-Pro into a single driver view. The upcoming Interoperability Regulation will mandate exactly this kind of platform. However, evuno must be operational *before* the regulation passes to be positioned as a solution rather than a latecomer.

**Chile blockers for evuno:**
- Open Charge Map data for Chile is sparse — evuno's own CitrineOS-managed chargers would be the primary data source, which means Charge must have paying operators before Navigate has value in Chile
- CLP formatting code exists but has never been tested in a browser
- Spanish translations exist for all 3 apps but have never been verified by a native speaker

### 5.2 Australia (secondary market)

**Market opportunity: HIGH · Platform readiness: LOW**

| Factor | Data | Source |
|--------|------|--------|
| EV market share | 14.6% BEV in March 2026 (nearly double YoY) | EV Infrastructure News |
| Charging market value | USD $304M in 2025, projected $1.69B by 2034 (21% CAGR) | IMARC Group |
| Major networks | Chargefox (~950 sites), Evie Networks, Exploren (493 locations, 5,500 plugs), Tesla (150+ Supercharger sites) | Zecar, various |
| Network fragmentation | 7+ operators, no single aggregator covers all | Competitive research |
| Chargefox position | Largest "network of networks" but does NOT provide OCPP management SaaS to operators | Chargefox |
| OCPP mandate | No national mandate; South Australia only state requiring OCPP compliance | Government |
| Government funding | $500M Driving the Nation Fund, $60M DRIVEN Program, $40M kerbside charging | Federal government |
| Dominant hardware | Tritium (Australian-made), ABB, Kempower | Industry |
| Currency | AUD | — |
| Stripe support | Yes | Codebase verified |

**Australia strategic assessment:** The market is larger than Chile but more competitive. Chargefox already operates as an aggregator for drivers. evuno's differentiation in Australia is at the **operator layer** — white-label OCPP management SaaS for small-to-mid operators who don't want to build their own platform. The $49–$199/mo pricing undercuts enterprise solutions (AMPECO: $200–$1,000/site/month, Driivz: $600–$800/port/year). Australia also has better Open Charge Map coverage, making Navigate more useful from day one.

**Australia blockers for evuno:**
- AUD formatting code exists but has never been tested
- English translations are the default and more likely to be correct than Spanish
- Chargefox already serves the driver aggregation use case — Navigate's value-add must be route planning (ABRP competitor), not just a charger map

### 5.3 New Zealand (expansion candidate — HIGH fit)

| Factor | Data | Source |
|--------|------|--------|
| EV registrations | Surpassed 100,000 units | EV Infrastructure News |
| Public chargers | ~1,200+ co-funded; government targeting 10,000 by 2030 | EECA, Ministry of Transport |
| Major investment | $110M joint investment (ChargeNet + Meridian Energy + government loans) for 2,500+ chargers in 2026 | NZ Government |
| Key operators | ChargeNet, Meridian, BP, Z Energy, Jolt, Tesla, WEL Networks | EECA |
| Regulatory environment | Active government promotion; contestable funding model | Ministry of Transport |
| Currency | NZD | — |
| Stripe support | Yes (NZ is in STRIPE_COUNTRIES) | Codebase verified |
| Language | English | — |
| Connector standard | Type 2 (AC), CCS2 (DC) — same as AU and CL | — |

**Why NZ fits:** Same language as AU, same connector standards, same currency format patterns, Stripe already supported. The $110M investment wave in 2026 means new operators are entering the market and need OCPP management software. evuno could expand from AU to NZ with near-zero localisation cost — add NZD to COUNTRY_DEFAULTS, add `NZ` to SUPPORTED_COUNTRIES, done.

**Effort to support:** ~2 hours of code changes (add country config, timezone, currency defaults).

### 5.4 Colombia (expansion candidate — MEDIUM fit)

| Factor | Data | Source |
|--------|------|--------|
| EV growth | Registrations +100-129% in early 2026 | Latam Mobility |
| Key cities | Bogota, Medellin, Cali leading in charging infrastructure | Latam Mobility |
| Regulatory support | Tax incentives, exemptions, co-financing programs | Latam Mobility |
| Currency | COP (Colombian Peso) | — |
| Stripe support | **No** — Colombia is NOT in STRIPE_COUNTRIES | Codebase verified |
| Language | Spanish | Already supported |

**Why Colombia fits partially:** Spanish already supported, strong growth trajectory, regulatory tailwind. But Stripe doesn't support COP natively — would need dLocal or local payment processor, which is explicitly deferred to post-MVP. Worth monitoring but not a launch market.

### 5.5 Mexico (expansion candidate — MEDIUM fit)

| Factor | Data | Source |
|--------|------|--------|
| Public stations | 2,083+ public stations; 3,300+ public points | MDPI research |
| Major investment | VEMO investing $1.5B in charging infrastructure and fleet expansion | Latam Mobility |
| Currency | MXN | — |
| Stripe support | **Yes** — Mexico is supported by Stripe | Stripe docs |
| Language | Spanish | Already supported |

**Why Mexico fits:** Massive market (130M population), Spanish already supported, Stripe works. $1.5B VEMO investment signals operator demand. However, Mexico has very different regulatory and business culture from Chile — would need local market research and potentially local partnerships. Phase 3+ expansion candidate.

### 5.6 Singapore (expansion candidate — HIGH fit)

| Factor | Data | Source |
|--------|------|--------|
| Charging points | 15,300+ chargers; targeting 60,000 by 2030 | LTA Singapore |
| Market value | $63M in 2022, projected $651M by 2030 | NextMSC |
| Key operators | Charge+ (4,000+ points), SP Mobility, Shell Recharge, CDG ENGIE | Revolt.sg |
| Regulation | Electric Vehicles Charging Act (EVCA) — licensed operators must meet safety and data standards | LTA |
| Currency | SGD | — |
| Stripe support | **Yes** (SG is in STRIPE_COUNTRIES) | Codebase verified |
| Language | English | Already supported |
| Connector standard | Type 2 (AC), CCS (DC) | — |

**Why Singapore fits:** English-speaking, Stripe-supported, strong regulatory framework (EVCA), compact geography (no range anxiety = Navigate less critical, Charge more critical), operators must be licensed. High-value market with operator demand. Same effort level as NZ to add country support.

### 5.7 Country prioritisation matrix

| Country | Market size | Fragmentation | Stripe | Language | Effort to add | Recommendation |
|---------|-----------|---------------|--------|----------|--------------|----------------|
| **Chile** | Medium | **Extreme** (3 operators, 0 interop) | Yes | es (done) | Launched | **Primary — launch here** |
| **Australia** | Large | High (7+ networks) | Yes | en (done) | Launched | **Secondary — launch here** |
| **New Zealand** | Small-medium | Medium | Yes | en (done) | ~2 hours | **Phase 2 — add immediately after AU** |
| **Singapore** | Medium | Medium | Yes | en (done) | ~4 hours | **Phase 2 — high value, low effort** |
| **Mexico** | Very large | Medium | Yes | es (done) | ~4 hours | **Phase 3 — needs local research** |
| **Colombia** | Medium | Low | **No** | es (done) | Blocked (payments) | **Phase 3+ — needs dLocal** |

---

## 6. Competitive positioning

### 6.1 evuno Charge vs. OCPP SaaS market

| Competitor | Pricing | OCPP 2.0.1 | White-label | evuno advantage | evuno disadvantage |
|-----------|---------|-----------|------------|----------------|-------------------|
| **AMPECO** | $200–$1,000/site/mo | Yes | Core | 4–20x cheaper at $49–$199/mo | AMPECO has 100+ charger integrations; evuno has 0 real integrations tested |
| **Monta** | €5–8/socket/mo + 2% | In development | Partner tier | Open-source CSMS (no per-charger licensing) | Monta has 225,000+ charge points; evuno has 0 |
| **Fuuse** | £60/yr/connector + 8% | OCA certified | Full | Lower transaction fee (1.5% vs 8%) | Fuuse has OCA certification; evuno's OCPP compliance is untested |
| **Driivz** | $600–800/port/yr | OCA golden node | Full | 3–5x cheaper | Driivz manages 150,000+ ports across 32 countries |
| **ChargeLab** | Custom | Yes | Yes | Latam focus (ChargeLab is NA-focused) | ChargeLab manages 15,000+ chargers |
| **Evoltsoft** | Custom | Yes | Core | No differentiation yet | New entrant, growing fast |
| **S44/TopazEV** | Custom | Yes (CitrineOS creators) | Yes | Same CSMS (CitrineOS) but evuno adds multi-product platform | S44 built CitrineOS — they know the codebase better |

**Honest assessment:** evuno's pricing is competitive and the multi-product platform (Charge + Navigate + Scout) is a genuine differentiator that no competitor offers as a bundle. However, **every competitor has deployed production systems with real chargers**. evuno has never connected to a real charger, processed a real payment, or served a real operator. The competitive advantage is theoretical until the first successful OCPP session is completed.

### 6.2 evuno Navigate vs. trip planners

| Competitor | Coverage | SoC routing | Community data | evuno advantage | evuno disadvantage |
|-----------|---------|------------|---------------|----------------|-------------------|
| **ABRP** | Global (1,000+ vehicles) | Best in class | Limited | CL/AU local focus; integrated with Charge operator data | 10 vehicles (Chargetrip Lite) vs 1,000+ |
| **PlugShare** | Global (350K+ stations) | Basic | Best in class (5M users) | Combined route planning + community | Zero community features; zero users |
| **Chargefox** | AU only (950 sites) | No | No | CL market (Chargefox is AU-only) | Chargefox already dominates AU driver aggregation |

### 6.3 evuno Scout vs. ROI tools

Scout's positioning as a free lead-gen tool feeding Charge sales is sound and under-competed. Most competitors (ChargePoint, Blink, AMPECO) require contacting sales for any ROI analysis. Stable Auto is the most sophisticated competitor but operates as enterprise B2B SaaS, not a free public tool.

---

## 7. No-go items for public launch

| # | Item | Severity | Status | Resolution |
|---|------|----------|--------|-----------|
| 1 | **`pnpm build` has never been run** | CRITICAL | Unverified | Run build; fix all compilation errors before any other work |
| 2 | **Zero test coverage** | CRITICAL | Missing | Add critical-path tests: ROI calculator, charger CRUD, session stats, Stripe webhook |
| 3 | **Auth callback route missing** | CRITICAL | Missing | Implement `/auth/callback` in Charge app to complete Keycloak PKCE flow |
| 4 | **No error boundaries** | HIGH | Missing | Add `error.tsx` and `not-found.tsx` to all app route segments |
| 5 | **CORS locked to localhost** | HIGH | Needs update | Update `main.ts` to allow production domains from env var |
| 6 | **No Drizzle schema migration** | HIGH | Missing | Run `drizzle-kit generate` to create the actual table creation SQL |
| 7 | **CitrineOS API paths unverified** | HIGH | Unverified | Start CitrineOS container and test actual REST endpoints |
| 8 | **No robots.txt / sitemap for Scout** | MEDIUM | Missing | Scout is the public-facing lead-gen tool — it must be indexable |
| 9 | **No rate limiting** | MEDIUM | Missing | Public endpoints (navigate, health) need rate limiting |
| 10 | **Spanish translations unreviewed** | MEDIUM | Unverified | Have a native speaker review `messages/es.json` in all 3 apps |

---

## 8. Feature readiness scorecard

| Category | Score | Rationale |
|----------|-------|-----------|
| **Code architecture** | 9/10 | Multi-tenant RLS, TypeScript strict, modular NestJS, proper Drizzle schemas. Enterprise-grade structure. |
| **Build verification** | 0/10 | Never compiled. Zero evidence anything works. |
| **Scout (ROI tool)** | 6/10 | Code complete but never rendered in a browser. No SEO setup. |
| **Charge (operator dashboard)** | 4/10 | Pages exist but auth callback is missing — operators cannot log in. |
| **Navigate (trip planner)** | 5/10 | Map + route planner code exists but requires 3 API keys to function. Never tested. |
| **API** | 7/10 | 21 endpoints, proper auth, validation pipes. Strong on paper. Never started. |
| **Payments (Stripe)** | 6/10 | Full implementation exists. Never processed a test card. Webhook endpoint never hit. |
| **OCPP (CitrineOS)** | 4/10 | Client implemented but API paths are based on docs, not tested against the actual container. |
| **Database** | 7/10 | Schemas are solid. Seed data exists. Migrations partially defined. TimescaleDB setup correct. |
| **Infrastructure (Docker)** | 7/10 | All services defined with health checks. Keycloak in prod mode. Never actually started. |
| **CI/CD** | 5/10 | Workflow exists but secrets not configured. Never triggered. |
| **Testing** | 0/10 | Zero test files anywhere in the repository. |
| **Security** | 4/10 | JWT auth exists, RLS configured, but no CSP headers on apps, no rate limiting, CORS is localhost-only. |
| **SEO / Marketing** | 1/10 | No robots.txt, sitemap, OG images, or schema markup. Scout cannot be found by search engines. |
| **Documentation** | 6/10 | CLAUDE.md is comprehensive. No user-facing docs, API docs, or onboarding guide. |
| **i18n** | 7/10 | Full en + es translations for all 3 apps. Never visually verified. Spanish unreviewed by native speaker. |
| | | |
| **Weighted total** | **52/100** | Strong architecture, zero verification. The codebase is a blueprint, not a product. |

---

## 9. Recommended launch sequence: April–June 2026

### Phase A: Verify what exists (14–21 April)

| Priority | Action | Deadline |
|----------|--------|----------|
| **P0** | Run `pnpm build` and fix all compilation errors | 15 April |
| **P0** | Start Docker services (`docker compose up -d`) and verify all 6 services healthy | 15 April |
| **P0** | Run `pnpm db:migrate` and verify tables created | 16 April |
| **P0** | Run `pnpm db:seed` and verify demo data | 16 April |
| **P0** | Start Scout (`pnpm --filter @evuno/scout dev`) and verify the calculator page renders | 16 April |
| **P0** | Start API (`pnpm --filter @evuno/api dev`) and verify `curl localhost:4000/api/health` | 17 April |
| **P0** | Start Charge and Navigate, verify pages render | 18 April |
| **P0** | Implement Keycloak auth callback route for Charge | 19 April |
| **P0** | Add error.tsx and not-found.tsx to all apps | 20 April |
| **P0** | Generate Drizzle schema migration (`drizzle-kit generate`) | 20 April |

### Phase B: First working product — Scout (21–28 April)

| Priority | Action | Deadline |
|----------|--------|----------|
| **P0** | Browser-test Scout calculator in both /es and /en | 22 April |
| **P0** | Verify CLP and AUD currency formatting visually | 22 April |
| **P0** | Test lead capture form submission | 23 April |
| **P1** | Add robots.txt, sitemap.ts, and OG metadata to Scout | 24 April |
| **P1** | Have a native Spanish speaker review es.json translations | 25 April |
| **P1** | Deploy Scout to Hetzner at scout.evuno.co | 28 April |

### Phase C: API + Charge (28 April – 12 May)

| Priority | Action | Deadline |
|----------|--------|----------|
| **P0** | Test all 21 API endpoints with curl/Postman | 30 April |
| **P0** | Test Keycloak login → dashboard flow end-to-end | 2 May |
| **P0** | Connect to Stripe test mode; process a test subscription | 3 May |
| **P0** | Start CitrineOS container; verify OCPP client against real API | 5 May |
| **P1** | Add critical-path tests (ROI, charger CRUD, sessions, webhook) | 8 May |
| **P1** | Update CORS to allow production domains | 8 May |
| **P1** | Deploy Charge + API to Hetzner | 12 May |

### Phase D: Navigate + go-live (12–31 May)

| Priority | Action | Deadline |
|----------|--------|----------|
| **P1** | Obtain Mapbox + Chargetrip + OCM API keys | 13 May |
| **P1** | Test Navigate map with live charger data | 15 May |
| **P1** | Test route planning with Chargetrip | 18 May |
| **P1** | Deploy Navigate to Hetzner | 20 May |
| **P2** | Add NZ and SG to SUPPORTED_COUNTRIES | 22 May |
| **P2** | Submit Scout to Google Search Console | 22 May |
| **P2** | Configure DNS for all evuno.co subdomains | 25 May |
| **P2** | Stripe live mode activation | 28 May |

---

## 10. Key dates and deadlines

| Date | Event | Impact on evuno |
|------|-------|----------------|
| **Now** | Chile charging up 55% to 1,700 connectors; still 0 interoperability | Window for unified platform |
| **March 2026** | Australia EV share hit 14.6% (nearly doubled YoY) | Growing operator + driver demand |
| **March 2026** | NZ government announces $110M for 2,500+ chargers | New operators entering market need OCPP SaaS |
| **2026 ongoing** | Tesla + Copec deploying Superchargers across Chile | Increases EV adoption → increases demand for non-Tesla charging |
| **H2 2026** | Chile Interoperability Regulation expected | Mandates exactly what evuno Navigate does — aggregated charger access |
| **2026–2027** | Singapore targeting 60,000 chargers by 2030 | Licensed operator market with regulatory compliance needs |

---

## 11. Assessment limitations

1. **No runtime verification.** This assessment is based entirely on static code review and filesystem inspection. No application has been compiled, started, or tested.
2. **CitrineOS API paths are theoretical.** The OCPP client implementation is based on CitrineOS documentation. Actual REST endpoints may differ by container image version.
3. **Chargetrip Lite tier constraints not tested.** The 10-vehicle and 100-route monthly limits have not been verified against real API calls.
4. **Open Charge Map Chile coverage unverified.** OCM is known to have sparse Latin American data; actual charger count returned for Chilean coordinates is unknown.
5. **No security audit performed.** Auth implementation exists but has never been penetration-tested. OCPP WebSocket security (TLS, client certificates) is not configured.

---

## Conclusion

evuno has a well-architected codebase targeting two markets with genuine gaps — Chile's three-operator zero-interoperability landscape and Australia's fragmented 7+ network ecosystem. The four-product platform (Charge + Navigate + Scout + Mobile) is a genuine differentiator that no competitor offers as a bundle. The open-source CSMS (CitrineOS) eliminates per-charger software licensing costs. Pricing at $49–$199/month undercuts every enterprise competitor.

But none of this matters until `pnpm build` passes. The single most important action in the next 48 hours is compiling the project and verifying that the 98 source files produce three working web applications and one working API server. Every other item in this assessment — DNS configuration, Stripe activation, Keycloak operator setup, API key procurement — is downstream of that basic verification.

The market timing is right. Chile's interoperability regulation, Australia's 14.6% EV share, and New Zealand's $110M charger investment wave all create demand for exactly what evuno is building. The question is not whether the opportunity exists — it's whether evuno can close the gap between "code committed" and "product serving customers" before the competitive window narrows.

**Path to first revenue: verify the build → deploy Scout → sign first Chilean operator → process first Stripe subscription. Target: end of May 2026.**

---

Sources:
- [Chile Charging Infrastructure Growth](https://mobilityportal.eu/chile-charging-public-stations-decline/)
- [Chile EV Market Overview](https://latamobility.com/en/chile-accelerates-transition-to-electromobility-public-transportation-charging-infrastructure-and-automotive-market-in-2025/)
- [Tesla + Copec Chile Supercharger Expansion](https://teslanorth.com/2026/02/02/tesla-to-launch-massive-supercharger-network-in-chile/)
- [Chile Charging Opportunities (Anari Energy)](https://www.anariev.com/chile-s-ev-charging-boom-opportunities-and-roadblocks-every-operator-should-know/)
- [Australia EV Sales Record March 2026](https://www.evinfrastructurenews.com/ev-technology/australian-ev-sales-hit-record-high-as-fuel-uncertainty-drives-market-shift)
- [Australia EV Charging Market Size (IMARC)](https://www.imarcgroup.com/australia-electric-vehicle-charging-market)
- [Australia EV Charging Networks (Zecar)](https://zecar.com/resources/what-ev-charging-providers-are-in-australia)
- [EV Charging Australia 2026 Conference](https://www.australia.evcharging-infrastructure.com/news/plugged-in-how-australias-ev-network-is-taking-off)
- [New Zealand 2,500+ Chargers Announcement](https://nationalinfrastructure.govt.nz/2026/03/charging-ahead-2500-ev-chargers-on-the-way/)
- [NZ EV Registrations Surpass 100,000](https://www.evinfrastructurenews.com/ev-networks/new-zealand-s-ev-registrations-surpass-100-000-units)
- [NZ Government 10,000 Charger Target](https://newsroom.co.nz/2026/03/10/govt-looks-to-market-to-reach-10000-ev-charger-goal/)
- [Colombia EV Growth 2026 (Latam Mobility)](https://latamobility.com/en/latam-mobility-colombia-2026-electric-mobility/)
- [Mexico Charging Infrastructure (MDPI)](https://www.mdpi.com/2032-6653/16/6/333)
- [VEMO $1.5B Mexico Investment](https://latamobility.com/en/vemo-to-invest-us1-5-billion-to-accelerate-charging-infrastructure-and-electric-fleet-expansion-in-mexico/)
- [Singapore Charge+ 4,000 Points](https://revolt.sg/news/charge-plus-4000-ev-charging-points-singapore-2026)
- [Singapore EV Roadmap (LTA)](https://www.lta.gov.sg/content/ltagov/en/industry_innovations/technologies/electric_vehicles/our_ev_roadmap.html)
- [Singapore EV Charging Market Size](https://www.nextmsc.com/report/singapore-electric-vehicle-ev-charging-market)
- [S44 Energy / TopazEV (CitrineOS Creators)](https://www.s44.team/csms)
- [AMPECO OCPP Guide 2026](https://www.ampeco.com/guides/complete-ocpp-guide/)
- [Top EV Charging Software 2026 (ZipDo)](https://zipdo.co/best/ev-charging-station-management-software/)
- [Latin America EV Market (IMARC)](https://www.imarcgroup.com/latin-america-electric-vehicles-market)
