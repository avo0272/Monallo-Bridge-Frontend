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
 * @param amount 数量（wei格式或已经是小数形式）
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
    
    console.log(`格式化代币数量: 输入=${amountStr}, 代币精度=${decimals}, 显示精度=${displayDecimals}`);
    
    let num: number;
    let originalFormatted: string = '';
    
    // 检查输入是否已经是小数形式
    if (amountStr.includes('.')) {
      // 已经是小数形式，直接解析
      num = parseFloat(amountStr);
      originalFormatted = amountStr;
      console.log(`输入已是小数形式: ${amountStr} => ${num}`);
    } else {
      try {
        // 根据代币精度从wei格式转换
        if (decimals === 18) {
          // 使用web3.utils.fromWei仅适用于18位精度的代币
          originalFormatted = web3.utils.fromWei(amountStr, 'ether');
        } else {
          // 对于非18位精度的代币，手动计算
          const amountBN = BigInt(amountStr);
          originalFormatted = (Number(amountBN) / Math.pow(10, decimals)).toString();
        }
        num = parseFloat(originalFormatted);
        console.log(`从wei转换: ${amountStr} => ${originalFormatted} => ${num} (精度: ${decimals})`);
      } catch (conversionError) {
        // 如果转换失败，尝试直接解析
        num = parseFloat(amountStr);
        originalFormatted = amountStr;
        console.log(`转换失败，直接解析: ${amountStr} => ${num}`);
        if (isNaN(num)) {
          throw conversionError; // 如果解析也失败，抛出原始错误
        }
      }
    }
    
    // 格式化显示精度
    if (num === 0) return '0';
    if (num < 0.000001 && num > 0) return '< 0.000001';
    
    // 使用原始格式化字符串进行精确的显示
    const result = num.toFixed(displayDecimals).replace(/\.?0+$/, '');
    console.log(`格式化结果: ${num} => ${result}`);
    return result;
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
    
    // 处理可能的精度问题
    // 确保数字格式正确，移除多余的0
    const normalizedAmount = parseFloat(amount).toString();
    console.log(`解析代币数量: 原始输入=${amount}, 标准化后=${normalizedAmount}, 精度=${decimals}`);
    
    // 根据代币精度转换为wei格式
    let weiAmount: string;
    if (decimals === 18) {
      // 使用web3.utils.toWei仅适用于18位精度的代币
      weiAmount = web3.utils.toWei(normalizedAmount, 'ether');
    } else {
      // 对于非18位精度的代币，手动计算
      const amountBN = BigInt(Math.round(parseFloat(normalizedAmount) * Math.pow(10, decimals)));
      weiAmount = amountBN.toString();
    }
    
    console.log(`转换为wei格式: ${normalizedAmount} => ${weiAmount} (精度: ${decimals})`);
    
    return weiAmount;
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
 * @param amount1 数量1（可以是wei格式或以太单位格式）
 * @param amount2 数量2（可以是wei格式或以太单位格式）
 * @returns -1: amount1 < amount2, 0: 相等, 1: amount1 > amount2
 */
export function compareTokenAmounts(amount1: string, amount2: string): number {
  try {
    // 使用parseFloat直接比较数值，避免BigInt不支持小数的问题
    const num1 = parseFloat(amount1);
    const num2 = parseFloat(amount2);
    
    if (isNaN(num1) || isNaN(num2)) {
      throw new Error(`无效的数值: ${amount1} 或 ${amount2}`);
    }
    
    // 处理浮点数精度问题，使用一个更合适的epsilon值
    // 对于小数点后4位的数字（如0.0001），使用更小的epsilon
    const smallestValue = Math.min(Math.abs(num1), Math.abs(num2));
    // 动态调整epsilon，确保它足够小但不会太小
    const epsilon = Math.max(1e-12, smallestValue * 1e-6);
    const diff = num1 - num2;
    
    console.log(`比较数值: ${num1} vs ${num2}, 差值: ${diff}, epsilon: ${epsilon}, 最小值: ${smallestValue}`);
    
    if (Math.abs(diff) < epsilon) {
      console.log(`数值被认为相等: |${diff}| < ${epsilon}`);
      return 0; // 认为数值相等
    }
    if (diff < 0) {
      console.log(`${num1} < ${num2}`);
      return -1;
    }
    console.log(`${num1} > ${num2}`);
    return 1;
  } catch (error) {
    console.error('比较代币数量失败:', error);
    return 0;
  }
}

/**
 * 检查代币余额是否足够
 * @param balance 当前余额（wei格式或以太单位格式）
 * @param amount 需要的数量（wei格式或以太单位格式）
 * @returns 是否足够
 */
export function hasSufficientBalance(balance: string, amount: string): boolean {
  const comparisonResult = compareTokenAmounts(balance, amount);
  console.log(`余额比较结果: ${comparisonResult} (balance: ${balance}, amount: ${amount})`);
  return comparisonResult >= 0;
}

/**
 * 检查授权额度是否足够
 * @param allowance 当前授权额度（wei格式或以太单位格式）
 * @param amount 需要的数量（wei格式或以太单位格式）
 * @returns 是否足够
 */
export function hasSufficientAllowance(allowance: string, amount: string): boolean {
  const comparisonResult = compareTokenAmounts(allowance, amount);
  console.log(`授权比较结果: ${comparisonResult} (allowance: ${allowance}, amount: ${amount})`);
  return comparisonResult >= 0;
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
 * @returns 完整的交易哈希
 */
export function formatTxHash(hash: string): string {
  // 根据需求，返回完整的交易哈希而不是缩写版本
  return hash || '';

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
 * @param decimals 代币精度，默认为18（ETH精度）
 * @returns 格式化的费用字符串
 */
export function calculateGasFee(gasPrice: string, gasLimit: string, decimals: number = 18): string {
  try {
    const web3 = new Web3();
    const gasPriceBN = web3.utils.toBigInt(gasPrice);
    const gasLimitBN = web3.utils.toBigInt(gasLimit);
    const totalFee = gasPriceBN * BigInt(gasLimitBN);
    
    // 根据代币精度从wei格式转换
    let formattedFee: string;
    if (decimals === 18) {
      // 使用web3.utils.fromWei仅适用于18位精度的代币
      formattedFee = web3.utils.fromWei(totalFee.toString(), 'ether');
    } else {
      // 对于非18位精度的代币，手动计算
      const divisor = Math.pow(10, decimals);
      formattedFee = (Number(totalFee) / divisor).toString();
    }
    
    console.log(`计算gas费用: 原始值=${totalFee.toString()}, 精度=${decimals}, 格式化后=${formattedFee}`);
    return formattedFee;
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