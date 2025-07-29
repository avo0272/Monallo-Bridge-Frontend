"use client"
import { useState, useEffect } from "react";
import web3Service from "../services/web3Service";
import { getExplorerUrl } from "../utils/explorerUtils";
import contractService from "../services/contractService";
import { CONTRACT_ADDRESSES } from "../services/contractService";

type Token = {
  symbol: string;
  network: string;
  address: string;
};

type NetworkKey = 'Ethereum-Sepolia' | 'Imua-Testnet' | 'ZetaChain-Testnet' | 'PlatON-Mainnet';
interface Option1SelectProps {
  onTokenSelect: (token: Token) => void
  showSelect: (v: boolean) => void
  toNetwork?: string // 添加来自Option2的网络信息
  selectedToken?: Token // 添加当前选择的代币信息
  toToken?: Token // 添加目标代币信息，用于过滤相同类型的代币
  walletConnected: boolean // 添加钱包连接状态
}


export default function Option1Select({ onTokenSelect, showSelect, toNetwork, selectedToken, toToken, walletConnected }: Option1SelectProps) {
  // 所有可用的网络
  const allNetworks = [
    { name: "ETH", icon: "/ethereum.png", network: "Ethereum-Sepolia" },
    { name: "Imua", icon: "/imua.png", network: "Imua-Testnet" },
    { name: "ZETA", icon: "/zeta.png", network: "ZetaChain-Testnet" },
    { name: "LAT", icon: "/platon.png", network: "PlatON-Mainnet" },
  ];
  
  // 过滤掉与toNetwork相同的网络
  const networks = allNetworks.filter(network => {
    // 如果toNetwork是undefined或null，显示所有网络
    if (!toNetwork) return true;
    // 否则过滤掉与toNetwork相同的网络
    return network.network !== toNetwork;
  });

  const networkInfo = {
    "Ethereum-Sepolia": [
      { symbol: "ETH", network: "Ethereum-Sepolia", address: "" },
      { symbol: "USDC", network: "Ethereum-Sepolia", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" },
      { symbol: "EURC", network: "Ethereum-Sepolia", address: "0x08210f9170f89ab7658f0b5e3ff39b0e03c594d4" },
      { symbol: "maoIMUA", network: "Ethereum-Sepolia", address: "0x12306381b1b6ecb4132ff4ce324ed2be3728e865"},
      { symbol: "maoZETA", network: "Ethereum-Sepolia", address: "0x13864cc6Ac76F4109254D6C2ED90807a2904563A"},
      { symbol: "maoUSDC", network: "Ethereum-Sepolia", address: "0x7562c0d1ee790aed045839aee88d2e29fdf010d2" },
      { symbol: "maoLAT", network: "Ethereum-Sepolia", address: "0x1afd2d6f77b125b2b18c471f7ba95b009a039ba8" }
    ],
    "Imua-Testnet": [
      { symbol: "IMUA", network: "Imua-Testnet", address: "" },
      { symbol: "maoETH", network: "Imua-Testnet", address: "0x4a91a4a24b6883dbbddc6e6704a3c0e96396d2e9" },
      { symbol: "maoUSDC", network: "Imua-Testnet", address: "0x4ed64b15ab26b8fe3905b4101beccc1d5b3d49fd" },
      { symbol: "maoEURC", network: "Imua-Testnet", address: "0xDFEc8F8C99eC22AA21e392Aa00eFb3F517C44987" },
      { symbol: "maoZETA", network: "Imua-Testnet", address: "0xFCE1AC30062EfDD9119F6527392D4B935397f714"},
      { symbol: "maoLAT", network: "Imua-Testnet", address: "0x924A9fb56b2b1B5554327823b201b7eEF691E524" }
    ],
    "ZetaChain-Testnet": [
      { symbol: "ZETA", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoIMUA", network: "ZetaChain-Testnet", address: "0x644b4d44ee3b1afd5370b6e541d55edf5e6f2120" },
      { symbol: "maoETH", network: "ZetaChain-Testnet", address: "0x3d4097f44b2765722c4ed315f14ad4b5f718136e" },
      { symbol: "maoUSDC", network: "ZetaChain-Testnet", address: "0xABc28D728bbEF3159e8ab7dbB036125669B0cc64" },//platon bridge zeta
      { symbol: "maoEURC", network: "ZetaChain-Testnet", address: "0x0ca5d56c30c5711B9AFFA6B4DB17367a987E234e" },//sepolia bridge zeta
      { symbol: "maoLAT", network: "ZetaChain-Testnet", address: "0x8967CEc2393082878d54A9906Cc1d7163292fB6C" }
    ],
    "PlatON-Mainnet": [
      { symbol: "LAT", network: "PlatON-Mainnet", address: "" },
      { symbol: "USDC", network: "PlatON-Mainnet", address: "0xdA396A3C7FC762643f658B47228CD51De6cE936d" },
      { symbol: "maoUSDC", network: "PlatON-Mainnet", address: "0x8967CEc2393082878d54A9906Cc1d7163292fB6C" },
      { symbol: "maoETH", network: "PlatON-Mainnet", address: "0xE9B5Ee5E5cE9DcDc0E5cE9DcDc0E5cE9DcDc0E5cE9D" },
      { symbol: "maoEURC", network: "PlatON-Mainnet", address: "0x644B4d44EE3b1afD5370b6E541d55Edf5E6F2120"}
    ],
  };

  // 使用当前选择的网络作为默认激活的网络
  const [activeNetwork, setActiveNetwork] = useState<NetworkKey>(
    selectedToken?.network as NetworkKey || "Ethereum-Sepolia"
  );
  const [searchTerm, setSearchTerm] = useState("");
  // 添加状态来强制更新UI
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 监听toNetwork变化，当目标网络变化时强制更新UI
  useEffect(() => {
    // 当toNetwork变化时，强制更新UI以刷新maoUSDC地址显示
    setForceUpdate(prev => prev + 1);
  }, [toNetwork]);

  // 过滤代币：匹配 symbol 或 address
  // From可以自由选择任何代币，不受To的限制
  const filteredTokens = networkInfo[activeNetwork].filter(token => {
    // 只匹配搜索词，不做其他限制
    return token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.address.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // 处理IMUA链上的maoUSDC特殊情况
  const handleMaoUSDCAddress = (token: Token) => {
    // 如果是IMUA链上的maoUSDC，并且有目标网络信息，则根据目标网络动态设置地址
    if (token.network === 'Imua-Testnet' && token.symbol === 'maoUSDC' && toNetwork) {
      console.log(`Handling maoUSDC address for target network: ${toNetwork}`);
      // 从contractService获取正确的地址
      const targetNetworkKey = toNetwork.split('-')[0]; // 提取网络名称的第一部分
      const tokenContracts = CONTRACT_ADDRESSES.TOKEN_CONTRACTS['Imua-Testnet'];
      
      if (tokenContracts && tokenContracts.maoUSDC && typeof tokenContracts.maoUSDC === 'object') {
        console.log('Found maoUSDC token contracts configuration:', tokenContracts.maoUSDC);
        
        // 使用类型断言将maoUSDC对象转换为具有字符串索引的类型
        const maoUSDCAddresses = tokenContracts.maoUSDC as Record<string, string>;
        
        // 尝试使用完整的目标网络名称作为键
        if (toNetwork === 'Ethereum-Sepolia') {
          const address = maoUSDCAddresses['Ethereum-Sepolia'];
          if (address) {
            token.address = address;
            console.log(`Using maoUSDC address for Ethereum-Sepolia: ${token.address}`);
          }
        }
        // 尝试使用PlatON键
        else if (toNetwork === 'PlatON-Mainnet' || targetNetworkKey === 'PlatON') {
          const address = maoUSDCAddresses['PlatON'];
          if (address) {
            token.address = address;
            console.log(`Using maoUSDC address for PlatON: ${token.address}`);
          }
        } else {
          console.log(`No matching maoUSDC address found for ${toNetwork} or ${targetNetworkKey}`);
        }
      } else {
        console.log('maoUSDC token contracts configuration not found or invalid');
      }
    }
    return token;
  };
  
  // 获取IMUA链上maoUSDC的当前地址（根据目标网络）
  const getCurrentMaoUSDCAddress = (): string => {
    if (!toNetwork) return '';
    
    const tokenContracts = CONTRACT_ADDRESSES.TOKEN_CONTRACTS['Imua-Testnet'];
    if (!tokenContracts || !tokenContracts.maoUSDC || typeof tokenContracts.maoUSDC !== 'object') {
      return '';
    }
    
    const maoUSDCAddresses = tokenContracts.maoUSDC as Record<string, string>;
    const targetNetworkKey = toNetwork.split('-')[0];
    
    if (toNetwork === 'Ethereum-Sepolia' && maoUSDCAddresses['Ethereum-Sepolia']) {
      return maoUSDCAddresses['Ethereum-Sepolia'];
    } else if ((toNetwork === 'PlatON-Mainnet' || targetNetworkKey === 'PlatON') && maoUSDCAddresses['PlatON']) {
      return maoUSDCAddresses['PlatON'];
    }
    
    return '';
  };

  const handleTokenClick = (token: Token) => {
    console.log("Original token:", token);
    
    // 检查钱包是否已连接
    if (!walletConnected) {
      alert("Please connect your wallet first.");
      showSelect(false);
      return;
    }
    
    // 处理IMUA链上的maoUSDC特殊情况
    const processedToken = handleMaoUSDCAddress({...token});
    console.log("Processed token:", processedToken);
    
    onTokenSelect(processedToken);
    showSelect(false);
  };

  return (
    <div className="w-full h-115 p-5 bg-[#000000] rounded-xl flex flex-col">
      <p className="text-white">Select a network</p>
      <div className="flex gap-7 py-4">
        {allNetworks.map((network, index) => {
          // 检查是否是与toNetwork相同的网络
          const isDisabled = toNetwork && (network.network === toNetwork);
          return (
            <div
              key={index}
              onClick={async () => {
                if (isDisabled) {
                  return;
                }
                try {
                  // 切换网络
                  await web3Service.switchNetwork(network.network);
                  setActiveNetwork(network.network as NetworkKey);
                  console.log(`Successfully switched to network: ${network.network}`);
                } catch (error) {
                  console.error('Failed to switch network:', error);
                  // Even if switching fails, update UI state to let user know which network was selected
                  setActiveNetwork(network.network as NetworkKey);
                }
              }}
              className={`flex flex-col items-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <img src={network.icon} alt={network.name} className="w-11 h-11 object-cover rounded-full" />
              <span className="text-white text-sm mt-2">{network.name}</span>
            </div>
          );
        })}
        <div className="flex flex-col items-center cursor-not-allowed">
          <img src="other.png" alt="other networks" className="w-11 h-11 object-cover opacity-50" />
          <span className="text-white text-sm mt-2">Other</span>
        </div>
      </div>
      <div className="flex flex-col my-2">
        <span className="text-white">Select a token</span>
        <div>
          <input
            type="text"
            placeholder="Search for a token tick or token address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-400 py-2">Tokens on {activeNetwork}</p>
        </div>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto text-white max-h-44">
          {/* 代币列表 */}
          {activeNetwork && toNetwork && (activeNetwork === toNetwork) ? (
            <div className="text-red-500 py-4">Cannot select the same network as target! Please select a different network.</div>
          ) : filteredTokens.length > 0 ? (
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto custom-scrollbar">
                {filteredTokens.map((token, idx) => {
                  // 处理IMUA链上的maoUSDC特殊情况，动态显示地址
                  let displayAddress = token.address;
                  let explorerUrl = getExplorerUrl(token.network, token.address);
                  
                  if (token.network === 'Imua-Testnet' && token.symbol === 'maoUSDC' && toNetwork) {
                    const currentAddress = getCurrentMaoUSDCAddress();
                    if (currentAddress) {
                      displayAddress = currentAddress;
                      explorerUrl = getExplorerUrl(token.network, currentAddress);
                    }
                  }
                  
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-gray-900 rounded hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleTokenClick(token)} // 点击代币时触发回调
                    >
                      <p>{token.symbol}</p>
                      <p className="text-gray-400 text-xs flex items-baseline gap-1">
                        {token.network}
                        {displayAddress && (
                          <>
                            &nbsp;·
                            <a 
                              href={explorerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center"
                            >
                              <span className="text-blue-500 truncate max-w-full inline-block align-bottom">{displayAddress}</span>
                              <img src={'/share.png'} className="w-2.5 h-2.5 ml-1" alt="View on explorer" title="View on explorer" />
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No tokens found.</p>
          )}
        </div>
      </div>
    </div>
  );
}