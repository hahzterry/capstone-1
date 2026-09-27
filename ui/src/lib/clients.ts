import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem";
import type { EIP1193Provider } from "viem";
import { arcChain } from "./chain";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

/**
 * Public read only client.
 *
 * The chain is selected by VITE_ARC_NETWORK:
 *
 * VITE_ARC_NETWORK=testnet
 * VITE_ARC_NETWORK=mainnet
 */
export const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(),
});

export class NoWalletError extends Error {
  constructor() {
    super(
      "No injected wallet found. Install MetaMask or another compatible wallet."
    );

    this.name = "NoWalletError";
  }
}

export class WrongNetworkError extends Error {
  constructor() {
    super(`Wallet must be connected to ${arcChain.name}.`);

    this.name = "WrongNetworkError";
  }
}

/**
 * Returns the browser injected wallet provider.
 */
function getInjectedProvider(): EIP1193Provider {
  if (typeof window === "undefined") {
    throw new NoWalletError();
  }

  const injected = window.ethereum;

  if (!injected) {
    throw new NoWalletError();
  }

  return injected;
}

/**
 * Create a wallet client using the user's injected wallet.
 */
export function getWalletClient() {
  const injected = getInjectedProvider();

  return createWalletClient({
    chain: arcChain,
    transport: custom(injected),
  });
}

/**
 * Check whether an injected browser wallet exists.
 */
export function hasWallet(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.ethereum)
  );
}

/**
 * Get the wallet's currently connected chain ID.
 */
export async function getWalletChainId(): Promise<number> {
  const injected = getInjectedProvider();

  const chainId = await injected.request({
    method: "eth_chainId",
  });

  return Number.parseInt(chainId, 16);
}

/**
 * Check whether the connected wallet is on the
 * currently configured Arc network.
 */
export async function isCorrectNetwork(): Promise<boolean> {
  try {
    const chainId = await getWalletChainId();

    return chainId === arcChain.id;
  } catch {
    return false;
  }
}

/**
 * Ask the wallet to switch to the configured Arc network.
 *
 * The actual chain configuration comes from chain.ts,
 * so the frontend cannot accidentally switch to a
 * hardcoded testnet while production is configured
 * for mainnet.
 */
export async function switchToArc() {
  const injected = getInjectedProvider();

  await injected.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: `0x${arcChain.id.toString(16)}`,
      },
    ],
  });
}

/**
 * Request the user's wallet accounts.
 */
export async function requestAccounts(): Promise<`0x${string}`[]> {
  const injected = getInjectedProvider();

  const accounts = await injected.request({
    method: "eth_requestAccounts",
  });

  return accounts as `0x${string}`[];
}
