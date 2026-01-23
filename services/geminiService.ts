
import { GoogleGenAI, Type } from "@google/genai";
import { Rule, PortfolioCategory, Identity, InterrupterLog, DecisionResult, WeeklyBriefing, Roadmap, DeepDiveResult, SimulationResult, SparkResult } from "../types";

// Support both standard process.env and Vite's import.meta.env for local development
const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resolve this dilemma: "${dilemma}"
  
      CONTEXT DATA:
      ${context}
      
      Requirements:
      1. Verdict must be binary/definitive (Yes/No or Option A/Option B).
      2. Action Plan: 3 concrete steps considering the current time/day.
      
      Output ONLY JSON.`,
      config: {
        systemInstruction: "You are a Chief of Staff. Output ONLY valid JSON.",
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "How the rules apply." },
            verdict: { type: Type.STRING, description: "The decision." },
            actionPlan: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Steps to take."
            }
          },
          required: ["analysis", "verdict", "actionPlan"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as DecisionResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      analysis: "System connection failed.",
      verdict: "Rely on your core values.",
      actionPlan: ["Check internet connection", "Review principles manually"]
    };
  }
};

export const simulateFuture = async (
  action: string,
  identities: Identity[]
): Promise<SimulationResult> => {
  const identityContext = identities.map(i => i.statement).join('; ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Action: "${action}"
  
      CONTEXT:
      ${getContextData()}
      
      Identity Context: ${identityContext}
      
      Predict the trajectory.
      - 1 Day: Immediate feeling (consider current time of day).
      - 1 Week: Emerging friction/flow.
      - 1 Month: Habit formation.
      - 6 Months: Identity shift.
      - 1 Year: Compound effects.
      - 10 Years: Divergence.
      
      Output ONLY JSON.`,
      config: {
        systemInstruction: "You are a Prediction Engine. Output ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            oneDay: { type: Type.STRING },
            oneWeek: { type: Type.STRING },
            oneMonth: { type: Type.STRING },
            threeMonths: { type: Type.STRING },
            sixMonths: { type: Type.STRING },
            oneYear: { type: Type.STRING },
            tenYears: { type: Type.STRING }
          },
          required: ["oneDay", "oneWeek", "oneMonth", "threeMonths", "sixMonths", "oneYear", "tenYears"]
        }
      }
    });
    
    const json = JSON.parse(response.text || "{}");
    return json as SimulationResult;
  } catch (error) {
    console.error(error);
    return { 
        oneDay: "Error", oneWeek: "Error", oneMonth: "Error", 
        threeMonths: "Error", sixMonths: "Error", oneYear: "Error", tenYears: "Error" 
    };
  }
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit system data:
      ${context}
      
      Output ONLY JSON.`,
      config: {
        systemInstruction: "You are a Performance Coach. Output ONLY valid JSON.",
        temperature: 0.5,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            governanceScore: { type: Type.INTEGER, description: "0-100 score" },
            leakAnalysis: { type: Type.STRING, description: "Analysis of inconsistency" },
            focusIdentity: { type: Type.STRING, description: "Identity to prioritize" },
            tacticalAdjustment: { type: Type.STRING, description: "Suggested change" }
          },
          required: ["governanceScore", "leakAnalysis", "focusIdentity", "tacticalAdjustment"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return result as WeeklyBriefing;
  } catch (error) {
    console.error(error);
    return {
      governanceScore: 0,
      leakAnalysis: "Audit failed.",
      focusIdentity: "N/A",
      tacticalAdjustment: "Retry audit."
    };
  }
};

export const generateRoadmap = async (goal: string): Promise<Roadmap> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create 80/20 roadmap for: "${goal}".
  
      CONTEXT:
      ${getContextData()}
      
      3-5 Phases. 1 Next Action (Something doable TODAY based on current time).
      Output ONLY JSON.`,
      config: {
        systemInstruction: "You are a Strategist. Output ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goal: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseName: { type: Type.STRING },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            nextAction: { type: Type.STRING, description: "The immediate next step." }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}") as Roadmap;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate roadmap");
  }
};

export const runDeepDiveAnalysis = async (
  topic: string,
  mode: '5whys' | 'premortem'
): Promise<DeepDiveResult> => {
  const prompt = mode === '5whys' 
    ? `5 Whys Analysis on: "${topic}". CONTEXT: ${getContextData()}. Output ONLY JSON.`
    : `Pre-Mortem on: "${topic}". CONTEXT: ${getContextData()}. Output ONLY JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an Analyst. Output ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}") as DeepDiveResult;
  } catch (error) {
    console.error(error);
    throw new Error("Analysis failed");
  }
};

export const generateSpark = async (): Promise<SparkResult> => {
  // 1. Broaden Scope: Significantly expanded domains
  const domains = [
    "Evolutionary Biology", "Game Theory", "Stoicism", "Microeconomics",
    "Complexity Science", "Cognitive Psychology", "Historical Strategy", "Physics & Entropy",
    "Network Theory", "Design Thinking", "Information Theory", "Mimetic Theory",
    "Systems Engineering", "Philosophy of Science", "Cybernetics", "Behavioral Economics",
    "Linguistics", "Urban Theory"
  ];
  
  // 2. Varied Formats: Specific structures to force variety
  const formats = [
    "A counter-intuitive truth", "A razor (decision heuristic)", "A paradox", 
    "A reframing of a common problem", "A cautionary observation", "A biological analogy",
    "A law of human nature", "A probability concept", "A hidden incentive"
  ];

  // 3. Tone/Vibe: Ensures the language style changes
  const tones = [
    "Direct and punchy", "Contemplative and deep", "Analytical and sharp", 
    "Witty and dry", "Urgent and actionable"
  ];

  const domain = domains[Math.floor(Math.random() * domains.length)];
  const format = formats[Math.floor(Math.random() * formats.length)];
  const tone = tones[Math.floor(Math.random() * tones.length)];

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a "Neural Spark" - a short, high-impact insight.
      
      Topic Domain: ${domain}
      Structure: ${format}
      Tone: ${tone}
      
      Requirements:
      1. CLARITY IS KING: Use simple, strong English. No flowery, archaic, or convoluted academic phrasing. Be direct.
      2. NO CLICHÉS: Avoid common advice (e.g. Eisenhower Matrix, 80/20). Give me a specific, obscure, or deep mental model.
      3. Brevity: Max 2 short sentences.
      4. Randomness Seed: ${Date.now()}
      
      Output ONLY JSON.`,
      config: {
        systemInstruction: "You are a Curator of High-Impact Ideas. Output ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The name of the concept, law, or model." },
            content: { type: Type.STRING, description: "The explanation." },
            category: { type: Type.STRING, description: `Must be: ${domain}` }
          },
          required: ["title", "content", "category"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as SparkResult;
  } catch (e) {
    console.error("Spark Error", e);
     return { title: "Connection Error", content: "Could not ignite spark. Please check your internet.", category: "Error" };
  }
};
