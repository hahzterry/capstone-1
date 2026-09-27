import {
  createPublicClient,
  http,
} from "viem";
import type {
  Address,
} from "viem";
import { arcChain } from "./chain";
export const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(),
});
export class CircleWalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircleWalletError";
  }
}
let circleSdk: any = null;
let circleAddress: Address | undefined;
let circleChainId: number | undefined;
function getCircleAppId(): string {
  const appId = (
    import.meta.env.VITE_CIRCLE_APP_ID ?? ""
  ).trim();
  if (!appId) {
    throw new CircleWalletError(
      "Circle wallet is not configured. Set VITE_CIRCLE_APP_ID."
    );
  }
  return appId;
}
/**
 * Lazily initialize Circle's Web SDK.
 *
 * The SDK is intentionally loaded only in the browser.
 */
export async function getCircleSdk(): Promise<any> {
  if (typeof window === "undefined") {
    throw new CircleWalletError(
      "Circle wallet is only available in the browser."
    );
  }
  if (circleSdk) {
    return circleSdk;
  }
  const module = await import(
    "@circle-fin/w3s-pw-web-sdk"
  );
  const W3SSdk = module.W3SSdk;
  circleSdk = new W3SSdk({
    appSettings: {
      appId: getCircleAppId(),
    },
  });
  /*
   * Circle requires getDeviceId() after initialization
   * to establish the SDK session.
   */
  if (
    typeof circleSdk.getDeviceId === "function"
  ) {
    await circleSdk.getDeviceId();
  }
  return circleSdk;
}
/**
 * Store the authenticated Circle wallet address.
 */
export function setCircleWallet(
  address: Address,
  chainId?: number,
) {
  circleAddress = address;
  if (chainId !== undefined) {
    circleChainId = chainId;
  }
}
/**
 * Clear the local wallet state.
 */
export function clearCircleWallet() {
  circleAddress = undefined;
  circleChainId = undefined;
}
/**
 * Return the Circle wallet address.
 */
export function getCircleAddress():
  | Address
  | undefined {
  return circleAddress;
}
/**
 * Return the Circle wallet chain.
 */
export function getCircleChainId():
  | number
  | undefined {
  return circleChainId;
}
/**
 * Circle is now the primary wallet.
 */
export function hasWallet(): boolean {
  return Boolean(circleAddress);
}
/**
 * Return the currently connected wallet.
 */
export async function requestAccounts(): Promise<
  Address[]
> {
  if (!circleAddress) {
    throw new CircleWalletError(
      "Connect your Circle wallet first."
    );
  }
  return [circleAddress];
}
/**
 * Return the connected chain.
 */
export async function getWalletChainId(): Promise<number> {
  if (circleChainId !== undefined) {
    return circleChainId;
  }
  return arcChain.id;
}
/**
 * Circle wallet is configured for Arc.
 */
export async function isCorrectNetwork(): Promise<boolean> {
  return (
    getCircleChainId() === undefined ||
    getCircleChainId() === arcChain.id
  );
}
/**
 * Circle wallets do not use window.ethereum.
 *
 * Network selection is handled by the Circle wallet
 * configuration / transaction flow.
 */
export async function switchToArc() {
  circleChainId = arcChain.id;
}
/**
 * Execute a Circle challenge.
 *
 * The challenge must be created by your secure backend.
 */
export async function executeCircleChallenge(
  challengeId: string,
): Promise<any> {
  const sdk = await getCircleSdk();
  return new Promise((resolve, reject) => {
    sdk.execute(
      challengeId,
      (
        error: any,
        result: any,
      ) => {
        if (error) {
          reject(
            new CircleWalletError(
              error?.message ??
                "Circle wallet operation failed."
            ),
          );
          return;
        }
        resolve(result);
      },
    );
  });
}
/**
 * Return the Circle wallet address as the
 * transaction sender.
 *
 * NOTE:
 * Actual signing must be performed through a
 * Circle-created challenge. This intentionally does
 * not expose or fabricate a private key.
 */
export function requireCircleAddress(): Address {
  if (!circleAddress) {
    throw new CircleWalletError(
      "Connect your Circle wallet first."
    );
  }
  return circleAddress;
}
