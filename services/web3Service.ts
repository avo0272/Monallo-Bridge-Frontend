import Web3 from 'web3';

// Network configuration interface
interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// Supported network configurations
export const NETWORK_CONFIGS: { [key: string]: NetworkConfig } = {
  'Ethereum-Sepolia': {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia test network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth-sepolia.api.onfinality.io/public'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  'Imua-Testnet': {
    chainId: '0xe9', // 233
    chainName: 'Imuachain Testnet',
    nativeCurrency: {
      name: 'IMUA',
      symbol: 'IMUA',
      decimals: 18,
    },
    rpcUrls: ['https://api-eth.exocore-restaking.com'],
    blockExplorerUrls: ['https://exoscan.org'],
  },
  'ZetaChain-Testnet': {
    chainId: '0x1b59', // 7001
    chainName: 'ZetaChain Athens Testnet',
    nativeCurrency: {
      name: 'ZETA',
      symbol: 'ZETA',
      decimals: 18,
    },
    rpcUrls: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    blockExplorerUrls: ['https://zetachain-testnet.blockscout.com/'],
  },
  'PlatON-Mainnet': {
    chainId: '0x335f9', // 210425
    chainName: 'PlatON Mainnet',
    nativeCurrency: {
      name: 'LAT',
      symbol: 'LAT',
      decimals: 18,
    },
    rpcUrls: ['https://openapi2.platon.network/rpc'],
    blockExplorerUrls: ['https://scan.platon.network/'],
  },
};

// ERC20 token standard ABI
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  }
];

class Web3Service {
  private _web3: Web3 | null = null;
  private currentNetwork: string = '';
  private networkChangeCallbacks: ((network: string) => void)[] = [];

  constructor() {
    this.initializeWeb3();
    this.setupEventListeners();
  }
  
  // Public accessor for web3 instance
  get web3(): Web3 | null {
    return this._web3;
  }

  // Initialize Web3
  private initializeWeb3() {
    if (typeof window !== 'undefined') {
      // 优先使用MetaMask
      if (window.ethereum) {
        this._web3 = new Web3(window.ethereum);
        console.log('Web3 initialized with MetaMask provider');
      } 
      // 尝试使用OKX钱包
      else if (window.okxwallet) {
        this._web3 = new Web3(window.okxwallet);
        console.log('Web3 initialized with OKX wallet provider');
      }
      // 如果没有可用的钱包，使用默认RPC
      else {
        // 使用默认的Ethereum Sepolia RPC作为后备
        const defaultRpcUrl = 'https://eth-sepolia.api.onfinality.io/public';
        this._web3 = new Web3(new Web3.providers.HttpProvider(defaultRpcUrl));
        console.log('Web3 initialized with default HTTP provider');
      }
    }
  }

