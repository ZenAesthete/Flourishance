
import { Rule, PortfolioCategory, Identity, InterrupterLog, DecisionResult, WeeklyBriefing, Roadmap, DeepDiveResult, SimulationResult, SparkResult } from "../types";

// ============================================================================
// CONFIGURATION SECTION
// ============================================================================

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// 2. MODEL ID
const MODEL_ID = "openrouter/elephant-alpha";

// ============================================================================

const getApiKey = () => {
  // Vite exposes env variables prefixed with VITE_ on import.meta.env
  const key = (import.meta as any).env?.VITE_OPENROUTER_API_KEY ||
    (import.meta as any).env?.VITE_API_KEY;

  if (!key) {
    console.warn("Missing API Key. Please add VITE_OPENROUTER_API_KEY to your .env file or Vercel Settings.");
    return null;
  }
  return key;
};

/**
 * Helper: Get current temporal context for better AI grounding
 */
const getContextData = () => {
  const now = new Date();
  return `
    Current Time: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    Current Date: ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
  `.trim();
};

/**
 * Generic AI Request Handler
 */
async function aiRequest(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("API Key is missing. Check settings.");
  }

  // Base Headers
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  // OpenRouter Specific Headers (Required for rankings and free tier)
  if (API_URL.includes("openrouter")) {
    headers["HTTP-Referer"] = typeof window !== 'undefined' ? window.location.origin : "https://selfos.app";
    headers["X-Title"] = "SelfOS";
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        stream: false,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `API Error (${response.status})`;

      try {
        const json = JSON.parse(errorText);
        if (json.error?.metadata?.provider_name) {
          errorMsg = `Provider Error (${json.error.metadata.provider_name}): ${json.error.message}`;
        } else {
          errorMsg = json.error?.message || json.message || errorMsg;
        }
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }

      if (errorMsg.includes("publication violation") || errorMsg.includes("data policy")) {
        errorMsg += " \n(HINT: Go to openrouter.ai/settings/privacy and enable data logging for free models)";
      }

      throw new Error(errorMsg);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    // --- CLEANUP & PARSING ---
    // Deepseek often returns <think> blocks. Remove them.
    const cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = cleanContent.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.warn("JSON Parse Error. Raw content:", cleanContent);
        throw new Error("AI response was not valid JSON. Try a different model.");
      }
    } else {
      console.warn("No JSON structure found. Raw content:", cleanContent);
      throw new Error("AI response did not contain JSON.");
    }

  } catch (error) {
    console.error("AI Request Failed:", error);
    throw error;
  }
}

// --- Exported Functions ---

export const resolveDecision = async (
  dilemma: string,
  rules: Rule[],
  values: string[]
): Promise<DecisionResult> => {
  const context = `
    ENVIRONMENTAL CONTEXT:
    ${getContextData()}

    User Rules:
    ${rules.map(r => `- [${r.category.toUpperCase()}] ${r.text}`).join('\n')}
    
    User Values:
    ${values.join(', ')}
  `;

  const system = `You are a Chief of Staff. Output ONLY valid JSON.
  Format: { "analysis": "string", "verdict": "string", "actionPlan": ["string"] }`;

  const user = `Resolve this dilemma: "${dilemma}"
  
  CONTEXT DATA:
  ${context}
  
  Requirements:
  1. Verdict must be binary (Yes/No or A/B).
  2. Action Plan: 3 concrete steps considering the current time/day.
  
  Output ONLY JSON.`;

  return await aiRequest(system, user);
};

export const simulateFuture = async (
  action: string,
  identities: Identity[]
): Promise<SimulationResult> => {
  const identityContext = identities.map(i => i.statement).join('; ');

  const system = `You are a Prediction Engine. Output ONLY valid JSON.
  Format: { 
    "oneDay": "string", 
    "oneWeek": "string", 
    "oneMonth": "string",
    "threeMonths": "string",
    "sixMonths": "string",
    "oneYear": "string",
    "tenYears": "string" 
  }`;

  const user = `Action: "${action}"
  
  CONTEXT:
  ${getContextData()}
  
  Identity Context: ${identityContext}
  
  Predict the trajectory.
  - 1 Day: Immediate feeling (consider current time of day).
  - 1 Week: Emerging friction/flow.
  - 1 Month: Habit formation stage.
  - 6 Months: Identity shift.
  - 1 Year: Compound effects.
  - 10 Years: Long-term divergence.
  
  Output ONLY JSON.`;

  return await aiRequest(system, user);
};

