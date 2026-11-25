import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url(),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
  ATTACHMENT_MAX_FILE_SIZE_MB: z.coerce.number().positive().max(50).default(10),
  ATTACHMENT_MAX_FILES_PER_UPLOAD: z.coerce.number().int().min(1).max(20).default(10),
  ATTACHMENT_MAX_FILES_PER_RECORD: z.coerce.number().int().min(1).max(100).default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalhes = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`Variáveis de ambiente inválidas:\n${detalhes}`);
  process.exit(1);
}

export const env = parsed.data;
