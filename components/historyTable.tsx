"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getExplorerUrl } from "../utils/explorerUtils";
import Image from "next/image";
import { CircularProgress, Box } from "@mui/material";

// 定义跨链记录的数据类型
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
}

// 状态映射
const getStatusDisplay = (status: string) => {
  const statusMap: { [key: string]: { text: string; color: string } } = {
    pending: { text: "pending", color: "text-yellow-600 bg-yellow-100" },
    minted: { text: "minted", color: "text-green-600 bg-green-100" },
    failed: { text: "failed", color: "text-red-600 bg-red-100" },
  };
  return statusMap[status] || { text: status, color: "text-gray-600 bg-gray-100" };
};

// 格式化地址显示
const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// 格式化时间戳
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

  // 获取跨链记录数据
  const fetchBridgeRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 这里需要替换为实际的后端API地址
      const response = await axios.get("https://uatbridge.monallo.ai/lockinfo/api/allLock");
      
      // 处理数据，添加缺失的字段
      const processedRecords = response.data.map((record: BridgeRecord) => ({
        ...record,
        sourceChain: record.sourceChain || "",
        targetChain: record.targetChain || "",
        targetTxHash: record.targetToTxHash || "",
        lockedToken: record.lockedToken || "",
        mintedToken: record.mintedToken || "",
      }));
      
      // 按时间戳倒序排列（最新的在前面）
      const sortedRecords = processedRecords.sort((a: BridgeRecord, b: BridgeRecord) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setRecords(sortedRecords);
    } catch (err) {
      console.error("获取跨链记录失败:", err);
      setError("获取数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  // 手动刷新
  const handleManualRefresh = () => {
    setCountdown(10);
    fetchBridgeRecords();
  };



  // 初始化数据获取
  useEffect(() => {
    fetchBridgeRecords();
  }, [fetchBridgeRecords]);

  // 自动刷新倒计时
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 控制面板 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center">
            {/* 刷新按钮 */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Image 
                src="/refresh.png" 
                alt="" 
                width={20} 
                height={20} 
                className={loading ? "animate-spin" : ""}
              />
            </button>

            {/* Material UI 圆形进度条 */}
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

      {/* 数据表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source TxHash
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locked Token
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target TxHash
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minted Token
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{formatAddress(record.fromAddress)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.sourceChain || "Ethereum-Sepolia", record.fromAddress),
                            "_blank"
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Image src="/share.png" alt="查看" width={12} height={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.sourceChain}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{formatAddress(record.sourceFromTxHash)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.sourceChain || "Ethereum-Sepolia", record.sourceFromTxHash),
                            "_blank"
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Image src="/share.png" alt="查看" width={12} height={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.lockedToken}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{formatAddress(record.toAddress)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(record.targetChain || "Imua-Testnet", record.toAddress),
                            "_blank"
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Image src="/share.png" alt="查看" width={12} height={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.targetChain}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {record.targetToTxHash ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{formatAddress(record.targetToTxHash)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              getExplorerUrl(record.targetChain || "Imua-Testnet", record.targetToTxHash || ""),
                              "_blank"
                            );
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Image src="/share.png" alt="查看" width={12} height={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.mintedToken}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {record.amount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(record.timestamp)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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