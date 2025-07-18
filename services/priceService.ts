import axios from 'axios';
import { NumberMul } from '../utils/numberUtils';

// Define token price interface
interface TokenPrice {
  symbol: string;
  price: number;
  lastUpdated: number;
}

// Cache duration (milliseconds)
const CACHE_DURATION = 5000; // 5s

// Price cache
const priceCache: Record<string, TokenPrice> = {};

// Token price service
class PriceService {
  // Get ETH price
  async getETHPrice(): Promise<number> {
    return this.getTokenPrice('ETH');
  }

  // Get USDC price
  async getUSDCPrice(): Promise<number> {
    return this.getTokenPrice('USDC');
  }

  // Get EURC price
  async getEURCPrice(): Promise<number> {
    return this.getTokenPrice('EURC');
  }

  // Get price by token symbol
  async getTokenPrice(symbol: string): Promise<number> {
    // Normalize symbol
    const normalizedSymbol = this.normalizeSymbol(symbol);
    
    // Check cache
    if (this.isCacheValid(normalizedSymbol)) {
      return priceCache[normalizedSymbol].price;
    }

    try {
      const price = await this.fetchTokenPrice(normalizedSymbol);
      
      // Update cache
      priceCache[normalizedSymbol] = {
        symbol: normalizedSymbol,
        price,
        lastUpdated: Date.now()
      };
      
      return price;
    } catch (error) {
      console.error(`Failed to get ${symbol} price:`, error);
      // If cache exists, return it even if expired
      if (priceCache[normalizedSymbol]) {
        return priceCache[normalizedSymbol].price;
      }
      return 0;
    }
  }

  // Check if cache is valid
  private isCacheValid(symbol: string): boolean {
    if (!priceCache[symbol]) return false;
    
    const now = Date.now();
    const lastUpdated = priceCache[symbol].lastUpdated;
    
    return (now - lastUpdated) < CACHE_DURATION;
  }

  // Normalize token symbol
  private normalizeSymbol(symbol: string): string {
    // Remove 'mao' prefix
    if (symbol.startsWith('mao')) {
      return symbol.substring(3);
    }
    return symbol;
  }

  // Get token price from OKX API
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
        throw new Error(`Unsupported token: ${symbol}`);
    }
    
    const response = await axios.get(endpoint);
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      // OKX API returns price in the last field
      const price = parseFloat(response.data.data[0].last);
      return price;
    }
    
    throw new Error(`Unable to get ${symbol} price`);
  }

  // Calculate total value (token amount * price)
  async calculateTotalValue(symbol: string, amount: number): Promise<number> {
    if (!amount || isNaN(amount) || amount <= 0) return 0;
    
    const price = await this.getTokenPrice(symbol);
    return NumberMul(price, amount);
  }
}

// Create singleton instance
const priceService = new PriceService();

export default priceService;