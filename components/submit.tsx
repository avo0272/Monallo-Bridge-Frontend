"use client"
import { useState } from "react";
export default function submit() {
    const [connected] = useState(false)
    function connect() {
        
    }
    return(
        <div className="w-full h-25 py-5 rounded-xl flex justify-between">
            {connected ? (
                <div className="w-full h-full flex justify-center items-center">
                    <button className="w-full h-full bg-black rounded-xl text-white font-bold text-xl">Bridge</button>
                </div>
            ) : (
                <div className="w-full h-full flex justify-center items-center">
                    <button className="w-full h-full bg-black rounded-xl text-white font-bold text-xl" onClick={connect}>Connect Wallet</button>
                </div>
            )}
        </div>
    )
}