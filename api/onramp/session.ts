// api/onramp/session.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { address } = req.body ?? {};

  if (!address) {
    return res.status(400).json({
      error: "Wallet address is required",
    });
  }

  const kitKey = process.env.ONRAMP_KIT_KEY;

  if (!kitKey) {
    return res.status(500).json({
      error: "Onramp is not configured",
    });
  }

  // Circle Onramp Kit creates a short-lived,
  // single-use session for this wallet.
  //
  // The Circle SDK/API call goes here.

  return res.status(200).json({
    session: "CIRCLE_SESSION_RETURNED_HERE",
  });
}
