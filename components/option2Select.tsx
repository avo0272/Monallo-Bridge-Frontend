"use client"
import { useState } from "react";

type Token = {
  symbol: string;
  network: string;
  address: string;
};

type NetworkKey = 'Ethereum-Sepolia' | 'Imua-Testnet' | 'ZetaChain-Testnet';
interface Option2SelectProps {
  onTokenSelect: (token: Token) => void
  showSelect: (v: boolean) => void
  fromNetwork?: string // 添加来自Option1的网络信息
}


export default function Option2Select({ onTokenSelect, showSelect, fromNetwork }: Option2SelectProps) {
  // 过滤掉与fromNetwork相同的网络
  const allNetworks = [
    { name: "ETH", icon: "/ethereum.png", network: "Ethereum-Sepolia" },
    { name: "Imua", icon: "/imua.png", network: "Imua-Testnet" },
    { name: "ZETA", icon: "/zeta.png", network: "ZetaChain-Testnet" },
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
      { symbol: "USDC", network: "Ethereum-Sepolia", address: "0x...." },
      { symbol: "ADA", network: "Ethereum-Sepolia", address: "" },
    ],
    "Imua-Testnet": [
      { symbol: "maoETH", network: "Imua-Testnet", address: "" },
      { symbol: "maoUSDC", network: "Imua-Testnet", address: "" },
      { symbol: "maoADA", network: "Imua-Testnet", address: "" }
    ],
    "ZetaChain-Testnet": [
      { symbol: "maoETH", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoUSDC", network: "ZetaChain-Testnet", address: "" },
      { symbol: "maoADA", network: "ZetaChain-Testnet", address: "" }
    ],
  };

  // 默认激活的网络应与body.tsx中的初始值一致
  const [activeNetwork, setActiveNetwork] = useState<NetworkKey>("Imua-Testnet");
  const [searchTerm, setSearchTerm] = useState("");

  // 检查当前选择的网络是否与fromNetwork相同
  const isNetworkDisabled = fromNetwork && (activeNetwork === fromNetwork);
  
  // 过滤代币：匹配 symbol 或 address，并且排除来自与fromNetwork相同网络的代币
  const filteredTokens = isNetworkDisabled 
    ? [] // 如果网络被禁用，返回空数组
    : networkInfo[activeNetwork].filter(token =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleTokenClick = (token: Token) => {
    console.log(token);
    

    
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
                setActiveNetwork(network.network as NetworkKey);
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
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto text-white max-h-44 ">
          {/* 代币列表 */}
          {isNetworkDisabled ? (
            <p className="text-red-500">Cannot select the same network as source! Please select another network.</p>
          ) : filteredTokens.length > 0 ? (
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                          <a href="#" className="text-blue-500">{token.address}</a>
                          <img src={'/share.png'} className="w-2.5 h-2.5 self-center" />
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