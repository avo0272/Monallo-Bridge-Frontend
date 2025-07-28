"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getExplorerUrl } from "../utils/explorerUtils";
import Image from "next/image";
import { CircularProgress, Box } from "@mui/material";

// Define cross-chain record data type
interface BridgeRecord {
  _id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  sourceFromTxHash: string;
  fee: string;
  status: string;
  timestamp: string;
  __v: number;
  sourceChain?: string;
  targetChain?: string;
  targetToTxHash?: string;
  lockedToken?: string;
  mintedToken?: string;
  // Original fields returned by API
  sourceFromAddress?: string;
  targetToAddress?: string;
  sourceFromAmount?: string;
  sourceFromHandingFee?: string;
  sourceFromTxStatus?: string;
  targetToTxStatus?: string;
  crossBridgeStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  sourceFromTokenName?: string;
  targetToTokenName?: string;
}

// Status mapping
const getStatusDisplay = (status: string) => {
  const statusMap: { [key: string]: { text: string; color: string } } = {
    pending: { text: "pending", color: "text-yellow-600 bg-yellow-100" },
    minted: { text: "minted", color: "text-green-600 bg-green-100" },
    success: { text: "success", color: "text-green-600 bg-green-100" },
    failed: { text: "failed", color: "text-red-600 bg-red-100" },
  };
  return statusMap[status] || { text: status, color: "text-gray-600 bg-gray-100" };
};

// Format address display
const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format timestamp
const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function HistoryTable() {
  const [records, setRecords] = useState<BridgeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Get cross-chain record data
  const fetchBridgeRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This needs to be replaced with the actual backend API address
      const response = await axios.get("https://uatbridge.monallo.ai/lockinfo/api/allCrossRecords");
      // const response = await axios.get("http://192.168.31.178:5000/api/allCrossRecords");
      console.log(response.data);
      
      // Process data, map API returned fields to component fields
      const processedRecords = response.data.map((record: any) => {
        // Remove quotes from fields
        const cleanString = (str: string | undefined) => {
          if (!str) return "";
          return str.replace(/['"\`]/g, "");
        };
        
        return {
          ...record,
          // Map fields
          fromAddress: record.sourceFromAddress || "",
          toAddress: record.targetToAddress || "",
          amount: record.sourceFromAmount || "",
          fee: record.sourceFromHandingFee || "",
          status: record.crossBridgeStatus || record.sourceFromTxStatus || "pending",
          timestamp: record.createdAt || record.updatedAt || new Date().toISOString(),
          // Clean quotes from fields
          sourceChain: cleanString(record.sourceChain),
          targetChain: cleanString(record.targetChain),
          targetToTxHash: record.targetToTxHash || "",
          lockedToken: cleanString(record.sourceFromTokenName),
          mintedToken: cleanString(record.targetToTokenName),
        };
      });
      
      // Sort by timestamp in descending order (newest first)
      const sortedRecords = processedRecords.sort((a: BridgeRecord, b: BridgeRecord) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setRecords(sortedRecords);
    } catch (err) {
      console.error("Failed to get cross-chain records:", err);
      setError("Failed to get data, please try again later");
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh
  const handleManualRefresh = () => {
    setCountdown(10);
    fetchBridgeRecords();
  };



  // Initialize data fetching
  useEffect(() => {
    fetchBridgeRecords();
  }, [fetchBridgeRecords]);

  // Auto refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchBridgeRecords();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ fetchBridgeRecords]);

  if (loading && records.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Control panel */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative flex items-center">
            {/* Refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="ml-1 sm:ml-2 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Image 
                src="/refresh.png" 
                alt="" 
                width={20} 
                height={20} 
                className={loading ? "animate-spin" : ""}
              />
            </button>

            {/* Material UI circular progress */}
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={(10 - countdown) * 10} 
                size={20}
                thickness={8}
              />

            </Box>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="min-w-full w-max table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                From
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                Source TxHash
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                Target TxHash
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => {
              const statusDisplay = getStatusDisplay(record.status);
              return (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-[100px] sm:min-w-[120px]">
                      <span 
                        className="font-mono cursor-pointer hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.sourceChain || "Ethereum-Sepolia", record.fromAddress, 'address'),
                            "_blank"
                          );
                        }}
                      >
                        {formatAddress(record.fromAddress)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.sourceChain || "Ethereum-Sepolia", record.fromAddress, 'address'),
                            "_blank"
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700 flex items-center justify-center w-5 h-5"
                      >
                        <Image src="/share.png" alt="View" width={16} height={16} className="object-contain"/>
                      </button>
                    </div>
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {record.sourceChain}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-[100px] sm:min-w-[120px]">
                      <span 
                        className="font-mono cursor-pointer hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.sourceChain || "Ethereum-Sepolia", record.sourceFromTxHash, 'tx'),
                            "_blank"
                          );
                        }}
                      >
                        {formatAddress(record.sourceFromTxHash)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.sourceChain || "Ethereum-Sepolia", record.sourceFromTxHash, 'tx'),
                            "_blank"
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700 flex items-center justify-center w-5 h-5"
                      >
                        <Image src="/share.png" alt="View" width={16} height={16} className="object-contain"/>
                      </button>
                    </div>
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {record.lockedToken}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-[100px] sm:min-w-[120px]">
                      <span 
                        className="font-mono cursor-pointer hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.targetChain || "Imua-Testnet", record.toAddress, 'address'),
                            "_blank"
                          );
                        }}
                      >
                        {formatAddress(record.toAddress)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.targetChain || "Imua-Testnet", record.toAddress, 'address'),
                            "_blank"
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700 flex items-center justify-center w-5 h-5"
                      >
                        <Image src="/share.png" alt="View" width={16} height={16} className="object-contain"/>
                      </button>
                    </div>
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {record.targetChain}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    {record.targetToTxHash ? (
                      <div className="flex items-center space-x-1 sm:space-x-2 min-w-[100px] sm:min-w-[120px]">
                        <span 
                          className="font-mono cursor-pointer hover:text-blue-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              getExplorerUrl(record.targetChain || "Imua-Testnet", record.targetToTxHash || "", 'tx'),
                              "_blank"
                            );
                          }}
                        >
                          {formatAddress(record.targetToTxHash)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              getExplorerUrl(record.targetChain || "Imua-Testnet", record.targetToTxHash || "", 'tx'),
                              "_blank"
                            );
                          }}
                          className="text-blue-500 hover:text-blue-700 flex items-center justify-center w-5 h-5"
                        >
                          <Image src="/share.png" alt="View" width={16} height={16} className="object-contain"/>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {record.mintedToken}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-mono">
                    {record.amount}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatTimestamp(record.timestamp)}
                  </td>
                  <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                        statusDisplay.color
                      }`}
                    >
                      {statusDisplay.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {records.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No cross-chain records
        </div>
      )}
    </div>
  );
}