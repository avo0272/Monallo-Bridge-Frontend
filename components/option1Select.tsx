"use client"
import { useState } from "react";
import web3Service from "../services/web3Service";
import { getExplorerUrl } from "../utils/explorerUtils";

type Token = {
  symbol: string;
  network: string;
  address: string;
};

type NetworkKey = 'Ethereum-Sepolia' | 'Imua-Testnet' | 'ZetaChain-Testnet';
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
      { symbol: "maoIMUA", network: "Ethereum-Sepolia", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"},
      { symbol: "maoZETA", network: "Ethereum-Sepolia", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"}
    ],
    "Imua-Testnet": [
      { symbol: "IMUA", network: "Imua-Testnet", address: "" },
      { symbol: "maoETH", network: "Imua-Testnet", address: "" },
      { symbol: "maoUSDC", network: "Imua-Testnet", address: "" },
      { symbol: "maoEURC", network: "Imua-Testnet", address: "" },
      { symbol: "maoZETA", network: "Imua-Testnet", address: ""}
    ],
    "ZetaChain-Testnet": [
      { symbol: "ZETA", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoIMUA", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoETH", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoUSDC", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoEURC", network: "ZetaChain-Testnet", address: "" }
    ],
  };

  // 使用当前选择的网络作为默认激活的网络
  const [activeNetwork, setActiveNetwork] = useState<NetworkKey>(
    selectedToken?.network as NetworkKey || "Ethereum-Sepolia"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // 过滤代币：匹配 symbol 或 address
  const filteredTokens = networkInfo[activeNetwork].filter(token => {
    // 匹配搜索词
    return token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleTokenClick = (token: Token) => {
    console.log(token);
    
    // 检查钱包是否已连接
    if (!walletConnected) {
      alert("Please connect your wallet first.");
      showSelect(false);
      return;
    }
    
    onTokenSelect(token);
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
        <div className="flex flex-col items-center cursor-pointer">
          <img src="other.png" alt="other networks" className="w-11 h-11 object-cover " />
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