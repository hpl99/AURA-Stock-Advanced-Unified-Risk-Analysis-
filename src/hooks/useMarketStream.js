import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useMarketStream = () => {
  const [liveData, setLiveData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    ws.current = new WebSocket('ws://127.0.0.1:8000/ws/market');

    ws.current.onopen = () => {
      setIsConnected(true);
      toast.success('Market Stream Connected', { id: 'ws-connect' });
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      setLiveData(prev => ({
        ...prev,
        [payload.ticker]: payload
      }));
      
      // Toast logic for >0.5% move
      if (Math.abs(payload.change) > 0.005) {
        toast(`Alert: ${payload.ticker} moved to $${payload.price} (${(payload.change * 100).toFixed(2)}%)`, {
           icon: payload.change > 0 ? '📈' : '📉',
           style: { 
             border: `1px solid ${payload.change > 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
             background: 'rgba(15,23,42,0.95)'
           },
           id: `alert-${payload.ticker}-${payload.timestamp}` // prevent spam of exact same timestamp
        });
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      toast.error('Market Stream Disconnected. Reconnecting...', { id: 'ws-disconnect' });
      // Auto-reconnect with 3s backoff
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = () => {
       ws.current.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect loop on unmount
        ws.current.close();
      }
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  return { liveData, isConnected };
};
