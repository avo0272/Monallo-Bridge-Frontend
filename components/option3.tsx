"use client"
import { useState } from "react";
type Option3Props = {
  amount: number;
  onAmountChange: (value: number) => void;
  price: number;
};
export default function Option3({amount, onAmountChange, price}: Option3Props) {
    return(
        <div className="w-full h-25 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex justify-between">
            <div>
                <input className={`text-3xl font-bold focus:outline-none focus:ring-0 ${amount !== 0 ? 'text-black' : 'text-[#827c7c]'}`} value={amount} onChange={(e)=>onAmountChange(Number(e.target.value))}/>
                <p className="text-[#827c7c] text-lg font-extralight">${price}</p>
            </div>
            <div className="flex items-center">
                <p className="text-[#827c7c] text-lg font-extralight">Max</p>
            </div>
        </div>
    )
}