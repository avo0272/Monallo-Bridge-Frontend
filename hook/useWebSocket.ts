import { useEffect, useRef } from 'react';

export function useWebSocket(onMessage: (data: any) => void, walletAddress?: string) {
  // Use ref to track the WebSocket instance and connection status
  const wsRef = useRef<WebSocket | null>(null);
  const connectedAddressRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    // Only create WebSocket connection when wallet address exists
    // and when the connection doesn't exist or the wallet address has changed
    if (!walletAddress) {
      console.log('WebSocket connection not established: wallet not connected');
      
      // Close existing connection if wallet disconnected
      if (wsRef.current) {
        console.log('Closing WebSocket due to wallet disconnect');
        wsRef.current.close();
        wsRef.current = null;
        connectedAddressRef.current = undefined;
      }
      return;
    }
    
    // If we already have a connection with the same wallet address, don't reconnect
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && 
        connectedAddressRef.current === walletAddress) {
      console.log('WebSocket already connected with the same wallet address');
      return;
    }
    
    // Close any existing connection before creating a new one
    if (wsRef.current) {
      console.log('Closing existing WebSocket connection');
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Create WebSocket connection and add wallet address as query parameter
    console.log('Creating new WebSocket connection for address:', walletAddress);
    const ws = new WebSocket(`wss://uatbridge.monallo.ai/ws/?address=${walletAddress}`);
    // const ws = new WebSocket(`ws://192.168.31.176:8888?address=${walletAddress}`);
    wsRef.current = ws;
    connectedAddressRef.current = walletAddress;

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
      if (connectedAddressRef.current === walletAddress) {
        connectedAddressRef.current = undefined;
      }
    };

    return () => {
      // Only close the connection if component unmounts or wallet address changes
      // This prevents unnecessary reconnections during re-renders
      if (ws === wsRef.current) {
        console.log('Cleanup: closing WebSocket connection');
        ws.close();
        wsRef.current = null;
      }
    };
  }, [walletAddress]); // Only depend on walletAddress, not onMessage
  
  // Handle onMessage changes without reconnecting WebSocket
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const ws = wsRef.current;
      const originalOnMessage = ws.onmessage;
      
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          onMessage(msg);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };
      
      return () => {
        if (wsRef.current === ws) {
          ws.onmessage = originalOnMessage;
        }
      };
    }
  }, [onMessage]);
}
