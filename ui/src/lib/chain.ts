import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  // Arc settles gas in USDC, and the native balance is 18-decimal like wei --
  // not the 6 decimals of the ERC-20 USDC people are used to.
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
  testnet: true,
});

export function txUrl(hash: string) {
  return `${arcTestnet.blockExplorers.default.url}/tx/${hash}`;
}

export function addressUrl(address: string) {
  return `${arcTestnet.blockExplorers.default.url}/address/${address}`;
}
