import Web3 from 'web3';

// Source合约 ABI
const Source_ABI = [
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
          "internalType": "bytes32",
          "name": "transactionId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "destinationChainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipientAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "tokenAddress",
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
        }
      ],
      "name": "AssetLocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "transactionId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "AssetUnlocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
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
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
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
      "name": "FEE_MANAGER_ROLE",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "accumulatedFees",
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
      "name": "feeConfig",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isPercentage",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "value",
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
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_destinationChainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        }
      ],
      "name": "lock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_destinationChainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        }
      ],
      "name": "lockNative",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
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
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedUnlockTxs",
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
      "name": "relayerSigner",
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
          "internalType": "bool",
          "name": "_isPercentage",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "setFeeConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newSigner",
          "type": "address"
        }
      ],
      "name": "setRelayerSigner",
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
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_txId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_signature",
          "type": "bytes"
        }
      ],
      "name": "unlock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// Target合约ABI
const Target_ABI = [
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
        },
        {
          "internalType": "uint256",
          "name": "sourceChainId_",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "relayerSigner_",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "InvalidAmount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRecipient",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidSignature",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SignerCannotBeZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransactionAlreadyProcessed",
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
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldSigner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newSigner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "updatedBy",
          "type": "address"
        }
      ],
      "name": "RelayerSignerUpdated",
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
          "internalType": "bytes32",
          "name": "transactionId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "burner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "sourceChainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipientAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensBurned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "transactionId",
          "type": "bytes32"
        },
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
          "indexed": true,
          "internalType": "address",
          "name": "minter",
          "type": "address"
        }
      ],
      "name": "TokensMinted",
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
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
          "name": "amount",
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
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
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
          "name": "recipientOnSource",
          "type": "address"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
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
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
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
          "internalType": "bytes32",
          "name": "txId",
          "type": "bytes32"
        },
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
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
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
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
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
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedMintTxs",
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
      "name": "relayerSigner",
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
          "internalType": "address",
          "name": "newSigner",
          "type": "address"
        }
      ],
      "name": "setRelayerSigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sourceChainId",
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
          "name": "amount",
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
          "name": "amount",
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
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// 定义MINT_TOKEN_ABI常量，使用Target_ABI
const MINT_TOKEN_ABI = Target_ABI;
const LOCK_TOKENS_ABI = Source_ABI;
const BURN_CONTRACT_ABI = Target_ABI;

