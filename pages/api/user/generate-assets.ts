// This API route has been deprecated and moved to /api/internal/generate-assets.
// It is kept here to prevent breaking any old, cached references, but it does nothing.
// Please update any references to point to the new internal endpoint.

import { verifySignature } from "@upstash/qstash/dist/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { generateAndActivateUser } from "@/lib/services/assetService";

export const config = { api: { bodyParser: false } };

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // after verifySignature, req.body is already a parsed object
  const { userId } = req.body as { userId?: string };

  if (!userId) {
    return res.status(400).json({ message: "userId missing" });
  }

  try {
    await generateAndActivateUser(userId);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(`[QStash Subscriber] Error processing job for userId ${userId}:`, error);
    res.status(500).json({ message: "Failed to process job." });
  }
}

export default process.env.NODE_ENV === "development"
  ? handler // bypass signature locally
  : verifySignature(handler); 