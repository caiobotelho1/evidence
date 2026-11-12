import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da tag é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),

  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional(),

  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "A cor deve estar no formato hexadecimal (#RRGGBB)."
    ),
}).strict();

export const updateTagSchema = createTagSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Informe pelo menos um campo para atualizar."
  );

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
