import { z } from "zod";

export const createMembershipRequestSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(1, "Informe seu cargo ou função.")
    .max(100, "O cargo deve ter no máximo 100 caracteres."),

  message: z
    .string()
    .trim()
    .max(500, "A mensagem deve ter no máximo 500 caracteres.")
    .optional()
    .transform((value) => value || undefined),
});

export const companyCnpjParamsSchema = z.object({
  cnpj: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(
      z.string().regex(
        /^\d{14}$/,
        "Informe um CNPJ com 14 dígitos."
      )
    ),
});

export type CreateMembershipRequestInput = z.infer<
  typeof createMembershipRequestSchema
>;
