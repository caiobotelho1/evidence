import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError, notFound, type ErrorFields } from "../lib/errors.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(notFound("Rota não encontrada."));
};

function zodFields(error: ZodError): ErrorFields {
  const fields: ErrorFields = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

function isJsonParseError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type: unknown }).type === "entity.parse.failed"
  );
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, fields: err.fields },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: "BAD_REQUEST", message: "Dados inválidos.", fields: zodFields(err) },
    });
    return;
  }

  if (isJsonParseError(err)) {
    res.status(400).json({
      error: { code: "BAD_REQUEST", message: "JSON inválido." },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor." },
  });
};
