/**
 * Application constants configuration file
 * Centralized management of all constants and configuration items
 */

// API endpoint configuration
export const API_ENDPOINTS = {
  // Production environment
  PRODUCTION: {
    CROSS_LOCK_INFO: 'https://uatbridge.monallo.ai/lockinfo/api/crossLockInfo',
    ADD_AUTHORIZATION: 'https://uatbridge.monallo.ai/lockinfo/api/addAuthorization',
    GET_AMOUNT: 'https://uatbridge.monallo.ai/lockinfo/api/getAmount',
    LOCK_INFO: 'https://uatbridge.monallo.ai/lockinfo/api/lockInfo'
  },
  // Development environment
  DEVELOPMENT: {
    CROSS_LOCK_INFO: 'http://192.168.31.176:5000/api/crossLockInfo',
    ADD_AUTHORIZATION: 'http://192.168.31.176:5000/api/addAuthorization',
    GET_AMOUNT: 'http://192.168.31.176:5000/api/getAmount',
    LOCK_INFO: 'http://192.168.31.176:5000/api/lockInfo'
  }
} as const;

// Current API environment
export const CURRENT_API_ENV = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT';
export const CURRENT_ENDPOINTS = API_ENDPOINTS[CURRENT_API_ENV];

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  // WebSocket server address
  WS_URL: process.env.NODE_ENV === 'production' 
    ? 'wss://uatbridge.monallo.ai/ws'
    : 'ws://192.168.31.176:5000/ws',
  
  // Reconnection configuration
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 10,
  
  // Heartbeat configuration
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  HEARTBEAT_MESSAGE: JSON.stringify({ type: 'ping' })
} as const;

// Error message configuration
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network connection error, please check your network settings',
  NETWORK_NOT_SUPPORTED: 'Unsupported network, please switch to a supported network',
  NETWORK_SWITCH_FAILED: 'Network switch failed, please switch manually',
  
  // Wallet errors
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  WALLET_CONNECTION_FAILED: 'Wallet connection failed',
  WALLET_NOT_FOUND: 'Wallet not detected, please install MetaMask',
  
  // Transaction errors
  TRANSACTION_FAILED: 'Transaction failed, please try again',
  TRANSACTION_REJECTED: 'Transaction rejected by user',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INSUFFICIENT_ALLOWANCE: 'Insufficient allowance',
  INSUFFICIENT_GAS: 'Insufficient gas fee',
  
  // Input validation errors
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_ADDRESS: 'Please enter a valid address',
  AMOUNT_TOO_SMALL: 'Amount too small',
  AMOUNT_TOO_LARGE: 'Amount too large',
  
  // Contract errors
  CONTRACT_ERROR: 'Contract call failed',
  CONTRACT_NOT_FOUND: 'Invalid contract address',
  
  // General errors
  UNKNOWN_ERROR: 'Unknown error, please try again',
  TIMEOUT_ERROR: 'Operation timed out, please try again'
} as const;

// Success message configuration
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted',
  TRANSACTION_CONFIRMED: 'Transaction confirmed successfully',
  AUTHORIZATION_SUCCESS: 'Authorization successful',
  BRIDGE_SUCCESS: 'Cross-chain transfer successful'
} as const;

// Status message configuration
export const STATUS_MESSAGES = {
  CONNECTING_WALLET: 'Connecting wallet...',
  CHECKING_AUTHORIZATION: 'Checking authorization status...',
  AUTHORIZING: 'Authorizing...',
  PREPARING_TRANSACTION: 'Preparing transaction...',
  SUBMITTING_TRANSACTION: 'Submitting transaction...',
  WAITING_CONFIRMATION: 'Waiting for transaction confirmation...',
  PROCESSING_BRIDGE: 'Processing cross-chain transfer...',
  WAITING_MINT: 'Waiting for minting confirmation...'
} as const;

// Development configuration
export const DEV_CONFIG = {
  // Whether to enable debug mode
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // Whether to enable verbose logging
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Whether to enable performance monitoring
  PERFORMANCE_MONITORING: true,
  
  // Whether to enable error reporting
  ERROR_REPORTING: process.env.NODE_ENV === 'production'
} as const;

// Export types for all configurations
export type ApiEndpoints = typeof API_ENDPOINTS;
export type WebSocketConfig = typeof WEBSOCKET_CONFIG;
export type ErrorMessages = typeof ERROR_MESSAGES;
export type SuccessMessages = typeof SUCCESS_MESSAGES;
export type StatusMessages = typeof STATUS_MESSAGES;
export type DevConfig = typeof DEV_CONFIG;

// Default export for all configurations
export default {
  API_ENDPOINTS,
  CURRENT_ENDPOINTS,
  WEBSOCKET_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STATUS_MESSAGES,
  DEV_CONFIG
};