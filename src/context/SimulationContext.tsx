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

  // Poll unread count on startup
  useEffect(() => {
    api.getUnreadAlertsCount().then(res => {
      setActiveAlertsCount(res.unacknowledged_count || 6);
    }).catch(() => {});
  }, []);

  // WebSockets
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

  useWebSocket('/ws/fleet', handleFleetMessage);
  useWebSocket('/ws/events', handleEventsMessage);
  useWebSocket('/ws/alerts', handleAlertsMessage);

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
