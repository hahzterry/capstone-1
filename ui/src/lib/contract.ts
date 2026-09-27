import type { Address } from "viem";
import { homeRegistryAbi } from "./abi";

const fromEnv = (
  import.meta.env.VITE_HOME_REGISTRY_ADDRESS ?? ""
).trim();

/**
 * Validate the configured HomeRegistry address before
 * allowing contract interactions.
 */
export const isDeployed = /^0x[a-fA-F0-9]{40}$/.test(fromEnv);

export const homeRegistryAddress = fromEnv as Address;

/**
 * Shared HomeRegistry contract configuration.
 *
 * ABI must be generated from the exact Solidity artifact
 * used for the deployed contract.
 */
export const homeRegistry = {
  address: homeRegistryAddress,
  abi: homeRegistryAbi,
} as const;

/**
 * HomeRegistry Home structure.
 *
 * This mirrors the upgraded Solidity Home struct:
 *
 * owner
 * leaseEnd
 * forSale
 * forRent
 * tenant
 * salePrice
 * rentPrice
 * name
 * location
 * threeWordAddress
 * metadataURI
 * tiktokURL
 */
export type Home = {
  owner: Address;
  leaseEnd: bigint;

  forSale: boolean;
  forRent: boolean;

  tenant: Address;

  salePrice: bigint;
  rentPrice: bigint;

  name: string;
  location: string;

  threeWordAddress: string;
  metadataURI: string;
  tiktokURL: string;
};

export type HomeView = Home & {
  id: bigint;
};

export { homeRegistryAbi };
