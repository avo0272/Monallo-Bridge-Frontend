"use client"
import Image from "next/image";
import { useState } from "react";
export default function option1() {
    const [FromSymbol] = useState("ETH")
    const [FromNetwork] = useState("Ethereum Sepolia")
    return(
        <div className="w-full h-25 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex justify-between">
            <div>
                <p className="text-[#000000] text-3xl font-bold">{FromSymbol}</p>
                <p className="text-[#827c7c] text-lg font-extralight">{FromNetwork}</p>
            </div>
            <div className="flex items-center">
                <Image src={"/downward.png"}  alt="" width={30} height={30}></Image>
            </div>
        </div>
    )
}