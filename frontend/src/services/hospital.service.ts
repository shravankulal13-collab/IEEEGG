// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital API Client Service & India Trauma Directory
// ============================================================

import { apiRequest } from './api';

export interface HospitalData {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  emergency_phone?: string;
  trauma_level?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  total_beds?: number;
  available_beds?: number;
  total_icu_beds?: number;
  available_icu_beds?: number;
  total_ventilators?: number;
  available_ventilators?: number;
  total_oxygen_units?: number;
  available_oxygen_units?: number;
  blood_bank_status?: 'ADEQUATE' | 'CRITICAL' | 'RESTOCKED';
  operational_status?: 'OPEN' | 'DIVERT' | 'FULL';
  active?: boolean;
  availableICUBeds?: number;
  availableEmergencyBeds?: number;
  onCallSpecialists?: string[];
  distance_km?: number;
  eta_minutes?: number;
}

export interface DoctorOnCall {
  id: string;
  name: string;
  specialty: string;
  department: string;
  phone: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'SURGERY' | 'OFF_DUTY';
  shift_end: string;
}

export interface IncomingPatient {
  incident_id: string;
  ambulance_number: string;
  driver_name: string;
  patient_condition: string;
  triage_level: 'RED' | 'YELLOW' | 'GREEN';
  eta_minutes: number;
  vitals: {
    heart_rate?: number;
    bp?: string;
    spo2?: number;
  };
}

export interface HospitalDashboardData {
  hospital: HospitalData;
  doctors: DoctorOnCall[];
  incoming_patients: IncomingPatient[];
  occupancy_rate: number;
  icu_occupancy_rate: number;
  ventilator_occupancy_rate: number;
  recent_admissions_count: number;
}

export interface HospitalCapacityUpdate {
  type: 'ICU' | 'EMERGENCY';
  count: number;
}

