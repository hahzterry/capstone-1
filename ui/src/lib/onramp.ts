import type { Address } from "viem";

export async function createOnrampSession(
  address: Address,
) {
  const response = await fetch("/api/onramp/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      blockchain: "ARC",
      asset: "USDC",
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Unable to start funding"
    );
  }

  return response.json() as Promise<{
    session: string;
  }>;
}
