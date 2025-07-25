/**
 * 获取区块链浏览器URL
 * @param network 网络名称
 * @param address 地址或交易哈希
 * @param type 地址类型，'tx'表示交易哈希，'address'表示钱包地址，默认为'address'
 * @returns 区块链浏览器URL
 */
export function getExplorerUrl(network: string, address: string, type: 'tx' | 'address' = 'address'): string {
  if (!address) return "";
  
  // 根据不同网络和地址类型构建不同的URL
  switch (network) {
    case "Ethereum-Sepolia":
      return `https://sepolia.etherscan.io/${type}/${address}`;
    case "Imua-Testnet":
      return `https://exoscan.org/${type}/${address}`;
    case "ZetaChain-Testnet":
      return `https://zetachain-testnet.blockscout.com/${type}/${address}`;
    case "PlatON-Mainnet":
      return `https://scan.platon.network/${type}/${address}`;
    default:
      console.log("未知网络:", network);
      return "";
  }
}