const AI_CONFIG = {
  provider: "openai", // Groq is OpenAI-compatible
  model: "llama-3.3-70b-versatile",
  maxTokens: 2000,
  temperature: 0.3,
  apiKeyEnvVar: "GROQ_API_KEY",
};

async function callAI(systemPrompt, userContent) {
  const apiKey = process.env[AI_CONFIG.apiKeyEnvVar];

  if (!apiKey) {
    throw new Error(
      `AI service is not configured. Please set the ${AI_CONFIG.apiKeyEnvVar} environment variable.`,
    );
  }

  // ── OpenAI ──────────────────────────────────────────────────────────────
  if (AI_CONFIG.provider === "openai") {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          max_tokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(
        errBody?.error?.message || `OpenAI API error: HTTP ${response.status}`,
      );
    }

    const json = await response.json();
    const text = json?.choices?.[0]?.message?.content;

    if (!text) throw new Error("OpenAI returned an empty response.");
    return text.trim();
  }

  throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
}

const SYSTEM_PROMPTS = {
  improveDraft: `You are a senior advocate with 20+ years of experience in Pakistani courts (Supreme Court, High Courts, Sessions Courts). You specialise in criminal and civil litigation under Pakistani law (PPC, CrPC, Civil Procedure Code).

Your task is to improve a legal application draft with the following strict rules:
1. PRESERVE ALL FACTS: Do not change names, dates, case numbers, FIR numbers, sections, or any factual information.
2. IMPROVE CLARITY: Rewrite sentences that are ambiguous, repetitive, or grammatically weak.
3. ENHANCE LEGAL LANGUAGE: Use formal Pakistani court language. Replace colloquial phrases with proper legal terms.
4. STRENGTHEN ARGUMENTS: Make existing grounds more persuasive by citing the correct legal standard (e.g. "prima facie case", "apprehension of misuse of liberty").
5. MAINTAIN STRUCTURE: Keep the existing headings, sections, and paragraph order intact.
6. TONE: Formal, respectful, third-person. Never casual.
7. OUTPUT: Return only the improved application text. No explanations, no preamble, no markdown formatting.`,

  generateCrossQuestions: `You are a senior criminal defence advocate practising in Pakistani courts with expertise in cross-examination strategy under the Qanun-e-Shahadat Order 1984.

Your task is to generate a structured set of cross-examination questions for a prosecution witness based on the case facts provided.

Rules:
1. Generate 15-25 questions organised into thematic sections (e.g. "Credibility", "Opportunity to Witness", "Prior Contradictions", "Motive to Falsely Implicate", "Procedural Lapses").
2. Each question must be a proper cross-examination question: leading, precise, and designed to elicit a "yes" or "no" answer that benefits the defence.
3. Do NOT include open-ended questions unless specifically for impeachment.
4. Questions should expose: inconsistencies in the FIR, delay in reporting, identification issues, investigation lapses, motive to falsely implicate, and procedural violations.
5. Reference relevant Pakistani case law principles where applicable (e.g. PLD, SCMR citations format).
6. Output format:
   SECTION: [Section Name]
   Q1. [Question text]
   Q2. [Question text]
   ...
   (repeat for each section)
7. No preamble, no explanations after the questions.`,

  summarise: `You are a legal assistant at a Pakistani law firm. Summarise the following legal document in plain English in 3-5 sentences. Identify: the type of application, the parties, the key grounds, and the relief sought. Keep it factual and neutral.`,
};

export async function improveDraft(content) {
  if (!content?.trim()) {
    return { ok: false, error: "No content provided to improve." };
  }

  try {
    const improvedContent = await callAI(
      SYSTEM_PROMPTS.improveDraft,
      `Please improve the following legal application:\n\n${content}`,
    );

    return { ok: true, improvedContent };
  } catch (err) {
    console.error("[aiService] improveDraft error:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function generateCrossQuestions(facts, options = {}) {
  if (!facts?.trim()) {
    return {
      ok: false,
      error: "No facts provided to generate questions from.",
    };
  }

  const { witnessType = "prosecution witness", caseType = "criminal" } =
    options;

  const contextualFacts = `
Case Type: ${caseType}
Witness Type: ${witnessType}

Case Facts / Witness Statement:
${facts}
  `.trim();

  try {
    const questions = await callAI(
      SYSTEM_PROMPTS.generateCrossQuestions,
      contextualFacts,
    );

    return { ok: true, questions };
  } catch (err) {
    console.error("[aiService] generateCrossQuestions error:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function summariseApplication(content) {
  if (!content?.trim()) {
    return { ok: false, error: "No content to summarise." };
  }

  try {
    const summary = await callAI(SYSTEM_PROMPTS.summarise, content);

    return { ok: true, summary };
  } catch (err) {
    console.error("[aiService] summariseApplication error:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function checkAIAvailability() {
  const apiKey = process.env[AI_CONFIG.apiKeyEnvVar];

  if (!apiKey) {
    return {
      available: false,
      reason: `${AI_CONFIG.apiKeyEnvVar} is not set in the environment.`,
    };
  }

  return { available: true };
}

export async function extractJudgement(rawText) {
  if (!rawText?.trim()) {
    return { ok: false, error: "No text provided to extract from." };
  }

  const systemPrompt = `You are a senior legal analyst specialising in Pakistani court judgements (Supreme Court, High Courts, Sessions Courts).

Your task is to read a raw court judgement and extract exactly 7 structured sections. Return ONLY valid JSON with these exact keys (no markdown, no preamble):

{
  "citation": "Case citation e.g. 2015 SCMR 1002",
  "title": "Case title e.g. State vs Ahmed Ali",
  "offenceName": "The specific charge(s), applicable statute, and a brief description of the alleged act",
  "courtName": "All courts involved — Trial Court, Appellate Court, and Final Court",
  "lawsDiscussed": "All statutes, sections, articles, and legal principles cited or interpreted",
  "crossExaminationQuestions": "Defence questions posed to prosecution witnesses and their stated purpose",
  "courtExaminationOfEvidence": "The court's own findings and analysis — weaknesses, contradictions, or evidentiary failures",
  "finalDecision": "The ultimate verdict: conviction/acquittal, sentence if any, and the stated legal reason",
  "voiceSummary": "A plain-language narrative paragraph summarising the entire judgement for quick understanding"
}

Rules:
- Extract only what is actually in the text. Use null for sections not found.
- For crossExaminationQuestions: list each question and its purpose, one per line.
- For lawsDiscussed: list each statute/section/principle, comma-separated.
- voiceSummary must be 3-5 sentences in simple English, suitable for a client briefing.
- Return ONLY the JSON object. No markdown code blocks. No explanation.`;

  try {
    const raw = await callAI(
      systemPrompt,
      `Extract from this judgement:\n\n${rawText.slice(0, 12000)}`,
    );
    const clean = raw.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(clean);
    return { ok: true, extracted };
  } catch (err) {
    console.error("[aiService] extractJudgement error:", err.message);
    return { ok: false, error: err.message };
  }
}
