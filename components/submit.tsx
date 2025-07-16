"use client"
import { useState, useEffect, useCallback, useReducer } from "react";
import contractService from "../services/contractService";
import web3Service from "../services/web3Service";
import axios from "axios";
import { useWebSocket } from "../hook/useWebSocket";
import { NETWORK_CONFIGS } from "../services/web3Service";

type Token = {
    symbol: string;
    network: string;
    address: string;
};

type SubmitProps = {
    onConnectWallet?: () => void; // 可选的连接钱包回调函数
    receiverAddress?: string; // 可选的接收者地址
    amount?: string; // 可选的金额参数
    selectedToken1?: Token; // 可选的源代币信息
    selectedToken2?: Token; // 可选的目标代币信息
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

// 定义状态类型
type State = {
    connected: boolean;
    isProcessing: boolean;
    txHash: string;
    showConfirmDialog: boolean;
    transactionDetails: {
        currentAddress: string;
        receiver: string;
        value: string;
        currentNetwork: string;
    } | null;
    isSendingToBackend: boolean;
    backendResponse: string | null;
    mintStatus: {
        success?: boolean;
        message: string;
        targetToTxHash?: string;
    } | null;
    showMintStatus: boolean;
    walletAddress: string;
};

// 定义操作类型
type Action =
    | { type: 'SET_CONNECTED', payload: boolean }
    | { type: 'SET_PROCESSING', payload: boolean }
    | { type: 'SET_TX_HASH', payload: string }
    | { type: 'SET_SHOW_CONFIRM_DIALOG', payload: boolean }
    | { type: 'SET_TRANSACTION_DETAILS', payload: State['transactionDetails'] }
    | { type: 'SET_SENDING_TO_BACKEND', payload: boolean }
    | { type: 'SET_BACKEND_RESPONSE', payload: string | null }
    | { type: 'SET_MINT_STATUS', payload: State['mintStatus'] }
    | { type: 'SET_SHOW_MINT_STATUS', payload: boolean }
    | { type: 'SET_WALLET_ADDRESS', payload: string }
    | { type: 'HANDLE_WEBSOCKET_MESSAGE', payload: MintMessage }
    | { type: 'PREPARE_BRIDGE_TRANSACTION', payload: State['transactionDetails'] }
    | { type: 'CLEAR_MINT_STATUS' }
    | { type: 'CLOSE_CONFIRM_DIALOG' };

// 定义reducer函数
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_CONNECTED':
            return { ...state, connected: action.payload };
        case 'SET_PROCESSING':
            return { ...state, isProcessing: action.payload };
        case 'SET_TX_HASH':
            return { ...state, txHash: action.payload };
        case 'SET_SHOW_CONFIRM_DIALOG':
            return { ...state, showConfirmDialog: action.payload };
        case 'SET_TRANSACTION_DETAILS':
            return { ...state, transactionDetails: action.payload };
        case 'SET_SENDING_TO_BACKEND':
            return { ...state, isSendingToBackend: action.payload };
        case 'SET_BACKEND_RESPONSE':
            return { ...state, backendResponse: action.payload };
        case 'SET_MINT_STATUS':
            return { ...state, mintStatus: action.payload };
        case 'SET_SHOW_MINT_STATUS':
            return { ...state, showMintStatus: action.payload };
        case 'SET_WALLET_ADDRESS':
            return { ...state, walletAddress: action.payload };
        case 'HANDLE_WEBSOCKET_MESSAGE': {
            const data = action.payload;
            let newMintStatus = state.mintStatus;
            
            if (data && typeof data === 'object') {
                // 根据消息类型处理
                if (data.type === 'MINT_SUCCESS') {
                    newMintStatus = {
                        success: true,
                        message: 'Minting successful!',
                        targetToTxHash: data.data?.targetToTxHash
                    };
                } else if (data.type === 'MINT_FAILURE') {
                    newMintStatus = {
                        success: false,
                        message: data.message || 'Minting failed',
                        targetToTxHash: data.data?.targetToTxHash
                    };
                } else {
                    // 处理其他类型的消息
                    newMintStatus = {
                        success: data.success,
                        message: data.message || 'Received minting status update',
                        targetToTxHash: data.data?.targetToTxHash
                    };
                }
                
                return {
                    ...state,
                    mintStatus: newMintStatus,
                    showMintStatus: true,
                    isProcessing: state.isProcessing ? false : state.isProcessing
                };
            }
            return state;
        }
        case 'PREPARE_BRIDGE_TRANSACTION':
            return {
                ...state,
                transactionDetails: action.payload,
                showConfirmDialog: true
            };
        case 'CLEAR_MINT_STATUS':
            return {
                ...state,
                mintStatus: null,
                showMintStatus: false
            };
        case 'CLOSE_CONFIRM_DIALOG':
            return {
                ...state,
                showConfirmDialog: false
            };
        default:
            return state;
    }
}

