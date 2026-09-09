import { useEffect, useRef, useState, useCallback } from 'react';

function getWebSocketUrl(path: string): string {
  // In dev, use local proxy if on localhost
  if (import.meta.env.DEV) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}${path}`;
  }

  // Explicit WS URL override
  const wsEnv = import.meta.env.VITE_WS_URL;
  if (wsEnv) {
    const clean = wsEnv.replace(/\/$/, '');
    return `${clean}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // Derive from backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://sih-backend-delta.vercel.app';
  const cleanBackend = backendUrl.replace(/\/$/, '').replace(/^http/, 'ws');
  return `${cleanBackend}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function useWebSocket(path: string, onMessage: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (retryCountRef.current >= maxRetries) {
      // Backend does not support WebSockets (e.g. serverless Vercel function). Gracefully stop retrying.
      return;
    }

    const url = getWebSocketUrl(path);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error('[WebSocket JSON parse error]', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        retryCountRef.current += 1;
        if (retryCountRef.current < maxRetries) {
          const backoff = Math.min(10000, 2000 * Math.pow(1.5, retryCountRef.current));
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, backoff);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn('[WebSocket connection error - HTTP polling active]', err);
      setIsConnected(false);
    }
  }, [path, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}

