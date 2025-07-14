"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Web3 from "web3";
import web3Service from "../services/web3Service";

export default function Header() {
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState("Imua Testnet");
  
  // 初始化时从localStorage加载钱包地址
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddress = localStorage.getItem("walletAddress");
      if (savedAddress) {
        setWalletAddress(savedAddress);
        setIsConnected(true);
      }
    }
  }, []);
  
  // 格式化钱包地址，只显示前四位和后四位
  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // 连接MetaMask钱包
  const connectMetaMask = async () => {
    try {
      // 检查是否安装了MetaMask
      if (typeof window.ethereum !== "undefined") {
        // 请求用户授权连接钱包
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        setShowWalletDropdown(false);
        // 保存钱包地址到localStorage
        localStorage.setItem("walletAddress", address);
        // 触发自定义事件，通知其他组件钱包状态已变化
        if (typeof document !== "undefined") {
          const event = new CustomEvent("walletChanged");
          document.dispatchEvent(event);
        }
        console.log("MetaMask连接成功:", address);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Failed to connect MetaMask:", error);
      alert("Failed to connect MetaMask: " + (error as Error).message);
    }
  };

  // 连接OKX钱包
  const connectOKXWallet = async () => {
    try {
      // 检查是否安装了OKX钱包
      if (typeof window.okxwallet !== "undefined") {
        // 请求用户授权连接钱包
        const accounts = await window.okxwallet.request({ method: "eth_requestAccounts" });
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        setShowWalletDropdown(false);
        // 保存钱包地址到localStorage
        localStorage.setItem("walletAddress", address);
        // 触发自定义事件，通知其他组件钱包状态已变化
        if (typeof document !== "undefined") {
          const event = new CustomEvent("walletChanged");
          document.dispatchEvent(event);
        }
        console.log("OKX钱包连接成功:", address);
      } else {
        alert("Please install the OKX Wallet extension!");
      }
    } catch (error) {
      console.error("Failed to connect OKX Wallet:", error);
      alert("Failed to connect OKX Wallet: " + (error as Error).message);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setWalletAddress("");
    setIsConnected(false);
    setShowWalletDropdown(false);
    // 从localStorage中移除钱包地址
    localStorage.removeItem("walletAddress");
    // 触发自定义事件，通知其他组件钱包状态已变化
    if (typeof document !== "undefined") {
      const event = new CustomEvent("walletChanged");
      document.dispatchEvent(event);
    }
    console.log("钱包已断开连接");
  };
  
  // 网络名称映射
  const getNetworkDisplayName = (networkName: string): string => {
    const networkMap: { [key: string]: string } = {
      'Ethereum-Sepolia': 'Ethereum Sepolia',
      'Imua-Testnet': 'Imua Testnet',
      'ZetaChain-Testnet': 'ZetaChain Testnet',
      'Unknown Network': 'Unknown Network'
    };
    return networkMap[networkName] || networkName;
  };

  // 监听钱包账户变化和网络变化
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 定义账户变化处理函数
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // 用户断开了连接
          setWalletAddress("");
          setIsConnected(false);
          // 从localStorage中移除钱包地址
          localStorage.removeItem("walletAddress");
        } else {
          // 账户已更改
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          // 更新localStorage中的钱包地址
          localStorage.setItem("walletAddress", accounts[0]);
        }
        
        // 触发自定义事件，通知其他组件钱包状态已变化
        if (typeof document !== "undefined") {
          const event = new CustomEvent("walletChanged");
          document.dispatchEvent(event);
        }
      };

      // 获取初始网络
      const initializeNetwork = async () => {
        try {
          const network = await web3Service.getCurrentNetwork();
          setCurrentNetwork(getNetworkDisplayName(network));
        } catch (error) {
          console.error('获取初始网络失败:', error);
        }
      };

      initializeNetwork();

      // 监听网络变化
      web3Service.onNetworkChange((network: string) => {
        setCurrentNetwork(getNetworkDisplayName(network));
      });

      // 添加事件监听器
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
      }
      
      if (window.okxwallet) {
        window.okxwallet.on("accountsChanged", handleAccountsChanged);
      }
      
      // 监听自定义事件，用于从其他组件触发钱包下拉框显示
      const handleShowWalletDropdown = () => {
        setShowWalletDropdown(true);
      };
      
      document.addEventListener("showWalletDropdown", handleShowWalletDropdown);

      // 清理函数
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
        if (window.okxwallet) {
          window.okxwallet.removeListener("accountsChanged", handleAccountsChanged);
        }
        document.removeEventListener("showWalletDropdown", handleShowWalletDropdown);
      };
    }
    return undefined;
  }, []);

  return (
    <header className="bg-white h-20 px-4 py-2 ">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 max-w-8xl mx-auto">
          <div className="flex-shrink-0 flex items-center ml-10">
            <a href="/">
                <Image src="/logo.png" alt="Logo" width={150} height={150} />
            </a>
          </div>
          <div className="flex items-center space-x-4 mr-10">
            <a href="#" className="flex items-center text-sm ">
              <Image src="/eye.png" alt="Validator Icon" width={15} height={15} className="mr-1" />
              MonalloScan
            </a>
            <a
              href="#"
              className="flex items-center text-sm relative"
            >
              <Image src="/bridge.png" alt="Blockchain Icon" width={15} height={15} className="mr-1" />
              Bridge
            </a>
            <a href="#" className="flex items-center text-sm ">
              <Image src="/file.png" alt="Faucet Icon" width={15} height={15} className="mr-1" />
              Histroy
            </a>
            <div
              className="relative"
              onMouseLeave={() => setShowWalletDropdown(false)}
            >
              <button 
                className="bg-black text-white text-xs px-3 py-1 rounded-full cursor-pointer"
                onClick={() => setShowWalletDropdown((v) => !v)}
              >
                {isConnected ? formatAddress(walletAddress) : "Connect Wallet"}
              </button>
              {showWalletDropdown && (
                <>
                  {/* 添加一个看不见的连接区域，防止鼠标移动时触发 mouseleave */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-40 h-2"></div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-40 rounded-xl bg-rose-100 shadow-lg p-4 z-30"
                  >
                  {!isConnected ? (
                    // 未连接钱包时显示钱包选项
                    <>
                      <div 
                        className="flex items-center mb-2 hover:bg-rose-200 rounded px-2 py-1 cursor-pointer"
                        onClick={connectMetaMask}
                      >
                        <Image src="/metamask.svg" alt="MetaMask Icon" width={24} height={24} className="mr-2" />
                        <span className="text-base text-rose-900">MetaMask</span>
                      </div>
                      <div 
                        className="flex items-center hover:bg-rose-200 rounded px-2 py-1 cursor-pointer"
                        onClick={connectOKXWallet}
                      >
                        <Image src="/okx_light.svg" alt="OKX Icon" width={24} height={24} className="mr-2" />
                        <span className="text-base text-rose-900">OKXWallet</span>
                      </div>
                    </>
                  ) : (
                    // 已连接钱包时显示断开连接选项
                    <div 
                      className="flex items-center justify-center hover:bg-rose-200 rounded px-2 py-1 cursor-pointer"
                      onClick={disconnectWallet}
                    >
                      <span className="text-base text-rose-900">Disconnect</span>
                    </div>
                  )}
                </div>
                </>
              )}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              <span className="text-sm">{currentNetwork}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}