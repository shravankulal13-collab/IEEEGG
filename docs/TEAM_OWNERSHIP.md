# Emergency Response Intelligence & Coordination System
## Team Ownership & Architecture Boundary Agreement

This document defines the strict module boundaries, architecture responsibilities, and data contracts across all 5 team members.

---

### Team Members & Module Responsibilities

#### 1. SK (Core Platform + Backend Integration Lead)
- **Primary Ownership**:
  - Core database schema, migrations, connection pool, and PostGIS spatial architecture.
  - Express backend initialization, middleware pipeline (Auth, Role, Rate Limiting, Request ID, Error Handling).
  - Centralized authentication & authorization engine (JWT, Supabase Auth, RBAC).
  - User profiles and role-based access management.
  - Incident API lifecycle and state machine (`reported` → `verifying` → `verified` → `dispatched` → `resolved` / `cancelled`).
  - Incident verification foundation & scoring engine.
  - Shared API client, HTTP interceptors, centralized error response contract.
  - Shared frontend UI primitive library (Buttons, Cards, Inputs, Modals, Badges, Tables, Toasts, Drawers, etc.).
  - Frontend master layout shell (`AppShell`, `Topbar`, `Sidebar`, `MobileNavigation`, `RoleGuard`).
  - Public authentication pages (`Login`, `Register`, `ForgotPassword`, `ResetPassword`, `NotFound`).
  - Core Zustand stores (`authStore`, `incidentStore`) and hooks (`useAuth`, `useIncident`).
  - Health check endpoint (`/api/health`) and admin platform endpoints (`/api/admin`).

#### 2. Saishree Santhosh Shet (Citizen + Ambulance Application)
- **Primary Ownership**:
  - Citizen emergency reporting interface & emergency type selection.
  - Citizen live tracking & incident history views.
  - Ambulance driver operational dashboard & dispatch acceptance.
  - Ambulance turn-by-turn navigation view & status telemetry transmission.
  - Vehicle status management & trip history.
  - Ambulance operational services & store (`ambulanceStore`, `ambulance.service.ts`).

#### 3. Anush KD (Routing + Traffic + Resilience)
- **Primary Ownership**:
  - Routing engine integrations (Mappls / MapmyIndia, Waze API, OSRM fallback).
  - Real-time traffic ingestion, congestion analysis, and traffic alert triggers.
  - Dynamic rerouting algorithms and alternative route calculations.
  - Route intelligence and traffic event dispatcher dashboard views.
  - Routing & traffic services and hooks (`route.service.ts`, `traffic.service.ts`, `useRoute`, `useTraffic`).

#### 4. Shreevarsha V Hegde (Hospital + Dispatch Operations)
- **Primary Ownership**:
  - Hospital operational dashboard & incoming emergency pre-arrival alerts.
  - Hospital bed, ICU, doctor, and trauma resource management.
  - Automated & manual ambulance dispatch matching engine.
  - Hospital network overview & capacity monitor.
  - Hospital & dispatch services and stores (`hospitalStore`, `dispatchStore`, `hospital.service.ts`, `dispatch.service.ts`).

#### 5. khushi.shettyyy (Command Center + Realtime + Operational Intelligence)
- **Primary Ownership**:
  - Central dispatcher command center and situational map overview.
  - Realtime WebSocket infrastructure (`socket.io`, Supabase Realtime subscriptions).
  - Live ambulance fleet tracking & incident detail telemetry.
  - Operational analytics, response-time metrics, and audit log viewer.
  - Realtime notification service and socket handlers (`socket.ts`, `analytics.service.ts`, `mapStore`).

---

### Data & API Response Contract

All backend API endpoints conform to the standard payload envelope:

```typescript
// Success Response
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

// Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | Array<unknown>;
  };
}
```

### Supported User Roles (`user_role` enum):
- `citizen`
- `dispatcher`
- `ambulance_driver`
- `hospital_admin`
- `hospital_staff`
- `system_admin`

---
*Maintained by Core Platform Lead (SK) on behalf of the Emergency Response Coordination Team.*
