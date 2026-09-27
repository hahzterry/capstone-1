import type { Address } from "viem";
import { homeRegistryAbi } from "./abi";
const fromEnv = (
  import.meta.env.VITE_HOME_REGISTRY_ADDRESS ?? ""
).trim();
export const isDeployed =
  /^0x[0-9a-fA-F]{40}$/.test(fromEnv);
export const homeRegistryAddress =
  fromEnv as Address;
export const homeRegistry = {
  address: homeRegistryAddress,
  abi: homeRegistryAbi,
} as const;
/**
 * Matches the Home struct returned by the
 * production rental-first HomeRegistry contract.
 *
 * Solidity:
 *
 * struct Home {
 *     address owner;
 *     string name;
 *     string location;
 *     string metadataURI;
 *     bool verified;
 *     bool active;
 *     bool forSale;
 *     bool forRent;
 *     uint256 salePrice;
 *     uint256 rentPrice;
 *     address tenant;
 *     uint64 leaseEnd;
 *     uint256 depositAmount;
 * }
 */
export type Home = {
  owner: Address;
  name: string;
  location: string;
  metadataURI: string;
  verified: boolean;
  active: boolean;
  forSale: boolean;
  forRent: boolean;
  salePrice: bigint;
  rentPrice: bigint;
  tenant: Address;
  leaseEnd: bigint;
  depositAmount: bigint;
};
export type HomeView = Home & {
  id: bigint;
};
export { homeRegistryAbi };
