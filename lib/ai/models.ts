export const DEFAULT_CHAT_MODEL = "anthropic/claude-opus-4-6";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // ── OpenAI ──────────────────────────────────────────
  {
    id: "openai/gpt-5.4-pro",
    name: "GPT-5.4 Pro",
    provider: "openai",
    description: "Most capable GPT-5.4 model",
  },
  {
    id: "openai/gpt-5.4",
    name: "GPT-5.4",
    provider: "openai",
    description: "Latest GPT-5.4 flagship",
  },
  {
    id: "openai/gpt-5.3-chat",
    name: "GPT-5.3 Chat",
    provider: "openai",
    description: "Optimized for conversation",
  },
  {
    id: "openai/gpt-5.3-codex",
    name: "GPT-5.3 Codex",
    provider: "openai",
    description: "Best coding model in GPT-5.3 series",
  },
  {
    id: "openai/gpt-5.2-pro",
    name: "GPT-5.2 Pro",
    provider: "openai",
    description: "Most capable GPT-5.2 model",
  },
  {
    id: "openai/gpt-5.2-codex",
    name: "GPT-5.2 Codex",
    provider: "openai",
    description: "Coding-focused GPT-5.2",
  },
  {
    id: "openai/gpt-5.1-codex-max",
    name: "GPT-5.1 Codex Max",
    provider: "openai",
    description: "Maximum power coding model",
  },
  {
    id: "openai/gpt-5.1-codex",
    name: "GPT-5.1 Codex",
    provider: "openai",
    description: "Standard GPT-5.1 coding model",
  },
  {
    id: "openai/gpt-5.1-codex-mini",
    name: "GPT-5.1 Codex Mini",
    provider: "openai",
    description: "Lightweight GPT-5.1 coding model",
  },
  {
    id: "openai/gpt-5.1-chat-latest",
    name: "GPT-5.1 Chat",
    provider: "openai",
    description: "Latest GPT-5.1 chat model",
  },
  {
    id: "openai/gpt-5-codex",
    name: "GPT-5 Codex",
    provider: "openai",
    description: "GPT-5 optimized for code",
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    provider: "openai",
    description: "Flagship GPT-5 model",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "openai",
    description: "Fast and efficient GPT-5",
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "openai",
    description: "Ultra-lightweight GPT-5",
  },
  {
    id: "openai/gpt-5-chat-latest",
    name: "GPT-5 Chat",
    provider: "openai",
    description: "Latest GPT-5 chat variant",
  },
  {
    id: "openai/gpt-4.5-preview",
    name: "GPT-4.5 Preview",
    provider: "openai",
    description: "Preview of GPT-4.5",
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Latest GPT-4.1 flagship",
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Fast and affordable GPT-4.1",
  },
  {
    id: "openai/gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    description: "Ultra-fast GPT-4.1",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Multimodal flagship model",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast multimodal model",
  },
  // ── OpenAI Reasoning ────────────────────────────────
  {
    id: "openai/o4-mini",
    name: "o4-mini",
    provider: "openai",
    description: "Fast reasoning model",
  },
  {
    id: "openai/o3",
    name: "o3",
    provider: "openai",
    description: "Advanced reasoning",
  },
  {
    id: "openai/o3-mini",
    name: "o3-mini",
    provider: "openai",
    description: "Lightweight reasoning",
  },
  {
    id: "openai/o1-pro",
    name: "o1 Pro",
    provider: "openai",
    description: "Most powerful o1 reasoning",
  },
  {
    id: "openai/o1",
    name: "o1",
    provider: "openai",
    description: "Flagship reasoning model",
  },
  {
    id: "openai/o1-mini",
    name: "o1-mini",
    provider: "openai",
    description: "Fast lightweight reasoning",
  },

  // ── Anthropic ────────────────────────────────────────
  {
    id: "anthropic/claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    description: "Most capable Claude model",
  },
  {
    id: "anthropic/claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    description: "Balanced speed and intelligence",
  },
  {
    id: "anthropic/claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Highly capable previous Opus",
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Balanced previous generation",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and affordable Claude",
  },
  {
    id: "anthropic/claude-opus-4-1",
    name: "Claude Opus 4.1",
    provider: "anthropic",
    description: "Powerful earlier Opus",
  },
  {
    id: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    provider: "anthropic",
    description: "Original Claude 4 Opus",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    description: "Original Claude 4 Sonnet",
  },
  {
    id: "anthropic/claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
    description: "Extended thinking model",
  },
  {
    id: "anthropic/claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Classic high-performance model",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    description: "Fastest Claude 3 model",
  },

  // ── Google ───────────────────────────────────────────
  {
    id: "google/gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    provider: "google",
    description: "Latest Gemini 3.1 flagship",
  },
  {
    id: "google/gemini-3.1-flash-lite-preview",
    name: "Gemini 3.1 Flash Lite",
    provider: "google",
    description: "Fastest Gemini 3.1 model",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    provider: "google",
    description: "Gemini 3 most capable",
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    provider: "google",
    description: "Fast Gemini 3 model",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Most capable Gemini 2.5",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Fast Gemini 2.5",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Ultra-lightweight Gemini 2.5",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Gemini 2.0 fast model",
  },
  {
    id: "google/gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "google",
    description: "Lightest Gemini 2.0",
  },

  // ── DeepSeek ─────────────────────────────────────────
  {
    id: "deepseek/deepseek-v3.2-exp",
    name: "DeepSeek V3.2 Exp",
    provider: "deepseek",
    description: "Experimental cutting-edge chat model",
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    description: "Latest stable general-purpose model",
  },
  {
    id: "deepseek/deepseek-v3.1-terminus",
    name: "DeepSeek V3.1 Terminus",
    provider: "deepseek",
    description: "Terminus general-purpose model",
  },
  {
    id: "deepseek/deepseek-r1-0528",
    name: "DeepSeek R1 (May 2025)",
    provider: "deepseek",
    description: "Latest DeepSeek reasoning model",
  },
  {
    id: "deepseek/deepseek-r1-distill-llama-70b",
    name: "DeepSeek R1 Llama 70B",
    provider: "deepseek",
    description: "R1 reasoning distilled into Llama 70B",
  },
];

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
