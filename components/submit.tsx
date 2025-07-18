"use client"
import { useState, useEffect, useCallback, useReducer } from "react";
import contractService from "../services/contractService";
import web3Service from "../services/web3Service";
import axios from "axios";
import { useWebSocket } from "../hook/useWebSocket";
import { NETWORK_CONFIGS } from "../services/web3Service";
import Web3 from "web3";
import { 
    formatTokenAmount, 
    parseTokenAmount, 
    validateTokenAmount, 
    hasSufficientBalance, 
    hasSufficientAllowance,
    formatTxHash,
    formatAddress,
    generateTransactionId
} from "../utils/tokenUtils";
import {
    CURRENT_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    STATUS_MESSAGES,
} from "../config/constants";

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
    needsAuthorization: boolean;
    isCheckingAuthorization: boolean;
    isAuthorizing: boolean;
    authorizedAmount: string;
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
    | { type: 'CLOSE_CONFIRM_DIALOG' }
    | { type: 'SET_NEEDS_AUTHORIZATION', payload: boolean }
    | { type: 'SET_CHECKING_AUTHORIZATION', payload: boolean }
    | { type: 'SET_AUTHORIZING', payload: boolean }
    | { type: 'SET_AUTHORIZED_AMOUNT', payload: string };

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
        case 'SET_NEEDS_AUTHORIZATION':
            return {
                ...state,
                needsAuthorization: action.payload
            };
        case 'SET_CHECKING_AUTHORIZATION':
            return {
                ...state,
                isCheckingAuthorization: action.payload
            };
        case 'SET_AUTHORIZING':
            return {
                ...state,
                isAuthorizing: action.payload
            };
        case 'SET_AUTHORIZED_AMOUNT':
            return {
                ...state,
                authorizedAmount: action.payload
            };
        default:
            return state;
    }
}

