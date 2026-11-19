import { z } from "zod";
import { normalizeEmail, normalizePhone } from "../lib/normalize.js";

const nameSchema = z
  .string()
  .trim()
  .min(3, "Informe o nome completo.")
  .max(120, "O nome deve ter no máximo 120 caracteres.");

const emailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(
    z
      .string()
      .max(254, "E-mail muito longo.")
      .email("E-mail inválido.")
  );

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(
    z
      .string()
      .regex(
        /^\d{10,11}$/,
        "Telefone inválido. Informe DDD e número."
      )
  );

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.");

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const updateUserSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
  })
  .strict();

export const changePasswordSchema = z.object({
    currentPassword: z
      .string()
      .min(1, "Informe sua senha atual."),

    newPassword: passwordSchema,
  })
  .strict()
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "A nova senha deve ser diferente da senha atual.",
      path: ["newPassword"],
    }
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
