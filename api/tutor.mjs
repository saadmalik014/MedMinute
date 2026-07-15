import { client, model, baseSafety, retrieve, sourceBlock, parseJSON, requireAI, allowMethods } from "./_lib.mjs";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!requireAI(res)) return;
  try {
    const action = String(req.body?.action || "teach");
    const topic = String(req.body?.topic || "").trim();
    const level = String(req.body?.level || "high-school");
    const course = String(req.body?.course || "");
    const instruction = String(req.body?.instruction || "").trim();
    const mastery = req.body?.mastery && typeof req.body.mastery === "object" ? req.body.mastery : {};
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];
    if (action !== "recommend" && !topic) return res.status(400).json({error:"Enter a topic."});

    if (action === "evaluate") {
      const response = await client.responses.create({
        model,
        instructions: `${baseSafety}\nEvaluate the student's answer fairly. Return only valid JSON: {"correct":boolean,"score":number,"feedback":"brief constructive feedback","model_answer":"concise ideal answer"}`,
        input: `TOPIC: ${topic}\nQUESTION: ${String(req.body?.question || "")}\nEXPECTED ANSWER: ${String(req.body?.expected_answer || "")}\nSTUDENT ANSWER: ${String(req.body?.user_answer || "")}`
      });
      return res.status(200).json(parseJSON(response.output_text));
    }

    const sources = action === "recommend"
      ? await retrieve(Object.keys(mastery).join(" ") || "academy health library clinical skills", 8)
      : await retrieve(`${topic} ${course} ${instruction}`, 8);

    const common = `LEVEL: ${level}\nCOURSE: ${course || "General medicine"}\nTOPIC: ${topic || "Personalized recommendation"}\nEXTRA INSTRUCTION: ${instruction || "None"}\nRECENT SESSION: ${history.map(x => `${x.role}: ${x.content}`).join("\n")}\nMASTERY PROFILE: ${JSON.stringify(mastery)}\nMEDMINUTE SOURCES:\n${sourceBlock(sources)}\n\nReturn only valid JSON with no markdown fences.`;

    let schemaInstruction = "";
    if (action === "teach" || action === "alberta") schemaInstruction = `Return {"title":"...","summary":"one sentence","sections":[{"heading":"...","content":"..."}],"check_question":"one understanding question"}. Use 4–7 sections.`;
    else if (action === "quiz") schemaInstruction = `Create an original six-question multiple-choice quiz. Return {"title":"...","topic":"...","summary":"Quiz ready","questions":[{"question":"...","options":["A","B","C","D"],"correct_index":0,"explanation":"..."}]}.`;
    else if (action === "flashcards") schemaInstruction = `Create ten concise flashcards. Return {"title":"...","summary":"Flashcards ready","flashcards":[{"front":"...","back":"..."}]}.`;
    else if (action === "followup") schemaInstruction = `Return {"summary":"Tutor question ready","question":"...","prompt":"...","expected_answer":"key points expected"}.`;
    else if (action === "recommend") schemaInstruction = `Return {"title":"Your recommended next lessons","summary":"Study plan ready","recommendations":[{"topic":"...","reason":"...","url":"matching MedMinute HTML filename or empty string"}]}. Give 3–5 recommendations.`;
    else return res.status(400).json({error:"Unknown tutor action."});

    const response = await client.responses.create({ model, instructions: `${baseSafety}\n${schemaInstruction}`, input: common });
    const data = parseJSON(response.output_text);
    data.sources = sources.map(({title,url}) => ({title,url}));
    res.status(200).json(data);
  } catch (error) {
    console.error("TUTOR_ERROR", error);
    res.status(500).json({error:"The AI Tutor could not generate this activity. Try again."});
  }
}
