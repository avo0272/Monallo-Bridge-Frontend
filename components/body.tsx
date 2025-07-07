"use client"

import Option1 from "./option1"
import Option2 from "./option2"
import Option3 from "./option3"
import Option4 from "./option4"
import Submit from "./submit"
import Image from "next/image";
import { useState } from "react"

export default function Body() {
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)
    const [ToSymbol] = useState("maoETH")
    const [ToNetwork] = useState("Imua Testnet")
    const [bridgeName] = useState("via Monallo Bridge")
    const [time] = useState("5")
    return(
        <header className="bg-white w-full flex justify-center items-center" >
            <div className="w-135 h-200">
                <div className="flex"><span className="text-gray-600 text-xl mb-3">From</span></div>
                <div className=" flex justify-center"><Option1/></div>
                
                <div className="flex">
                    <span className="text-gray-600 text-xl mb-3 mt-10">To</span>
                    <Image src={"/exchange.png"} alt="" width={45} height={10} className="mx-auto mt-8 mb-3 w-7 h-7"></Image>
                    </div>
                <div className="mb-10 flex justify-center"><Option2 ToNetwork={ToNetwork} ToSymbol={ToSymbol}/></div>

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
                        {/* <div className="flex justify-center">
                            <p className="text-[#827c7c]">View other routes</p>
                        </div> */}
                    </>
                )}
                <div><Submit/></div>
            </div>
        </header>
    )
}