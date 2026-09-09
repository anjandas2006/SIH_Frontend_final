const API_BASE = '/api';

export const api = {
  // Auth
  async login(credentials: { username: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },

  async getCurrentUser() {
    const token = localStorage.getItem('bussense_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return res.json();
  },

  // Buses & Fleet
  async getBuses(status?: string, routeId?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (routeId) params.append('route_id', routeId);
    const res = await fetch(`${API_BASE}/buses?${params.toString()}`);
    return res.json();
  },

  async getBus(busId: string) {
    const res = await fetch(`${API_BASE}/buses/${busId}`);
    if (!res.ok) throw new Error('Bus not found');
    return res.json();
  },

  async getBusCameras(busId: string) {
    const res = await fetch(`${API_BASE}/buses/${busId}/cameras`);
    return res.json();
  },

  // Routes
  async getRoutes() {
    const res = await fetch(`${API_BASE}/routes`);
    return res.json();
  },

  async getRoutesRanking() {
    const res = await fetch(`${API_BASE}/routes/analytics/ranking`);
    return res.json();
  },

  async getOdMatrix() {
    const res = await fetch(`${API_BASE}/routes/od-matrix`);
    return res.json();
  },

  // Road Defects & Clustering
  async getRoadDefects(defectType?: string, severity?: string, status?: string) {
    const params = new URLSearchParams();
    if (defectType) params.append('defect_type', defectType);
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/road-defects?${params.toString()}`);
    return res.json();
  },

  async getRoadDefectDetail(defectId: string) {
    const res = await fetch(`${API_BASE}/road-defects/${defectId}`);
    return res.json();
  },

  async updateDefectStatus(defectId: string, status: string) {
    const res = await fetch(`${API_BASE}/road-defects/${defectId}/status?status=${status}`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Traffic
  async getTrafficSummary() {
    const res = await fetch(`${API_BASE}/traffic/summary`);
    return res.json();
  },

  async getTrafficEvents() {
    const res = await fetch(`${API_BASE}/traffic/events`);
    return res.json();
  },

  async getTrafficBottlenecks() {
    const res = await fetch(`${API_BASE}/traffic/bottlenecks`);
    return res.json();
  },

  // Incidents & OCR
  async getIncidents(status?: string, type?: string, severity?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('incident_type', type);
    if (severity) params.append('severity', severity);
    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    return res.json();
  },

  async getIncident(incidentId: string) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
    return res.json();
  },

  async updateIncidentStatus(incidentId: string, status: string, notes?: string) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  },

  async correctIncidentOcr(incidentId: string, corrected_plate: string, notes?: string) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/ocr-correct`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corrected_plate, notes })
    });
    return res.json();
  },

  // Alerts
  async getAlerts(severity?: string, isAcknowledged?: boolean) {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (isAcknowledged !== undefined) params.append('is_acknowledged', String(isAcknowledged));
    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    return res.json();
  },

  async getUnreadAlertsCount() {
    const res = await fetch(`${API_BASE}/alerts/unread-count`);
    return res.json();
  },

  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledged_by: acknowledgedBy })
    });
    return res.json();
  },

  async resolveAlert(alertId: string) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Video Analysis
  async getVideoSamples() {
    const res = await fetch(`${API_BASE}/video/samples`);
    return res.json();
  },

  async analyzeVideo(formData: FormData) {
    const res = await fetch(`${API_BASE}/video/analyze`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Analytics
  async getTrafficAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/traffic`);
    return res.json();
  },

  async getRoadHealthAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/road-health`);
    return res.json();
  },

  async getFleetAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/fleet`);
    return res.json();
  },

  async getAiPerformance() {
    const res = await fetch(`${API_BASE}/analytics/ai-performance`);
    return res.json();
  },

  // Reports
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    return res.json();
  },

  async generateReport(reportType: string, title: string, daysBack: number = 7) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: reportType, title, days_back: daysBack })
    });
    return res.json();
  },

  getExportCsvUrl(reportId: string) {
    return `${API_BASE}/reports/${reportId}/export-csv`;
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settingsData: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    return res.json();
  },

  // Simulation
  async getSimulationState() {
    const res = await fetch(`${API_BASE}/simulation/state`);
    return res.json();
  },

  async controlSimulation(payload: { action: string; speed_multiplier?: number; defect_type?: string; incident_type?: string }) {
    const res = await fetch(`${API_BASE}/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
