import { z } from "zod";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe o nome completo.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  email: z
    .string()
    .transform(normalizeEmail)
    .pipe(z.string().max(254, "E-mail muito longo.").email("E-mail inválido.")),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^\d{10,11}$/, "Telefone inválido. Informe DDD e número.")),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