export const generateWeeklyBriefing = async (
  identities: Identity[],
  portfolio: PortfolioCategory[],
  logs: InterrupterLog[]
): Promise<WeeklyBriefing> => {
  const context = `
    DATETIME: ${getContextData()}
    
    Identities: ${identities.map(i => `${i.statement} (Str:${i.strength}%)`).join(', ')}
    Portfolio: ${portfolio.map(p => `${p.name} (Inv:${p.investment}%)`).join(', ')}
    Failures: ${logs.slice(0, 10).map(l => l.urge).join('; ')}
  `;

  const system = `You are a Performance Coach. Output ONLY valid JSON.
  Format: { "governanceScore": number, "leakAnalysis": "string", "focusIdentity": "string", "tacticalAdjustment": "string" }`;

  const user = `Audit system data:
  ${context}
  
  Output ONLY JSON.`;

  return await aiRequest(system, user);
};

export const generateRoadmap = async (goal: string): Promise<Roadmap> => {
  const system = `You are a Strategist. Output ONLY valid JSON.
  Format: { "goal": "string", "phases": [{ "phaseName": "string", "steps": ["string"] }], "nextAction": "string" }`;

  const user = `Create 80/20 roadmap for: "${goal}".
  
  CONTEXT:
  ${getContextData()}
  
  3-5 Phases. 1 Next Action (Something doable TODAY based on current time).
  Output ONLY JSON.`;

  return await aiRequest(system, user);
};

export const runDeepDiveAnalysis = async (
  topic: string,
  mode: '5whys' | 'premortem'
): Promise<DeepDiveResult> => {
  const system = `You are an Analyst. Output ONLY valid JSON.
  Format: { "title": "string", "items": [{ "label": "string", "content": "string" }], "summary": "string" }`;

  const user = mode === '5whys'
    ? `5 Whys Analysis on: "${topic}". CONTEXT: ${getContextData()}. Output ONLY JSON.`
    : `Pre-Mortem on: "${topic}". CONTEXT: ${getContextData()}. Output ONLY JSON.`;

  return await aiRequest(system, user);
};

export const generateSpark = async (): Promise<SparkResult> => {
  // 1. Broaden Scope
  const domains = [
    "Evolutionary Biology", "Game Theory", "Stoicism", "Microeconomics",
    "Complexity Science", "Cognitive Psychology", "Historical Strategy", "Physics & Entropy",
    "Network Theory", "Design Thinking", "Information Theory", "Mimetic Theory",
    "Systems Engineering", "Philosophy of Science", "Cybernetics", "Behavioral Economics",
    "Linguistics", "Urban Theory"
  ];

  // 2. Varied Formats
  const formats = [
    "A counter-intuitive truth", "A razor (decision heuristic)", "A paradox",
    "A reframing of a common problem", "A cautionary observation", "A biological analogy",
    "A law of human nature", "A probability concept", "A hidden incentive"
  ];

  // 3. Tone/Vibe
  const tones = [
    "Direct and punchy", "Contemplative and deep", "Analytical and sharp",
    "Witty and dry", "Urgent and actionable"
  ];

  const domain = domains[Math.floor(Math.random() * domains.length)];
  const format = formats[Math.floor(Math.random() * formats.length)];
  const tone = tones[Math.floor(Math.random() * tones.length)];

  const system = `You are a Curator of High-Impact Ideas. Output ONLY valid JSON.
  Format: { "title": "string", "content": "string", "category": "string" }`;

  const user = `Give me a "Neural Spark" - a short, high-impact insight.
      
  Topic Domain: ${domain}
  Structure: ${format}
  Tone: ${tone}
  
  Requirements:
  1. CLARITY IS KING: Use simple, strong English. No flowery, archaic, or convoluted academic phrasing. Be direct.
  2. NO CLICHÉS: Avoid common advice (e.g. Eisenhower Matrix, 80/20). Give me a specific, obscure, or deep mental model.
  3. Brevity: Max 2 short sentences.
  4. Randomness Seed: ${Date.now()}
  
  Output ONLY JSON.`;

  try {
    const result = await aiRequest(system, user);
    return {
      ...result,
      // Fallback for category if model hallucinates a different one
      category: result.category || domain
    } as SparkResult;
  } catch (e) {
    console.error("Spark Error", e);
    return { title: "Connection Error", content: "Could not ignite spark. Please check your internet.", category: "Error" };
  }
};
