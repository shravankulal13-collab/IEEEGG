<!--
============================================================
PRIMARY OWNER: SK
ROLE: Core Platform + Backend Integration Lead
MODULE: System Overview & Architecture
NOTE: Shared dependency -- changes require team coordination.
============================================================
-->

# Emergency Response Intelligence & Coordination System (ERICS)

> A high-reliability, real-time national emergency response coordination and decision-support platform connecting Citizens, Dispatchers, Ambulance Fleets, and Hospital Networks.

---

## 1. System Architecture

```
Citizen (SOS / App)
        ↓
Emergency Incident Logged
        ↓
Automated & Dispatcher Verification
        ↓
Ambulance Fleet Dispatching
        ↓
Traffic-Aware Dynamic Routing (Mappls / Fallback)
        ↓
Live GPS Ambulance Telemetry
        ↓
Hospital Bed & Capacity Matching
        ↓
Patient Handover & Incident Resolution
        ↓
Audit Logs & Operational Analytics
```

---

## 2. Core Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Zustand, Lucide Icons, Leaflet / React-Leaflet
- **Backend**: Node.js, Express, TypeScript (ES Modules), Zod, Pino Structured Logger, Helmet, Rate-Limiting
- **Database & Spatial**: Supabase / PostgreSQL, PostGIS spatial indexing & geography queries
- **Realtime**: Socket.IO, Supabase Realtime pub/sub
- **Caching**: Redis with resilient in-memory local cache fallback
- **Routing**: MapmyIndia (Mappls) integration adapter with internal heuristic fallback routing

---

## 3. Team Ownership Boundaries

| Lead | Role & Module Area | Primary Responsibilities |
| :--- | :--- | :--- |
| **SK** | **Core Platform + Backend Integration Lead** | Database schema, PostGIS migrations, Express middleware pipeline, Auth & RBAC, Incident API lifecycle, verification foundation, shared UI primitives, master layout shell, shared API client. |
| **Saishree Santhosh Shet** | **Citizen + Ambulance Application** | Citizen emergency reporting UI, emergency type selection, citizen live tracking, ambulance driver navigation & trip telemetry. |
| **Anush KD** | **Routing + Traffic + Resilience** | Mappls routing integration, dynamic traffic ingestion, congestion rerouting engine, route intelligence views. |
| **Shreevarsha V Hegde** | **Hospital + Dispatch Operations** | Hospital capacity dashboard, ICU/bed tracking, doctor availability, dispatch matching engine. |
| **khushi.shettyyy** | **Command Center + Realtime + Operational Intelligence** | Dispatcher command center radar map, WebSocket realtime telemetry, operational analytics, audit logs. |

For detailed module boundaries, see [`docs/TEAM_OWNERSHIP.md`](file:///e:/IEEEGG/docs/TEAM_OWNERSHIP.md).

---

## 4. SK Module Implementation Highlights

1. **Authentication & Authorization**:
   - Granular RBAC (`citizen`, `ambulance_driver`, `hospital_staff`, `hospital_admin`, `dispatcher`, `system_admin`).
   - Secure password hashing with bcrypt, JWT token signing & verification, Supabase session compatibility.
   - Frontend `useAuth` hook and persisted `authStore` with quick-login evaluator demo presets.
2. **Incident Lifecycle State Machine**:
   - Strict state transitions: `reported` → `verifying` → `verified` → `dispatching` → `dispatched` → `en_route` → `arrived` → `transporting` → `resolved` / `cancelled`.
   - PostGIS spatial duplicate incident detection heuristic (500m / 30 min window).
   - Multi-signal verification scoring engine (India bounding box check, address validation, reporter history).
3. **Resilience & Fallback-First Design**:
   - Runs out of the box even when PostgreSQL, Redis, or external APIs are offline using graceful in-memory storage.
   - Health check endpoint `GET /api/health` reports granular provider status.
4. **Design System & UI Primitives**:
   - Custom palette (`#FDF4D2`, `#B0CDE6`, `#A290B7`, `#946D6D`) with dark/light mode toggle.
   - 15 accessible UI primitives: `Badge`, `Button`, `Card`, `ConfirmDialog`, `Drawer`, `EmptyState`, `ErrorState`, `Input`, `Modal`, `Select`, `Skeleton`, `Spinner`, `Table`, `Tabs`, `Toast`.
   - Responsive `AppShell` with Topbar, Sidebar, MobileNavigation, and `RoleGuard`.

---

## 5. Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation & Execution

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`. Health endpoint: `http://localhost:5000/api/health`.

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

#### Running Tests
```bash
# Backend unit & integration tests
npm --prefix backend test

# Frontend typecheck & production build
npm --prefix frontend run build
```

---

## 6. Seed Accounts for Evaluators

All test accounts use the password: `Emergency@123`

| Role | Email | Purpose |
| :--- | :--- | :--- |
| **System Admin** | `admin@emergency.gov.in` | Global administrative & system status terminal |
| **Dispatcher** | `dispatcher@emergency.gov.in` | Command center incident verification & dispatch |
| **Ambulance Operator** | `ambulance@emergency.gov.in` | Vehicle telemetry & route navigation |
| **Hospital Admin** | `hospital@emergency.gov.in` | Emergency department bed & doctor management |
| **Citizen** | `citizen@emergency.gov.in` | SOS emergency reporting & live tracking |