  // Set up event listeners
  private setupEventListeners() {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        const networkName = this.getNetworkNameByChainId(chainId);
        this.currentNetwork = networkName;
        this.notifyNetworkChange(networkName);
      });
    }
  }

  // 根据chainId获取网络名称
  private getNetworkNameByChainId(chainId: string): string {
    const normalizedChainId = chainId.toLowerCase();
    for (const [networkName, config] of Object.entries(NETWORK_CONFIGS)) {
      if (config.chainId.toLowerCase() === normalizedChainId) {
        return networkName;
      }
    }
    return 'Unknown Network';
  }

  // 添加网络变化回调
  onNetworkChange(callback: (network: string) => void) {
    this.networkChangeCallbacks.push(callback);
  }

  // 通知网络变化
  private notifyNetworkChange(network: string) {
    this.networkChangeCallbacks.forEach(callback => callback(network));
  }

  // 获取当前网络
  async getCurrentNetwork(): Promise<string> {
    // 确保Web3已初始化
    if (!this._web3) {
      this.initializeWeb3();
      
      // 如果仍然未初始化，返回默认网络
      if (!this._web3) {
        console.warn('Web3无法初始化，返回默认网络');
        return 'Ethereum-Sepolia';
      }
    }

    try {
      const chainId = await this._web3.eth.getChainId();
      const hexChainId = '0x' + chainId.toString(16);
      const networkName = this.getNetworkNameByChainId(hexChainId);
      this.currentNetwork = networkName;
      return networkName;
    } catch (error) {
      console.error('获取当前网络失败:', error);
      // 出错时返回默认网络而不是Unknown Network
      return 'Ethereum-Sepolia';
    }
  }

  // 获取当前链ID
  async getCurrentChainId(): Promise<string> {
    // 确保Web3已初始化
    if (!this._web3) {
      this.initializeWeb3();
      
      // 如果仍然未初始化，返回默认链ID (Ethereum Sepolia)
      if (!this._web3) {
        console.warn('Web3无法初始化，返回默认链ID');
        return '11155111'; // Ethereum Sepolia的链ID
      }
    }

    try {
      const chainId = await this._web3.eth.getChainId();
      return chainId.toString();
    } catch (error) {
      console.error('获取当前链ID失败:', error);
      // 出错时返回默认链ID而不是抛出错误
      return '11155111'; // Ethereum Sepolia的链ID
    }
  }

  // 切换网络
  async switchNetwork(networkName: string): Promise<boolean> {
    if (!this._web3 || !window.ethereum) {
      throw new Error('Web3 或钱包未初始化');
    }

    const networkConfig = NETWORK_CONFIGS[networkName];
    if (!networkConfig) {
      throw new Error(`不支持的网络: ${networkName}`);
    }

    console.log(`[SWITCH NETWORK] 尝试切换到网络: ${networkName}, 链ID: ${networkConfig.chainId}`);

    try {
      // 获取当前网络
      const currentChainId = await this._web3.eth.getChainId();
      const currentHexChainId = '0x' + currentChainId.toString(16);
      console.log(`[SWITCH NETWORK] 当前链ID: ${currentHexChainId}`);
      
      // 如果已经在目标网络，直接返回
      if (currentHexChainId.toLowerCase() === networkConfig.chainId.toLowerCase()) {
        console.log(`[SWITCH NETWORK] 已经在目标网络 ${networkName}，无需切换`);
        this.currentNetwork = networkName;
        return true;
      }
      
      // 尝试切换到指定网络
      console.log(`[SWITCH NETWORK] 发送切换网络请求`);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });

      this.currentNetwork = networkName;
      console.log(`[SWITCH NETWORK] 成功切换到网络: ${networkName}`);
      return true;
    } catch (error: any) {
      console.log(`[SWITCH NETWORK] 切换网络出错，错误代码: ${error.code}`);
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        try {
          console.log(`[SWITCH NETWORK] 网络不存在，尝试添加网络: ${networkName}`);
          await this.addNetwork(networkConfig);
          this.currentNetwork = networkName;
          console.log(`[SWITCH NETWORK] 成功添加并切换到网络: ${networkName}`);
          return true;
        } catch (addError) {
          console.error('[SWITCH NETWORK] 添加网络失败:', addError);
          throw addError;
        }
      }
      console.error('[SWITCH NETWORK] 切换网络失败:', error);
      throw error;
    }
  }

  // 添加网络
  private async addNetwork(networkConfig: NetworkConfig): Promise<void> {
    if (!window.ethereum) {
      throw new Error('钱包未初始化');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
  }

  // 获取原生代币余额（如ETH）
  async getNativeBalance(address: string): Promise<string> {
    if (!this._web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const balance = await this._web3.eth.getBalance(address);
      const ethBalance = this._web3.utils.fromWei(balance, 'ether');
      return parseFloat(ethBalance).toFixed(6);
    } catch (error) {
      console.error('获取原生代币余额失败:', error);
      return '0';
    }
  }

  // 获取ERC20代币余额
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!this._web3) {
      throw new Error('Web3 未初始化');
    }

    // 如果没有代币地址，返回原生代币余额
    if (!tokenAddress) {
      console.log(`[GET TOKEN BALANCE] 获取原生代币余额 - 钱包地址: ${walletAddress}`);
      return this.getNativeBalance(walletAddress);
    }

    try {
      // 获取当前网络信息
      const currentChainId = await this._web3.eth.getChainId();
      const currentNetwork = await this.getCurrentNetwork();
      console.log(`[GET TOKEN BALANCE] 当前网络: ${currentNetwork}, 链ID: ${currentChainId}`);
      console.log(`[GET TOKEN BALANCE] 查询代币余额 - 代币地址: ${tokenAddress}, 钱包地址: ${walletAddress}`);
      
      // 创建合约实例
      const tokenContract = new this._web3.eth.Contract(ERC20_ABI, tokenAddress);

      // 获取代币精度
      const decimals = await tokenContract.methods.decimals().call();
      console.log(`[GET TOKEN BALANCE] 代币精度: ${decimals}`);

      // 获取原始余额
      const balance = await tokenContract.methods.balanceOf(walletAddress).call();
      console.log(`[GET TOKEN BALANCE] 原始余额: ${balance}`);

      // 根据精度转换余额
      const formattedBalance = Number(balance) / Math.pow(10, Number(decimals));
      console.log(`[GET TOKEN BALANCE] 格式化余额: ${formattedBalance}`);

      return formattedBalance.toFixed(6);
    } catch (error) {
      console.error('获取代币余额失败:', error);
      return '0';
    }
  }

  // 获取支持的网络列表
  getSupportedNetworks(): string[] {
    return Object.keys(NETWORK_CONFIGS);
  }

  // 获取网络配置
  getNetworkConfig(networkName: string): NetworkConfig | null {
    return NETWORK_CONFIGS[networkName] || null;
  }
}

// 创建单例实例
const web3Service = new Web3Service();

export default web3Service;
export type { NetworkConfig };