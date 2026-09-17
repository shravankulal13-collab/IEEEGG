// ============================================================
// PRIMARY OWNER: SK / Saishree Santhosh Shet
// ROLE: Core Platform + Multi-Portal Comprehensive Routing System
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { RoleGuard, getDefaultRolePath } from './components/layout/RoleGuard';
import { Spinner } from './components/ui/Spinner';

// Showcase, Auth & Admin Pages (SK)
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { PublicReports } from './pages/PublicReports';

// Citizen Portal Pages (Saishree Santhosh Shet)
import { EmergencyHome } from './pages/citizen/EmergencyHome';
import { ReportEmergency } from './pages/citizen/ReportEmergency';
import { IncidentConfirmation } from './pages/citizen/IncidentConfirmation';
import { LiveIncidentTracking } from './pages/citizen/LiveIncidentTracking';
import { IncidentHistory } from './pages/citizen/IncidentHistory';

// Ambulance Driver Portal Pages (Saishree Santhosh Shet & Shreevarsha V Hegde)
import { AmbulanceHome } from './pages/ambulance/AmbulanceHome';
import { ActiveEmergency } from './pages/ambulance/ActiveEmergency';
import { DispatchRequest } from './pages/ambulance/DispatchRequest';
import { Navigation } from './pages/ambulance/Navigation';
import { VehicleStatus } from './pages/ambulance/VehicleStatus';
import { TripHistory } from './pages/ambulance/TripHistory';

// Dispatcher Command Center Portal Pages (khushi.shettyyy)
import { CommandCenter } from './pages/dispatcher/CommandCenter';
import { AmbulanceFleet } from './pages/dispatcher/AmbulanceFleet';
import { HospitalNetwork } from './pages/dispatcher/HospitalNetwork';
import { IncidentDetails } from './pages/dispatcher/IncidentDetails';
import { RouteIntelligence } from './pages/dispatcher/RouteIntelligence';
import { TrafficEvents } from './pages/dispatcher/TrafficEvents';
import { Analytics } from './pages/dispatcher/Analytics';
import { AuditLogs } from './pages/dispatcher/AuditLogs';
import { Notifications } from './pages/dispatcher/Notifications';

// Hospital Trauma Unit Portal Pages (Shreevarsha V Hegde)
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { IncomingEmergency } from './pages/hospital/IncomingEmergency';
import { ResourceManagement } from './pages/hospital/ResourceManagement';
import { Doctors } from './pages/hospital/Doctors';
import { History } from './pages/hospital/History';

function RootRedirect() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" color="danger" />
        <p className="text-xs font-semibold text-slate-500 mt-4">Initializing ResQGrid Security...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRolePath(user.role)} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry Point: Unauthenticated -> /login; Authenticated -> Role Portal */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Showcase & Landing Page */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/showcase" element={<LandingPage />} />

        {/* Authentication & User Management Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* System Administration & Diagnostics */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['system_admin']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route path="/public" element={<PublicReports />} />

        {/* 1. Citizen Portal Routes */}
        <Route
          path="/citizen"
          element={
            <RoleGuard allowedRoles={['citizen', 'system_admin']}>
              <EmergencyHome />
            </RoleGuard>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <RoleGuard allowedRoles={['citizen', 'system_admin']}>
              <ReportEmergency />
            </RoleGuard>
          }
        />
        <Route
          path="/citizen/confirm"
          element={
            <RoleGuard allowedRoles={['citizen', 'system_admin']}>
              <IncidentConfirmation />
            </RoleGuard>
          }
        />
        <Route
          path="/citizen/tracking"
          element={
            <RoleGuard allowedRoles={['citizen', 'dispatcher', 'system_admin']}>
              <LiveIncidentTracking />
            </RoleGuard>
          }
        />
        <Route
          path="/citizen/history"
          element={
            <RoleGuard allowedRoles={['citizen', 'system_admin']}>
              <IncidentHistory />
            </RoleGuard>
          }
        />

        {/* 2. Ambulance Driver Portal Routes */}
        <Route
          path="/ambulance"
          element={
            <RoleGuard allowedRoles={['ambulance_driver', 'system_admin']}>
              <AmbulanceHome />
            </RoleGuard>
          }
        />
        <Route
          path="/ambulance/active"
          element={
            <RoleGuard allowedRoles={['ambulance_driver', 'system_admin']}>
              <ActiveEmergency />
            </RoleGuard>
          }
        />
        <Route
          path="/ambulance/dispatch"
          element={
            <RoleGuard allowedRoles={['ambulance_driver', 'system_admin']}>
              <DispatchRequest />
            </RoleGuard>
          }
        />
        <Route
          path="/ambulance/navigation"
          element={
            <RoleGuard allowedRoles={['ambulance_driver', 'system_admin']}>
              <Navigation />
            </RoleGuard>
          }
        />
        <Route
          path="/ambulance/status"
          element={
            <RoleGuard allowedRoles={['ambulance_driver', 'system_admin']}>
              <VehicleStatus />
            </RoleGuard>
          }
        />
        <Route
          path="/ambulance/history"
          element={
            <RoleGuard allowedRoles={['ambulance_driver', 'system_admin']}>
              <TripHistory />
            </RoleGuard>
          }
        />

        {/* 3. Dispatcher Command Center Portal Routes */}
        <Route
          path="/dispatcher"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <CommandCenter />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/fleet"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <AmbulanceFleet />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/hospitals"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <HospitalNetwork />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/incidents"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <IncidentDetails />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/incidents/:id"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <IncidentDetails />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/routes"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <RouteIntelligence />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/traffic"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <TrafficEvents />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/analytics"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <Analytics />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/audit"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <AuditLogs />
            </RoleGuard>
          }
        />
        <Route
          path="/dispatcher/notifications"
          element={
            <RoleGuard allowedRoles={['dispatcher', 'system_admin']}>
              <Notifications />
            </RoleGuard>
          }
        />

        {/* 4. Hospital Trauma Unit Portal Routes */}
        <Route
          path="/hospital"
          element={
            <RoleGuard allowedRoles={['hospital_admin', 'hospital_staff', 'system_admin']}>
              <HospitalDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/hospital/emergency"
          element={
            <RoleGuard allowedRoles={['hospital_admin', 'hospital_staff', 'system_admin']}>
              <IncomingEmergency />
            </RoleGuard>
          }
        />
        <Route
          path="/hospital/resources"
          element={
            <RoleGuard allowedRoles={['hospital_admin', 'hospital_staff', 'system_admin']}>
              <ResourceManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/hospital/doctors"
          element={
            <RoleGuard allowedRoles={['hospital_admin', 'hospital_staff', 'system_admin']}>
              <Doctors />
            </RoleGuard>
          }
        />
        <Route
          path="/hospital/history"
          element={
            <RoleGuard allowedRoles={['hospital_admin', 'hospital_staff', 'system_admin']}>
              <History />
            </RoleGuard>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