export const PAN_INDIA_HOSPITALS: HospitalData[] = [
  // --- BENGALURU ---
  {
    id: 'hosp-blr-001',
    name: 'Apollo Hospital Bannerghatta',
    code: 'KA-BLR-001',
    address: '154/11, Opp. IIMB, Bannerghatta Main Rd',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.8953,
    longitude: 77.5986,
    phone: '+918026304050',
    emergency_phone: '+918026304055',
    trauma_level: 'LEVEL_1',
    total_beds: 350,
    available_beds: 42,
    total_icu_beds: 45,
    available_icu_beds: 8,
    total_ventilators: 28,
    available_ventilators: 6,
    total_oxygen_units: 120,
    available_oxygen_units: 94,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Rajesh Sharma (Trauma Surgery)', 'Dr. Ananya Iyer (Interventional Cardiology)', 'Dr. Suresh Reddy (Critical Care)'],
  },
  {
    id: 'hosp-blr-002',
    name: 'Fortis Hospital Cunningham Road',
    code: 'KA-BLR-002',
    address: '14, Cunningham Road, Vasanth Nagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9882,
    longitude: 77.5978,
    phone: '+918041994444',
    emergency_phone: '+918041994455',
    trauma_level: 'LEVEL_1',
    total_beds: 220,
    available_beds: 28,
    total_icu_beds: 30,
    available_icu_beds: 5,
    total_ventilators: 20,
    available_ventilators: 4,
    total_oxygen_units: 90,
    available_oxygen_units: 72,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Priya Nair (Neurosurgery)', 'Dr. Karthik Hegde (Resuscitation)'],
  },
  {
    id: 'hosp-blr-003',
    name: 'Manipal Hospital Old Airport Road',
    code: 'KA-BLR-003',
    address: '98, HAL Old Airport Road, Kodihalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9592,
    longitude: 77.6534,
    phone: '+918025024444',
    emergency_phone: '+918025024455',
    trauma_level: 'LEVEL_1',
    total_beds: 400,
    available_beds: 55,
    total_icu_beds: 60,
    available_icu_beds: 11,
    total_ventilators: 35,
    available_ventilators: 9,
    total_oxygen_units: 150,
    available_oxygen_units: 128,
    blood_bank_status: 'RESTOCKED',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Meera Nambiar (Cardiothoracic Surgery)', 'Dr. Arvind Swamy (Pediatric Emergency)'],
  },
  {
    id: 'hosp-blr-004',
    name: 'Victoria Hospital (BMCRI Trauma Care)',
    code: 'KA-BLR-004',
    address: 'Fort Road, Near City Market, Kalasipalya',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9634,
    longitude: 77.5746,
    phone: '+918026701150',
    emergency_phone: '+918026701155',
    trauma_level: 'LEVEL_1',
    total_beds: 600,
    available_beds: 85,
    total_icu_beds: 50,
    available_icu_beds: 14,
    total_ventilators: 40,
    available_ventilators: 12,
    total_oxygen_units: 200,
    available_oxygen_units: 165,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. B. R. Chandrashekar (Mass Casualty)', 'Dr. Shwetha Patil (Orthopedic Trauma)'],
  },
  {
    id: 'hosp-blr-005',
    name: 'Narayana Health City (Mazumdar Shaw)',
    code: 'KA-BLR-005',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.8122,
    longitude: 77.6934,
    phone: '+918071222222',
    emergency_phone: '+918071222255',
    trauma_level: 'LEVEL_1',
    total_beds: 500,
    available_beds: 72,
    total_icu_beds: 55,
    available_icu_beds: 12,
    total_ventilators: 45,
    available_ventilators: 15,
    total_oxygen_units: 180,
    available_oxygen_units: 140,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Devi Prasad Shetty (Cardiac Surgery)', 'Dr. Harish Kumar (Vascular Surgery)'],
  },

  // --- DELHI NCR ---
  {
    id: 'hosp-del-001',
    name: 'AIIMS New Delhi (Apex Trauma Center)',
    code: 'DL-DEL-001',
    address: 'Sri Aurobindo Marg, Ansari Nagar, Ring Road',
    city: 'Delhi NCR',
    state: 'Delhi',
    latitude: 28.5672,
    longitude: 77.2100,
    phone: '+911126588500',
    emergency_phone: '+911126588700',
    trauma_level: 'LEVEL_1',
    total_beds: 750,
    available_beds: 96,
    total_icu_beds: 80,
    available_icu_beds: 18,
    total_ventilators: 65,
    available_ventilators: 21,
    total_oxygen_units: 300,
    available_oxygen_units: 260,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Sanjeev Bhoi (Emergency Medicine)', 'Dr. Amit Gupta (Trauma Surgery)', 'Dr. Sumit Sinha (Neurosurgery)'],
  },
  {
    id: 'hosp-del-002',
    name: 'Max Super Speciality Hospital Saket',
    code: 'DL-DEL-002',
    address: '1, 2, Press Enclave Marg, Saket',
    city: 'Delhi NCR',
    state: 'Delhi',
    latitude: 28.5284,
    longitude: 77.2119,
    phone: '+911126515050',
    emergency_phone: '+911126515099',
    trauma_level: 'LEVEL_1',
    total_beds: 500,
    available_beds: 64,
    total_icu_beds: 65,
    available_icu_beds: 14,
    total_ventilators: 40,
    available_ventilators: 11,
    total_oxygen_units: 190,
    available_oxygen_units: 160,
    blood_bank_status: 'RESTOCKED',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Rohit Verma (Interventional Cardiology)', 'Dr. Nandini Saxena (Critical Care)'],
  },
  {
    id: 'hosp-del-003',
    name: 'Medanta - The Medicity Gurugram',
    code: 'HR-GUR-001',
    address: 'CH Bakhtawar Singh Rd, Sector 38',
    city: 'Delhi NCR',
    state: 'Haryana',
    latitude: 28.4394,
    longitude: 77.0425,
    phone: '+911244141414',
    emergency_phone: '+911244141499',
    trauma_level: 'LEVEL_1',
    total_beds: 1250,
    available_beds: 140,
    total_icu_beds: 120,
    available_icu_beds: 26,
    total_ventilators: 90,
    available_ventilators: 28,
    total_oxygen_units: 450,
    available_oxygen_units: 390,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Naresh Trehan (Cardiac Sciences)', 'Dr. Yatin Mehta (Critical Care Medicine)'],
  },

  // --- MUMBAI ---
  {
    id: 'hosp-mum-001',
    name: 'Lilavati Hospital & Research Centre',
    code: 'MH-MUM-001',
    address: 'A-791, Bandra Reclamation, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0514,
    longitude: 72.8295,
    phone: '+912226751000',
    emergency_phone: '+912226751099',
    trauma_level: 'LEVEL_1',
    total_beds: 320,
    available_beds: 38,
    total_icu_beds: 42,
    available_icu_beds: 9,
    total_ventilators: 30,
    available_ventilators: 8,
    total_oxygen_units: 130,
    available_oxygen_units: 110,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Nitin Dange (Neurosurgery)', 'Dr. Prahlad Prabhudesai (Pulmonology)'],
  },
  {
    id: 'hosp-mum-002',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    code: 'MH-MUM-002',
    address: 'Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.1312,
    longitude: 72.8252,
    phone: '+912242696969',
    emergency_phone: '+912242699999',
    trauma_level: 'LEVEL_1',
    total_beds: 750,
    available_beds: 82,
    total_icu_beds: 70,
    available_icu_beds: 15,
    total_ventilators: 50,
    available_ventilators: 14,
    total_oxygen_units: 260,
    available_oxygen_units: 215,
    blood_bank_status: 'RESTOCKED',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Ram Narain (Emergency Director)', 'Dr. Manish Agarwal (Orthopedic Oncology)'],
  },
  {
    id: 'hosp-mum-003',
    name: 'KEM Hospital & Trauma Center Parel',
    code: 'MH-MUM-003',
    address: 'Acharya Donde Marg, Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0028,
    longitude: 72.8427,
    phone: '+912224107000',
    emergency_phone: '+912224107555',
    trauma_level: 'LEVEL_1',
    total_beds: 800,
    available_beds: 110,
    total_icu_beds: 65,
    available_icu_beds: 12,
    total_ventilators: 45,
    available_ventilators: 10,
    total_oxygen_units: 280,
    available_oxygen_units: 230,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Sangeeta Ravat (Neurology)', 'Dr. Chetan Kantharia (Surgical Gastroenterology)'],
  },

  // --- HYDERABAD ---
  {
    id: 'hosp-hyd-001',
    name: 'Apollo Hospitals Jubilee Hills',
    code: 'TS-HYD-001',
    address: 'Road No 72, Opp. Bharatiya Vidya Bhavan, Film Nagar',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4156,
    longitude: 78.4124,
    phone: '+914023607777',
    emergency_phone: '+914023607799',
    trauma_level: 'LEVEL_1',
    total_beds: 450,
    available_beds: 58,
    total_icu_beds: 50,
    available_icu_beds: 11,
    total_ventilators: 38,
    available_ventilators: 9,
    total_oxygen_units: 160,
    available_oxygen_units: 135,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. K. Hari Prasad (Emergency Medicine)', 'Dr. B. Somaraju (Cardiology)'],
  },
  {
    id: 'hosp-hyd-002',
    name: 'Continental Hospitals Gachibowli',
    code: 'TS-HYD-002',
    address: 'Plot No. 3, Road No. 2, IT & Financial District, Nanakramguda',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4198,
    longitude: 78.3486,
    phone: '+914067000000',
    emergency_phone: '+914067000999',
    trauma_level: 'LEVEL_1',
    total_beds: 350,
    available_beds: 46,
    total_icu_beds: 40,
    available_icu_beds: 8,
    total_ventilators: 25,
    available_ventilators: 7,
    total_oxygen_units: 120,
    available_oxygen_units: 102,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Guru N. Reddy (Gastroenterology)', 'Dr. Pradeep Kumar (Critical Care)'],
  },

  // --- CHENNAI ---
  {
    id: 'hosp-chn-001',
    name: 'Apollo Hospitals Greams Road',
    code: 'TN-CHN-001',
    address: '21 Greams Lane, Off Greams Road, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0604,
    longitude: 80.2496,
    phone: '+914428290200',
    emergency_phone: '+914428293333',
    trauma_level: 'LEVEL_1',
    total_beds: 550,
    available_beds: 68,
    total_icu_beds: 60,
    available_icu_beds: 14,
    total_ventilators: 42,
    available_ventilators: 12,
    total_oxygen_units: 190,
    available_oxygen_units: 160,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Prathap C. Reddy (Founder / Advisory)', 'Dr. M. R. Girinath (Cardiothoracic)'],
  },
  {
    id: 'hosp-chn-002',
    name: 'Fortis Malar Hospital Adyar',
    code: 'TN-CHN-002',
    address: 'No. 52, 1st Main Rd, Gandhi Nagar, Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0067,
    longitude: 80.2570,
    phone: '+914442892222',
    emergency_phone: '+914442892299',
    trauma_level: 'LEVEL_1',
    total_beds: 180,
    available_beds: 24,
    total_icu_beds: 25,
    available_icu_beds: 6,
    total_ventilators: 18,
    available_ventilators: 5,
    total_oxygen_units: 80,
    available_oxygen_units: 68,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. K. R. Balakrishnan (Heart Transplant)', 'Dr. Suresh Rao (Cardiac Anesthesia)'],
  },

  // --- KOLKATA ---
  {
    id: 'hosp-kol-001',
    name: 'Apollo Multispeciality Hospitals EM Bypass',
    code: 'WB-KOL-001',
    address: '58, Canal Circular Road, Kadapara, Phool Bagan',
    city: 'Kolkata',
    state: 'West Bengal',
    latitude: 22.5714,
    longitude: 88.4042,
    phone: '+913323203040',
    emergency_phone: '+913323202122',
    trauma_level: 'LEVEL_1',
    total_beds: 510,
    available_beds: 62,
    total_icu_beds: 55,
    available_icu_beds: 12,
    total_ventilators: 36,
    available_ventilators: 8,
    total_oxygen_units: 180,
    available_oxygen_units: 152,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Sudipta Mukherjee (Emergency Medicine)', 'Dr. Debabrata Roy (Cardiology)'],
  },

  // --- PUNE ---
  {
    id: 'hosp-pun-001',
    name: 'Ruby Hall Clinic Sassoon Road',
    code: 'MH-PUN-001',
    address: '40, Sassoon Rd, Sangamvadi',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5314,
    longitude: 73.8744,
    phone: '+912066455100',
    emergency_phone: '+912066455199',
    trauma_level: 'LEVEL_1',
    total_beds: 450,
    available_beds: 54,
    total_icu_beds: 50,
    available_icu_beds: 10,
    total_ventilators: 32,
    available_ventilators: 7,
    total_oxygen_units: 150,
    available_oxygen_units: 124,
    blood_bank_status: 'ADEQUATE',
    operational_status: 'OPEN',
    onCallSpecialists: ['Dr. Purvez Grant (Managing Trustee & Cardiologist)', 'Dr. Sanjay Pathare (Emergency Services)'],
  },
];

