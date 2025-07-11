"use client"

import Option1 from "./option1"
import Option2 from "./option2"
import Option3 from "./option3"
import Option4 from "./option4"
import Submit from "./submit"
import Image from "next/image";
import Option1Select from "./option1Select";
import Option2Select from "./option2Select";
import ReceiverAddress from "./receiverAddress";
import { useState, useEffect } from "react"
import web3Service from "../services/web3Service"
import priceService from "../services/priceService"


export default function Body() {
    const [amount, setAmount] = useState('') // 金额，改为字符串类型
    const [price, setPrice] = useState(0) // 价格
    const [isLoadingPrice, setIsLoadingPrice] = useState(false) // 价格加载状态
    const [receiverAddress, setReceiverAddress] = useState('') // 接收者地址
    // const [ToSymbol] = useState("maoETH")
    // const [ToNetwork] = useState("Imua Testnet")
    const [bridgeName] = useState("via Monallo Bridge")
    const [time] = useState("5")
    const [showSelect1, setShowSelect1] = useState(false) // 控制 Select1 显示的状态
    const [selectedToken1, setSelectedToken1] = useState<{ symbol: string; network: string; address: string }>({ symbol: "ETH", network: "Ethereum-Sepolia", address: "" })
    const [showSelect2, setShowSelect2] = useState(false) // 控制 Select2 显示的状态
    const [selectedToken2, setSelectedToken2] = useState<{ symbol: string; network: string; address: string }>({ symbol: "maoETH", network: "Imua-Testnet", address: "" })
    const [walletAddress, setWalletAddress] = useState("") // 钱包地址
    const [token1Balance, setToken1Balance] = useState("") // Token1余额
    const [token2Balance, setToken2Balance] = useState("") // Token2余额
    const [isLoadingBalance, setIsLoadingBalance] = useState(false) // 余额加载状态
    const [tokenTypeError, setTokenTypeError] = useState("") // 代币类型错误信息
    const ToSymbol = selectedToken2.symbol
    const ToNetwork = selectedToken2.network
    
    // 定义相同类型代币的映射关系
    const tokenTypeMap: Record<string, string[]> = {
        "ETH": ["ETH", "maoETH"],
        "maoETH": ["ETH", "maoETH"],
        "USDC": ["USDC", "maoUSDC"],
        "maoUSDC": ["USDC", "maoUSDC"],
        "EURC": ["EURC", "maoEURC"],
        "maoEURC": ["EURC", "maoEURC"],
        "IMUA": ["IMUA", "maoIMUA"],
        "ZETA": ["ZETA", "maoZETA"],
    };
    
    // 检查两个代币是否属于同一类型
    const areTokensOfSameType = (token1: string, token2: string): boolean => {
        if (!token1 || !token2) return true; // 如果有一个未选择，不显示错误
        
        const type1 = tokenTypeMap[token1];
        if (!type1) return false; // 如果token1不在映射表中，认为不是同类型
        
        return type1.includes(token2); // 检查token2是否在token1的同类型列表中
    };
    // 获取代币余额 - 只获取Token1的余额
    const fetchTokenBalance = async (tokenInfo: { symbol: string; network: string; address: string }, isToken1: boolean = true) => {
        if (!walletAddress) return;
        
        setIsLoadingBalance(true);
        try {
            // 切换到对应网络 - 只对Token1执行
            if (isToken1) {
                await web3Service.switchNetwork(tokenInfo.network);
                
                // 获取余额
                const balance = await web3Service.getTokenBalance(tokenInfo.address, walletAddress);
                setToken1Balance(balance);
            }
            // 不处理Token2的余额
        } catch (error) {
            console.error('获取代币余额失败:', error);
            if (isToken1) {
                setToken1Balance('0');
            }
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // 监听钱包地址变化
    useEffect(() => {
        // 从localStorage中获取保存的钱包地址
        const getSavedWalletAddress = () => {
            if (typeof window !== 'undefined') {
                const savedAddress = localStorage.getItem("walletAddress");
                if (savedAddress) {
                    // 只有当localStorage中有钱包地址时，才设置钱包地址
                    setWalletAddress(savedAddress);
                    return true;
                }
            }
            return false;
        };
        
        // 检查是否有连接的钱包
        const checkWalletConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        // 检查当前连接的钱包地址与localStorage中的是否一致
                        const savedAddress = localStorage.getItem("walletAddress");
                        if (savedAddress && savedAddress === accounts[0]) {
                            setWalletAddress(accounts[0]);
                        } else if (!savedAddress) {
                            // 如果localStorage中没有钱包地址，则不设置钱包地址
                            setWalletAddress('');
                        }
                    }
                } catch (error) {
                    console.error('检查钱包连接失败:', error);
                }
            }
        };

        // 先尝试从localStorage获取地址，如果没有再检查钱包连接
        const hasSavedAddress = getSavedWalletAddress();
        if (!hasSavedAddress) {
            checkWalletConnection();
        }

        // 监听账户变化和localStorage变化
        if (typeof window !== 'undefined') {
            // 监听钱包账户变化
            const handleAccountsChanged = (accounts: string[]) => {
                const savedAddress = localStorage.getItem("walletAddress");
                if (accounts.length > 0) {
                    // 检查新账户与localStorage中的是否一致
                    if (savedAddress && savedAddress === accounts[0]) {
                        setWalletAddress(accounts[0]);
                    } else if (!savedAddress) {
                        // 如果localStorage中没有钱包地址，则不设置钱包地址
                        setWalletAddress('');
                        setToken1Balance('');
                        setToken2Balance('');
                    }
                } else {
                    // 如果没有连接的账户，清除状态
                    setWalletAddress('');
                    setToken1Balance('');
                    setToken2Balance('');
                    // 同时确保localStorage中也没有钱包地址
                    if (savedAddress) {
                        localStorage.removeItem("walletAddress");
                    }
                }
            };
            
            // 监听localStorage变化（自定义事件）
            const handleWalletChanged = () => {
                const savedAddress = localStorage.getItem("walletAddress");
                if (savedAddress) {
                    // 检查当前连接的钱包地址与localStorage中的是否一致
                    if (window.ethereum) {
                        window.ethereum.request({ method: 'eth_accounts' })
                            .then(accounts => {
                                if (accounts.length > 0 && accounts[0] === savedAddress) {
                                    setWalletAddress(savedAddress);
                                } else {
                                    // 如果钱包未连接或地址不一致，清除localStorage中的地址
                                    localStorage.removeItem("walletAddress");
                                    setWalletAddress('');
                                    setToken1Balance('');
                                    setToken2Balance('');
                                }
                            })
                            .catch(error => {
                                console.error('检查钱包连接失败:', error);
                                // 发生错误时，清除状态
                                setWalletAddress('');
                                setToken1Balance('');
                                setToken2Balance('');
                            });
                    } else {
                        // 如果没有ethereum对象，说明钱包未安装，清除localStorage中的地址
                        localStorage.removeItem("walletAddress");
                        setWalletAddress('');
                        setToken1Balance('');
                        setToken2Balance('');
                    }
                } else {
                    setWalletAddress('');
                    setToken1Balance('');
                    setToken2Balance('');
                }
            };
            
            // 添加事件监听器
            if (window.ethereum) {
                window.ethereum.on('accountsChanged', handleAccountsChanged);
            }
            document.addEventListener('walletChanged', handleWalletChanged);
            
            // 清理函数
            return () => {
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                }
                document.removeEventListener('walletChanged', handleWalletChanged);
            };
        }
    }, []);

    // 当钱包地址或选择的代币变化时，获取余额并切换网络
    useEffect(() => {
        // 检查localStorage中的钱包地址和当前钱包地址是否一致
        const savedAddress = localStorage.getItem("walletAddress");
        
        // 只有当localStorage中有钱包地址且与当前钱包地址一致时，才获取余额
        if (savedAddress && walletAddress && savedAddress === walletAddress && selectedToken1) {
            fetchTokenBalance(selectedToken1, true);
            // 当option1的网络变化时，切换到对应的网络
            web3Service.switchNetwork(selectedToken1.network)
                .catch(error => console.error('自动切换网络失败:', error));
        }
    }, [walletAddress, selectedToken1]);
    
    // 当代币选择或金额变化时，更新价格
    useEffect(() => {
        const updatePrice = async () => {
            // 只有当金额大于0时才更新价格
            if (amount && parseFloat(String(amount)) > 0) {
                setIsLoadingPrice(true);
                try {
                    // 获取代币价格并计算总价值
                    const totalValue = await priceService.calculateTotalValue(
                        selectedToken1.symbol,
                        parseFloat(String(amount))
                    );
                    setPrice(totalValue);
                } catch (error) {
                    console.error('获取代币价格失败:', error);
                    setPrice(0);
                } finally {
                    setIsLoadingPrice(false);
                }
            } else {
                setPrice(0);
            }
        };
        
        updatePrice();
    }, [amount, selectedToken1.symbol]);

    // 移除获取Token2余额的代码，因为不需要获取Token2的余额

    return(
        <header className="bg-white w-full flex justify-center items-center" >
            <div className="w-135 h-200">
                <div className="flex"><span className="text-gray-600 text-xl mb-3">From</span></div>
                <div 
                    className="relative flex justify-center"
                >
                    <div 
                    className="w-full"
                    onClick={() => setShowSelect1(true)}
                >
                    <Option1 selectedToken={selectedToken1}/>
                </div>
                {showSelect1 && (
                    <div className="absolute z-10 w-full" onMouseLeave={() => setShowSelect1(false)}>
                        <Option1Select
                        onTokenSelect={(token) => {
                            setSelectedToken1(token);
                            
                            // 当选择代币变化且金额大于0时，检查代币类型是否匹配
                            if (parseFloat(amount) > 0) {
                                const areSameType = areTokensOfSameType(token.symbol, selectedToken2.symbol);
                                if (!areSameType) {
                                    setTokenTypeError("Please select tokens of the same type.");
                                } else {
                                    setTokenTypeError("");
                                }
                            }
                        }} 
                        showSelect={setShowSelect1} // 把 setShowSelect 传进去
                        toNetwork={selectedToken2?.network} // 传递Option2选择的网络信息
                        selectedToken={selectedToken1} // 传递当前选择的代币信息
                        toToken={selectedToken2} // 传递目标代币信息，用于过滤相同类型的代币
                        walletConnected={!!walletAddress} // 传递钱包连接状态
                        />
                    </div>
                )}
                </div>
                
                <div className="flex">
                    <span className="text-gray-600 text-xl mb-3 mt-10">To</span>
                    <Image 
                        src={"/exchange.png"} 
                        alt="交换" 
                        width={45} 
                        height={10} 
                        className="mx-auto mt-8 mb-3 w-7 h-7 cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => {
                            // 交换selectedToken1和selectedToken2的值
                            const temp = {...selectedToken1};
                            setSelectedToken1({...selectedToken2});
                            setSelectedToken2(temp);
                            // 交换余额显示
                            const tempBalance = token1Balance;
                            setToken1Balance(token2Balance);
                            setToken2Balance(tempBalance);
                        }}
                    />
                </div>
                <div className="flex justify-between items-center mb-3">
                {/* 移除Token2余额显示 */}
                </div>
                <div className="mb-10 relative flex justify-center">
                    <div className="w-full"
                        onClick={() => setShowSelect2(true)}
                    >
                        <Option2 selectedToken={selectedToken2}/>
                    </div>
                    {showSelect2 && (
                        <div className="absolute z-10 w-full" onMouseLeave={() => setShowSelect2(false)}>
                            <Option2Select
                            onTokenSelect={(token) => {
                                setSelectedToken2(token);
                                
                                // 当选择代币变化且金额大于0时，检查代币类型是否匹配
                                if (parseFloat(amount) > 0) {
                                    const areSameType = areTokensOfSameType(selectedToken1.symbol, token.symbol);
                                    if (!areSameType) {
                                        setTokenTypeError("Please select tokens of the same type.");
                                    } else {
                                        setTokenTypeError("");
                                    }
                                }
                            }} 
                            showSelect={setShowSelect2} // 把 setShowSelect 传进去
                            fromNetwork={selectedToken1?.network} // 传递Option1选择的网络信息
                            selectedToken={selectedToken2} // 传递当前选择的代币信息
                            fromToken={selectedToken1} // 传递源代币信息，用于过滤相同类型的代币
                            walletConnected={!!walletAddress} // 传递钱包连接状态
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xl mb-3">Amount</span>
                    {walletAddress && (
                        <span className="text-sm text-gray-500 mb-3">
                            Balance: {isLoadingBalance ? 'Loading...' : token1Balance || '0'} {selectedToken1.symbol}
                        </span>
                    )}
                </div>
                <div className="mb-7 flex justify-center">
                    <Option3 
                        amount={amount} 
                        onAmountChange={(value) => {
                            setAmount(String(value));
                            
                            // 当用户输入金额时，检查代币类型是否匹配
                            const numValue = value === '' ? 0 : parseFloat(String(value));
                            if (numValue > 0) {
                                const areSameType = areTokensOfSameType(selectedToken1.symbol, selectedToken2.symbol);
                                if (!areSameType) {
                                    setTokenTypeError("Please select tokens of the same type.");
                                } else {
                                    setTokenTypeError("");
                                }
                            } else {
                                setTokenTypeError(""); // 清空错误信息
                            }
                        }} 
                        price={price}
                        balance={token1Balance}
                        walletConnected={!!walletAddress} // 传递钱包连接状态
                        isLoadingPrice={isLoadingPrice} // 传递价格加载状态
                    />
                </div>
                {/* 显示代币类型错误信息 */}
                {tokenTypeError && (
                    <div className="mb-3 text-red-500 text-center">
                        {tokenTypeError}
                    </div>
                )}
                
                {/* 添加接收者地址组件 */}
                <div className="mb-3">
                    <ReceiverAddress 
                        receiverAddress={receiverAddress}
                        onAddressChange={setReceiverAddress}
                    />
                </div>
                
                {amount && parseFloat(String(amount)) > 0 && (
                    <>
                        <div className="flex">
                            <span className="text-gray-600 text-xl mb-3">Routes</span>
                        </div>
                        <div className="mb-6 flex justify-center">
                            <Option4 amount={parseFloat(String(amount))} ToSymbol={ToSymbol} price={price} bridgeName={bridgeName} ToNetwork={ToNetwork} time={time}/>
                        </div>
                    </>
                )}
                <div>
                    <Submit 
                        onConnectWallet={() => {
                            // 触发自定义事件，通知header组件显示钱包下拉框
                            if (typeof document !== "undefined") {
                                const event = new CustomEvent("showWalletDropdown");
                                document.dispatchEvent(event);
                            }
                        }}
                        receiverAddress={receiverAddress}
                        amount={amount} // 传递金额参数
                    />
                </div>
            </div>
        </header>
    )
}