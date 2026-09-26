import dotenv from "dotenv";

dotenv.config();

const parseBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;

  const normalized = value.trim().toLowerCase();
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  return fallback;
};

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  useMockAI: parseBooleanEnv(process.env.USE_MOCK_AI, true),
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aura_db",
  jwtSecret: process.env.JWT_SECRET || "aura-default-jwt-secret-key-32chars",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  claudeApiKey: process.env.CLAUDE_API_KEY || "",
  openAIApiKey: process.env.OPENAI_API_KEY || "",
  openAIModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || "",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
};
