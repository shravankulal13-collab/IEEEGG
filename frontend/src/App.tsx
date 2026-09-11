// ============================================================
// PRIMARY OWNER: SK / Saishree Santhosh Shet
// ROLE: Core Platform + Citizen & Ambulance Module Routes
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Citizen Portal Pages
import { EmergencyHome } from './pages/citizen/EmergencyHome';
import { ReportEmergency } from './pages/citizen/ReportEmergency';
import { IncidentConfirmation } from './pages/citizen/IncidentConfirmation';
import { LiveIncidentTracking } from './pages/citizen/LiveIncidentTracking';
import { IncidentHistory } from './pages/citizen/IncidentHistory';
import { Profile } from './pages/citizen/Profile';

// Ambulance Driver Portal Pages
import { AmbulanceHome } from './pages/ambulance/AmbulanceHome';
import { ActiveEmergency } from './pages/ambulance/ActiveEmergency';
import { Navigation } from './pages/ambulance/Navigation';
import { VehicleStatus } from './pages/ambulance/VehicleStatus';
import { TripHistory } from './pages/ambulance/TripHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirect to Citizen Portal */}
        <Route path="/" element={<Navigate to="/citizen" replace />} />

        {/* Citizen Portal Routes */}
        <Route path="/citizen" element={<EmergencyHome />} />
        <Route path="/citizen/report" element={<ReportEmergency />} />
        <Route path="/citizen/confirm" element={<IncidentConfirmation />} />
        <Route path="/citizen/tracking" element={<LiveIncidentTracking />} />
        <Route path="/citizen/history" element={<IncidentHistory />} />
        <Route path="/citizen/profile" element={<Profile />} />

        {/* Ambulance Driver Portal Routes */}
        <Route path="/ambulance" element={<AmbulanceHome />} />
        <Route path="/ambulance/active" element={<ActiveEmergency />} />
        <Route path="/ambulance/navigation" element={<Navigation />} />
        <Route path="/ambulance/status" element={<VehicleStatus />} />
        <Route path="/ambulance/history" element={<TripHistory />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/citizen" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
