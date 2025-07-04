"use client"
import Image from "next/image";
import { useState } from "react";
export default function option2() {
    const [ToSymbol] = useState("maoETH")
    const [ToNetwork] = useState("Imua Testnet")
    return(
        <div className="w-full h-25 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex justify-between">
            <div>
                <p className="text-[#000000] text-3xl font-bold">{ToSymbol}</p>
                <p className="text-[#827c7c] text-lg font-extralight">{ToNetwork}</p>
            </div>
            <div className="flex items-center">
                <Image src={"/downward.png"}  alt="" width={30} height={30}></Image>
            </div>
        </div>
    )
}