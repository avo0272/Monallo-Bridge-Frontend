"use client"
import { useState, useEffect } from "react";

type SubmitProps = {
    onConnectWallet?: () => void; // 可选的连接钱包回调函数
    receiverAddress?: string; // 可选的接收者地址
};

export default function Submit({ onConnectWallet, receiverAddress }: SubmitProps) {
    const [connected, setConnected] = useState(false);
    
    // 从localStorage检查钱包连接状态
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedAddress = localStorage.getItem("walletAddress");
            setConnected(!!savedAddress);
            
            // 监听localStorage变化
            const handleStorageChange = () => {
                const currentAddress = localStorage.getItem("walletAddress");
                setConnected(!!currentAddress);
            };
            
            // 创建自定义事件监听器，用于跨组件通信
            window.addEventListener("storage", handleStorageChange);
            document.addEventListener("walletChanged", handleStorageChange);
            
            return () => {
                window.removeEventListener("storage", handleStorageChange);
                document.removeEventListener("walletChanged", handleStorageChange);
            };
        }
    }, []);
    
    // 处理连接钱包按钮点击
    function handleConnectClick() {
        // 如果提供了onConnectWallet回调，则调用它
        if (onConnectWallet) {
            onConnectWallet();
        } else {
            // 否则，触发一个自定义事件，通知header组件显示钱包下拉框
            const event = new CustomEvent("showWalletDropdown");
            document.dispatchEvent(event);
        }
    }
    
    // 处理Bridge按钮点击
    function handleBridgeClick() {
        // 这里可以添加桥接功能的实现
        console.log("Bridge功能待实现");
        if (receiverAddress) {
            console.log("接收者地址:", receiverAddress);
        } else {
            console.log("使用默认地址（当前连接的钱包地址）");
        }
    }
    
    return(
        <div className="w-full h-25 py-5 rounded-xl flex justify-between">
            {connected ? (
                <div className="w-full h-full flex justify-center items-center">
                    <button 
                        className="w-full h-full bg-black rounded-xl text-white font-bold text-xl hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={handleBridgeClick}
                    >
                        Bridge
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex justify-center items-center">
                    <button 
                        className="w-full h-full bg-black rounded-xl text-white font-bold text-xl hover:bg-gray-800 transition-colors cursor-pointer" 
                        onClick={handleConnectClick}
                    >
                        Connect Wallet
                    </button>
                </div>
            )}
        </div>
    )
}