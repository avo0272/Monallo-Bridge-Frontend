"use client"
import { useState } from "react";
type Option4Props = {
  amount: number;
  ToSymbol: string;
  price: number;
  bridgeName: string;
  ToNetwork: string;
  time: string;
};
export default function Option4({amount, ToSymbol, price, bridgeName, ToNetwork, time}: Option4Props) {
    return(
        <div className="w-full h-30 p-5 bg-[#EEEEEE] shadow-xl/20 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between w-full">
                <p className="text-xl font-bold">{amount * 0.992} {ToSymbol}</p>
                <span>Fastest</span>
            </div>
            <div>
                <span className="text-[#827c7c]">${(price * 0.992).toFixed(4)} {bridgeName}</span>
            </div>
            <div className="flex justify-between w-full">
                <p className="text-[#827c7c]">Time to {ToNetwork}</p>
                <p className="text-green-500">~ {time} sec</p>
            </div>
        </div>
    )
}