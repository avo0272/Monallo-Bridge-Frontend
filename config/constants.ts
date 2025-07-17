/**
 * 应用常量配置文件
 * 集中管理所有常量和配置项
 */

// API端点配置
export const API_ENDPOINTS = {
  // 生产环境
  PRODUCTION: {
    CROSS_LOCK_INFO: 'https://uatbridge.monallo.ai/lockinfo/api/crossLockInfo',
    ADD_AUTHORIZATION: 'https://uatbridge.monallo.ai/api/addAuthorization',
    GET_AMOUNT: 'https://uatbridge.monallo.ai/api/getAmount',
    LOCK_INFO: 'https://uatbridge.monallo.ai/api/lockInfo'
  },
  // 开发环境
  DEVELOPMENT: {
    CROSS_LOCK_INFO: 'http://192.168.31.176:5000/api/crossLockInfo',
    ADD_AUTHORIZATION: 'http://192.168.31.176:5000/api/addAuthorization',
    GET_AMOUNT: 'http://192.168.31.176:5000/api/getAmount',
    LOCK_INFO: 'http://192.168.31.176:5000/api/lockInfo'
  }
} as const;

// 当前使用的API环境
export const CURRENT_API_ENV = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT';
export const CURRENT_ENDPOINTS = API_ENDPOINTS[CURRENT_API_ENV];

// WebSocket配置
export const WEBSOCKET_CONFIG = {
  // WebSocket服务器地址
  WS_URL: process.env.NODE_ENV === 'production' 
    ? 'wss://uatbridge.monallo.ai/ws'
    : 'ws://192.168.31.176:5000/ws',
  
  // 重连配置
  RECONNECT_INTERVAL: 5000, // 5秒
  MAX_RECONNECT_ATTEMPTS: 10,
  
  // 心跳配置
  HEARTBEAT_INTERVAL: 30000, // 30秒
  HEARTBEAT_MESSAGE: JSON.stringify({ type: 'ping' })
} as const;

// 错误消息配置
export const ERROR_MESSAGES = {
  // 网络错误
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  NETWORK_NOT_SUPPORTED: '不支持的网络，请切换到支持的网络',
  NETWORK_SWITCH_FAILED: '网络切换失败，请手动切换',
  
  // 钱包错误
  WALLET_NOT_CONNECTED: '请先连接钱包',
  WALLET_CONNECTION_FAILED: '钱包连接失败',
  WALLET_NOT_FOUND: '未检测到钱包，请安装MetaMask',
  
  // 交易错误
  TRANSACTION_FAILED: '交易失败，请重试',
  TRANSACTION_REJECTED: '交易被用户拒绝',
  INSUFFICIENT_BALANCE: '余额不足',
  INSUFFICIENT_ALLOWANCE: '授权额度不足',
  INSUFFICIENT_GAS: 'Gas费用不足',
  
  // 输入验证错误
  INVALID_AMOUNT: '请输入有效的数量',
  INVALID_ADDRESS: '请输入有效的地址',
  AMOUNT_TOO_SMALL: '数量过小',
  AMOUNT_TOO_LARGE: '数量过大',
  
  // 合约错误
  CONTRACT_ERROR: '合约调用失败',
  CONTRACT_NOT_FOUND: '合约地址无效',
  
  // 通用错误
  UNKNOWN_ERROR: '未知错误，请重试',
  TIMEOUT_ERROR: '操作超时，请重试'
} as const;

// 成功消息配置
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: '钱包连接成功',
  TRANSACTION_SUBMITTED: '交易已提交',
  TRANSACTION_CONFIRMED: '交易确认成功',
  AUTHORIZATION_SUCCESS: '授权成功',
  BRIDGE_SUCCESS: '跨链转账成功'
} as const;

// 状态消息配置
export const STATUS_MESSAGES = {
  CONNECTING_WALLET: '正在连接钱包...',
  CHECKING_AUTHORIZATION: '正在检查授权状态...',
  AUTHORIZING: '正在授权...',
  PREPARING_TRANSACTION: '正在准备交易...',
  SUBMITTING_TRANSACTION: '正在提交交易...',
  WAITING_CONFIRMATION: '等待交易确认...',
  PROCESSING_BRIDGE: '正在处理跨链转账...',
  WAITING_MINT: '等待铸币确认...'
} as const;

// 开发配置
export const DEV_CONFIG = {
  // 是否启用调试模式
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // 是否启用详细日志
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  
  // 是否启用性能监控
  PERFORMANCE_MONITORING: true,
  
  // 是否启用错误上报
  ERROR_REPORTING: process.env.NODE_ENV === 'production'
} as const;

// 导出所有配置的类型
export type ApiEndpoints = typeof API_ENDPOINTS;
export type WebSocketConfig = typeof WEBSOCKET_CONFIG;
export type ErrorMessages = typeof ERROR_MESSAGES;
export type SuccessMessages = typeof SUCCESS_MESSAGES;
export type StatusMessages = typeof STATUS_MESSAGES;
export type DevConfig = typeof DEV_CONFIG;

// 默认导出所有配置
export default {
  API_ENDPOINTS,
  CURRENT_ENDPOINTS,
  WEBSOCKET_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STATUS_MESSAGES,
  DEV_CONFIG
};