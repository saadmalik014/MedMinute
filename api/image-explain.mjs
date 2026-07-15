import { client, model, baseSafety, requireAI, allowMethods } from "./_lib.mjs";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!requireAI(res)) return;
  try {
    const image = String(req.body?.image || "");
    const question = String(req.body?.question || "").trim();
    if (!image.startsWith("data:image/")) return res.status(400).json({error:"Upload a valid PNG, JPEG or WebP image."});
    if (image.length > 4_000_000) return res.status(413).json({error:"The image is too large. Use a smaller image."});
    const response = await client.responses.create({
      model,
      instructions: `${baseSafety}\nExplain only de-identified educational medical images. Do not identify a person, diagnose a patient, claim certainty, or recommend treatment. Clearly distinguish visible observations from inference.`,
      input: [{ role: "user", content: [
        { type: "input_text", text: question || "Explain the visible educational features in this medical image." },
        { type: "input_image", image_url: image }
      ]}]
    });
    res.status(200).json({
      title: "MedMinute Educational Image Explanation",
      explanation: response.output_text?.trim() || "No explanation was generated.",
      limitations: "Educational only; not a diagnosis or substitute for clinical interpretation."
    });
  } catch (error) {
    console.error("IMAGE_ERROR", error);
    res.status(500).json({error:"The image could not be explained right now."});
  }
}
