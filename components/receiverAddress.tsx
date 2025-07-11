"use client"
import { useState } from "react";

type ReceiverAddressProps = {
    receiverAddress: string;
    onAddressChange: (address: string) => void;
};

export default function ReceiverAddress({ receiverAddress, onAddressChange }: ReceiverAddressProps) {
    const [showInput, setShowInput] = useState(false);
    
    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAddressChange(e.target.value);
    };
    
    // 处理按钮点击
    const handleButtonClick = () => {
        setShowInput(!showInput);
        if (!showInput) {
            // 如果要显示输入框，但地址为空，不做任何操作
        } else {
            // 如果要隐藏输入框，清空地址
            onAddressChange('');
        }
    };
    
    return(
        <div className="w-full">
            <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xl mb-3">Receiver Address (Optional)</span>
                <button 
                    className={`text-sm ${showInput ? 'text-blue-500' : 'text-gray-500'} mb-3 hover:text-blue-500 transition-colors`}
                    onClick={handleButtonClick}
                >
                    {showInput ? 'Remove' : 'Add Receiver'}
                </button>
            </div>
            {showInput && (
                <div className="mb-7 flex justify-center">
                    <div className="w-full">
                        <div className="w-full h-25 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex justify-between">
                            <input 
                                className="w-full text-lg focus:outline-none focus:ring-0 bg-[#EEEEEE]"
                                value={receiverAddress} 
                                onChange={handleInputChange}
                                placeholder="Enter receiver wallet address"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}