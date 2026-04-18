import type { CodexMessage } from "@/lib/codex-store";

export type FileContext = {
  name: string;
  content: string;
};

export const CODEX_LIMITS = {
  maxPromptChars: 8000,
  maxAttachedFiles: 4,
  maxFileChars: 6000,
  maxTotalContextChars: 20000,
  maxHistoryMessages: 24,
  maxResponseTokens: 1200,
  maxRequestsPerWindow: 24,
  rateLimitWindowMs: 5 * 60 * 1000,
};

type RateEntry = {
  count: number;
  windowStart: number;
};

const rateMap = new Map<string, RateEntry>();

function enforceRateLimit(userId: string) {
  const now = Date.now();
  const key = userId;
  const current = rateMap.get(key);
  if (!current || now - current.windowStart > CODEX_LIMITS.rateLimitWindowMs) {
    rateMap.set(key, { count: 1, windowStart: now });
    return;
  }
  if (current.count >= CODEX_LIMITS.maxRequestsPerWindow) {
    throw new Error("RATE_LIMITED");
  }
  current.count += 1;
  rateMap.set(key, current);
}

function readModel() {
  return (
    process.env.CODEX_MODEL ||
    process.env.OPENAI_MODEL ||
    "gpt-5.4"
  );
}

function asText(v: unknown) {
  return String(v || "").trim();
}

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

export function normalizeFileContexts(raw: unknown): FileContext[] {
  if (!Array.isArray(raw)) return [];
  const fileContexts: FileContext[] = [];
  for (const item of raw.slice(0, CODEX_LIMITS.maxAttachedFiles)) {
    const obj = asObject(item);
    const name = asText(obj?.name) || "context.txt";
    const content = asText(obj?.content);
    if (!content) continue;
    fileContexts.push({
      name: name.slice(0, 120),
      content: content.slice(0, CODEX_LIMITS.maxFileChars),
    });
  }
  const total = fileContexts.reduce((sum, file) => sum + file.content.length, 0);
  if (total > CODEX_LIMITS.maxTotalContextChars) {
    throw new Error("CONTEXT_TOO_LARGE");
  }
  return fileContexts;
}

function buildPrompt(userMessage: string, fileContexts: FileContext[]) {
  if (!fileContexts.length) return userMessage;
  const formatted = fileContexts
    .map((file, idx) => `--- Context ${idx + 1}: ${file.name} ---\n${file.content}`)
    .join("\n\n");
  return `${userMessage}\n\nUse the attached context when helpful:\n\n${formatted}`;
}

function buildHistory(messages: CodexMessage[]) {
  const filtered = messages
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .slice(-CODEX_LIMITS.maxHistoryMessages);
  return filtered.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

function parseResponseText(payload: unknown): string {
  const root = asObject(payload);
  const choices = Array.isArray(root?.choices) ? root.choices : [];
  const firstChoice = asObject(choices[0]);
  const message = asObject(firstChoice?.message);
  const fromChoices = message?.content;
  if (typeof fromChoices === "string") return fromChoices.trim();
  if (Array.isArray(fromChoices)) {
    const text = fromChoices
      .map((part) => {
        const obj = asObject(part);
        return typeof obj?.text === "string" ? obj.text : "";
      })
      .join("")
      .trim();
    if (text) return text;
  }
  return "";
}

export async function generateCodexReply(input: {
  userId: string;
  prompt: string;
  history: CodexMessage[];
  fileContexts: FileContext[];
  model?: string;
}) {
  const apiKey = asText(process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY);
  if (!apiKey) {
    throw new Error("OPENAI_KEY_MISSING");
  }

  enforceRateLimit(input.userId);

  const prompt = asText(input.prompt);
  if (!prompt) {
    throw new Error("PROMPT_REQUIRED");
  }
  if (prompt.length > CODEX_LIMITS.maxPromptChars) {
    throw new Error("PROMPT_TOO_LARGE");
  }

  const history = buildHistory(input.history);
  const finalPrompt = buildPrompt(prompt, input.fileContexts);
  const model = asText(input.model || readModel());

  const messages = [
    {
      role: "system",
      content:
        "You are a practical coding assistant. Be concise, accurate, and explicit about assumptions. Prioritize actionable output.",
    },
    ...history,
    { role: "user", content: finalPrompt },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_completion_tokens: CODEX_LIMITS.maxResponseTokens,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`OPENAI_ERROR:${res.status}:${errorBody.slice(0, 240)}`);
  }

  const payload = await res.json();
  const text = parseResponseText(payload);
  const payloadObject = asObject(payload);
  if (!text) {
    throw new Error("EMPTY_MODEL_RESPONSE");
  }

  return {
    text,
    model,
    usage: payloadObject?.usage || null,
  };
}
