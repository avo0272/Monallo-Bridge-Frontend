"use client"

import Option1 from "./option1"
import Option2 from "./option2"
import Option3 from "./option3"
import Option4 from "./option4"
import Submit from "./submit"
import Image from "next/image";
import Option1Select from "./option1Select";
import Option2Select from "./option2Select";
import { useState, useEffect } from "react"
import web3Service from "../services/web3Service"


export default function Body() {
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)
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
    const ToSymbol = selectedToken2.symbol
    const ToNetwork = selectedToken2.network
    // 获取代币余额
    const fetchTokenBalance = async (tokenInfo: { symbol: string; network: string; address: string }, isToken1: boolean = true) => {
        if (!walletAddress) return;
        
        setIsLoadingBalance(true);
        try {
            // 切换到对应网络
            await web3Service.switchNetwork(tokenInfo.network);
            
            // 获取余额
            const balance = await web3Service.getTokenBalance(tokenInfo.address, walletAddress);
            
            if (isToken1) {
                setToken1Balance(balance);
            } else {
                setToken2Balance(balance);
            }
        } catch (error) {
            console.error('获取代币余额失败:', error);
            if (isToken1) {
                setToken1Balance('0');
            } else {
                setToken2Balance('0');
            }
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // 监听钱包地址变化
    useEffect(() => {
        // 检查是否有连接的钱包
        const checkWalletConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                } catch (error) {
                    console.error('检查钱包连接失败:', error);
                }
            }
        };

        checkWalletConnection();

        // 监听账户变化
        if (typeof window !== 'undefined' && window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                } else {
                    setWalletAddress('');
                    setToken1Balance('');
                    setToken2Balance('');
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    // 当钱包地址或选择的代币变化时，获取余额
    useEffect(() => {
        if (walletAddress && selectedToken1) {
            fetchTokenBalance(selectedToken1, true);
        }
    }, [walletAddress, selectedToken1]);

    useEffect(() => {
        if (walletAddress && selectedToken2) {
            fetchTokenBalance(selectedToken2, false);
        }
    }, [walletAddress, selectedToken2]);

    return(
        <header className="bg-white w-full flex justify-center items-center" >
            <div className="w-135 h-200">
                <div className="flex justify-between items-center"><span className="text-gray-600 text-xl mb-3">From</span>
                {walletAddress && (
                    <span className="text-sm text-gray-500 mb-3">
                        余额: {isLoadingBalance ? '加载中...' : token1Balance || '0'} {selectedToken1.symbol}
                    </span>
                )}
                </div>
                <div 
                    className="relative flex justify-center"
                >
                    <div className="w-full"
                        onClick={() => setShowSelect1(true)}
                    >
                        <Option1 selectedToken={selectedToken1}/>
                    </div>
                    {showSelect1 && (
                        <div className="absolute z-10 w-full" onMouseLeave={() => setShowSelect1(false)}>
                            <Option1Select
                            onTokenSelect={setSelectedToken1} 
                            showSelect={setShowSelect1} // 把 setShowSelect 传进去
                            toNetwork={selectedToken2?.network} // 传递Option2选择的网络信息
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
                {walletAddress && (
                    <span className="text-sm text-gray-500">
                        余额: {isLoadingBalance ? '加载中...' : token2Balance || '0'} {selectedToken2.symbol}
                    </span>
                )}
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
                            onTokenSelect={setSelectedToken2} 
                            showSelect={setShowSelect2} // 把 setShowSelect 传进去
                            fromNetwork={selectedToken1?.network} // 传递Option1选择的网络信息
                            />
                        </div>
                    )}
                </div>

                <div className="flex"><span className="text-gray-600 text-xl mb-3">Amount</span></div>
                <div className="mb-7 flex justify-center"><Option3 amount={amount} onAmountChange={setAmount} price={price}/></div>
                {amount !== 0 && (
                    <>
                        <div className="flex">
                            <span className="text-gray-600 text-xl mb-3">Routes</span>
                        </div>
                        <div className="mb-6 flex justify-center">
                            <Option4 amount={amount} ToSymbol={ToSymbol} price={price} bridgeName={bridgeName} ToNetwork={ToNetwork} time={time}/>
                        </div>
                    </>
                )}
                <div><Submit/></div>
            </div>
        </header>
    )
}