// 合约地址配置
const CONTRACT_ADDRESSES = {
  // 锁币合约地址 (Source.sol)
  LOCK_CONTRACTS: {
    'Ethereum-Sepolia': '0x4195868b54b70d4420E6203e85A4b92a6705FF28', // Sepolia上的Source合约地址
    'PlatON-Mainnet': '0x2fd92027B1afB80613B5720Df1015D41873F8d7C', // PlatON上的Source合约地址
    'Imua-Testnet': '0xfcc4936B0b437469F5CE4C3cBD7eAa05CE5f581d', // Imua上的Source合约地址
    'ZetaChain-Testnet': '0x1870f6D7A02994EE08E7c9BC3aEad81f00de1A05', // ZetaChain上的Source合约地址
  },
  // 销毁合约地址 (Target.sol) - 用于销毁代币跨链解锁回原链
  BURN_CONTRACTS: {
    // 在Sepolia上销毁maoETH需要使用Sepolia上的Target合约
    'Ethereum-Sepolia': '0x4a91a4a24b6883dbbddc6e6704a3c0e96396d2e9', // Sepolia上的Target合约地址
    // 在Imua上销毁maoETH需要使用Imua上的Target合约
    'Imua-Testnet': '0x4a91a4a24b6883dbbddc6e6704a3c0e96396d2e9', // Imua上的Target合约地址
    // 在ZetaChain上销毁maoETH需要使用ZetaChain上的Target合约
    'ZetaChain-Testnet': '0xD34F03fE714C2DbfDAC4fDCbEAe9d0d72c8031D5', // ZetaChain上的Target合约地址
    // 在PlatON上销毁maoETH需要使用PlatON上的Target合约
    'PlatON-Mainnet': '0x75891AA11AC45ab150e81AE744728d11C72c472B', // PlatON上的Target合约地址
  },
  // 目标合约地址
  TARGET_CONTRACTS: {
    // imua链上targets
    'target_210425': '0x75891AA11AC45ab150e81AE744728d11C72c472B', // PlatON网络的目标合约地址
    'target_11155111': '0x4a91a4a24b6883dbbddc6e6704a3c0e96396d2e9', // Sepolia网络的目标合约地址
    'target_7001': '0x4a91a4a24b6883dbbddc6e6704a3c0e96396d2e9', // Imua网络的目标合约地址
    // sepolia链上targets
    'sepolia_target_210425': '0x4195868b54b70d4420E6203e85A4b92a6705FF28', // sepolia上PlatON的目标合约地址
    'sepolia_target_7001': '0x5652A9FC9752E3D7937206d00740500F3878d952', // sepolia上Imua的目标合约地址
    // platon链上targets
    'platon_target_11155111': '0x59def95E745b5F87146021FB2D3D6C857667F519', // platon上Sepolia的目标合约地址
    'platon_target_7001': '0x5652A9FC9752E3D7937206d00740500F3878d952', // platon上Imua的目标合约地址
    // USDC targets
    'sepolia_usdc_target_210425': '0x4195868b54b70d4420E6203e85A4b92a6705FF28', // sepolia上USDC到PlatON的目标合约地址
    'platon_usdc_target_11155111': '0x59def95E745b5F87146021FB2D3D6C857667F519', // platon上USDC到Sepolia的目标合约地址
  },
  // 代币合约地址
  TOKEN_CONTRACTS: {
    'Ethereum-Sepolia': {
      'ETH': '', // 原生代币
      'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC代币地址
      'EURC': '0x08210f9170f89ab7658f0b5e3ff39b0e03c594d4', // EURC代币地址
      'maoIMUA': '0x12306381b1b6ecb4132ff4ce324ed2be3728e865', // maoIMUA代币地址
      'maoZETA': '0x13864cc6Ac76F4109254D6C2ED90807a2904563A', // maoZETA代币地址
      'maoUSDC': '0x7562c0d1ee790aed045839aee88d2e29fdf010d2', // maoUSDC代币地址
      'maoLAT': '0x1afd2d6f77b125b2b18c471f7ba95b009a039ba8' // maoLAT代币地址
    },
    'Imua-Testnet': {
      'IMUA': '', // 原生代币
      'maoETH': '0x4a91a4a24b6883dbbddc6e6704a3c0e96396d2e9', // maoETH代币地址
      'maoLAT': '0x924A9fb56b2b1B5554327823b201b7eEF691E524', // maoLAT代币地址
      'maoZETA': '0xFCE1AC30062EfDD9119F6527392D4B935397f714', // maoZETA代币地址
      'maoEURC': '0xDFEc8F8C99eC22AA21e392Aa00eFb3F517C44987', // maoEURC代币地址
      'maoUSDC': { // 根据目标网络不同使用不同的合约地址
        'PlatON': '0x4ed64b15ab26b8fe3905b4101beccc1d5b3d49fd', // 当TO选择的网络为PlatON时
        'Ethereum-Sepolia': '0xe5a26a2c90b6e629861bb25f10177f06720e5335' // 当TO选择的网络为Ethereum-Sepolia时
      }
    },
    'ZetaChain-Testnet': {
      'ZETA': '', // 原生代币
      'maoIMUA': '0x644b4d44ee3b1afd5370b6e541d55edf5e6f2120', // maoIMUA代币地址
      'maoETH': '0x3d4097f44b2765722c4ed315f14ad4b5f718136e', // maoETH代币地址
      'maoUSDC': '0xABc28D728bbEF3159e8ab7dbB036125669B0cc64', // maoUSDC代币地址 (platon bridge zeta)
      'maoEURC': '0x0ca5d56c30c5711B9AFFA6B4DB17367a987E234e', // maoEURC代币地址 (sepolia bridge zeta)
      'maoLAT': '0x8967CEc2393082878d54A9906Cc1d7163292fB6C' // maoLAT代币地址
    },
    'PlatON-Mainnet': {
      'LAT': '', // 原生代币
      'USDC': '0xdA396A3C7FC762643f658B47228CD51De6cE936d', // USDC代币地址
      'maoUSDC': '0x2E715D00Cd58a048077640Ca1d3aB5CdaB181f0c', // maoUSDC代币地址
      'maoETH': '0xE9B5Ee5E5cE9DcDc0E5cE9DcDc0E5cE9DcDc0E5cE9D', // maoETH代币地址
      'maoEURC': '0x644B4d44EE3b1afD5370b6E541d55Edf5E6F2120' // maoEURC代币地址
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
  // networkName: 当前网络名称，用于在该网络上销毁代币
  // targetNetwork: 可选参数，目标网络名称，用于特殊情况下指定目标网络
  getBurnContract(networkName: string, targetNetwork?: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const contractAddress = this.getBurnContractAddress(networkName, targetNetwork);
    if (!contractAddress) {
      throw new Error(`网络 ${networkName} ${targetNetwork ? `到 ${targetNetwork}` : ''} 没有配置销毁合约地址`);
    }

    return new this.web3.eth.Contract(BURN_CONTRACT_ABI, contractAddress);
  }

  // 获取代币合约地址
  getTokenContractAddress(networkName: string, tokenSymbol: string, targetNetwork?: string): string {
    const networkTokens = CONTRACT_ADDRESSES.TOKEN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.TOKEN_CONTRACTS];
    if (!networkTokens) {
      throw new Error(`网络 ${networkName} 没有配置代币合约地址`);
    }
    
    const tokenAddress = networkTokens[tokenSymbol as keyof typeof networkTokens];
    if (!tokenAddress) {
      return '';
    }
    
    // 处理特殊情况：如果代币地址是一个对象（如maoUSDC根据目标网络不同使用不同地址）
    if (typeof tokenAddress === 'object' && targetNetwork) {
      // 首先尝试使用完整的目标网络名称作为键
      if (targetNetwork in tokenAddress) {
        return tokenAddress[targetNetwork as keyof typeof tokenAddress] as string;
      }
      
      // 如果完整网络名称不存在，尝试从targetNetwork中提取网络名称的第一部分
      const targetNetworkKey = targetNetwork.split('-')[0];
      if (targetNetworkKey in tokenAddress) {
        return tokenAddress[targetNetworkKey as keyof typeof tokenAddress] as string;
      }
      
      return '';
    }
    
    return tokenAddress as string;
  }

  // 获取代币地址（用于同名代币处理）
  getTokenAddress(networkName: string, tokenSymbol: string, targetNetwork?: string): string {
    try {
      return this.getTokenContractAddress(networkName, tokenSymbol, targetNetwork);
    } catch (error) {
      console.error(`Error getting token address for ${tokenSymbol} on ${networkName}${targetNetwork ? ` to ${targetNetwork}` : ''}:`, error);
      return '';
    }
  }

  // 执行锁币操作
  async lockTokens(params: {
    networkName: string;
    sender: string;
    receiver: string;
    amount: string;
    isNative?: boolean; // 新增参数，标识是否为原生代币
    tokenAddress?: string; // 新增参数，ERC20代币地址
    targetNetwork?: string; // 新增参数，指定目标网络
  }) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const { networkName, sender, receiver, amount, isNative = true, tokenAddress, targetNetwork } = params;
    
    try {
      const contract = this.getLockTokensContract(networkName);
      
      // 根据代币类型转换金额
      let value: string;
      if (isNative) {
        // 原生代币使用18位精度
        value = this.web3.utils.toWei(amount, 'ether');
      } else if (tokenAddress) {
        // ERC20代币根据实际精度转换
        const decimals = await this.getTokenDecimals(tokenAddress);
        if (decimals === 18) {
          value = this.web3.utils.toWei(amount, 'ether');
        } else {
          // 对于非18位精度的代币，手动计算
          const amountBN = this.web3.utils.toBigInt(parseFloat(amount) * Math.pow(10, decimals));
          value = amountBN.toString();
        }
        console.log(`锁币代币: ${tokenAddress}, 金额: ${amount}, 精度: ${decimals}, 转换后: ${value}`);
      } else {
        throw new Error('ERC20代币必须提供tokenAddress');
      }
      
      // 获取目标链ID映射
      const networkToChainId: {[key: string]: number} = {
        'Ethereum-Sepolia': 11155111,
        'Imua-Testnet': 233,
        'ZetaChain-Testnet': 7001,
        'PlatON-Mainnet': 210425
      };
      
      // 根据用户选择的目标网络确定目标链ID
      let destinationChainId = 0;
      if (targetNetwork && networkToChainId[targetNetwork]) {
        destinationChainId = networkToChainId[targetNetwork];
      } 
      console.log('destinationChainId', destinationChainId);
      
      if (destinationChainId === 0) {
        throw new Error(`无法确定网络 ${targetNetwork || networkName} 的目标链ID`);
      }
      
      let tx;
      
      if (isNative) {
        // 如果是原生代币，调用lockNative函数
        console.log('锁定原生代币，调用lockNative函数');
        const paused = await contract.methods.paused().call();
        console.log('合约是否暂停：', paused);
        
        tx = await contract.methods.lockNative(
          destinationChainId,     // _destinationChainId 参数
          receiver                // _recipient 参数
        ).send({
          from: sender,
          value: value,  // 发送原生代币值
          gas: '500000'  // gas限制
        });
      } else {
        // 如果是ERC20代币，调用lock函数
        console.log('锁定ERC20代币，调用lock函数');
        // 使用传入的ERC20代币地址或默认零地址
        const tokenAddr = tokenAddress || '0x0000000000000000000000000000000000000000';
        
        tx = await contract.methods.lock(
          tokenAddr,              // _token 参数
          value,                  // _amount 参数
          destinationChainId,     // _destinationChainId 参数
          receiver                // _recipient 参数
        ).send({
          from: sender,
          gas: '300000'  // gas限制
        });
      }
      
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
  // networkName: 当前网络名称，用于在该网络上销毁代币
  // targetNetwork: 可选参数，目标网络名称，用于特殊情况下指定目标网络
  getBurnContractAddress(networkName: string, targetNetwork?: string) {
    // 如果提供了目标网络，可以在未来扩展这里的逻辑，根据源网络和目标网络获取特定的销毁合约地址
    // 目前，销毁合约地址是根据当前网络确定的，因为销毁操作是在当前网络上进行的
    return CONTRACT_ADDRESSES.BURN_CONTRACTS[networkName as keyof typeof CONTRACT_ADDRESSES.BURN_CONTRACTS] || null;
  }
  
  // 获取目标合约地址
  getTargetContractAddress(targetChainId: string | number, sourceNetwork?: string) {
    // 如果提供了源网络，则使用特定格式的键
    if (sourceNetwork) {
      // 从sourceNetwork中提取网络名称的第一部分（如Ethereum-Sepolia -> sepolia）
      const sourcePrefix = sourceNetwork.split('-')[0].toLowerCase();
      // 对于USDC特殊处理
      if (sourceNetwork.includes('USDC')) {
        const targetKey = `${sourcePrefix}_usdc_target_${targetChainId}`;
        return CONTRACT_ADDRESSES.TARGET_CONTRACTS[targetKey as keyof typeof CONTRACT_ADDRESSES.TARGET_CONTRACTS] || null;
      } else {
        const targetKey = `${sourcePrefix}_target_${targetChainId}`;
        return CONTRACT_ADDRESSES.TARGET_CONTRACTS[targetKey as keyof typeof CONTRACT_ADDRESSES.TARGET_CONTRACTS] || null;
      }
    }
    
    // 默认使用原来的格式
    const targetKey = `target_${targetChainId}`;
    return CONTRACT_ADDRESSES.TARGET_CONTRACTS[targetKey as keyof typeof CONTRACT_ADDRESSES.TARGET_CONTRACTS] || null;
  }
  
  // 获取目标合约实例
  getTargetContract(targetChainId: string | number, sourceNetwork?: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }
    
    const contractAddress = this.getTargetContractAddress(targetChainId, sourceNetwork);
    if (!contractAddress) {
      throw new Error(`目标链 ${targetChainId} ${sourceNetwork ? `从 ${sourceNetwork}` : ''} 没有配置目标合约地址`);
    }
    
    return new this.web3.eth.Contract(Target_ABI, contractAddress);
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
      
      // 获取代币精度
      const decimals = await this.getTokenDecimals(tokenAddress);
      
      // 根据代币精度转换金额
      let value: string;
      if (decimals === 18) {
        value = this.web3.utils.toWei(amount, 'ether');
      } else {
        // 对于非18位精度的代币，手动计算
        const amountBN = this.web3.utils.toBigInt(parseFloat(amount) * Math.pow(10, decimals));
        value = amountBN.toString();
      }
      
      console.log(`授权代币: ${tokenAddress}, 金额: ${amount}, 精度: ${decimals}, 转换后: ${value}`);
      
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
      
      // 获取代币精度
      const decimals = await this.getTokenDecimals(tokenAddress);
      
      // 根据代币精度转换授权额度
      let formattedAllowance: string;
      if (decimals === 18) {
        formattedAllowance = this.web3.utils.fromWei(String(allowance), 'ether');
      } else {
        // 对于非18位精度的代币，手动计算
        const allowanceBN = this.web3.utils.toBigInt(String(allowance));
        const divisor = Math.pow(10, decimals);
        formattedAllowance = (Number(allowanceBN) / divisor).toString();
      }
      
      console.log(`检查授权额度: ${tokenAddress}, 原始值: ${allowance}, 精度: ${decimals}, 格式化后: ${formattedAllowance}`);
      
      return formattedAllowance;
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
      
      // 获取代币精度
      const decimals = await this.getTokenDecimals(tokenAddress);
      
      // 根据代币精度转换余额
      let formattedBalance: string;
      if (decimals === 18) {
        formattedBalance = this.web3.utils.fromWei(balance.toString(), 'ether');
      } else {
        // 对于非18位精度的代币，手动计算
        const balanceBN = this.web3.utils.toBigInt(balance.toString());
        const divisor = Math.pow(10, decimals);
        formattedBalance = (Number(balanceBN) / divisor).toString();
      }
      
      console.log(`获取代币余额: ${tokenAddress}, 原始值: ${balance}, 精度: ${decimals}, 格式化后: ${formattedBalance}`);
      
      return formattedBalance;
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
    targetNetwork?: string; // 可选参数，目标网络名称
  }) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    const { networkName, sender, receiver, amount, tokenAddress, targetNetwork } = params;
    
    try {
      // 获取销毁合约实例，可以传入目标网络参数
      const burnContract = this.getBurnContract(networkName, targetNetwork);
      
      // 注意：amount已经是wei格式，不需要再次转换
      const value = amount;
      
      // 使用burn方法，根据ABI定义
      const tx = await burnContract.methods.burn(value, receiver).send({
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
  // networkName: 当前网络名称
  // targetNetwork: 可选参数，目标网络名称
  async getBurnContractTokenAddress(networkName: string, targetNetwork?: string) {
    if (!this.web3) {
      throw new Error('Web3 未初始化');
    }

    try {
      const burnContract = this.getBurnContract(networkName, targetNetwork);
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

// 导出CONTRACT_ADDRESSES常量和contractService单例
export { CONTRACT_ADDRESSES };
export default contractService;