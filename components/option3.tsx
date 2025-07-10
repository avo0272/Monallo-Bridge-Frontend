"use client"
import { useState } from "react";
type Option3Props = {
  amount: string | number; // 修改为string或number类型，以支持小数点输入
  onAmountChange: (value: string | number) => void;
  price: number;
  balance?: string; // 添加余额属性，用于Max按钮功能
  walletConnected?: boolean; // 添加钱包连接状态属性
  isLoadingPrice?: boolean; // 添加价格加载状态属性
};
export default function Option3({amount, onAmountChange, price, balance, walletConnected = false, isLoadingPrice = false}: Option3Props) {
    // 添加状态来存储未连接钱包时的错误提示
    const [walletError, setWalletError] = useState("");
    
    // 处理输入变化，只允许输入数字（整数和小数）
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // 检查钱包是否已连接
        if (!walletConnected) {
            setWalletError("Please connect your wallet first");
            return;
        } else {
            setWalletError(""); // 清除错误提示
        }
        
        // 允许空字符串（清空输入框）
        if (value === '') {
            onAmountChange('');
            return;
        }
        
        // 使用正则表达式验证输入是否为有效的数字格式（整数或小数）
        // 允许：整数、带小数点的数字、以小数点开头的数字（如.5）
        const regex = /^\d*\.?\d*$/;
        
        if (regex.test(value)) {
            // 直接传递字符串值，保留小数点
            onAmountChange(value);
        }
    };
    
    // 处理Max按钮点击
    const handleMaxClick = () => {
        if (balance) {
            onAmountChange(Number(balance));
        }
    };
    
    return(
        <div className="w-full">
            <div className="w-full h-25 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex justify-between">
                <div>
                    <input 
                        className={`text-3xl font-bold focus:outline-none focus:ring-0 ${amount ? 'text-black' : 'text-[#827c7c]'}`} 
                        value={amount || ''} 
                        onChange={handleInputChange}
                        placeholder="0"
                    />
                    <p className="text-[#827c7c] text-lg font-extralight">
                        {isLoadingPrice ? 'Loading price...' : `$${price.toFixed(2)}`}
                    </p>
                </div>
                <div className="flex items-center">
                    <button 
                        className={`text-lg font-extralight ${walletConnected ? 'text-[#827c7c] hover:text-blue-500' : 'text-gray-400 cursor-not-allowed'}`}
                        onClick={walletConnected ? handleMaxClick : () => setWalletError("Please connect your wallet first")}
                    >
                        Max
                    </button>
                </div>
            </div>
            {walletError && (
                <div className="mt-2 text-red-500 text-sm">
                    {walletError}
                </div>
            )}
        </div>
    )
}