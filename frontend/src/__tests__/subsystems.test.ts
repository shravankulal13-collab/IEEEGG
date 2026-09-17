import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHospitalStore } from '../store/hospitalStore';
import { useDispatchStore } from '../store/dispatchStore';
import { useMapStore } from '../store/mapStore';
import { useNotificationStore } from '../store/notificationStore';
import { dispatchService } from '../services/dispatch.service';
import { routeService } from '../services/route.service';
import { trafficService } from '../services/traffic.service';
import { analyticsService } from '../services/analytics.service';
import { hospitalService } from '../services/hospital.service';
import { ambulanceService } from '../services/ambulance.service';
import { notificationService } from '../services/notification.service';

describe('ResQGrid Frontend Subsystems & Stores Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hospital Operations Store (Shreevarsha V Hegde)', () => {
    it('should initialize with default state and fetch hospitals from backend', async () => {
      const mockHospitals = [
        { id: 'hosp-001', name: 'Apollo Hospital Bannerghatta', trauma_level: 'LEVEL_1', available_beds: 42 },
        { id: 'hosp-002', name: 'Fortis Hospital', trauma_level: 'LEVEL_1', available_beds: 18 },
      ];

      vi.spyOn(hospitalService, 'getAllHospitals').mockResolvedValue(mockHospitals as any);

      const directHospitals = await hospitalService.getAllHospitals();
      expect(directHospitals.length).toBe(2);

      await useHospitalStore.getState().fetchHospitals();
      const state = useHospitalStore.getState();
      expect(state.hospitals.length).toBe(2);
      expect(state.hospitals[0].name).toBe('Apollo Hospital Bannerghatta');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should fetch hospital dashboard with doctor and incoming patient queues', async () => {
      const mockDashboard = {
        hospital: { id: 'hosp-001', name: 'Apollo Hospital' },
        doctors: [{ id: 'doc-01', name: 'Dr. Rajesh Nair', status: 'ON_DUTY' }],
        incoming_patients: [{ incident_id: 'inc-01', ambulance_number: 'KA-01-EA-1042' }],
        occupancy_rate: 83.2,
      };

      vi.spyOn(hospitalService, 'getHospitalDashboard').mockResolvedValue(mockDashboard as any);

      await useHospitalStore.getState().fetchHospitalDashboard('hosp-001');
      const state = useHospitalStore.getState();
      expect(state.currentDashboard).not.toBeNull();
      expect(state.currentDashboard?.doctors.length).toBe(1);
      expect(state.currentDashboard?.hospital.id).toBe('hosp-001');
    });

    it('should update hospital capacity metrics in database', async () => {
      vi.spyOn(hospitalService, 'updateCapacity').mockResolvedValue({
        id: 'hosp-001',
        name: 'Apollo Hospital',
        available_icu_beds: 12,
      } as any);

      await useHospitalStore.getState().updateCapacity('hosp-001', {
        type: 'ICU',
        count: 12,
      });

      expect(hospitalService.updateCapacity).toHaveBeenCalledWith('hosp-001', {
        type: 'ICU',
        count: 12,
      });
    });
  });

  describe('Dispatch Coordination Store & Service (Shreevarsha V Hegde)', () => {
    it('should score dispatch candidates based on proximity, ETA, and capability', () => {
      const scoreResult = dispatchService.calculateDispatchScore({
        distance_km: 2.0,
        eta_minutes: 5,
        type: 'ALS',
        is_als_required: true,
      });

      expect(scoreResult.score).toBeGreaterThan(70);
      expect(scoreResult.breakdown.capability_score).toBe(100);
      expect(scoreResult.breakdown.proximity_score).toBe(80);
    });

    it('should fetch scored candidates from live ambulances in database', async () => {
      const mockAmbulances = [
        {
          id: 'amb-101',
          ambulance_number: 'KA-01-EA-1042',
          driver_name: 'Manoj Kumar',
          driver_phone: '+91 98765 43210',
          status: 'available',
          emergency_capable: true,
          ambulance_type: 'ALS',
          current_latitude: 12.9716,
          current_longitude: 77.5946,
        },
      ];

      vi.spyOn(ambulanceService, 'getAllAmbulances').mockResolvedValue(mockAmbulances as any);

      await useDispatchStore.getState().fetchCandidates('inc-001', { lat: 12.9716, lng: 77.5946 });
      const state = useDispatchStore.getState();
      expect(state.candidates.length).toBe(1);
      expect(state.selectedCandidate).not.toBeNull();
      expect(state.selectedCandidate?.ambulance_number).toBe('KA-01-EA-1042');
    });

    it('should execute dispatch request and persist assignment', async () => {
      vi.spyOn(dispatchService, 'requestDispatch').mockResolvedValue({
        success: true,
        assignment_id: 'asgn-101',
        incident_id: 'inc-001',
        ambulance_id: 'amb-101',
        assigned_at: new Date().toISOString(),
        estimated_eta_minutes: 6,
        status: 'DISPATCHED',
      });

      const res = await useDispatchStore.getState().executeDispatch({
        incident_id: 'inc-001',
        ambulance_id: 'amb-101',
        priority: 'CRITICAL',
      });

      expect(res.success).toBe(true);
      expect(res.assignment_id).toBe('asgn-101');
      expect(useDispatchStore.getState().activeAssignment).not.toBeNull();
    });
  });

  describe('Routing & Green Wave Service (Anush KD)', () => {
    it('should calculate emergency route with signal preemption nodes', async () => {
      const mockRoute = {
        provider: 'tomtom' as const,
        distance_meters: 5400,
        duration_seconds: 480,
        formatted_distance: '5.4 km',
        formatted_duration: '8 min',
        geometry: [[12.9716, 77.5946], [12.8953, 77.5986]] as [number, number][],
        steps: [{ instruction: 'Proceed south', distance_meters: 800, duration_seconds: 90, maneuver: 'straight', name: 'Main Rd' }],
        signals: [{ signal_id: 'sig-01', junction_name: 'MG Rd', latitude: 12.9716, longitude: 77.5946, current_phase: 'GREEN' as const, preemption_status: 'ACTIVE' as const, distance_to_signal_meters: 500, time_to_green_seconds: 0 }],
        congestion_level: 'LOW' as const,
      };

      vi.spyOn(routeService, 'computeRoute').mockResolvedValue(mockRoute);

      const route = await routeService.computeRoute({
        origin: { lat: 12.9716, lng: 77.5946 },
        destination: { lat: 12.8953, lng: 77.5986 },
        profile: 'emergency',
      });

      expect(route.distance_meters).toBe(5400);
      expect(route.signals.length).toBe(1);
      expect(route.signals[0].preemption_status).toBe('ACTIVE');
    });

    it('should query routing provider circuit breaker health', async () => {
      vi.spyOn(routeService, 'getProviderHealth').mockResolvedValue([
        { provider: 'tomtom', state: 'CLOSED', consecutiveFailures: 0, avgLatencyMs: 120 },
      ]);

      const health = await routeService.getProviderHealth();
      expect(health.length).toBe(1);
      expect(health[0].provider).toBe('tomtom');
      expect(health[0].state).toBe('CLOSED');
    });
  });

  describe('Traffic Intelligence Service (Anush KD)', () => {
    it('should fetch fused traffic flow and incidents', async () => {
      vi.spyOn(trafficService, 'getTrafficFlow').mockResolvedValue({
        segments: [{ id: 'seg-1', roadName: 'Outer Ring Rd', startLat: 12.92, startLng: 77.68, endLat: 12.95, endLng: 77.70, congestionLevel: 'MODERATE', currentSpeedKmh: 35, freeFlowSpeedKmh: 50, delaySeconds: 120 }],
        sourcesUsed: ['tomtom'],
        sourcesFailed: [],
        fusedAt: new Date().toISOString(),
      });

      vi.spyOn(trafficService, 'getTrafficIncidents').mockResolvedValue({
        incidents: [{ id: 'inc-1', type: 'ACCIDENT', severity: 'CRITICAL', description: 'Collision', roadName: 'Silk Board', latitude: 12.91, longitude: 77.62, reportedAt: new Date().toISOString(), estimatedClearanceMinutes: 20, impactRadiusMeters: 300 }],
        sourcesUsed: ['police_feed'],
        sourcesFailed: [],
        fusedAt: new Date().toISOString(),
      });

      const bbox: [number, number, number, number] = [12.85, 77.50, 13.08, 77.75];
      const flow = await trafficService.getTrafficFlow(bbox);
      const incidents = await trafficService.getTrafficIncidents(bbox);

      expect(flow.segments.length).toBe(1);
      expect(incidents.incidents.length).toBe(1);
      expect(incidents.incidents[0].severity).toBe('CRITICAL');
    });
  });

  describe('Operational Analytics Service (Khushi Shetty)', () => {
    it('should return system KPIs and SLA metrics from database', async () => {
      vi.spyOn(analyticsService, 'getKPIs').mockResolvedValue({
        active_incidents: 4,
        available_ambulances: 10,
        dispatched_ambulances: 2,
        sla_compliance_percent: 95.4,
      });

      vi.spyOn(analyticsService, 'getSLAMetrics').mockResolvedValue({
        window_hours: 24,
        total_dispatches: 30,
        met_sla_count: 29,
        breached_sla_count: 1,
        compliance_percentage: 96.6,
        target_response_minutes: 8,
      });

      const kpis = await analyticsService.getKPIs();
      const sla = await analyticsService.getSLAMetrics(24);

      expect(kpis.active_incidents).toBe(4);
      expect(sla.compliance_percentage).toBe(96.6);
    });

    it('should return paginated audit logs from database', async () => {
      vi.spyOn(analyticsService, 'getAuditLogs').mockResolvedValue({
        total: 1,
        limit: 10,
        offset: 0,
        logs: [
          {
            id: 'audit-01',
            timestamp: new Date().toISOString(),
            actor_name: 'Khushi Shetty',
            actor_role: 'DISPATCHER',
            action: 'DISPATCH_ASSIGNED',
            entity_type: 'INCIDENT',
            entity_id: 'inc-001',
            details: {},
          },
        ],
      });

      const audit = await analyticsService.getAuditLogs(10, 0);
      expect(audit.logs.length).toBe(1);
      expect(audit.logs[0].actor_name).toBe('Khushi Shetty');
    });
  });

  describe('Realtime Notification Store (Khushi Shetty)', () => {
    it('should fetch notifications from backend and track unread count', async () => {
      vi.spyOn(notificationService, 'getNotifications').mockResolvedValue([
        {
          id: 'notif-01',
          type: 'EMERGENCY',
          severity: 'CRITICAL',
          title: 'Emergency Priority 1',
          message: 'Cardiac arrest logged at MG Road',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);

      await useNotificationStore.getState().fetchNotifications();
      const state = useNotificationStore.getState();
      expect(state.notifications.length).toBe(1);
      expect(state.unreadCount).toBe(1);
    });

    it('should mark notifications as read in backend', async () => {
      vi.spyOn(notificationService, 'markAsRead').mockResolvedValue();

      useNotificationStore.setState({
        notifications: [
          {
            id: 'notif-01',
            type: 'EMERGENCY',
            severity: 'CRITICAL',
            title: 'Test Alert',
            message: 'Test description',
            timestamp: new Date().toISOString(),
            read: false,
          },
        ],
        unreadCount: 1,
      });

      await useNotificationStore.getState().markAsRead('notif-01');
      const state = useNotificationStore.getState();
      expect(state.notifications[0].read).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('should broadcast an alert and append to notifications feed', async () => {
      vi.spyOn(notificationService, 'broadcastAlert').mockResolvedValue({
        success: true,
        broadcast_id: 'bcast-101',
      });

      await useNotificationStore.getState().broadcastAlert({
        title: 'Corridor Clearance Active',
        message: 'All units yield for priority transport',
        severity: 'CRITICAL',
        target_roles: ['AMBULANCE_DRIVER', 'DISPATCHER'],
      });

      const state = useNotificationStore.getState();
      const broadcastNotif = state.notifications.find((n) => n.title.includes('Corridor Clearance Active'));
      expect(broadcastNotif).toBeDefined();
    });
  });

  describe('Interactive Map Store (Khushi Shetty)', () => {
    it('should update viewport and toggle layers', () => {
      useMapStore.getState().setViewport([12.9304, 77.6202], 14);
      expect(useMapStore.getState().viewport.center).toEqual([12.9304, 77.6202]);
      expect(useMapStore.getState().viewport.zoom).toBe(14);

      useMapStore.getState().toggleLayer('traffic');
      expect(useMapStore.getState().layers.traffic).toBe(false);

      useMapStore.getState().toggleLayer('traffic');
      expect(useMapStore.getState().layers.traffic).toBe(true);
    });

    it('should set active route polyline and selected entity', () => {
      const polyline: [number, number][] = [[12.9716, 77.5946], [12.8953, 77.5986]];
      useMapStore.getState().setActiveRoutePolyline(polyline);
      useMapStore.getState().setSelectedEntity({ type: 'ambulance', id: 'amb-101' });

      expect(useMapStore.getState().activeRoutePolyline).toEqual(polyline);
      expect(useMapStore.getState().selectedEntity?.id).toBe('amb-101');
    });
  });
});
