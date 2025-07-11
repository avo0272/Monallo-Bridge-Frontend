import { useEffect } from 'react';

export function useWebSocket(onMessage: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8888');

    ws.onopen = () => {
      console.log('✅ WebSocket 已连接');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch (err) {
        console.error('消息解析失败:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket 已断开');
    };

    return () => {
      ws.close();
    };
  }, [onMessage]);
}
