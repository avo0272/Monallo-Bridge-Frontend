import { useEffect } from 'react';

export function useWebSocket(onMessage: (data: any) => void, walletAddress?: string) {
  useEffect(() => {
    // Only create WebSocket connection when wallet address exists
    if (!walletAddress) {
      console.log('WebSocket connection not established: wallet not connected');
      return;
    }
    
    // Create WebSocket connection and add wallet address as query parameter
    const ws = new WebSocket(`wss://uatbridge.monallo.ai/ws?address=${walletAddress}`);

    ws.onopen = () => {
      console.log('✅ WebSocket connected with wallet address:', walletAddress);
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
  }, [onMessage, walletAddress]); // Add walletAddress as dependency
}
