import { z } from "zod";
import { ActivityRecordStatus } from "../generated/prisma/enums.js";

const titleSchema = z
  .string("O título é obrigatório.")
  .trim()
  .min(1, "O título é obrigatório.")
  .max(150, "O título deve ter no máximo 150 caracteres.");

const descriptionSchema = z
  .string("A descrição é obrigatória.")
  .trim()
  .min(1, "A descrição é obrigatória.")
  .max(20000, "A descrição deve ter no máximo 20000 caracteres.");

const statusSchema = z.enum(ActivityRecordStatus, "Status inválido.");

const tagIdsSchema = z
  .array(z.uuid("Tag inválida."), "As tags devem ser uma lista.")
  .max(50, "Selecione no máximo 50 tags.")
  .transform((ids) => [...new Set(ids)]);

export const createActivityRecordSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    status: statusSchema.optional(),
    tagIds: tagIdsSchema.default([]),
  })
  .strict();

export const updateActivityRecordSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    status: statusSchema.optional(),
    tagIds: tagIdsSchema.optional(),
  })
  .strict()
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: "Informe ao menos um campo para atualizar.",
  });

const queryStringArray = <T extends string>(itemSchema: z.ZodType<T>) =>
  z
    .union([itemSchema, z.array(itemSchema)])
    .optional()
    .transform((values): T[] =>
      values === undefined ? [] : Array.isArray(values) ? values : [values],
    )
    .transform((values) => [...new Set(values)]);

export const listActivityRecordsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: z.string().min(1).optional(),
    search: z.string().trim().max(200).optional().transform((value) => value || undefined),
    tagIds: queryStringArray(z.uuid("Tag inválida.")).pipe(z.array(z.uuid()).max(50)),
    statuses: queryStringArray(z.enum(ActivityRecordStatus, "Status inválido.")),
    dateFrom: z.iso.datetime({ offset: true }).optional(),
    dateTo: z.iso.datetime({ offset: true }).optional(),
    employeeIds: queryStringArray(z.uuid("Funcionário inválido.")).pipe(z.array(z.uuid()).max(100)),
  })
  .superRefine((query, context) => {
    if (
      query.dateFrom &&
      query.dateTo &&
      new Date(query.dateFrom).getTime() > new Date(query.dateTo).getTime()
    ) {
      context.addIssue({
        code: "custom",
        path: ["dateTo"],
        message: "A data final deve ser igual ou posterior à data inicial.",
      });
    }
  });

export type CreateActivityRecordInput = z.infer<typeof createActivityRecordSchema>;
export type UpdateActivityRecordInput = z.infer<typeof updateActivityRecordSchema>;
export type ListActivityRecordsQuery = z.infer<typeof listActivityRecordsQuerySchema>;
