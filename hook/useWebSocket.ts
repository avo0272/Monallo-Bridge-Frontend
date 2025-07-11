import { useEffect } from 'react';

export function useWebSocket(onMessage: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8888');

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [onMessage]);
}
