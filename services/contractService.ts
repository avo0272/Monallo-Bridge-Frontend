import Web3 from 'web3';

// 锁币合约 ABI
const LOCK_TOKENS_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FeesWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "crosschainHash",
          "type": "bytes32"
        }
      ],
      "name": "Locked",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "feeRate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "lock",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalFeesCollected",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// 合约地址配置
const CONTRACT_ADDRESSES = {
  'Ethereum-Sepolia': '0xA960259959584C308c87e8c06119e902cCBf88C8', // 替换为实际的合约地址
  'Imua-Testnet': '0x987654321...', // 替换为实际的合约地址
  'ZetaChain-Testnet': '0xabcdef123...', // 替换为实际的合约地址
};

class ContractService {
  private web3: Web3 | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    }
  }

  // 初始化Web3
  initWeb3() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      return true;
    }
    return false;
  }

  // 获取锁币合约实例
  getLockTokensContract(networkName: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const contractAddress = CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES];
    if (!contractAddress) {
      throw new Error(`网络 ${networkName} 没有配置合约地址`);
    }

    return new this.web3.eth.Contract(LOCK_TOKENS_ABI, contractAddress);
  }

  // 执行锁币操作
  async lockTokens(params: {
    networkName: string;
    sender: string;
    receiver: string;
    amount: string;
  }) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const { networkName, sender, receiver, amount } = params;
    
    try {
      const contract = this.getLockTokensContract(networkName);
      const value = this.web3.utils.toWei(amount, 'ether');
      
      // 调用合约的lock函数
      const tx = await contract.methods.lock(receiver).send({
        from: sender,
        value: value,
        gas: '200000' // 预估的gas限制
      });
      
      return {
        success: true,
        transactionHash: tx.transactionHash,
        events: tx.events
      };
    } catch (error) {
      console.error('锁币操作失败:', error);
      throw error;
    }
  }

  // 获取合约ABI
  getLockTokensABI() {
    return LOCK_TOKENS_ABI;
  }

  // 获取指定网络的合约地址
  getContractAddress(networkName: string) {
    return CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES] || null;
  }
}

// 创建单例实例
const contractService = new ContractService();

export default contractService;