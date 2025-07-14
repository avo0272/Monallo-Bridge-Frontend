/**
 * 获取区块链浏览器URL
 * @param network 网络名称
 * @param address 合约地址
 * @returns 区块链浏览器URL
 */
export function getExplorerUrl(network: string, address: string): string {
  if (!address) return "";
  
  switch (network) {
    case "Ethereum-Sepolia":
      return `https://sepolia.etherscan.io/address/${address}`;
    case "Imua-Testnet":
      return `https://https://exoscan.org/address/${address}`;
    case "ZetaChain-Testnet":
      return `https://zetachain-testnet.blockscout.com/address/${address}`;
    default:
      return "";
  }
}