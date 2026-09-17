// ============================================================
// PRIMARY OWNER: SK / Saishree Santhosh Shet
// ROLE: Core Platform + Multi-Portal Comprehensive Routing System
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
import { Profile } from './pages/citizen/Profile';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Showcase & Landing Page (Theme & Moving Animations) */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication & User Management Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* System Administration & Diagnostics */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/public" element={<PublicReports />} />

        {/* 1. Citizen Portal Routes */}
        <Route path="/citizen" element={<EmergencyHome />} />
        <Route path="/citizen/report" element={<ReportEmergency />} />
        <Route path="/citizen/confirm" element={<IncidentConfirmation />} />
        <Route path="/citizen/tracking" element={<LiveIncidentTracking />} />
        <Route path="/citizen/history" element={<IncidentHistory />} />
        <Route path="/citizen/profile" element={<Profile />} />

        {/* 2. Ambulance Driver Portal Routes */}
        <Route path="/ambulance" element={<AmbulanceHome />} />
        <Route path="/ambulance/active" element={<ActiveEmergency />} />
        <Route path="/ambulance/dispatch" element={<DispatchRequest />} />
        <Route path="/ambulance/navigation" element={<Navigation />} />
        <Route path="/ambulance/status" element={<VehicleStatus />} />
        <Route path="/ambulance/history" element={<TripHistory />} />

        {/* 3. Dispatcher Command Center Portal Routes */}
        <Route path="/dispatcher" element={<CommandCenter />} />
        <Route path="/dispatcher/fleet" element={<AmbulanceFleet />} />
        <Route path="/dispatcher/hospitals" element={<HospitalNetwork />} />
        <Route path="/dispatcher/incidents" element={<IncidentDetails />} />
        <Route path="/dispatcher/incidents/:id" element={<IncidentDetails />} />
        <Route path="/dispatcher/routes" element={<RouteIntelligence />} />
        <Route path="/dispatcher/traffic" element={<TrafficEvents />} />
        <Route path="/dispatcher/analytics" element={<Analytics />} />
        <Route path="/dispatcher/audit" element={<AuditLogs />} />
        <Route path="/dispatcher/notifications" element={<Notifications />} />

        {/* 4. Hospital Trauma Unit Portal Routes */}
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/hospital/emergency" element={<IncomingEmergency />} />
        <Route path="/hospital/resources" element={<ResourceManagement />} />
        <Route path="/hospital/doctors" element={<Doctors />} />
        <Route path="/hospital/history" element={<History />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
