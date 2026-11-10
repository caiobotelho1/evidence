import { z } from "zod";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";

export const  createCompanySchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(1),
  tradeName: z
    .string()
    .trim()
    .optional(),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "CNPJ inválido"),
  businessEmail: z
    .email()
    .optional(),
  businessPhone: z
    .string()
    .optional(),
});


export type CreateCompanyInput = z.infer<typeof createCompanySchema>;