const DEFAULT_DOCTORS: DoctorOnCall[] = [
  { id: 'doc-1', name: 'Dr. Rajesh Sharma', specialty: 'Trauma & Emergency Surgery', department: 'Emergency Medicine', phone: '+919845011221', status: 'ON_DUTY', shift_end: '08:00 AM' },
  { id: 'doc-2', name: 'Dr. Ananya Iyer', specialty: 'Interventional Cardiology', department: 'Cardiology', phone: '+919845011222', status: 'AVAILABLE', shift_end: '02:00 PM' },
  { id: 'doc-3', name: 'Dr. Suresh Reddy', specialty: 'Critical Care Medicine', department: 'ICU / Critical Care', phone: '+919845011223', status: 'ON_DUTY', shift_end: '12:00 PM' },
  { id: 'doc-4', name: 'Dr. Priya Nair', specialty: 'Neurosurgery & Stroke Care', department: 'Neuro Sciences', phone: '+919845022331', status: 'AVAILABLE', shift_end: '06:00 PM' },
  { id: 'doc-5', name: 'Dr. Karthik Hegde', specialty: 'Emergency Resuscitation', department: 'Trauma Care', phone: '+919845022332', status: 'SURGERY', shift_end: '04:00 PM' },
  { id: 'doc-6', name: 'Dr. Arvind Swamy', specialty: 'Pediatric Emergency Care', department: 'Pediatrics', phone: '+919845033442', status: 'ON_DUTY', shift_end: '10:00 PM' },
];

