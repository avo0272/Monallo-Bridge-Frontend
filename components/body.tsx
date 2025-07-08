"use client"

import Option1 from "./option1"
import Option2 from "./option2"
import Option3 from "./option3"
import Option4 from "./option4"
import Submit from "./submit"
import Image from "next/image";
import Option1Select from "./option1Select";
import Option2Select from "./option2Select";
import { useState } from "react"


export default function Body() {
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)
    // const [ToSymbol] = useState("maoETH")
    // const [ToNetwork] = useState("Imua Testnet")
    const [bridgeName] = useState("via Monallo Bridge")
    const [time] = useState("5")
    const [showSelect1, setShowSelect1] = useState(false) // 控制 Select1 显示的状态
    const [selectedToken1, setSelectedToken1] = useState<{ symbol: string; network: string; address: string } | null>(null)
    const [showSelect2, setShowSelect2] = useState(false) // 控制 Select2 显示的状态
    const [selectedToken2, setSelectedToken2] = useState<{ symbol: string; network: string; address: string } | null>(null)
    const ToSymbol = selectedToken2?.symbol || 'maoETH'
    const ToNetwork = selectedToken2?.network || 'Imua Testnet'
    return(
        <header className="bg-white w-full flex justify-center items-center" >
            <div className="w-135 h-200">
                <div className="flex"><span className="text-gray-600 text-xl mb-3">From</span></div>
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
                            />
                        </div>
                    )}
                </div>
                
                <div className="flex">
                    <span className="text-gray-600 text-xl mb-3 mt-10">To</span>
                    <Image src={"/exchange.png"} alt="" width={45} height={10} className="mx-auto mt-8 mb-3 w-7 h-7"></Image>
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