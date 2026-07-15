import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;
const client = apiKey ? new OpenAI({ apiKey }) : null;

if (!apiKey) console.warn("OPENAI_API_KEY is not set.");
if (!model) console.warn("OPENAI_MODEL is not set.");

const corpus = JSON.parse(
  await fs.readFile(path.join(__dirname, "assets", "medminute-corpus.json"), "utf8")
);

app.use(express.json({ limit: "12mb" }));
app.use(express.static(__dirname));


const analyticsFile = path.join(__dirname, "data", "analytics.json");
let analyticsQueue = Promise.resolve();

function blankAnalytics() {
  return {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    visitors: {},
    totals: {
      visits: 0,
      page_views: 0,
      article_reads: 0,
      certificates_earned: 0,
      ai_tutor_uses: 0,
      ai_questions: 0,
      image_explanations: 0,
      quizzes_completed: 0,
      cases_completed: 0
    },
    pages: {},
    events_by_day: {}
  };
}

async function ensureAnalyticsFile() {
  await fs.mkdir(path.dirname(analyticsFile), { recursive: true });
  try {
    await fs.access(analyticsFile);
  } catch {
    await fs.writeFile(analyticsFile, JSON.stringify(blankAnalytics(), null, 2));
  }
}

async function readAnalytics() {
  await ensureAnalyticsFile();
  try {
    return JSON.parse(await fs.readFile(analyticsFile, "utf8"));
  } catch {
    const fresh = blankAnalytics();
    await fs.writeFile(analyticsFile, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

function mutateAnalytics(mutator) {
  analyticsQueue = analyticsQueue.then(async () => {
    const data = await readAnalytics();
    mutator(data);
    data.updated_at = new Date().toISOString();
    await fs.writeFile(analyticsFile, JSON.stringify(data, null, 2));
    return data;
  });
  return analyticsQueue;
}

function safeEventName(value) {
  const allowed = new Set([
    "page_view","article_read","certificate_earned","ai_tutor_use",
    "ai_question","image_explanation","quiz_completed","case_completed"
  ]);
  return allowed.has(value) ? value : null;
}

function analyticsSummary(data) {
  const now = Date.now();
  const activeWindow = 5 * 60 * 1000;
  const active_now = Object.values(data.visitors || {}).filter(v => {
    const seen = Date.parse(v.last_seen || 0);
    return Number.isFinite(seen) && now - seen <= activeWindow;
  }).length;

  const top_pages = Object.entries(data.pages || {})
    .map(([url, item]) => ({url, title:item.title || url, views:item.views || 0, reads:item.reads || 0}))
    .sort((a,b) => (b.views + b.reads) - (a.views + a.reads))
    .slice(0, 8);

  const daily = Object.entries(data.events_by_day || {})
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, values]) => ({date, ...values}));

  return {
    total_visitors: Object.keys(data.visitors || {}).length,
    active_now,
    updated_at: data.updated_at,
    totals: data.totals,
    top_pages,
    daily
  };
}


const stopWords = new Set([
  "the","and","for","with","what","when","where","which","why","how","does","is",
  "are","was","were","from","into","about","this","that","have","has","can","could",
  "would","should","explain","tell","please","your","you","their","there","make",
  "create","generate","question","questions","quiz","flashcards"
]);

function terms(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g)?.filter(x => x.length > 2 && !stopWords.has(x)) || [];
}

function retrieve(query, limit = 7) {
  const queryTerms = terms(query);
  return corpus.map(doc => {
    const haystack = `${doc.title} ${doc.text}`.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      score += Math.min(haystack.split(term).length - 1, 10);
      if (doc.title.toLowerCase().includes(term)) score += 8;
    }
    return {...doc, score};
  }).filter(doc => doc.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, limit);
}

function sourceBlock(sources) {
  return sources.length
    ? sources.map((s,i) =>
      `SOURCE ${i+1}: ${s.title}\nURL: ${s.url}\nCONTENT: ${s.text.slice(0,5500)}`
    ).join("\n\n")
    : "No clearly relevant MedMinute source was retrieved.";
}

function parseJSON(text) {
  const cleaned = text.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(cleaned);
}

const baseSafety = `
You are MedMinute AI Tutor, part of a student-led medical education website.
Use ONLY the supplied MedMinute source material.
Never invent missing facts. If sources are insufficient, state that clearly.
Do not diagnose, prescribe, interpret personal laboratory results, or recommend medication changes.
For symptoms, provide general education and recommend professional assessment when appropriate.
Use original questions. Never reproduce secured or copyrighted examination items.
For Alberta Biology 20 and Chemistry 30, align to the website's course content.
`;


