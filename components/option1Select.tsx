"use client"
import { useState } from "react";

type Token = {
  symbol: string;
  network: string;
  address: string;
};

type NetworkKey = 'Ethereum' | 'Imua' | 'ZetaChain';
interface Option1SelectProps {
  onTokenSelect: (token: Token) => void
  showSelect: (v: boolean) => void
}


export default function Option1Select({ onTokenSelect, showSelect }: Option1SelectProps) {
  const networks = [
    { name: "ETH", icon: "/ethereum.png", network: "Ethereum" },
    { name: "Imua", icon: "/imua.png", network: "Imua" },
    { name: "ZETA", icon: "/zeta.png", network: "ZetaChain" },
  ];

  const networkInfo = {
    Ethereum: [
      { symbol: "ETH", network: "Ethereum", address: "" },
      { symbol: "USDC", network: "Ethereum", address: "0x...." },
      { symbol: "ADA", network: "Ethereum", address: "" },
    ],
    Imua: [
      { symbol: "maoETH", network: "Imua", address: "" },
      { symbol: "maoUSDC", network: "Imua", address: "" },
      { symbol: "maoADA", network: "Imua", address: "" }
    ],
    ZetaChain: [
      { symbol: "maoETH", network: "ZetaChain", address: "" },
      { symbol: "maoUSDC", network: "ZetaChain", address: "" },
      { symbol: "maoADA", network: "ZetaChain", address: "" }
    ],
  };

  const [activeNetwork, setActiveNetwork] = useState<NetworkKey>("Ethereum");
  const [searchTerm, setSearchTerm] = useState("");

  // 过滤代币：匹配 symbol 或 address
  const filteredTokens = networkInfo[activeNetwork].filter(token =>
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
        {networks.map((network, index) => (
          <div
            key={index}
            onClick={() => setActiveNetwork(network.network as NetworkKey)}
            className="flex flex-col items-center cursor-pointer"
          >
            <img src={network.icon} alt={network.name} className="w-11 h-11 object-cover rounded-full" />
            <span className="text-white text-sm mt-2">{network.name}</span>
          </div>
        ))}
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
          {filteredTokens.length > 0 ? (
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