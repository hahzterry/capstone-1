import { getAddress } from "viem";
import type { Address } from "viem";
import { homeRegistryAbi } from "./abi";
const rawAddress = (
  import.meta.env.VITE_HOME_REGISTRY_ADDRESS ?? ""
).trim();
function normalizeAddress(value: string): Address {
  if (!value) {
    return "0x0000000000000000000000000000000000000000";
  }
  try {
    return getAddress(value) as Address;
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
}
export const homeRegistryAddress = normalizeAddress(rawAddress);
export const isDeployed =
  /^0x[a-fA-F0-9]{40}$/.test(rawAddress) &&
  homeRegistryAddress !==
    "0x0000000000000000000000000000000000000000";
export const homeRegistry = {
  address: homeRegistryAddress,
  abi: homeRegistryAbi,
} as const;
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
