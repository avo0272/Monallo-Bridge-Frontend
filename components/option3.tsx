"use client"
import { useState } from "react";
export default function option3() {
    const [amount] = useState(0)
    const [price] = useState(0)
    return(
        <div className="w-full h-25 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex justify-between">
            <div>
                <p className="text-[#827c7c] text-3xl font-bold">{amount}</p>
                <p className="text-[#827c7c] text-lg font-extralight">${price}</p>
            </div>
            <div className="flex items-center">
                <p className="text-[#827c7c] text-lg font-extralight">Max</p>
            </div>
        </div>
    )
}