export default function Submit({ onConnectWallet, receiverAddress, amount, selectedToken1, selectedToken2 }: SubmitProps) {
    // 设置默认的代币信息
    const defaultToken1: Token = { symbol: "ETH", network: "Ethereum-Sepolia", address: "" };
    const defaultToken2: Token = { symbol: "maoETH", network: "Imua-Testnet", address: "0x21717FD336Db40Af910603f8a8b4aA202736C4Ec" };
    
    // 使用传入的代币信息或默认值
    const sourceToken = selectedToken1 || defaultToken1;
    const targetToken = selectedToken2 || defaultToken2;
    // 初始状态
    const initialState: State = {
        connected: false,
        isProcessing: false,
        txHash: "",
        showConfirmDialog: false,
        transactionDetails: null,
        isSendingToBackend: false,
        backendResponse: null,
        mintStatus: null,
        showMintStatus: false,
        walletAddress: ""
    };
    
    // 使用useReducer替代多个useState
    const [state, dispatch] = useReducer(reducer, initialState);
    
    // 处理WebSocket消息 - 使用useCallback缓存函数，避免不必要的重新创建
    const handleWebSocketMessage = useCallback((data: MintMessage) => {
        console.log('Received WebSocket message:', data);
        dispatch({ type: 'HANDLE_WEBSOCKET_MESSAGE', payload: data });
    }, []);
    
    // Update wallet address when connection status changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedAddress = localStorage.getItem("walletAddress") || "";
            dispatch({ type: 'SET_WALLET_ADDRESS', payload: savedAddress });
        }
    }, [state.connected]);
    
    // 使用更新后的useWebSocket钩子，获取连接状态和重连方法
    const { isConnected, reconnect } = useWebSocket(handleWebSocketMessage, state.walletAddress);
    
    // 在用户交互时触发WebSocket重连
    const triggerReconnect = useCallback(() => {
        if (!isConnected && state.walletAddress) {
            console.log('User interaction detected, attempting to reconnect WebSocket');
            reconnect();
        }
    }, [isConnected, state.walletAddress, reconnect]);
    
    // 监听用户交互事件
    useEffect(() => {
        const userInteractionEvents = ['mousedown', 'keydown', 'touchstart'];
        
        const handleUserInteraction = () => {
            triggerReconnect();
        };
        
        userInteractionEvents.forEach(event => {
            document.addEventListener(event, handleUserInteraction);
        });
        
        return () => {
            userInteractionEvents.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        };
    }, [triggerReconnect]);
    
    // 从localStorage检查钱包连接状态
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedAddress = localStorage.getItem("walletAddress");
            dispatch({ type: 'SET_CONNECTED', payload: !!savedAddress });
            
            // Listen for localStorage changes
            const handleStorageChange = () => {
                const currentAddress = localStorage.getItem("walletAddress") || "";
                dispatch({ type: 'SET_CONNECTED', payload: !!currentAddress });
                dispatch({ type: 'SET_WALLET_ADDRESS', payload: currentAddress });
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
        // 尝试重新连接WebSocket
        triggerReconnect();
        
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
        // 尝试重新连接WebSocket
        triggerReconnect();
        
        if (!window.ethereum) {
            alert("Please install MetaMask or other compatible wallet!");
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
            const value = amount || '';
            
            // 设置交易详情并显示确认对话框
            dispatch({ 
                type: 'PREPARE_BRIDGE_TRANSACTION', 
                payload: {
                    currentAddress,
                    receiver,
                    value,
                    currentNetwork
                }
            });
            
        } catch (error) {
            console.error("Prepare lock operation failed:", error);
            alert("Prepare lock operation failed: " + (error instanceof Error ? error.message : String(error)));
        }
    }
    
    // 确认锁币操作
    async function confirmBridgeTransaction() {
        if (!state.transactionDetails) return;
        
        dispatch({ type: 'SET_SHOW_CONFIRM_DIALOG', payload: false });
        dispatch({ type: 'SET_PROCESSING', payload: true });
        
        // 清除之前的状态
        dispatch({ type: 'CLEAR_MINT_STATUS' });
        
        try {
            const { currentAddress, receiver, value, currentNetwork } = state.transactionDetails;
            
            console.log("Lock operation started:");
            console.log("- Current network:", currentNetwork);
            console.log("- Sender address:", currentAddress);
            console.log("- Receiver address:", receiver);
            console.log("- Amount:", value, "ETH");
            
            // 显示锁币中状态
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    message: "Processing lock transaction..."
                }
            });
            dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: true });
            
            // 使用合约服务执行锁币操作
            const result = await contractService.lockTokens({
                networkName: currentNetwork,
                sender: currentAddress,
                receiver: receiver,
                amount: value
            });
            console.log("Lock transaction result:", result);
            
            const txHash = result.transactionHash;
            dispatch({ type: 'SET_TX_HASH', payload: txHash });
            console.log("Transaction successful:", txHash);
            
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
            
            // Print all data
            console.log("Data to be sent to backend:", transactionData);
            
            // 更新状态为锁币成功，等待铸币
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    success: true,
                    message: "Lock successful, waiting for minting confirmation...",
                    targetToTxHash: txHash
                }
            });
            
            // 发送数据到后端
            await sendDataToBackend(transactionData);
            
            // 注意：此时不设置isProcessing为false，因为我们仍在等待WebSocket消息
            // WebSocket消息处理函数会在收到铸币确认后设置isProcessing为false
            
        } catch (error) {
            console.error("Lock failed:", error);
            
            // Show error status
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    success: false,
                    message: "Lock failed: " + (error instanceof Error ? error.message : String(error))
                }
            });
            dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: true });
            dispatch({ type: 'SET_PROCESSING', payload: false });
        }
    }
    
    // 取消锁币操作
    function cancelBridgeTransaction() {
        dispatch({ type: 'CLOSE_CONFIRM_DIALOG' });
    }
    
    // Send data to backend
    async function sendDataToBackend(data: TransactionData) {
        dispatch({ type: 'SET_SENDING_TO_BACKEND', payload: true });
        try {
            // 获取当前网络信息
            const currentNetwork = await web3Service.getCurrentNetwork();
            const networkConfig = NETWORK_CONFIGS[currentNetwork as keyof typeof NETWORK_CONFIGS];
            
            // 获取目标网络信息（从选中的目标代币信息中获取）
            const targetNetwork = targetToken.network;
            const targetNetworkConfig = NETWORK_CONFIGS[targetNetwork as keyof typeof NETWORK_CONFIGS];
            
            // 获取源链和目标链的代币信息（从选中的代币信息中获取）
            const sourceTokenName = `'${sourceToken.symbol}'`;
            console.log('Source token symbol:', sourceToken.symbol);
            
            const targetTokenName = `'${targetToken.symbol}'`;
            console.log('Target token symbol:', targetToken.symbol);
            
            // 获取源链和目标链的代币合约地址（从选中的代币信息中获取）
            const sourceContractAddress = sourceToken.address || "''";
            console.log('Source token contract address:', sourceContractAddress);
            
            const targetContractAddress = targetToken.address || "''";
            console.log('Target token contract address:', targetContractAddress);
            
            
            // 构建新的数据格式
            const requestData = {
                sourceChainId: networkConfig ? parseInt(networkConfig.chainId, 16).toString() : '', 
                sourceChain: `'${currentNetwork}'`, 
                sourceRpc: networkConfig ? `'${networkConfig.rpcUrls[0]}'` : "''", 
                sourceFromAddress: data.fromAddress, 
                sourceFromTokenName: sourceTokenName, // 动态获取源链代币符号
                sourceFromTokenContractAddress: sourceContractAddress, // 获取源链合约地址
                sourceFromAmount: data.amount, 
                sourceFromHandingFee: data.fee || "", 
                sourceFromRealAmount: data.amount, // 实际金额，可能需要减去手续费
                sourceFromTxHash: data.sourceFromTxHash, 
                sourceFromTxStatus: "'pending'", 
                targetChainId: targetNetworkConfig ? parseInt(targetNetworkConfig.chainId, 16).toString() : '', 
                targetChain: `'${targetNetwork}'`, 
                targetRpc: targetNetworkConfig ? `'${targetNetworkConfig.rpcUrls[0]}'` : "''", 
                targetToAddress: data.toAddress, 
                targetToTokenName: targetTokenName, // 动态获取目标链代币符号
                targetToTokenContractAddress: targetContractAddress, // 获取目标链合约地址
                targetToReceiveAmount: data.amount, // 接收金额，可能与发送金额不同
                targetToCallContractAddress: "''", 
                targetToGasStatus: "''", 
                targetToTxHash: "''", 
                targetToTxStatus: "'pending'", 
                crossBridgeStatus: "'pending'",
                walletAddress: state.walletAddress // 保留钱包地址用于身份识别
            };
            
            console.log("Sending data to backend:", requestData);
            const response = await axios.post('https://uatbridge.monallo.ai/lockinfo/api/crossLockInfo', requestData);
            // const response = await axios.post('http://192.168.31.176:5000/api/lockInfo', requestData);
            console.log(response);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = response.data;
            dispatch({ type: 'SET_BACKEND_RESPONSE', payload: "Data successfully sent to backend, waiting for minting confirmation..." });
            console.log("Backend response:", responseData);
            
            // Set to processing state, waiting for WebSocket message
            dispatch({ type: 'SET_PROCESSING', payload: true });
            
            // Show temporary status message
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    success: undefined,
                    message: "Waiting for minting confirmation, please wait..."
                }
            });
            dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: true });
            
            // No longer show alert, waiting for WebSocket message to update status
            // WebSocket message handling is in handleWebSocketMessage function
            
        } catch (error) {
            console.error("Failed to send data to backend:", error);
            dispatch({ type: 'SET_BACKEND_RESPONSE', payload: "Failed to send data to backend: " + (error instanceof Error ? error.message : String(error)) });
            
            // 显示错误状态
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    success: false,
                    message: "Failed to send data to backend, but lock operation is complete",
                    targetToTxHash: data.sourceFromTxHash
                }
            });
            dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: true });
            dispatch({ type: 'SET_PROCESSING', payload: false });
        } finally {
            dispatch({ type: 'SET_SENDING_TO_BACKEND', payload: false });
        }
    }
    
    return(
        <div className="flex flex-col w-full">
            <div className="w-full h-25 py-5 rounded-xl flex justify-between">
                {state.connected ? (
                    <div className="w-full h-full flex justify-center items-center">
                        <button 
                            className={`w-full h-full bg-black rounded-xl text-white font-bold text-xl hover:bg-gray-800 transition-colors ${state.isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleBridgeClick}
                            disabled={state.isProcessing}
                        >
                            {state.isProcessing ? "Processing..." : "Bridge"}
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
            {state.showMintStatus && state.mintStatus && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* 毛玻璃背景 */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: false })}></div>
                    {/* 弹窗内容 */}
                    <div className={`max-w-md w-full mx-4 p-6 rounded-xl shadow-xl z-50 ${state.mintStatus.success ? 'bg-white border-l-4 border-green-500' : 'bg-white border-l-4 border-yellow-500'}`}>
                        <div className="flex items-start">
                            <div className="flex-grow">
                                <p className={`text-lg font-medium ${state.mintStatus.success ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {state.mintStatus.message}
                                </p>
                                {state.mintStatus.targetToTxHash && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
                                        <p className="text-sm font-mono break-all mt-1">{state.mintStatus.targetToTxHash}</p>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: false })} 
                                className="ml-2 text-gray-400 hover:text-gray-600 text-xl font-medium"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: false })}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 确认对话框 */}
            {state.showConfirmDialog && state.transactionDetails && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* 毛玻璃背景 */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={cancelBridgeTransaction}></div>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl z-50">
                        <h2 className="text-xl font-bold mb-4">Confirm Lock Transaction</h2>
                        <div className="mb-4">
                            <p className="mb-2"><span className="font-semibold">Network:</span> {state.transactionDetails.currentNetwork}</p>
                            <p className="mb-2"><span className="font-semibold">From Address:</span> {state.transactionDetails.currentAddress}</p>
                            <p className="mb-2"><span className="font-semibold">To Address:</span> {state.transactionDetails.receiver}</p>
                            <p className="mb-2"><span className="font-semibold">Amount:</span> {state.transactionDetails.value} ETH</p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                                onClick={cancelBridgeTransaction}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                                onClick={confirmBridgeTransaction}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}