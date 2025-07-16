import { useEffect, useRef, useState } from 'react';

export function useWebSocket(onMessage: (data: any) => void, walletAddress?: string) {
  // Use ref to track the WebSocket instance and connection status
  const wsRef = useRef<WebSocket | null>(null);
  const connectedAddressRef = useRef<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 心跳间隔时间（毫秒）- 默认每30秒发送一次心跳
  const HEARTBEAT_INTERVAL = 90000;
  
  // 更新最后活动时间
  const updateLastActivity = () => {
    lastActivityRef.current = Date.now();
    
    // 如果WebSocket已断开但有钱包地址，则尝试重新连接
    if (!isConnected && walletAddress) {
      connectWebSocket();
    }
  };
  
  // 发送心跳消息以保持连接活跃
  const sendHeartbeat = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending heartbeat to keep WebSocket connection alive');
      // 发送一个简单的心跳消息
      wsRef.current.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      // 更新最后活动时间
      updateLastActivity();
    }
  };
  
  // 启动心跳定时器
  const startHeartbeat = () => {
    // 清除现有的心跳定时器
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    // 设置新的心跳定时器
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
  };
  
  // 停止心跳定时器
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };
  
  // 创建WebSocket连接
  const connectWebSocket = () => {
    // 如果没有钱包地址，不创建连接
    if (!walletAddress) {
      console.log('WebSocket connection not established: wallet not connected');
      return;
    }
    
    // 如果已经有相同钱包地址的连接，不重新连接
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && 
        connectedAddressRef.current === walletAddress) {
      console.log('WebSocket already connected with the same wallet address');
      return;
    }
    
    // 关闭现有连接
    if (wsRef.current) {
      console.log('Closing existing WebSocket connection');
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // 创建新连接
    console.log('Creating new WebSocket connection for address:', walletAddress);
    const ws = new WebSocket(`wss://uatbridge.monallo.ai/ws/?address=${walletAddress}`);
    // const ws = new WebSocket(`ws://192.168.31.176:8888?address=${walletAddress}`);
    wsRef.current = ws;
    connectedAddressRef.current = walletAddress;

    ws.onopen = () => {
      console.log('✅ WebSocket connected with wallet address:', walletAddress);
      setIsConnected(true);
      // 连接成功后启动心跳
      startHeartbeat();
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
      setIsConnected(false);
      if (connectedAddressRef.current === walletAddress) {
        connectedAddressRef.current = undefined;
      }
      // 连接关闭时停止心跳
      stopHeartbeat();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      // 连接出错时停止心跳
      stopHeartbeat();
    };
  };
  
  // 初始连接和钱包地址变化时的处理
  useEffect(() => {
    if (!walletAddress) {
      console.log('WebSocket connection not established: wallet not connected');
      
      // 关闭现有连接
      if (wsRef.current) {
        console.log('Closing WebSocket due to wallet disconnect');
        wsRef.current.close();
        wsRef.current = null;
        connectedAddressRef.current = undefined;
        setIsConnected(false);
      }
      return;
    }
    
    // 初始连接
    connectWebSocket();
    
    return () => {
      // 组件卸载或钱包地址变化时清理
      if (wsRef.current) {
        console.log('Cleanup: closing WebSocket connection');
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
      
      // 清理重连定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // 清理心跳定时器
      stopHeartbeat();
    };
  }, [walletAddress]); // 只依赖于钱包地址
  
  // 处理onMessage变化而不重新连接WebSocket
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
  
  // 监听用户活动
  useEffect(() => {
    // 用户交互事件列表
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    
    // 事件处理函数
    const handleUserActivity = () => {
      updateLastActivity();
    };
    
    // 添加事件监听
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      // 移除事件监听
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);
  
  // 导出重连方法，允许外部组件在需要时触发重连
  return {
    isConnected,
    reconnect: connectWebSocket
  };
}
