import Web3 from 'web3';

// 锁币合约 ABI
const LOCK_TOKENS_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
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
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "crosschainHash",
          "type": "bytes32"
        }
      ],
      "name": "Unlocked",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "RELAYER_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "imuaRecipient",
          "type": "address"
        }
      ],
      "name": "lock",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedUnlockTx",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "crosschainHash",
          "type": "bytes32"
        }
      ],
      "name": "unlock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

// 铸币合约ABI（包含ERC20标准功能和铸币销毁功能）
const MINT_TOKEN_ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name_",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol_",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MINTER_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
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
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
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
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burnFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "txHash",
          "type": "bytes32"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedTx",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
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
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// 销毁合约ABI（预留，需要根据实际合约补充）
const BURN_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "burner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sepoliaRecipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "crosschainHash",
          "type": "bytes32"
        }
      ],
      "name": "Burned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sepoliaRecipient",
          "type": "address"
        }
      ],
      "name": "burnCrossChain",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract IMintTokens",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// 合约地址配置
const CONTRACT_ADDRESSES = {
  // 锁币合约地址
  LOCK_CONTRACTS: {
    'Ethereum-Sepolia': '0xE218189033593d5870228D8C3A15bC035730FEeA',
    'Imua-Testnet': '0x987654321...',
    'ZetaChain-Testnet': '0xabcdef123...',
  },
  // 销毁合约地址
  BURN_CONTRACTS: {
    'Ethereum-Sepolia': '0x5652A9FC9752E3D7937206d00740500F3878d952',
    'Imua-Testnet': '0x5652A9FC9752E3D7937206d00740500F3878d952',
    'ZetaChain-Testnet': '0x5652A9FC9752E3D7937206d00740500F3878d952',
  },
  // 代币合约地址
  TOKEN_CONTRACTS: {
    'Ethereum-Sepolia': {
      'ETH': '',
      'maoETH': '0x06fF2cfbAAFDfcFbd4604B98C8a343dfa693476e'
    },
    'Imua-Testnet': {
      'maoETH': '0x06fF2cfbAAFDfcFbd4604B98C8a343dfa693476e',
      'ETH': ''
    },
    'ZetaChain-Testnet': {
      'maoETH': '0x06fF2cfbAAFDfcFbd4604B98C8a343dfa693476e',
      'ETH': ''
    }
  }
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

    const contractAddress = CONTRACT_ADDRESSES.LOCK_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.LOCK_CONTRACTS];
    if (!contractAddress) {
      throw new Error(`网络 ${networkName} 没有配置锁币合约地址`);
    }

    return new this.web3.eth.Contract(LOCK_TOKENS_ABI, contractAddress);
  }

  // 获取销毁合约实例
  getBurnContract(networkName: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const contractAddress = CONTRACT_ADDRESSES.BURN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.BURN_CONTRACTS];
    if (!contractAddress) {
      throw new Error(`网络 ${networkName} 没有配置销毁合约地址`);
    }

    return new this.web3.eth.Contract(BURN_CONTRACT_ABI, contractAddress);
  }

  // 获取代币合约地址
  getTokenContractAddress(networkName: string, tokenSymbol: string) {
    const networkTokens = CONTRACT_ADDRESSES.TOKEN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.TOKEN_CONTRACTS];
    if (!networkTokens) {
      throw new Error(`网络 ${networkName} 没有配置代币合约地址`);
    }
    
    return networkTokens[tokenSymbol as keyof typeof networkTokens] || '';
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

  // 获取指定网络的锁币合约地址
  getLockContractAddress(networkName: string) {
    return CONTRACT_ADDRESSES.LOCK_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.LOCK_CONTRACTS] || null;
  }

  // 获取指定网络的销毁合约地址
  getBurnContractAddress(networkName: string) {
    return CONTRACT_ADDRESSES.BURN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.BURN_CONTRACTS] || null;
  }

  // 获取铸币代币合约实例
  getMintTokenContract(tokenAddress: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }
    return new this.web3.eth.Contract(MINT_TOKEN_ABI, tokenAddress);
  }

  // 授权代币给指定地址
  async approveToken(tokenAddress: string, spenderAddress: string, amount: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const accounts = await this.web3.eth.getAccounts();
      const fromAddress = accounts[0];
      
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const value = this.web3.utils.toWei(amount, 'ether');
      
      const tx = await tokenContract.methods.approve(spenderAddress, value).send({
        from: fromAddress,
        gas: '150000' // 增加gas限制
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error('代币授权失败:', error);
      throw error;
    }
  }

  // 检查代币授权额度
  async checkAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const allowance = await tokenContract.methods.allowance(ownerAddress, spenderAddress).call();
      // 确保allowance是字符串类型
      return this.web3.utils.fromWei(String(allowance), 'ether');
    } catch (error) {
      console.error('检查授权额度失败:', error);
      throw error;
    }
  }

  // 获取代币余额
  async getTokenBalance(tokenAddress: string, accountAddress: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const balance = await tokenContract.methods.balanceOf(accountAddress).call();
      // 确保balance不为空且为有效数值
      if (!balance) return '0';
      return this.web3.utils.fromWei(balance.toString(), 'ether');
    } catch (error) {
      console.error('获取代币余额失败:', error);
      throw error;
    }
  }

  // 检查交易是否已处理（用于防重放攻击）
  async isTransactionProcessed(tokenAddress: string, txHash: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const processed = await tokenContract.methods.processedTx(txHash).call();
      return processed;
    } catch (error) {
      console.error('检查交易处理状态失败:', error);
      throw error;
    }
  }

  // 销毁代币操作 - 使用burnCrossChain方法
  async burnTokens(params: {
    networkName: string;
    sender: string;
    receiver: string;
    amount: string;
    tokenAddress: string;
  }) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const { networkName, sender, receiver, amount, tokenAddress } = params;
    
    try {
      // 获取销毁合约实例
      const burnContract = this.getBurnContract(networkName);
      
      // 注意：amount已经是wei格式，不需要再次转换
      const value = amount;
      
      // 使用burnCrossChain方法，根据ABI定义
      const tx = await burnContract.methods.burnCrossChain(value, receiver).send({
        from: sender,
        gas: '300000' // 增加gas限制以确保交易成功
      });
      
      console.log('销毁交易详情:', tx);
      
      return {
        success: true,
        transactionHash: tx.transactionHash,
        events: tx.events
      };
    } catch (error) {
      console.error('销毁操作失败:', error);
      throw error;
    }
  }

  // 获取销毁合约的代币地址
  async getBurnContractTokenAddress(networkName: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const burnContract = this.getBurnContract(networkName);
      const tokenAddress = await burnContract.methods.token().call();
      return tokenAddress;
    } catch (error) {
      console.error('获取销毁合约代币地址失败:', error);
      throw error;
    }
  }

  // 获取代币精度
  async getTokenDecimals(tokenAddress: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const decimals = await tokenContract.methods.decimals().call();
      // 将decimals转换为数字类型并返回
      // 确保decimals不为void,并转换为数字
      return decimals ? Number(decimals) : 18;
    } catch (error) {
      console.error('获取代币精度失败:', error);
      // 默认返回18位精度
      return 18;
    }
  }

  // 获取代币名称
  async getTokenName(tokenAddress: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const name = await tokenContract.methods.name().call();
      return name;
    } catch (error) {
      console.error('获取代币名称失败:', error);
      return 'Unknown Token';
    }
  }

  // 获取代币符号
  async getTokenSymbol(tokenAddress: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const tokenContract = this.getMintTokenContract(tokenAddress);
      const symbol = await tokenContract.methods.symbol().call();
      return symbol;
    } catch (error) {
      console.error('获取代币符号失败:', error);
      return 'UNKNOWN';
    }
  }

  // 格式化代币数量（考虑精度）
  async formatTokenAmount(tokenAddress: string, amount: string, fromWei: boolean = true) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      
      if (fromWei) {
        // 从wei转换为可读格式
        return this.web3.utils.fromWei(amount, decimals === 18 ? 'ether' : 'wei');
      } else {
        // 从可读格式转换为wei
        return this.web3.utils.toWei(amount, decimals === 18 ? 'ether' : 'wei');
      }
    } catch (error) {
      console.error('格式化代币数量失败:', error);
      // 默认使用ether精度
      return fromWei ? this.web3.utils.fromWei(amount, 'ether') : this.web3.utils.toWei(amount, 'ether');
    }
  }

  // 验证网络和合约配置
  validateNetworkConfig(networkName: string) {
    const lockContract = CONTRACT_ADDRESSES.LOCK_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.LOCK_CONTRACTS];
    const burnContract = CONTRACT_ADDRESSES.BURN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.BURN_CONTRACTS];
    const tokenContracts = CONTRACT_ADDRESSES.TOKEN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.TOKEN_CONTRACTS];
    
    return {
      hasLockContract: !!lockContract,
      hasBurnContract: !!burnContract,
      hasTokenContracts: !!tokenContracts,
      lockContractAddress: lockContract,
      burnContractAddress: burnContract,
      tokenContracts: tokenContracts
    };
  }
}

// 创建单例实例
const contractService = new ContractService();

export default contractService;