"use client"
import { useState, useEffect } from "react";
import Web3 from "web3";
import contractService from "../services/contractService";
import web3Service from "../services/web3Service";
import axios from "axios";
import { useWebSocket } from "../hook/useWebSocket";

type SubmitProps = {
    onConnectWallet?: () => void; // 可选的连接钱包回调函数
    receiverAddress?: string; // 可选的接收者地址
    amount?: string; // 可选的金额参数
};

// WebSocket消息类型
type MintMessage = {
    type: string;
    data?: {
        targetToTxHash?: string;
        [key: string]: any;
    };
    success?: boolean;
    message?: string;
};

// 定义交易数据类型
type TransactionData = {
    fromAddress: string;
    toAddress: string;
    amount: string;
    sourceFromTxHash: string;
    fee: string | null;
};

export default function Submit({ onConnectWallet, receiverAddress, amount }: SubmitProps) {
    const [connected, setConnected] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<{
        currentAddress: string;
        receiver: string;
        value: string;
        currentNetwork: string;
    } | null>(null);
    const [isSendingToBackend, setIsSendingToBackend] = useState(false);
    const [backendResponse, setBackendResponse] = useState<string | null>(null);
    
    // WebSocket相关状态
    const [mintStatus, setMintStatus] = useState<{
        success?: boolean;
        message: string;
        targetToTxHash?: string;
    } | null>(null);
    const [showMintStatus, setShowMintStatus] = useState(false);
    
    // 处理WebSocket消息
    const handleWebSocketMessage = (data: MintMessage) => {
        console.log('收到WebSocket消息:', data);
        if (data && typeof data === 'object') {
            // 根据消息类型处理
            if (data.type === 'MINT_SUCCESS') {
                setMintStatus({
                    success: true,
                    message: '铸币成功！',
                    targetToTxHash: data.data?.targetToTxHash
                });
            } else if (data.type === 'MINT_FAILURE') {
                setMintStatus({
                    success: false,
                    message: data.message || '铸币失败',
                    targetToTxHash: data.data?.targetToTxHash
                });
            } else {
                // 处理其他类型的消息
                setMintStatus({
                    success: data.success,
                    message: data.message || '收到铸币状态更新',
                    targetToTxHash: data.data?.targetToTxHash
                });
            }
            
            console.log('处理后的铸币状态:', {
                success: data.type === 'MINT_SUCCESS',
                message: data.type === 'MINT_SUCCESS' ? '铸币成功！' : (data.message || '收到铸币状态更新'),
                targetToTxHash: data.data?.targetToTxHash
            });
            
            setShowMintStatus(true);
            // 如果处理中，则标记为完成
            if (isProcessing) {
                setIsProcessing(false);
            }
        }
    };
    
    // 使用WebSocket钩子
    useWebSocket(handleWebSocketMessage);
    
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
    
    // 处理Bridge按钮点击 - 显示确认对话框
    async function handleBridgeClick() {
        if (!window.ethereum) {
            alert("请安装MetaMask或其他兼容的钱包!");
            return;
        }
        
        try {
            // 获取当前连接的钱包地址
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentAddress = accounts[0];
            
            // 确定接收者地址，如果未提供则使用当前钱包地址
            const receiver = receiverAddress || currentAddress;
            
            // 获取当前网络
            const currentNetwork = await web3Service.getCurrentNetwork();
            
            // 确定发送金额，如果未提供则使用默认值
            const value = amount || '0.01';
            
            // 设置交易详情并显示确认对话框
            setTransactionDetails({
                currentAddress,
                receiver,
                value,
                currentNetwork
            });
            setShowConfirmDialog(true);
            
        } catch (error) {
            console.error("准备锁币操作失败:", error);
            alert("准备锁币操作失败: " + (error instanceof Error ? error.message : String(error)));
        }
    }
    
    // 确认锁币操作
    async function confirmBridgeTransaction() {
        if (!transactionDetails) return;
        
        setShowConfirmDialog(false);
        setIsProcessing(true);
        
        // 清除之前的状态
        setMintStatus(null);
        setShowMintStatus(false);
        
        try {
            const { currentAddress, receiver, value, currentNetwork } = transactionDetails;
            
            console.log("锁币操作开始:");
            console.log("- 当前网络:", currentNetwork);
            console.log("- 发送者地址:", currentAddress);
            console.log("- 接收者地址:", receiver);
            console.log("- 金额:", value, "ETH");
            
            // 显示锁币中状态
            setMintStatus({
                message: "锁币交易处理中..."
            });
            setShowMintStatus(true);
            
            // 使用合约服务执行锁币操作
            const result = await contractService.lockTokens({
                networkName: currentNetwork,
                sender: currentAddress,
                receiver: receiver,
                amount: value
            });
            
            const txHash = result.transactionHash;
            setTxHash(txHash);
            console.log("交易成功:", txHash);
            
            // 提取fee信息，如果有的话
            let fee = null;
            if (result.events && result.events.Locked) {
                fee = result.events.Locked.returnValues.fee;
            }
            
            // 准备发送到后端的数据
            const transactionData: TransactionData = {
                fromAddress: currentAddress,
                toAddress: receiver,
                amount: value,
                sourceFromTxHash: txHash,
                fee: fee ? fee.toString() : null
            };
            
            // 打印所有数据
            console.log("发送到后端的数据:", transactionData);
            
            // 更新状态为锁币成功，等待铸币
            setMintStatus({
                success: true,
                message: "锁币成功，正在等待铸币确认...",
                targetToTxHash: txHash
            });
            
            // 发送数据到后端
            await sendDataToBackend(transactionData);
            
            // 注意：此时不设置isProcessing为false，因为我们仍在等待WebSocket消息
            // WebSocket消息处理函数会在收到铸币确认后设置isProcessing为false
            
        } catch (error) {
            console.error("锁币失败:", error);
            
            // 显示错误状态
            setMintStatus({
                success: false,
                message: "锁币失败: " + (error instanceof Error ? error.message : String(error))
            });
            setShowMintStatus(true);
            setIsProcessing(false);
        }
    }
    
    // 取消锁币操作
    function cancelBridgeTransaction() {
        setShowConfirmDialog(false);
    }
    
    // 发送数据到后端
    async function sendDataToBackend(data: TransactionData) {
        setIsSendingToBackend(true);
        try {
            const response = await axios.post('http://localhost:5000/api/lockInfo', data);
            console.log(response);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = response.data;
            setBackendResponse("数据已成功发送到后端，等待铸币确认...");
            console.log("后端响应:", responseData);
            
            // 设置为处理中状态，等待WebSocket消息
            setIsProcessing(true);
            
            // 显示临时状态消息
            setMintStatus({
                success: undefined,
                message: "等待铸币确认，请稍候..."
            });
            setShowMintStatus(true);
            
            // 不再显示alert，等待WebSocket消息更新状态
            // WebSocket消息处理在handleWebSocketMessage函数中
            
        } catch (error) {
            console.error("发送数据到后端失败:", error);
            setBackendResponse("发送数据到后端失败: " + (error instanceof Error ? error.message : String(error)));
            
            // 显示错误状态
            setMintStatus({
                success: false,
                message: "发送数据到后端失败，但锁币操作已完成",
                targetToTxHash: data.sourceFromTxHash
            });
            setShowMintStatus(true);
            setIsProcessing(false);
        } finally {
            setIsSendingToBackend(false);
        }
    }
    
    return(
        <div className="flex flex-col w-full">
            <div className="w-full h-25 py-5 rounded-xl flex justify-between">
                {connected ? (
                    <div className="w-full h-full flex justify-center items-center">
                        <button 
                            className={`w-full h-full bg-black rounded-xl text-white font-bold text-xl hover:bg-gray-800 transition-colors ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleBridgeClick}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "处理中..." : "Bridge"}
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
            
            {/* 铸币状态模态弹窗 */}
            {showMintStatus && mintStatus && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* 毛玻璃背景 */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowMintStatus(false)}></div>
                    {/* 弹窗内容 */}
                    <div className={`max-w-md w-full mx-4 p-6 rounded-xl shadow-xl z-50 ${mintStatus.success ? 'bg-white border-l-4 border-green-500' : 'bg-white border-l-4 border-yellow-500'}`}>
                        <div className="flex items-start">
                            <div className="flex-grow">
                                <p className={`text-lg font-medium ${mintStatus.success ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {mintStatus.message}
                                </p>
                                {mintStatus.targetToTxHash && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700">交易哈希:</p>
                                        <p className="text-sm font-mono break-all mt-1">{mintStatus.targetToTxHash}</p>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setShowMintStatus(false)} 
                                className="ml-2 text-gray-400 hover:text-gray-600 text-xl font-medium"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowMintStatus(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 确认对话框 */}
            {showConfirmDialog && transactionDetails && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* 毛玻璃背景 */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={cancelBridgeTransaction}></div>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl z-50">
                        <h2 className="text-xl font-bold mb-4">确认锁币交易</h2>
                        <div className="mb-4">
                            <p className="mb-2"><span className="font-semibold">网络:</span> {transactionDetails.currentNetwork}</p>
                            <p className="mb-2"><span className="font-semibold">发送地址:</span> {transactionDetails.currentAddress}</p>
                            <p className="mb-2"><span className="font-semibold">接收地址:</span> {transactionDetails.receiver}</p>
                            <p className="mb-2"><span className="font-semibold">金额:</span> {transactionDetails.value} ETH</p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                                onClick={cancelBridgeTransaction}
                            >
                                取消
                            </button>
                            <button 
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                                onClick={confirmBridgeTransaction}
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}