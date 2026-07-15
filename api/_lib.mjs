import OpenAI from "openai";
import fs from "node:fs/promises";

export const model = process.env.OPENAI_MODEL || "gpt-5-mini";
export const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const corpusUrl = new URL("../assets/medminute-corpus.json", import.meta.url);
let corpusPromise;

export async function getCorpus() {
  corpusPromise ||= fs.readFile(corpusUrl, "utf8").then(JSON.parse);
  return corpusPromise;
}

const stopWords = new Set([
  "the","and","for","with","what","when","where","which","why","how","does","is",
  "are","was","were","from","into","about","this","that","have","has","can","could",
  "would","should","explain","tell","please","your","you","their","there","make",
  "create","generate","question","questions","quiz","flashcards"
]);

function terms(text) {
  return String(text || "").toLowerCase().match(/[a-z0-9]+/g)
    ?.filter(x => x.length > 2 && !stopWords.has(x)) || [];
}

export async function retrieve(query, limit = 8) {
  const corpus = await getCorpus();
  const queryTerms = terms(query);
  return corpus.map(doc => {
    const title = String(doc.title || "");
    const text = String(doc.text || "");
    const haystack = `${title} ${text}`.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      score += Math.min(haystack.split(term).length - 1, 10);
      if (title.toLowerCase().includes(term)) score += 8;
    }
    return {...doc, score};
  }).filter(doc => doc.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, limit);
}

export function sourceBlock(sources) {
  return sources.length
    ? sources.map((s,i) =>
      `SOURCE ${i+1}: ${s.title}\nURL: ${s.url}\nCONTENT: ${String(s.text || "").slice(0,5500)}`
    ).join("\n\n")
    : "No clearly relevant MedMinute source was retrieved.";
}

export function parseJSON(text) {
  const cleaned = String(text || "").trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(cleaned);
}

export const baseSafety = `
You are MedMinute AI Tutor, part of a student-led medical education website.
Use only the supplied MedMinute source material.
Never invent missing facts. If sources are insufficient, state that clearly.
Do not diagnose, prescribe, interpret personal laboratory results, or recommend medication changes.
For symptoms, provide general education and recommend professional assessment when appropriate.
Use original questions. Never reproduce secured or copyrighted examination items.
For Alberta Biology 20 and Chemistry 30, align to the website's course content.
`;

export function requireAI(res) {
  if (!client) {
    res.status(503).json({error:"AI server is not configured."});
    return false;
  }
  return true;
}

export function allowMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    res.setHeader("Allow", methods);
    res.status(405).json({error:"Method not allowed."});
    return false;
  }
  return true;
}
