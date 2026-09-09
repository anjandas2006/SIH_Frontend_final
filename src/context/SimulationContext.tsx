import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

interface SimulationContextType {
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

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(6);
  const [latestAlert, setLatestAlert] = useState<any | null>(null);

  // WebSockets message callbacks
  const handleFleetMessage = useCallback((data: any) => {
    if (data.type === 'FLEET_UPDATE' && Array.isArray(data.buses)) {
      setLiveBuses(data.buses);
    }
  }, []);

  const handleEventsMessage = useCallback((data: any) => {
    if (data.type === 'AI_DETECTION' || data.type === 'TRAFFIC_UPDATE') {
      setLiveEvents(prev => [data, ...prev.slice(0, 19)]);
    }
  }, []);

  const handleAlertsMessage = useCallback((data: any) => {
    if (data.type === 'NEW_ALERT') {
      setActiveAlertsCount(prev => prev + 1);
      setLatestAlert(data);
    }
  }, []);

  // Initial and polling data synchronizers
  const { isConnected: wsFleetConnected } = useWebSocket('/ws/fleet', handleFleetMessage);
  const { isConnected: wsEventsConnected } = useWebSocket('/ws/events', handleEventsMessage);
  const { isConnected: wsAlertsConnected } = useWebSocket('/ws/alerts', handleAlertsMessage);

  // Fallback polling for live buses when WebSockets are disconnected
  useEffect(() => {
    const fetchFleet = () => {
      api.getBuses().then(buses => {
        if (Array.isArray(buses) && buses.length > 0) {
          setLiveBuses(buses);
        }
      }).catch(() => {});
    };

    fetchFleet();

    if (!wsFleetConnected) {
      const interval = setInterval(fetchFleet, 4000);
      return () => clearInterval(interval);
    }
  }, [wsFleetConnected]);

  // Fallback polling for live traffic events when WebSockets are disconnected
  useEffect(() => {
    const fetchEvents = () => {
      api.getTrafficEvents().then(events => {
        if (Array.isArray(events) && events.length > 0) {
          setLiveEvents(events.slice(0, 20));
        }
      }).catch(() => {});
    };

    fetchEvents();

    if (!wsEventsConnected) {
      const interval = setInterval(fetchEvents, 8000);
      return () => clearInterval(interval);
    }
  }, [wsEventsConnected]);

  // Fallback polling for unread alerts
  useEffect(() => {
    const fetchAlerts = () => {
      api.getUnreadAlertsCount().then(res => {
        if (res && res.unacknowledged_count !== undefined) {
          setActiveAlertsCount(res.unacknowledged_count);
        }
      }).catch(() => {});
    };

    fetchAlerts();

    if (!wsAlertsConnected) {
      const interval = setInterval(fetchAlerts, 10000);
      return () => clearInterval(interval);
    }
  }, [wsAlertsConnected]);


  const toggleSimulation = async () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    await api.controlSimulation({ action: nextRunning ? 'start' : 'pause' });
  };

  const setSimulationSpeed = async (newSpeed: number) => {
    setSpeed(newSpeed);
    await api.controlSimulation({ action: 'set_speed', speed_multiplier: newSpeed });
  };

  const triggerDefectDemo = async () => {
    await api.controlSimulation({ action: 'trigger_defect', defect_type: 'POTHOLE' });
  };

  const triggerIncidentDemo = async () => {
    await api.controlSimulation({ action: 'trigger_incident', incident_type: 'HIT_AND_RUN' });
  };

  const dismissLatestAlert = () => {
    setLatestAlert(null);
  };

  return (
    <SimulationContext.Provider
      value={{
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