export class HospitalService {
  async getAllHospitals(): Promise<HospitalData[]> {
    try {
      const res = await apiRequest<{ success: boolean; data: HospitalData[] }>('/hospitals');
      if (res?.data && res.data.length > 0) {
        // Blend backend records with pan-India directory if backend only has partial records
        const ids = new Set(res.data.map(h => h.id));
        const merged = [...res.data];
        for (const hosp of PAN_INDIA_HOSPITALS) {
          if (!ids.has(hosp.id)) {
            merged.push(hosp);
          }
        }
        return merged;
      }
    } catch {
      // Graceful fallback during demo or offline mode
    }
    return PAN_INDIA_HOSPITALS;
  }

  async getHospitalDashboard(hospitalId: string): Promise<HospitalDashboardData> {
    try {
      const res = await apiRequest<{ success: boolean; data: HospitalDashboardData }>(`/hospitals/${hospitalId}/dashboard`);
      if (res?.data && res.data.hospital) {
        return res.data;
      }
    } catch {
      // Fallback below
    }

    const matchedHosp = PAN_INDIA_HOSPITALS.find(h => h.id === hospitalId) || PAN_INDIA_HOSPITALS[0];
    const totalBeds = matchedHosp.total_beds || 350;
    const availBeds = matchedHosp.available_beds || 42;
    const occupancy = Number((((totalBeds - availBeds) / totalBeds) * 100).toFixed(1));

    return {
      hospital: matchedHosp,
      doctors: DEFAULT_DOCTORS,
      incoming_patients: [
        {
          incident_id: 'INC-2026-904',
          ambulance_number: 'AMB-104 (ALS Unit)',
          driver_name: 'Vikram Singh',
          patient_condition: 'Acute STEMI / Severe Chest Angina',
          triage_level: 'RED',
          eta_minutes: 4,
          vitals: { heart_rate: 118, bp: '158/96 mmHg', spo2: 94 },
        },
        {
          incident_id: 'INC-2026-908',
          ambulance_number: 'AMB-108 (BLS Unit)',
          driver_name: 'Kavita Rao',
          patient_condition: 'High-Velocity Motor Collision (Polytrauma)',
          triage_level: 'RED',
          eta_minutes: 8,
          vitals: { heart_rate: 132, bp: '92/60 mmHg', spo2: 91 },
        },
      ],
      occupancy_rate: occupancy,
      icu_occupancy_rate: 78.4,
      ventilator_occupancy_rate: 62.5,
      recent_admissions_count: 14,
    };
  }

  async updateCapacity(hospitalId: string, payload: HospitalCapacityUpdate): Promise<HospitalData> {
    try {
      const res = await apiRequest<{ success: boolean; data: HospitalData }>(`/hospitals/${hospitalId}/capacity`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res?.data) return res.data;
    } catch {
      // Fallback
    }

    const matchedHosp = PAN_INDIA_HOSPITALS.find(h => h.id === hospitalId) || PAN_INDIA_HOSPITALS[0];
    if (payload.type === 'ICU') {
      matchedHosp.available_icu_beds = payload.count;
    } else {
      matchedHosp.available_beds = payload.count;
    }
    return { ...matchedHosp };
  }

  async updateSpecialists(hospitalId: string, specialists: string[]): Promise<void> {
    await apiRequest(`/hospitals/${hospitalId}/roster`, {
      method: 'PUT',
      body: JSON.stringify({ specialists }),
    }).catch(() => {});
  }

  async updateDoctorStatus(hospitalId: string, doctorId: string, status: DoctorOnCall['status']): Promise<void> {
    await apiRequest(`/hospitals/${hospitalId}/doctors/${doctorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }
}

export const hospitalService = new HospitalService();
