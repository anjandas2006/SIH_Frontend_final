export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'Administrator' | 'Transport Authority' | 'Traffic Officer' | 'Maintenance Officer' | 'Analyst';
  is_active: boolean;
}

export interface Camera {
  id: string;
  position: 'FRONT' | 'REAR' | 'LEFT' | 'RIGHT' | 'CABIN';
  resolution: string;
  fps: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

export interface Bus {
  id: string;
  bus_number: string;
  registration_number: string;
  route_id?: string;
  route_name?: string;
  route_code?: string;
  current_lat: number;
  current_lng: number;
  speed_kmh: number;
  heading: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  camera_status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  ai_status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  last_communication: string;
  events_today_count: number;
  cameras?: Camera[];
}

export interface Route {
  id: string;
  name: string;
  route_code: string;
  origin: string;
  destination: string;
  color: string;
  waypoints_json: [number, number, string][];
  distance_km: number;
  avg_journey_mins: number;
  status: string;
  active_buses_count?: number;
}

export interface RoadDefectCluster {
  id: string;
  cluster_code: string;
  defect_type: string;
  latitude: number;
  longitude: number;
  confidence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'UNRESOLVED' | 'UNDER_REVIEW' | 'WORK_ORDER_ISSUED' | 'REPAIRED' | 'REJECTED';
  confirmed_buses_count: number;
  total_detections: number;
  first_detected_at: string;
  last_detected_at: string;
  address_description?: string;
  evidence_image?: string;
}

export interface TrafficEvent {
  id: string;
  bus_id: string;
  route_id?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  density_percent: number;
  density_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  avg_speed_kmh: number;
  vehicle_count: number;
  cars_count: number;
  bikes_count: number;
  buses_count: number;
  trucks_count: number;
  autos_count: number;
  timestamp: string;
  duration_minutes: number;
}

export interface Incident {
  id: string;
  incident_code: string;
  incident_type: 'HIT_AND_RUN' | 'RASH_DRIVING' | 'PEDESTRIAN_SAFETY_RISK' | 'ROAD_HAZARD';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vehicle_track_id?: string;
  detected_plate?: string;
  corrected_plate?: string;
  plate_confidence: number;
  tracking_confidence: number;
  bus_id: string;
  route_id?: string;
  latitude: number;
  longitude: number;
  location_name: string;
  timestamp: string;
  evidence_image?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOLVED' | 'FALSE_POSITIVE';
  notes?: string;
}

export interface Alert {
  id: string;
  alert_code: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  bus_id?: string;
  route_id?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  is_read: boolean;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  resolved_at?: string;
}

export interface DashboardSummary {
  active_buses: number;
  total_buses: number;
  ai_events_today: number;
  potholes_detected: number;
  traffic_hotspots: number;
  active_incidents: number;
  waterlogging_points: number;
  unresolved_defects: number;
  recent_events: any[];
  traffic_metrics: {
    overall_density: number;
    overall_status: string;
    avg_speed: number;
    hourly_trend: any[];
  };
  road_health_metrics: {
    healthy_percentage: number;
    damaged_percentage: number;
    unresolved: number;
    under_review: number;
    work_order_issued: number;
    repaired: number;
    rm_pci_index?: number;
    pci_rating_label?: string;
    surveyed_network_km?: number;
    level_1_excellent_pct?: number;
    level_2_good_pct?: number;
    level_3_fair_pct?: number;
    level_4_poor_pct?: number;
    level_5_critical_pct?: number;
  };
  incident_summary: Record<string, number>;
  fleet_status: Record<string, number>;
}
