"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  return (
    <header className="bg-white h-26 px-4 py-4 ">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 max-w-8xl mx-auto">
          <div className="flex-shrink-0 flex items-center ml-10">
            <a href="/">
                <Image src="/logo.png" alt="Logo" width={150} height={150} />
            </a>
          </div>
          <div className="flex items-center space-x-4 mr-10">
            <a href="#" className="flex items-center text-sm ">
              <Image src="/Validator.png" alt="Validator Icon" width={15} height={15} className="mr-1" />
              MonalloScan
            </a>
            <a
              href="#"
              className="flex items-center text-sm relative"
            >
              <Image src="/Blockchains.png" alt="Blockchain Icon" width={15} height={15} className="mr-1" />
              Bridge
            </a>
            <a href="#" className="flex items-center text-sm ">
              <Image src="/Faucet.png" alt="Faucet Icon" width={15} height={15} className="mr-1" />
              Histroy
            </a>
            <div
              className="relative"
            >
              <button 
                className="bg-black text-white text-xs px-3 py-1 rounded-full"
                onClick={() => setShowWalletDropdown((v) => !v)}
              >
                Connect Wallet
              </button>
              {showWalletDropdown && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-40 rounded-xl bg-rose-100 shadow-lg p-4 z-30"
                >
                  <div className="flex items-center mb-2 hover:bg-rose-200 rounded px-2 py-1 cursor-pointer">
                    <Image src="/metamask.svg" alt="MetaMask Icon" width={24} height={24} className="mr-2" />
                    <span className="text-base text-rose-900">MetaMask</span>
                  </div>
                  <div className="flex items-center hover:bg-rose-200 rounded px-2 py-1 cursor-pointer">
                    <Image src="okx_light.svg" alt="OKX Icon" width={24} height={24} className="mr-2" />
                    <span className="text-base text-rose-900">OKXWallet</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              <select className="text-sm bg-transparent outline-none appearance-none" disabled>
                <option>Imua Testnet</option>
                <option>ZetaChain Testnet</option>
                <option>Other Network</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}