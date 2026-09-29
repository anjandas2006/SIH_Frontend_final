import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export type SystemMode = 'demo' | 'live';

interface SimulationContextType {
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;
  isRunning: boolean;
  speed: number;
  liveBuses: any[];
  liveEvents: any[];
  activeAlertsCount: number;
  latestAlert: any | null;
  toggleSimulation: () => Promise<void>;
  setSimulationSpeed: (spd: number) => Promise<void>;
  triggerDefectDemo: () => Promise<void>;
  triggerIncidentDemo: () => Promise<void>;
  dismissLatestAlert: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// 8 Realistic Kolkata Transit Corridors with Waypoints
const KOLKATA_ROUTES: Record<string, { name: string; waypoints: [number, number][] }> = {
  'R-101': {
    name: 'Howrah Station ⇄ Esplanade Central',
    waypoints: [
      [22.5850, 88.3426], [22.5841, 88.3512], [22.5835, 88.3590],
      [22.5760, 88.3530], [22.5700, 88.3520], [22.5650, 88.3525], [22.5640, 88.3515]
    ]
  },
  'R-102': {
    name: 'Salt Lake Sector V ⇄ Park Street',
    waypoints: [
      [22.5800, 88.4350], [22.5750, 88.4200], [22.5680, 88.4050],
      [22.5550, 88.3980], [22.5480, 88.3900], [22.5450, 88.3750], [22.5510, 88.3520]
    ]
  },
  'R-103': {
    name: 'Garia Bus Stand ⇄ Esplanade',
    waypoints: [
      [22.4650, 88.3750], [22.4900, 88.3720], [22.5150, 88.3650],
      [22.5350, 88.3550], [22.5500, 88.3520], [22.5640, 88.3515]
    ]
  },
  'R-104': {
    name: 'Dum Dum Metro ⇄ Howrah Station',
    waypoints: [
      [22.6220, 88.3780], [22.6020, 88.3720], [22.5950, 88.3680],
      [22.5850, 88.3640], [22.5841, 88.3512], [22.5850, 88.3426]
    ]
  },
  'R-105': {
    name: 'New Town Eco Park ⇄ Sealdah Station',
    waypoints: [
      [22.6050, 88.4650], [22.5900, 88.4500], [22.5750, 88.4200],
      [22.5680, 88.3950], [22.5670, 88.3710], [22.5665, 88.3700]
    ]
  },
  'R-106': {
    name: 'Shyambazar ⇄ Jadavpur University',
    waypoints: [
      [22.6020, 88.3720], [22.5820, 88.3700], [22.5650, 88.3710],
      [22.5380, 88.3680], [22.5150, 88.3650], [22.4900, 88.3720]
    ]
  },
  'R-107': {
    name: 'Behala Chowrasta ⇄ BBD Bagh',
    waypoints: [
      [22.4980, 88.3180], [22.5180, 88.3220], [22.5350, 88.3300],
      [22.5480, 88.3420], [22.5620, 88.3480], [22.5700, 88.3520]
    ]
  },
  'R-108': {
    name: 'Netaji Subhash Airport ⇄ Gariahat',
    waypoints: [
      [22.6450, 88.4420], [22.6100, 88.4350], [22.5800, 88.4250],
      [22.5550, 88.4050], [22.5350, 88.3850], [22.5150, 88.3650]
    ]
  }
};

// Seed 20 Fleet Transit Buses with Active Initial Coordinates
const INITIAL_FLEET = Array.from({ length: 20 }, (_, i) => {
  const num = (i + 1).toString().padStart(3, '0');
  const routeCodes = ['R-101', 'R-102', 'R-103', 'R-104', 'R-105', 'R-106', 'R-107', 'R-108'];
  const routeCode = routeCodes[i % routeCodes.length];
  const routeInfo = KOLKATA_ROUTES[routeCode];
  const wpIndex = i % routeInfo.waypoints.length;
  const [lat, lng] = routeInfo.waypoints[wpIndex];

  return {
    id: `bus-${num}`,
    bus_number: `BUS-${num}`,
    registration_number: `WB-04-E-1${num}`,
    route_code: routeCode,
    route_name: routeInfo.name,
    lat: lat + (Math.random() - 0.5) * 0.002,
    lng: lng + (Math.random() - 0.5) * 0.002,
    current_lat: lat,
    current_lng: lng,
    speed: Math.round(25 + Math.random() * 18),
    speed_kmh: Math.round(25 + Math.random() * 18),
    heading: Math.round(Math.random() * 360),
    status: 'ACTIVE',
    camera_status: '5_ACTIVE',
    ai_status: 'ONLINE',
    events_today: Math.round(15 + Math.random() * 40),
    _wpIndex: wpIndex,
    _forward: i % 2 === 0
  };
});

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemMode, setSystemModeState] = useState<SystemMode>(() => {
    return (localStorage.getItem('bussense_system_mode') as SystemMode) || 'demo';
  });

  const setSystemMode = (mode: SystemMode) => {
    setSystemModeState(mode);
    localStorage.setItem('bussense_system_mode', mode);
  };

  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [rawBuses, setRawBuses] = useState<any[]>(INITIAL_FLEET);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(6);
  const [latestAlert, setLatestAlert] = useState<any | null>(null);

  // In live mode, unless physical cameras transmit, active fleet is 0 units
  const liveBuses = systemMode === 'live' ? [] : rawBuses;

  // Active moving transport engine for Demo Mode
  useEffect(() => {
    if (systemMode !== 'demo' || !isRunning) return;

    const interval = setInterval(() => {
      setRawBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          const routeCode = bus.route_code || 'R-101';
          const route = KOLKATA_ROUTES[routeCode] || KOLKATA_ROUTES['R-101'];
          const waypoints = route.waypoints;
          const numWp = waypoints.length;
          if (numWp < 2) return bus;

          let forward = bus._forward !== false;
          let idx = typeof bus._wpIndex === 'number' ? bus._wpIndex : 0;

          if (forward) {
            idx += 1;
            if (idx >= numWp) {
              idx = numWp - 2;
              forward = false;
            }
          } else {
            idx -= 1;
            if (idx < 0) {
              idx = 1;
              forward = true;
            }
          }

          const targetWp = waypoints[idx];
          const jitterLat = targetWp[0] + (Math.random() - 0.5) * 0.0003;
          const jitterLng = targetWp[1] + (Math.random() - 0.5) * 0.0003;

          const prevLat = bus.lat || bus.current_lat;
          const prevLng = bus.lng || bus.current_lng;
          const dlat = jitterLat - prevLat;
          const dlng = jitterLng - prevLng;
          const heading = Math.round(((Math.atan2(dlng, dlat) * 180) / Math.PI + 360) % 360);
          const newSpeed = Math.round(24 + Math.random() * 16);

          return {
            ...bus,
            lat: jitterLat,
            lng: jitterLng,
            current_lat: jitterLat,
            current_lng: jitterLng,
            speed: newSpeed,
            speed_kmh: newSpeed,
            heading,
            _wpIndex: idx,
            _forward: forward
          };
        });
      });
    }, Math.max(800, 1600 / speed));

    return () => clearInterval(interval);
  }, [systemMode, isRunning, speed]);

  // WebSockets message callbacks
  const handleFleetMessage = useCallback((data: any) => {
    if (data.type === 'FLEET_UPDATE' && Array.isArray(data.buses) && data.buses.length > 0) {
      setRawBuses((prev) => {
        // Merge backend live telemetry with local metadata
        return data.buses.map((b: any, i: number) => ({
          ...(prev[i] || {}),
          ...b,
          lat: b.lat || b.current_lat,
          lng: b.lng || b.current_lng,
          speed: b.speed || b.speed_kmh || 30
        }));
      });
    }
  }, []);

  const handleEventsMessage = useCallback((data: any) => {
    if (data.type === 'AI_DETECTION' || data.type === 'TRAFFIC_UPDATE' || data.type === 'DEFECT') {
      const formatted = {
        id: data.id || `live-${Date.now()}`,
        type: data.category === 'POTHOLE' || data.defect_type === 'POTHOLE' ? 'DEFECT' : data.type || 'AI_DETECTION',
        title: data.category ? `${data.category.replace('_', ' ')} Detected` : (data.title || 'Live Edge Detection'),
        bus: data.bus_number || data.bus_id || 'BUS-024 [Live Edge]',
        location: data.address_description || data.location || 'Urban Corridor Uplink',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: data.confidence ? (typeof data.confidence === 'number' ? `${Math.round(data.confidence * 100)}%` : data.confidence) : '96%',
        severity: data.severity || 'HIGH',
        cluster_code: data.cluster_code || 'LIVE-STREAM',
        evidence: data.evidence_image || data.evidence || '/evidence/sample_pothole.jpg',
        category: data.category || data.defect_type || 'POTHOLE'
      };
      setLiveEvents((prev) => [formatted, ...prev.slice(0, 29)]);
    }
  }, []);

  const handleAlertsMessage = useCallback((data: any) => {
    if (data.type === 'NEW_ALERT') {
      setActiveAlertsCount((prev) => prev + 1);
      setLatestAlert(data);

      const alertEvent = {
        id: `alert-${Date.now()}`,
        type: 'INCIDENT',
        title: data.title || 'Critical Incident Alert',
        bus: data.bus_id || 'BUS-024',
        location: data.location || 'Urban Corridor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: '95%',
        severity: data.severity || 'CRITICAL',
        cluster_code: data.alert_code || 'LIVE-ALERT',
        evidence: '/evidence/sample_hit_and_run.jpg',
        category: 'INCIDENT'
      };
      setLiveEvents((prev) => [alertEvent, ...prev.slice(0, 29)]);
    }
  }, []);

  // WebSockets hooks
  const { isConnected: wsFleetConnected } = useWebSocket('/ws/fleet', handleFleetMessage);
  const { isConnected: wsEventsConnected } = useWebSocket('/ws/events', handleEventsMessage);
  const { isConnected: wsAlertsConnected } = useWebSocket('/ws/alerts', handleAlertsMessage);

  // Fallback polling for live buses when WebSockets are disconnected
  useEffect(() => {
    const fetchFleet = () => {
      api.getBuses().then((buses) => {
        if (Array.isArray(buses) && buses.length > 0) {
          setRawBuses((prev) => {
            return buses.map((b: any, i: number) => ({
              ...(prev[i] || {}),
              ...b,
              lat: b.current_lat || b.lat,
              lng: b.current_lng || b.lng,
              speed: b.speed_kmh || b.speed
            }));
          });
        }
      }).catch(() => {});
    };

    fetchFleet();

    if (!wsFleetConnected) {
      const interval = setInterval(fetchFleet, 5000);
      return () => clearInterval(interval);
    }
  }, [wsFleetConnected]);

  const toggleSimulation = async () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    try {
      await api.controlSimulation({ action: nextRunning ? 'start' : 'pause' });
    } catch {}
  };

  const setSimulationSpeed = async (newSpeed: number) => {
    setSpeed(newSpeed);
    try {
      await api.controlSimulation({ action: 'set_speed', speed_multiplier: newSpeed });
    } catch {}
  };

  const triggerDefectDemo = async () => {
    try {
      await api.controlSimulation({ action: 'trigger_defect', defect_type: 'POTHOLE' });
    } catch (e) {
      // Local fallback event creation if backend disconnected
      const fallbackEvent = {
        id: `local-${Date.now()}`,
        type: 'DEFECT',
        title: 'Pothole Detected [Simulated]',
        bus: 'BUS-024',
        location: 'MG Road / Central Ave Corridor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: '95%',
        severity: 'HIGH',
        cluster_code: 'POTHOLE-LIVE',
        evidence: '/evidence/sample_pothole.jpg',
        category: 'POTHOLE'
      };
      setLiveEvents((prev) => [fallbackEvent, ...prev]);
    }
  };

  const triggerIncidentDemo = async () => {
    try {
      await api.controlSimulation({ action: 'trigger_incident', incident_type: 'HIT_AND_RUN' });
    } catch (e) {
      const fallbackIncident = {
        id: `local-inc-${Date.now()}`,
        type: 'INCIDENT',
        title: 'Hit-and-Run Collision Flagged',
        bus: 'BUS-024',
        location: 'Bowbazar Crossing',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: '92%',
        severity: 'CRITICAL',
        cluster_code: 'INCIDENT-LIVE',
        evidence: '/evidence/sample_hit_and_run.jpg',
        category: 'INCIDENT'
      };
      setLiveEvents((prev) => [fallbackIncident, ...prev]);
      setActiveAlertsCount((c) => c + 1);
    }
  };

  const dismissLatestAlert = () => {
    setLatestAlert(null);
  };

  return (
    <SimulationContext.Provider
      value={{
        systemMode,
        setSystemMode,
        isRunning,
        speed,
        liveBuses,
        liveEvents,
        activeAlertsCount,
        latestAlert,
        toggleSimulation,
        setSimulationSpeed,
        triggerDefectDemo,
        triggerIncidentDemo,
        dismissLatestAlert
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
};
