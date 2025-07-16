import Web3 from 'web3';

// 网络配置接口
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

// 支持的网络配置
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
    chainId: '0xe9', // 8081
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
};

// ERC20代币标准ABI
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
  private web3: Web3 | null = null;
  private currentNetwork: string = '';
  private networkChangeCallbacks: ((network: string) => void)[] = [];

  constructor() {
    this.initializeWeb3();
    this.setupEventListeners();
  }

  // 初始化Web3
  private initializeWeb3() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    }
  }

  // 设置事件监听器
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
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const chainId = await this.web3.eth.getChainId();
      const hexChainId = '0x' + chainId.toString(16);
      const networkName = this.getNetworkNameByChainId(hexChainId);
      this.currentNetwork = networkName;
      return networkName;
    } catch (error) {
      console.error('获取当前网络失败:', error);
      return 'Unknown Network';
    }
  }

  // 切换网络
  async switchNetwork(networkName: string): Promise<boolean> {
    if (!this.web3 || !window.ethereum) {
      throw new Error('Web3 或钱包未初始化');
    }

    const networkConfig = NETWORK_CONFIGS[networkName];
    if (!networkConfig) {
      throw new Error(`不支持的网络: ${networkName}`);
    }

    try {
      // 尝试切换到指定网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });

      this.currentNetwork = networkName;
      // console.log(`成功切换到网络: ${networkName}`);
      return true;
    } catch (error: any) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        try {
          await this.addNetwork(networkConfig);
          this.currentNetwork = networkName;
          return true;
        } catch (addError) {
          console.error('添加网络失败:', addError);
          throw addError;
        }
      }
      console.error('切换网络失败:', error);
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
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const balance = await this.web3.eth.getBalance(address);
      const ethBalance = this.web3.utils.fromWei(balance, 'ether');
      return parseFloat(ethBalance).toFixed(6);
    } catch (error) {
      console.error('获取原生代币余额失败:', error);
      return '0';
    }
  }

  // 获取ERC20代币余额
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    // 如果没有代币地址，返回原生代币余额
    if (!tokenAddress) {
      return this.getNativeBalance(walletAddress);
    }

    try {
      // 创建合约实例
      const tokenContract = new this.web3.eth.Contract(ERC20_ABI, tokenAddress);

      // 获取代币精度
      const decimals = await tokenContract.methods.decimals().call();

      // 获取原始余额
      const balance = await tokenContract.methods.balanceOf(walletAddress).call();

      // 根据精度转换余额
      const formattedBalance = Number(balance) / Math.pow(10, Number(decimals));

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