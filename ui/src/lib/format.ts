import { formatUnits, parseUnits } from "viem";

export const USDC_DECIMALS = 18;

/// Renders a native-USDC amount with thousands separators and a fixed number of
/// decimals. Kept on strings so large prices never touch a float.
export function formatUsdc(value: bigint, fractionDigits = 2): string {
  const [whole, fraction = ""] = formatUnits(value, USDC_DECIMALS).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${(fraction + "0".repeat(fractionDigits)).slice(0, fractionDigits)}`;
}

export function parseUsdc(value: string): bigint {
  return parseUnits(value.trim(), USDC_DECIMALS);
}

export function isValidAmount(value: string): boolean {
  if (!/^\d+(\.\d{1,18})?$/.test(value.trim())) return false;
  return parseUsdc(value) > 0n;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function nowInSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function isLeaseActive(leaseEnd: bigint): boolean {
  return leaseEnd > nowInSeconds();
}

export function formatLeaseEnd(leaseEnd: bigint): string {
  if (leaseEnd === 0n) return "-";
  return new Date(Number(leaseEnd) * 1000).toLocaleString();
}

export function daysLeft(leaseEnd: bigint): number {
  const seconds = Number(leaseEnd - nowInSeconds());
  return Math.max(0, Math.ceil(seconds / 86_400));
}
