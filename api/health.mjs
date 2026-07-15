import { client, model, allowMethods } from "./_lib.mjs";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    ai_configured: Boolean(client),
    model,
    environment: process.env.VERCEL ? "vercel" : "local"
  });
}
