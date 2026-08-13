import { createPublicClient, createWalletClient, custom, http } from "viem";
import type { EIP1193Provider } from "viem";
import { arcTestnet } from "./chain";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

export class NoWalletError extends Error {
  constructor() {
    super("No injected wallet found. Install MetaMask or another browser wallet.");
  }
}

export function getWalletClient() {
  const injected = window.ethereum;
  if (!injected) throw new NoWalletError();

  return createWalletClient({ chain: arcTestnet, transport: custom(injected) });
}

export function hasWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}
