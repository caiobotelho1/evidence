import { z } from "zod";
import { normalizeEmail } from "../lib/normalize.js";


export const loginSchema = z.object({
  email: z
    .string({ error: "Informe o e-mail." })
    .transform(normalizeEmail)
    .pipe(z.string().max(254, "E-mail muito longo.").email("E-mail inválido.")),
  password: z
    .string({ error: "Informe a senha." })
    .min(1, "Informe a senha.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
