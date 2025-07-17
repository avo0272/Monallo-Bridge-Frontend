/**
 * 代币工具函数
 * 提供代币格式化、验证和转换功能
 */

import Web3 from 'web3';

// 代币精度常量
export const TOKEN_DECIMALS = {
  ETH: 18,
  USDT: 6,
  USDC: 6,
  DAI: 18,
  DEFAULT: 18
} as const;

// 网络配置类型
export interface NetworkInfo {
  chainId: string;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// 代币信息类型
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  allowance?: string;
}

/**
 * 格式化代币数量显示
 * @param amount 数量（wei格式）
 * @param decimals 代币精度
 * @param displayDecimals 显示精度
 * @returns 格式化后的数量字符串
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = TOKEN_DECIMALS.DEFAULT,
  displayDecimals: number = 6
): string {
  try {
    const web3 = new Web3();
    const amountStr = amount.toString();
    
    // 如果是wei格式，转换为可读格式
    const formatted = web3.utils.fromWei(amountStr, 'ether');
    const num = parseFloat(formatted);
    
    // 格式化显示精度
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    
    return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
  } catch (error) {
    console.error('格式化代币数量失败:', error);
    return '0';
  }
}

/**
 * 将用户输入的数量转换为wei格式
 * @param amount 用户输入的数量
 * @param decimals 代币精度
 * @returns wei格式的数量字符串
 */
export function parseTokenAmount(
  amount: string,
  decimals: number = TOKEN_DECIMALS.DEFAULT
): string {
  try {
    const web3 = new Web3();
    
    // 验证输入
    if (!amount || isNaN(parseFloat(amount))) {
      throw new Error('无效的数量输入');
    }
    
    // 转换为wei格式
    return web3.utils.toWei(amount, 'ether');
  } catch (error) {
    console.error('解析代币数量失败:', error);
    throw new Error('无效的数量格式');
  }
}

/**
 * 验证代币数量是否有效
 * @param amount 数量字符串
 * @param maxDecimals 最大小数位数
 * @returns 是否有效
 */
export function validateTokenAmount(
  amount: string,
  maxDecimals: number = 18
): { isValid: boolean; error?: string } {
  try {
    // 检查是否为空
    if (!amount || amount.trim() === '') {
      return { isValid: false, error: '请输入数量' };
    }
    
    // 检查是否为数字
    const num = parseFloat(amount);
    if (isNaN(num)) {
      return { isValid: false, error: '请输入有效的数字' };
    }
    
    // 检查是否为正数
    if (num <= 0) {
      return { isValid: false, error: '数量必须大于0' };
    }
    
    // 检查小数位数
    const decimalPlaces = (amount.split('.')[1] || '').length;
    if (decimalPlaces > maxDecimals) {
      return { isValid: false, error: `小数位数不能超过${maxDecimals}位` };
    }
    
    // 检查是否过大
    if (num > 1e18) {
      return { isValid: false, error: '数量过大' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: '数量格式错误' };
  }
}

/**
 * 比较两个代币数量
 * @param amount1 数量1（wei格式）
 * @param amount2 数量2（wei格式）
 * @returns -1: amount1 < amount2, 0: 相等, 1: amount1 > amount2
 */
export function compareTokenAmounts(amount1: string, amount2: string): number {
  try {
    const web3 = new Web3();
    const bn1 = web3.utils.toBigInt(amount1);
    const bn2 = web3.utils.toBigInt(amount2);
    
    if (bn1 < bn2) return -1;
    if (bn1 > bn2) return 1;
    return 0;
  } catch (error) {
    console.error('比较代币数量失败:', error);
    return 0;
  }
}

/**
 * 检查余额是否足够
 * @param balance 当前余额（wei格式）
 * @param amount 需要的数量（wei格式）
 * @returns 是否足够
 */
export function hasSufficientBalance(balance: string, amount: string): boolean {
  return compareTokenAmounts(balance, amount) >= 0;
}

/**
 * 检查授权额度是否足够
 * @param allowance 当前授权额度（wei格式）
 * @param amount 需要的数量（wei格式）
 * @returns 是否足够
 */
export function hasSufficientAllowance(allowance: string, amount: string): boolean {
  return compareTokenAmounts(allowance, amount) >= 0;
}

/**
 * 获取代币符号的显示名称
 * @param symbol 代币符号
 * @returns 显示名称
 */
export function getTokenDisplayName(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'ETH': 'Ethereum',
    'BTC': 'Bitcoin',
    'USDT': 'Tether USD',
    'USDC': 'USD Coin',
    'DAI': 'Dai Stablecoin',
    'BNB': 'Binance Coin',
    'MATIC': 'Polygon'
  };
  
  return symbolMap[symbol.toUpperCase()] || symbol;
}

/**
 * 格式化交易哈希显示
 * @param hash 完整的交易哈希
 * @param startLength 开始显示的字符数
 * @param endLength 结尾显示的字符数
 * @returns 格式化后的哈希
 */
export function formatTxHash(
  hash: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!hash || hash.length <= startLength + endLength) {
    return hash;
  }
  
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

/**
 * 格式化钱包地址显示
 * @param address 完整的钱包地址
 * @param startLength 开始显示的字符数
 * @param endLength 结尾显示的字符数
 * @returns 格式化后的地址
 */
export function formatAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * 验证以太坊地址格式
 * @param address 地址字符串
 * @returns 是否为有效地址
 */
export function isValidAddress(address: string): boolean {
  try {
    const web3 = new Web3();
    return web3.utils.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * 生成随机的交易ID（用于跟踪）
 * @returns 随机ID字符串
 */
export function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 计算预估的gas费用
 * @param gasPrice gas价格（wei）
 * @param gasLimit gas限制
 * @returns 格式化的费用字符串
 */
export function calculateGasFee(gasPrice: string, gasLimit: string): string {
  try {
    const web3 = new Web3();
    const gasPriceBN = web3.utils.toBigInt(gasPrice);
    const gasLimitBN = web3.utils.toBigInt(gasLimit);
    const totalFee = gasPriceBN * BigInt(gasLimitBN);
    
    return web3.utils.fromWei(totalFee.toString(), 'ether');
  } catch (error) {
    console.error('计算gas费用失败:', error);
    return '0';
  }
}

export default {
  formatTokenAmount,
  parseTokenAmount,
  validateTokenAmount,
  compareTokenAmounts,
  hasSufficientBalance,
  hasSufficientAllowance,
  getTokenDisplayName,
  formatTxHash,
  formatAddress,
  isValidAddress,
  generateTransactionId,
  calculateGasFee,
  TOKEN_DECIMALS
};