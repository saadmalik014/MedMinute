import { client, model, baseSafety, retrieve, sourceBlock, requireAI, allowMethods } from "./_lib.mjs";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!requireAI(res)) return;
  try {
    const question = String(req.body?.question || "").trim();
    if (!question || question.length > 1200) return res.status(400).json({error:"Enter a valid shorter question."});
    const sources = await retrieve(question, 7);
    const response = await client.responses.create({
      model,
      instructions: `${baseSafety}\nAnswer clearly for a high-school or early pre-med reader in 2–6 short paragraphs.`,
      input: `QUESTION:\n${question}\n\nMEDMINUTE SOURCES:\n${sourceBlock(sources)}`
    });
    res.status(200).json({
      answer: response.output_text?.trim() || "No answer was generated.",
      sources: sources.map(({title,url}) => ({title,url}))
    });
  } catch (error) {
    console.error("ASK_ERROR", error);
    res.status(500).json({error:"MedMinute AI could not answer right now."});
  }
}
