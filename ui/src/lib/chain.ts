import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",

  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },

  blockExplorers: {
    default: {
      name: "Arcscan",
      url: "https://testnet.arcscan.app",
    },
  },

  testnet: true,
});

export const arcMainnet = defineChain({
  id: 5042,
  name: "Arc",

  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.arc.io"],
    },
  },

  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.io",
    },
  },

  testnet: false,
});

/**
 * Set:
 *
 * VITE_ARC_NETWORK=testnet
 *
 * for development, or:
 *
 * VITE_ARC_NETWORK=mainnet
 *
 * for production.
 */
const network =
  (import.meta.env.VITE_ARC_NETWORK ?? "testnet").trim().toLowerCase();

export const arcChain =
  network === "mainnet"
    ? arcMainnet
    : arcTestnet;

export const isArcMainnet =
  arcChain.id === arcMainnet.id;

export const isArcTestnet =
  arcChain.id === arcTestnet.id;

export function txUrl(hash: string) {
  return `${arcChain.blockExplorers.default.url}/tx/${hash}`;
}

export function addressUrl(address: string) {
  return `${arcChain.blockExplorers.default.url}/address/${address}`;
}
