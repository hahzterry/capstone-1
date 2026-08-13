import type { Address } from "viem";
import { homeRegistryAbi } from "./abi";

const fromEnv = (import.meta.env.VITE_HOME_REGISTRY_ADDRESS ?? "").trim();

export const isDeployed = /^0x[0-9a-fA-F]{40}$/.test(fromEnv);
export const homeRegistryAddress = fromEnv as Address;

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
};

export type HomeView = Home & { id: bigint };

export { homeRegistryAbi };
