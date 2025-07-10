import axios from 'axios';

// 定义代币价格接口
interface TokenPrice {
  symbol: string;
  price: number;
  lastUpdated: number;
}

// 缓存时间（毫秒）
const CACHE_DURATION = 5000; // 5s

// 价格缓存
const priceCache: Record<string, TokenPrice> = {};

// 代币价格服务
class PriceService {
  // 获取ETH价格
  async getETHPrice(): Promise<number> {
    return this.getTokenPrice('ETH');
  }

  // 获取USDC价格
  async getUSDCPrice(): Promise<number> {
    return this.getTokenPrice('USDC');
  }

  // 获取EURC价格
  async getEURCPrice(): Promise<number> {
    return this.getTokenPrice('EURC');
  }

  // 根据代币符号获取价格
  async getTokenPrice(symbol: string): Promise<number> {
    // 标准化符号
    const normalizedSymbol = this.normalizeSymbol(symbol);
    
    // 检查缓存
    if (this.isCacheValid(normalizedSymbol)) {
      return priceCache[normalizedSymbol].price;
    }

    try {
      const price = await this.fetchTokenPrice(normalizedSymbol);
      
      // 更新缓存
      priceCache[normalizedSymbol] = {
        symbol: normalizedSymbol,
        price,
        lastUpdated: Date.now()
      };
      
      return price;
    } catch (error) {
      console.error(`获取${symbol}价格失败:`, error);
      // 如果有缓存，即使过期也返回
      if (priceCache[normalizedSymbol]) {
        return priceCache[normalizedSymbol].price;
      }
      return 0;
    }
  }

  // 检查缓存是否有效
  private isCacheValid(symbol: string): boolean {
    if (!priceCache[symbol]) return false;
    
    const now = Date.now();
    const lastUpdated = priceCache[symbol].lastUpdated;
    
    return (now - lastUpdated) < CACHE_DURATION;
  }

  // 标准化代币符号
  private normalizeSymbol(symbol: string): string {
    // 移除'mao'前缀
    if (symbol.startsWith('mao')) {
      return symbol.substring(3);
    }
    return symbol;
  }

  // 从OKX API获取代币价格
  private async fetchTokenPrice(symbol: string): Promise<number> {
    let endpoint = '';
    
    switch (symbol) {
      case 'ETH':
        endpoint = 'https://www.okx.com/api/v5/market/ticker?instId=ETH-USD';
        break;
      case 'USDC':
        endpoint = 'https://www.okx.com/api/v5/market/ticker?instId=USDC-USDT';
        break;
      case 'EURC':
        endpoint = 'https://www.okx.com/api/v5/market/ticker?instId=EURC-USD';
        break;
      default:
        throw new Error(`不支持的代币: ${symbol}`);
    }
    
    const response = await axios.get(endpoint);
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      // OKX API返回的价格在last字段
      const price = parseFloat(response.data.data[0].last);
      return price;
    }
    
    throw new Error(`无法获取${symbol}价格`);
  }

  // 计算总价值（代币数量 * 价格）
  async calculateTotalValue(symbol: string, amount: number): Promise<number> {
    if (!amount || isNaN(amount) || amount <= 0) return 0;
    
    const price = await this.getTokenPrice(symbol);
    return price * amount;
  }
}

// 创建单例实例
const priceService = new PriceService();

export default priceService;