export default function Submit({ onConnectWallet, receiverAddress, amount, selectedToken1, selectedToken2 }: SubmitProps) {
    // 设置默认的代币信息
    const defaultToken1: Token = { symbol: "ETH", network: "Ethereum-Sepolia", address: "" };
    const defaultToken2: Token = { symbol: "maoETH", network: "Imua-Testnet", address: "0x06fF2cfbAAFDfcFbd4604B98C8a343dfa693476e" };
    
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
        walletAddress: "",
        needsAuthorization: false,
        isCheckingAuthorization: false,
        isAuthorizing: false,
        authorizedAmount: "0"
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
    
    // 检查授权状态
    const checkAuthorization = async () => {
        if (!sourceToken.symbol.startsWith('mao') || !amount || !state.walletAddress) {
            dispatch({ type: 'SET_NEEDS_AUTHORIZATION', payload: false });
            return;
        }

        dispatch({ type: 'SET_CHECKING_AUTHORIZATION', payload: true });
        try {
            // 获取当前网络
            const currentNetwork = await web3Service.getCurrentNetwork();
            
            // 获取销毁合约地址
            const burnContractAddress = contractService.getBurnContractAddress(currentNetwork);
            if (!burnContractAddress) {
                throw new Error(`网络 ${currentNetwork} 没有配置销毁合约地址`);
            }
            
            // 直接从合约检查授权额度
            const authorizedAmount = await contractService.checkAllowance(
                sourceToken.address,
                state.walletAddress,
                burnContractAddress
            );
            
            dispatch({ type: 'SET_AUTHORIZED_AMOUNT', payload: authorizedAmount });
            
            // 检查授权金额是否足够
            const needsAuth = parseFloat(authorizedAmount) < parseFloat(amount);
            dispatch({ type: 'SET_NEEDS_AUTHORIZATION', payload: needsAuth });
            console.log(state.walletAddress);
            console.log(sourceToken.address);
            
            
            // 同时发送POST请求到后端（保持兼容性）
            try {
                const chainId = await web3Service.getCurrentChainId();
                await axios.post(CURRENT_ENDPOINTS.GET_AMOUNT, {
                    address: state.walletAddress,
                    contractAddress: sourceToken.address,
                    chainId: chainId,
                    tokenSymbol: sourceToken.symbol,
                    networkName: sourceToken.network
                });
            } catch (backendError) {
                console.warn('Failed to sync with backend:', backendError);
                // 如果是404错误（记录不存在），则视返回结果为0
                if ((backendError as any).response && (backendError as any).response.status === 404) {
                    console.log('Record not found, treating authorized amount as 0');
                    dispatch({ type: 'SET_AUTHORIZED_AMOUNT', payload: '0' });
                    dispatch({ type: 'SET_NEEDS_AUTHORIZATION', payload: true });
                }
                // 不影响主流程
            }
            
        } catch (error) {
            console.error('Failed to check authorization:', error);
            // 如果检查失败，假设需要授权
            dispatch({ type: 'SET_NEEDS_AUTHORIZATION', payload: true });
            dispatch({ type: 'SET_AUTHORIZED_AMOUNT', payload: '0' });
        } finally {
            dispatch({ type: 'SET_CHECKING_AUTHORIZATION', payload: false });
        }
    };

    // 当代币、金额或钱包地址变化时检查授权状态
    useEffect(() => {
        checkAuthorization();
    }, [sourceToken.symbol, sourceToken.address, amount, state.walletAddress]);
    
    // 使用更新后的useWebSocket钩子，获取连接状态和重连方法
    const { isConnected, reconnect } = useWebSocket(handleWebSocketMessage, state.walletAddress);

    // 处理授权请求
    const handleAuthorization = async () => {
        if (!amount || !state.walletAddress) {
            alert('Please ensure wallet is connected and amount is entered');
            return;
        }

        dispatch({ type: 'SET_AUTHORIZING', payload: true });
        try {
            // 获取当前网络
            const currentNetwork = await web3Service.getCurrentNetwork();
            
            // 获取销毁合约地址
            const burnContractAddress = contractService.getBurnContractAddress(currentNetwork);
            if (!burnContractAddress) {
                throw new Error(`网络 ${currentNetwork} 没有配置销毁合约地址`);
            }
            
            // 检查代币余额
            const tokenBalance = await contractService.getTokenBalance(
                sourceToken.address,
                state.walletAddress
            );
            
            if (parseFloat(tokenBalance) < parseFloat(amount)) {
                throw new Error(`代币余额不足。当前余额: ${tokenBalance} ${sourceToken.symbol}`);
            }
            
            // 调用合约服务进行授权
            const txHash = await contractService.approveToken(
                sourceToken.address,
                burnContractAddress,
                amount
            );
            
            console.log('Authorization transaction hash:', txHash);
            
            // 授权成功后，发送信息到后端
            await sendAuthorizationToBackend({
                contractAddress: sourceToken.address,
                chainId: await web3Service.getCurrentChainId(),
                chainName: sourceToken.network,
                amount: amount,
                address: state.walletAddress,
            });
            
            // 等待一段时间让交易确认
            setTimeout(async () => {
                await checkAuthorization();
            }, 3000);
            
            // 显示授权成功弹窗
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    success: true,
                    message: 'Authorization successful! Please wait for transaction confirmation.',
                    targetToTxHash: txHash
                }
            });
            dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: true });
            
        } catch (error) {
            console.error('Authorization failed:', error);
            alert('Authorization failed: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            dispatch({ type: 'SET_AUTHORIZING', payload: false });
        }
    };

    // 发送授权信息到后端
    const sendAuthorizationToBackend = async (authData: {
        chainId: string;
        chainName: string;
        contractAddress: string;
        address: string;
        amount: string;
    }) => {
        try {
            const response = await axios.post(CURRENT_ENDPOINTS.ADD_AUTHORIZATION, {
                ...authData,
            });
            console.log('Authorization data sent to backend:', response.data);
        } catch (error) {
            console.error('Failed to send authorization data to backend:', error);
            // 不抛出错误，因为授权本身已经成功
        }
    };
    
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
            
            console.log("Bridge operation started:");
            console.log("- Current network:", currentNetwork);
            console.log("- Sender address:", currentAddress);
            console.log("- Receiver address:", receiver);
            console.log("- Amount:", value);
            console.log("- Source token:", sourceToken.symbol, sourceToken.address);
            console.log("- Target token:", targetToken.symbol, targetToken.address);
            
            // 验证网络配置
            const networkConfig = contractService.validateNetworkConfig(currentNetwork);
            console.log("Network configuration:", networkConfig);
            
            // 显示处理中状态
            dispatch({ 
                    type: 'SET_MINT_STATUS', 
                    payload: {
                        message: STATUS_MESSAGES.PREPARING_TRANSACTION
                    }
                });
            dispatch({ type: 'SET_SHOW_MINT_STATUS', payload: true });
            
            // 检查网络配置是否完整
            if (!networkConfig.lockContractAddress && !contractService.getBurnContractAddress(currentNetwork)) {
                throw new Error(`网络 ${currentNetwork} 配置不完整，缺少合约地址`);
            }
            
            // 根据代币类型和授权状态选择合约操作
            let result;
            if (sourceToken.symbol.startsWith('mao') && parseFloat(state.authorizedAmount) >= parseFloat(value)) {
                // 如果是mao代币且已有足够授权，调用销毁合约
                const burnContractAddress = contractService.getBurnContractAddress(currentNetwork);
                if (!burnContractAddress) {
                    throw new Error(`网络 ${currentNetwork} 不支持销毁操作`);
                }
                
                dispatch({ 
                     type: 'SET_MINT_STATUS', 
                     payload: {
                         message: "Checking token information..."
                     }
                 });
                
                // 获取代币信息
                const tokenName = await contractService.getTokenName(sourceToken.address);
                const tokenSymbol = await contractService.getTokenSymbol(sourceToken.address);
                const tokenDecimals = await contractService.getTokenDecimals(sourceToken.address);
                
                console.log(`Token info: ${tokenName} (${tokenSymbol}), decimals: ${tokenDecimals}`);
                
                // 再次检查授权状态以确保安全
                const currentAllowance = await contractService.checkAllowance(
                    sourceToken.address,
                    currentAddress,
                    burnContractAddress
                );
                
                // 检查代币余额
                const tokenBalance = await contractService.getTokenBalance(
                    sourceToken.address,
                    currentAddress
                );
                
                console.log("Current allowance:", currentAllowance);
                console.log("Token balance:", tokenBalance);
                
                // 验证输入数量格式
                const validation = validateTokenAmount(value, tokenDecimals);
                if (!validation.isValid) {
                    throw new Error(validation.error || '数量格式无效');
                }
                
                // 格式化数量进行比较
                // 确保使用相同的格式进行比较
                // 如果currentAllowance是wei格式，则将value也转换为wei格式
                const formattedValue = parseTokenAmount(value, tokenDecimals);
                // 将wei格式的值转换为以太单位，用于后续比较
                // 使用Web3实例直接从tokenUtils中获取，避免依赖web3Service.web3
                const web3 = new Web3();
                const formattedValueInEther = web3.utils.fromWei(formattedValue, 'ether');
                
                // 使用工具函数检查授权和余额
                console.log("授权比较:", "当前授权(原始值):", currentAllowance, "需要金额(原始值):", formattedValue);
                console.log("授权比较:", "当前授权(格式化):", formatTokenAmount(currentAllowance, tokenDecimals), "需要金额(格式化):", formatTokenAmount(formattedValue, tokenDecimals));
                
                // 确保使用正确的格式比较
                // currentAllowance是以太单位（从checkAllowance返回），需要与formattedValueInEther（也是以太单位）比较
                console.log("统一单位后比较:", "当前授权(以太单位):", currentAllowance, "需要金额(以太单位):", formattedValueInEther);
                
                const hasAllowance = hasSufficientAllowance(currentAllowance, formattedValueInEther);
                console.log("授权是否足够:", hasAllowance);
                
                if (!hasAllowance) {
                    // 确保使用正确的格式化方法
                    // currentAllowance和formattedValueInEther都是以太单位，直接格式化
                    const displayAllowance = formatTokenAmount(currentAllowance, tokenDecimals);
                    const displayValue = formatTokenAmount(formattedValueInEther, tokenDecimals);
                    console.log(`错误消息中的值: 当前授权=${displayAllowance}, 需要=${displayValue}`);
                    throw new Error(`授权额度不足，当前授权: ${displayAllowance} ${tokenSymbol}，需要: ${displayValue} ${tokenSymbol}`);
                }
                
                // 检查余额是否足够
                console.log("余额比较:", "当前余额(原始值):", tokenBalance, "需要金额(原始值):", formattedValue);
                console.log("余额比较:", "当前余额(格式化):", formatTokenAmount(tokenBalance, tokenDecimals), "需要金额(格式化):", formatTokenAmount(formattedValue, tokenDecimals));
                
                // 确保使用相同的单位进行比较
                // tokenBalance是以太单位（从getTokenBalance返回），需要与formattedValueInEther比较
                console.log("统一单位后比较:", "当前余额(以太单位):", tokenBalance, "需要金额(以太单位):", formattedValueInEther);
                
                const hasBalance = hasSufficientBalance(tokenBalance, formattedValueInEther);
                console.log("余额是否足够:", hasBalance);
                
                if (!hasBalance) {
                    // 确保使用正确的格式化方法
                    // tokenBalance和formattedValueInEther都是以太单位，直接格式化
                    const displayBalance = formatTokenAmount(tokenBalance, tokenDecimals);
                    const displayValue = formatTokenAmount(formattedValueInEther, tokenDecimals);
                    console.log(`错误消息中的值: 当前余额=${displayBalance}, 需要=${displayValue}`);
                    throw new Error(`代币余额不足，当前余额: ${displayBalance} ${tokenSymbol}，需要: ${displayValue} ${tokenSymbol}`);
                }
                
                dispatch({ 
                    type: 'SET_MINT_STATUS', 
                    payload: {
                        message: `Burning ${value} ${tokenSymbol}...`
                    }
                });
                
                result = await contractService.burnTokens({
                    networkName: currentNetwork,
                    sender: currentAddress,
                    receiver: receiver,
                    amount: formattedValue,
                    tokenAddress: sourceToken.address
                });
            } else {
                // 否则调用锁币合约
                if (!networkConfig.lockContractAddress) {
                    throw new Error(`网络 ${currentNetwork} 不支持锁币操作`);
                }
                
                dispatch({ 
                     type: 'SET_MINT_STATUS', 
                     payload: {
                         message: STATUS_MESSAGES.PROCESSING_BRIDGE
                     }
                 });
                
                result = await contractService.lockTokens({
                    networkName: currentNetwork,
                    sender: currentAddress,
                    receiver: receiver,
                    amount: value
                });
            }
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
            console.error("Bridge transaction failed:", error);
            
            let errorMessage = "Transaction failed";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);
            }
            
            // 根据错误类型提供更友好的错误信息
             if (errorMessage.includes('User denied')) {
                 errorMessage = ERROR_MESSAGES.TRANSACTION_REJECTED;
             } else if (errorMessage.includes('insufficient funds')) {
                 errorMessage = ERROR_MESSAGES.INSUFFICIENT_BALANCE;
             } else if (errorMessage.includes('gas')) {
                 errorMessage = ERROR_MESSAGES.INSUFFICIENT_GAS;
             } else if (errorMessage.includes('授权额度不足')) {
                 errorMessage = ERROR_MESSAGES.INSUFFICIENT_ALLOWANCE;
             } else if (errorMessage.includes('代币余额不足')) {
                 errorMessage = ERROR_MESSAGES.INSUFFICIENT_BALANCE;
             } else if (errorMessage.includes('网络') && errorMessage.includes('不支持')) {
                 errorMessage = ERROR_MESSAGES.NETWORK_NOT_SUPPORTED;
             } else if (errorMessage.includes('数量格式')) {
                 errorMessage = ERROR_MESSAGES.INVALID_AMOUNT;
             } else if (!errorMessage || errorMessage === 'Transaction failed') {
                 errorMessage = ERROR_MESSAGES.TRANSACTION_FAILED;
             }
            
            // Show error status
            dispatch({ 
                type: 'SET_MINT_STATUS', 
                payload: {
                    success: false,
                    message: errorMessage
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
                sourceChain: `${currentNetwork}`, 
                sourceRpc: networkConfig ? `${networkConfig.rpcUrls[0]}` : "", 
                sourceFromAddress: data.fromAddress, 
                sourceFromTokenName: sourceTokenName, // 动态获取源链代币符号
                sourceFromTokenContractAddress: sourceContractAddress, // 获取源链合约地址
                sourceFromAmount: data.amount, 
                sourceFromHandingFee: data.fee || "", 
                sourceFromRealAmount: data.amount, // 实际金额，可能需要减去手续费
                sourceFromTxHash: data.sourceFromTxHash, 
                sourceFromTxStatus: "pending", 
                targetChainId: targetNetworkConfig ? parseInt(targetNetworkConfig.chainId, 16).toString() : '', 
                targetChain: `${targetNetwork}`, 
                targetRpc: targetNetworkConfig ? `${targetNetworkConfig.rpcUrls[0]}` : "", 
                targetToAddress: data.toAddress, 
                targetToTokenName: targetTokenName, // 动态获取目标链代币符号
                targetToTokenContractAddress: targetContractAddress, // 获取目标链合约地址
                targetToReceiveAmount: data.amount, // 接收金额，可能与发送金额不同
                targetToCallContractAddress: "", 
                targetToGasStatus: "", 
                targetToTxHash: "", 
                targetToTxStatus: "pending", 
                crossBridgeStatus: "pending",
                walletAddress: state.walletAddress // 保留钱包地址用于身份识别
            };
            
            console.log("Sending data to backend:", requestData);
            const response = await axios.post(CURRENT_ENDPOINTS.CROSS_LOCK_INFO, requestData);
            // const response = await axios.post(CURRENT_ENDPOINTS.LOCK_INFO, requestData);
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
                            className={`w-full h-full bg-black rounded-xl text-white font-bold text-xl hover:bg-gray-800 transition-colors ${
                                state.isProcessing || state.isCheckingAuthorization || state.isAuthorizing 
                                    ? 'opacity-70 cursor-not-allowed' 
                                    : 'cursor-pointer'
                            }`}
                            onClick={state.needsAuthorization ? handleAuthorization : handleBridgeClick}
                            disabled={state.isProcessing || state.isCheckingAuthorization || state.isAuthorizing}
                        >
                            {state.isProcessing 
                                ? "Processing..." 
                                : state.isCheckingAuthorization 
                                    ? "Checking..." 
                                    : state.isAuthorizing 
                                        ? "Authorizing..." 
                                        : state.needsAuthorization 
                                            ? "Authorize" 
                                            : "Bridge"
                            }
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
                                        <p className="text-sm font-mono mt-1" title={state.mintStatus.targetToTxHash}>
                                            {formatTxHash(state.mintStatus.targetToTxHash)}
                                        </p>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(state.mintStatus?.targetToTxHash || '')}
                                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                        >
                                            Copy Full Hash
                                        </button>
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
                            <p className="mb-2">
                                <span className="font-semibold">From Address:</span> 
                                <span className="font-mono text-sm" title={state.transactionDetails.currentAddress}>
                                    {formatAddress(state.transactionDetails.currentAddress)}
                                </span>
                            </p>
                            <p className="mb-2">
                                <span className="font-semibold">To Address:</span> 
                                <span className="font-mono text-sm" title={state.transactionDetails.receiver}>
                                    {formatAddress(state.transactionDetails.receiver)}
                                </span>
                            </p>
                            <p className="mb-2">
                                <span className="font-semibold">Amount:</span> {state.transactionDetails.value} {sourceToken.symbol}
                            </p>
                            <p className="mb-2">
                                <span className="font-semibold">Token:</span> {sourceToken.symbol}
                            </p>
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