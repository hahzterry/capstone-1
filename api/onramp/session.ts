// api/onramp/session.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createOnrampServerKit } from "@crcl-main/onramp-kit";

const kitKey = process.env.ONRAMP_KIT_KEY;

if (!kitKey) {
  throw new Error("ONRAMP_KIT_KEY is not configured");
}

const onramp = createOnrampServerKit({
  kitKey,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { address } = req.body ?? {};

    if (
      typeof address !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(address)
    ) {
      return res.status(400).json({
        error: "Valid wallet address is required",
      });
    }

    /*
     * Circle creates a short-lived, single-use session
     * for the wallet receiving the USDC.
     *
     * The exact session method is provided by the
     * currently installed Onramp Kit version.
     */
    const session = await onramp.createSession({
      destinationAddress: address,
      destinationChain: "ARC",
      destinationAsset: "USDC",
    });

    return res.status(200).json({
      session,
    });
  } catch (error) {
    console.error("Circle Onramp session error:", error);

    return res.status(500).json({
      error: "Unable to create funding session",
    });
  }
}
