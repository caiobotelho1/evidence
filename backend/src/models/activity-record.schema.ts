import { z } from "zod";
import { ActivityRecordStatus } from "../generated/prisma/enums.js";

export const createActivityRecordSchema = z
  .object({
    title: z
      .string("O título é obrigatório.")
      .trim()
      .min(1, "O título é obrigatório.")
      .max(150, "O título deve ter no máximo 150 caracteres."),

    description: z
      .string("A descrição é obrigatória.")
      .trim()
      .min(1, "A descrição é obrigatória.")
      .max(20000, "A descrição deve ter no máximo 20000 caracteres."),

    status: z.enum(ActivityRecordStatus, "Status inválido.").default("PENDING"),

    tagIds: z
      .array(z.uuid("Tag inválida."), "As tags devem ser uma lista.")
      .max(50, "Selecione no máximo 50 tags.")
      .default([])
      .transform((ids) => [...new Set(ids)]),
  })
  .strict();

export const listActivityRecordsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().min(1).optional(),
});

export type CreateActivityRecordInput = z.infer<typeof createActivityRecordSchema>;
export type ListActivityRecordsQuery = z.infer<typeof listActivityRecordsQuerySchema>;