app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    ai_configured: Boolean(client && model),
    model: model || null,
    environment: process.env.VERCEL ? "vercel" : "local"
  });
});

app.post("/api/ask", async (req,res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question || question.length > 1200) return res.status(400).json({error:"Enter a valid shorter question."});
    if (!client || !model) return res.status(503).json({error:"AI server is not configured."});

    const sources = retrieve(question);
    const response = await client.responses.create({
      model,
      instructions: `${baseSafety}
Answer clearly for a high-school or early pre-med reader in 2–6 short paragraphs.`,
      input: `QUESTION:\n${question}\n\nMEDMINUTE SOURCES:\n${sourceBlock(sources)}`
    });

    res.json({
      answer: response.output_text?.trim() || "No answer was generated.",
      sources: sources.map(({title,url}) => ({title,url}))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"MedMinute AI could not answer right now."});
  }
});

app.post("/api/tutor", async (req,res) => {
  try {
    const action = String(req.body?.action || "teach");
    const topic = String(req.body?.topic || "").trim();
    const level = String(req.body?.level || "high-school");
    const course = String(req.body?.course || "");
    const instruction = String(req.body?.instruction || "").trim();
    const mastery = req.body?.mastery && typeof req.body.mastery === "object" ? req.body.mastery : {};
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];

    if (!client || !model) return res.status(503).json({error:"AI server is not configured."});
    if (action !== "recommend" && !topic) return res.status(400).json({error:"Enter a topic."});

    if (action === "evaluate") {
      const question = String(req.body?.question || "");
      const expected = String(req.body?.expected_answer || "");
      const userAnswer = String(req.body?.user_answer || "");
      const response = await client.responses.create({
        model,
        instructions: `${baseSafety}
Evaluate the student's answer fairly. Return ONLY valid JSON:
{"correct":boolean,"score":number from 0 to 100,"feedback":"brief constructive feedback","model_answer":"concise ideal answer"}`,
        input: `TOPIC: ${topic}\nQUESTION: ${question}\nEXPECTED ANSWER: ${expected}\nSTUDENT ANSWER: ${userAnswer}`
      });
      return res.json(parseJSON(response.output_text));
    }

    const retrievalQuery = `${topic} ${course} ${instruction}`;
    const sources = action === "recommend"
      ? retrieve(Object.keys(mastery).join(" ") || "academy health library clinical skills", 8)
      : retrieve(retrievalQuery, 8);

    const common = `LEVEL: ${level}
COURSE: ${course || "General medicine"}
TOPIC: ${topic || "Personalized recommendation"}
EXTRA INSTRUCTION: ${instruction || "None"}
RECENT SESSION: ${history.map(x => `${x.role}: ${x.content}`).join("\n")}
MASTERY PROFILE: ${JSON.stringify(mastery)}
MEDMINUTE SOURCES:
${sourceBlock(sources)}

Return ONLY valid JSON with no markdown fences.`;

    let schemaInstruction = "";
    if (action === "teach" || action === "alberta") {
      schemaInstruction = `
Act as a patient, structured medical/science teacher.
Return:
{"title":"...","summary":"one sentence","sections":[{"heading":"...","content":"..."}],"check_question":"one understanding question"}
Use 4–7 sections. For a disease, usually cover mechanism, symptoms, diagnosis, treatment and key takeaway.
For Alberta content, teach the requested curriculum concept and include an original application example.`;
    } else if (action === "quiz") {
      schemaInstruction = `
Create an original 6-question multiple-choice quiz.
Return:
{"title":"...","topic":"...","summary":"Quiz ready","questions":[
{"question":"...","options":["A","B","C","D"],"correct_index":0,"explanation":"..."}
]}
Each correct_index must match the correct option. Questions should test understanding, not obscure trivia.`;
    } else if (action === "flashcards") {
      schemaInstruction = `
Create 10 concise flashcards.
Return:
{"title":"...","summary":"Flashcards ready","flashcards":[{"front":"...","back":"..."}]}
Cover definitions, mechanisms, diagnosis, comparisons and key facts when appropriate.`;
    } else if (action === "followup") {
      schemaInstruction = `
Ask one useful open-ended question that tests understanding.
Return:
{"summary":"Tutor question ready","question":"...","prompt":"...","expected_answer":"key points expected in the answer"}
Do not reveal the expected answer in the question or prompt.`;
    } else if (action === "recommend") {
      schemaInstruction = `
Analyze the mastery profile. Lower average scores and repeated weak areas deserve priority.
Return:
{"title":"Your recommended next lessons","summary":"Study plan ready","recommendations":[
{"topic":"...","reason":"...","url":"a matching MedMinute HTML filename from the supplied sources, or empty string"}
]}
Give 3–5 practical recommendations. If mastery is empty, recommend a balanced starting path.`;
    } else {
      return res.status(400).json({error:"Unknown tutor action."});
    }

    const response = await client.responses.create({
      model,
      instructions: `${baseSafety}\n${schemaInstruction}`,
      input: common
    });

    const data = parseJSON(response.output_text);
    data.sources = sources.map(({title,url}) => ({title,url}));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"The AI Tutor could not generate this activity. Try again."});
  }
});


