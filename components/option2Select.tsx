"use client"
import { useState } from "react";
import { getExplorerUrl } from "../utils/explorerUtils";
import contractService from "../services/contractService";
import { CONTRACT_ADDRESSES } from "../services/contractService";

type Token = {
  symbol: string;
  network: string;
  address: string;
};

type NetworkKey = 'Ethereum-Sepolia' | 'Imua-Testnet' | 'ZetaChain-Testnet' | 'PlatON-Mainnet';
interface Option2SelectProps {
  onTokenSelect: (token: Token) => void
  showSelect: (v: boolean) => void
  fromNetwork?: string // 添加来自Option1的网络信息
  selectedToken?: Token // 添加当前选择的代币信息
  fromToken?: Token // 添加源代币信息，用于过滤相同类型的代币
  walletConnected: boolean // 添加钱包连接状态
}


export default function Option2Select({ onTokenSelect, showSelect, fromNetwork, selectedToken, fromToken, walletConnected }: Option2SelectProps) {
  // 过滤掉与fromNetwork相同的网络
  const allNetworks = [
    { name: "ETH", icon: "/ethereum.png", network: "Ethereum-Sepolia" },
    { name: "Imua", icon: "/imua.png", network: "Imua-Testnet" },
    { name: "ZETA", icon: "/zeta.png", network: "ZetaChain-Testnet" },
    { name: "LAT", icon: "/platon.png", network: "PlatON-Mainnet" },
  ];
  
  // 过滤掉与fromNetwork相同的网络
  const networks = allNetworks.filter(network => {
    // 如果fromNetwork是undefined或null，显示所有网络
    if (!fromNetwork) return true;
    // 否则过滤掉与fromNetwork相同的网络
    return network.network !== fromNetwork;
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
      { symbol: "maoUSDC", network: "ZetaChain-Testnet", address: "0xABc28D728bbEF3159e8ab7dbB036125669B0cc64" },
      { symbol: "maoEURC", network: "ZetaChain-Testnet", address: "0x0ca5d56c30c5711B9AFFA6B4DB17367a987E234e" },
      { symbol: "maoLAT", network: "ZetaChain-Testnet", address: "0x8967CEc2393082878d54A9906Cc1d7163292fB6C" }
    ],
    "PlatON-Mainnet": [
      { symbol: "LAT", network: "PlatON-Mainnet", address: "" },
      { symbol: "USDC", network: "PlatON-Mainnet", address: "0xdA396A3C7FC762643f658B47228CD51De6cE936d" },
      { symbol: "maoUSDC", network: "PlatON-Mainnet", address: "0x2E715D00Cd58a048077640Ca1d3aB5CdaB181f0c" },
      { symbol: "maoETH", network: "PlatON-Mainnet", address: "0xE9B5Ee5E5cE9DcDc0E5cE9DcDc0E5cE9DcDc0E5cE9D" },
      { symbol: "maoEURC", network: "PlatON-Mainnet", address: "0x644B4d44EE3b1afD5370b6E541d55Edf5E6F2120"}
    ],
  };

  // 使用当前选择的网络作为默认激活的网络
  const [activeNetwork, setActiveNetwork] = useState<NetworkKey>(
    selectedToken?.network as NetworkKey || "Imua-Testnet"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // 检查当前选择的网络是否与fromNetwork相同
  const isNetworkDisabled = fromNetwork && (activeNetwork === fromNetwork);
  
  // 过滤代币：匹配 symbol 或 address，并且排除来自与fromNetwork相同网络的代币
  const filteredTokens = isNetworkDisabled 
    ? [] // 如果网络被禁用，返回空数组
    : networkInfo[activeNetwork].filter(token => {
        // 匹配搜索词
        return token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.address.toLowerCase().includes(searchTerm.toLowerCase());
      });

  const handleTokenClick = (token: Token) => {
    console.log("[TOKEN SELECTION] Selected target token:", token);
    console.log("[TOKEN SELECTION] Timestamp:", new Date().toISOString());
    
    // 检查钱包是否已连接
    if (!walletConnected) {
      alert("Please connect your wallet first.");
      showSelect(false);
      return;
    }
    
    // 检查是否需要更新From网络中IMUA链上的maoUSDC地址
    if (fromToken && fromToken.network === 'Imua-Testnet' && fromToken.symbol === 'maoUSDC') {
      console.log("[MAOUSDC UPDATE] From token is maoUSDC on IMUA, checking if address needs update based on target network:", token.network);
      console.log("[MAOUSDC UPDATE] Current fromToken:", {
        symbol: fromToken.symbol,
        network: fromToken.network,
        address: fromToken.address
      });
      
      // 获取正确的maoUSDC地址
      const tokenContracts = CONTRACT_ADDRESSES.TOKEN_CONTRACTS['Imua-Testnet'];
      if (tokenContracts && tokenContracts.maoUSDC && typeof tokenContracts.maoUSDC === 'object') {
        console.log('[MAOUSDC UPDATE] Found maoUSDC token contracts configuration:', tokenContracts.maoUSDC);
        let updatedAddress = '';
        
        // 使用类型断言将maoUSDC对象转换为具有字符串索引的类型
        const maoUSDCAddresses = tokenContracts.maoUSDC as Record<string, string>;
        const targetNetworkKey = token.network.split('-')[0];
        console.log(`[MAOUSDC UPDATE] Target network: ${token.network}, Target network key: ${targetNetworkKey}`);
        
        // 首先尝试使用完整的目标网络名称作为键
        if (token.network === 'Ethereum-Sepolia') {
          const address = maoUSDCAddresses['Ethereum-Sepolia'];
          if (address) {
            updatedAddress = address;
            console.log(`[MAOUSDC UPDATE] Found maoUSDC address using full network name Ethereum-Sepolia: ${updatedAddress}`);
          }
        }
        // 尝试使用PlatON键
        else if (token.network === 'PlatON-Mainnet' || targetNetworkKey === 'PlatON') {
          const address = maoUSDCAddresses['PlatON'];
          if (address) {
            updatedAddress = address;
            console.log(`[MAOUSDC UPDATE] Found maoUSDC address using network key PlatON: ${updatedAddress}`);
          }
        } else {
          console.log(`[MAOUSDC UPDATE] No matching maoUSDC address found for ${token.network} or ${targetNetworkKey}`);
        }
        
        if (updatedAddress && updatedAddress !== fromToken.address) {
          console.log(`[MAOUSDC UPDATE] Before update: fromToken address = ${fromToken.address}`);
          console.log(`[MAOUSDC UPDATE] Updating maoUSDC address from ${fromToken.address} to ${updatedAddress} for ${token.network}`);
          
          // 创建更新后的fromToken
          const updatedFromToken = {
            ...fromToken,
            address: updatedAddress
          };
          console.log(`[MAOUSDC UPDATE] After update: fromToken address = ${updatedFromToken.address}`);
          
          // 触发一个自定义事件，通知body组件更新fromToken
          const updateEvent = new CustomEvent("updateFromToken", {
            detail: updatedFromToken,
            bubbles: true,
            cancelable: true
          });
          
          // 记录事件分发前的时间戳
          console.log(`[MAOUSDC UPDATE] Dispatching event at: ${new Date().toISOString()}`);
          
          // 分发事件
          const eventDispatched = document.dispatchEvent(updateEvent);
          
          // 记录事件分发结果
          console.log(`[MAOUSDC UPDATE] Event dispatched successfully: ${eventDispatched}`);
          console.log("[MAOUSDC UPDATE] Dispatched updateFromToken event with token:", updatedFromToken);
          
          // 验证事件是否被正确处理的检查
          setTimeout(() => {
            // 这里无法直接访问body组件中的状态，但可以记录一个检查点
            console.log(`[MAOUSDC UPDATE] Event dispatch follow-up check at: ${new Date().toISOString()}`);
            console.log(`[MAOUSDC UPDATE] Expected maoUSDC address after update: ${updatedAddress}`);
          }, 200);
        } else {
          if (!updatedAddress) {
            console.log("[MAOUSDC UPDATE] No valid maoUSDC address found for the target network");
          } else {
            console.log("[MAOUSDC UPDATE] maoUSDC address is already up to date");
          }
        }
      } else {
        console.log('[MAOUSDC UPDATE] maoUSDC token contracts configuration not found or invalid');
      }
    }
    
    onTokenSelect(token);
    showSelect(false);
  };

  return (
    <div className="w-full h-115 p-5 bg-[#000000] rounded-xl flex flex-col">
      <p className="text-white">Select a network</p>
      <div className="flex gap-7 py-4">
        {allNetworks.map((network, index) => {
          // 检查是否是与fromNetwork相同的网络
          const isDisabled = fromNetwork && (network.network === fromNetwork);
          return (
            <div
              key={index}
              onClick={() => {
                if (isDisabled) {
                  return;
                }
                // 只更新UI状态，不切换网络
                setActiveNetwork(network.network as NetworkKey);
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
          {isNetworkDisabled ? (
            <p className="text-red-500">Cannot select the same network as source! Please select another network.</p>
          ) : filteredTokens.length > 0 ? (
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto custom-scrollbar">
                {filteredTokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-gray-900 rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleTokenClick(token)} // 点击代币时触发回调
                  >
                    <p>{token.symbol}</p>
                    <p className="text-gray-400 text-xs flex items-baseline gap-1">
                      {token.network}
                      {token.address && (
                        <>
                          &nbsp;·
                          <a 
                            href={getExplorerUrl(token.network, token.address)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center"
                          >
                            <span className="text-blue-500 truncate max-w-full inline-block align-bottom">{token.address}</span>
                            <img src={'/share.png'} className="w-2.5 h-2.5 ml-1" alt="View on explorer" title="View on explorer" />
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                ))}
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