app.post("/api/image-explain", async (req, res) => {
  try {
    const image = String(req.body?.image || "");
    const question = String(req.body?.question || "").trim();
    if (!client || !model) return res.status(503).json({error:"AI server is not configured."});
    if (!image.startsWith("data:image/")) return res.status(400).json({error:"Upload a valid PNG, JPEG or WebP image."});
    if (image.length > 11_500_000) return res.status(413).json({error:"The image is too large."});

    const response = await client.responses.create({
      model,
      instructions: `${baseSafety}
You are explaining an educational, de-identified medical image.
Do not identify a person, diagnose a patient, claim certainty, or recommend treatment.
Describe visible educational features and terminology. Clearly distinguish observation from inference.
If the image is unclear, inappropriate, contains identifiable information, or cannot be safely interpreted, say so.
Return a concise title, a structured explanation, and limitations.`,
      input: [{
        role: "user",
        content: [
          {type: "input_text", text: question || "Explain the visible educational features in this medical image for a high-school or early pre-med learner."},
          {type: "input_image", image_url: image}
        ]
      }]
    });

    const explanation = response.output_text?.trim();
    if (!explanation) throw new Error("No readable image explanation was returned.");
    res.json({
      title: "MedMinute Educational Image Explanation",
      explanation,
      limitations: "This output is educational only and cannot replace interpretation by a qualified clinician with access to the full clinical context."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"The image could not be explained right now."});
  }
});


app.post("/api/analytics/event", async (req, res) => {
  try {
    const visitorId = String(req.body?.visitor_id || "").trim().slice(0, 100);
    const event = safeEventName(String(req.body?.event || ""));
    const url = String(req.body?.url || "").trim().slice(0, 240);
    const title = String(req.body?.title || "").trim().slice(0, 180);
    if (!visitorId || !event) return res.status(400).json({error:"Invalid analytics event."});

    const now = new Date();
    const day = now.toISOString().slice(0,10);
    const data = await mutateAnalytics(store => {
      store.visitors ||= {};
      store.totals ||= blankAnalytics().totals;
      store.pages ||= {};
      store.events_by_day ||= {};

      const isNewVisitor = !store.visitors[visitorId];
      if (isNewVisitor) {
        store.visitors[visitorId] = {first_seen:now.toISOString(), last_seen:now.toISOString(), visits:1};
        store.totals.visits = (store.totals.visits || 0) + 1;
      } else {
        store.visitors[visitorId].last_seen = now.toISOString();
      }

      const map = {
        page_view:"page_views",
        article_read:"article_reads",
        certificate_earned:"certificates_earned",
        ai_tutor_use:"ai_tutor_uses",
        ai_question:"ai_questions",
        image_explanation:"image_explanations",
        quiz_completed:"quizzes_completed",
        case_completed:"cases_completed"
      };
      store.totals[map[event]] = (store.totals[map[event]] || 0) + 1;

      store.events_by_day[day] ||= {};
      store.events_by_day[day][event] = (store.events_by_day[day][event] || 0) + 1;

      if (url) {
        store.pages[url] ||= {title:title || url, views:0, reads:0};
        if (title) store.pages[url].title = title;
        if (event === "page_view") store.pages[url].views++;
        if (event === "article_read") store.pages[url].reads++;
      }
    });
    res.json({ok:true, summary:analyticsSummary(data)});
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"Analytics could not be updated."});
  }
});

app.get("/api/analytics/summary", async (req, res) => {
  try {
    const data = await readAnalytics();
    res.set("Cache-Control", "no-store");
    res.json(analyticsSummary(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"Analytics are unavailable."});
  }
});

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "index.html"));
});

export default app;

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`MedMinute running at http://localhost:${port}`));
}
