export type ErrorFields = Record<string, string[]>;

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: ErrorFields;

  constructor(status: number, code: string, message: string, fields?: ErrorFields) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const badRequest = (message = "Dados inválidos.", fields?: ErrorFields) =>
  new AppError(400, "BAD_REQUEST", message, fields);

export const unauthorized = (message = "Não autenticado.") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Sem permissão para esta ação.") =>
  new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "Recurso não encontrado.") =>
  new AppError(404, "NOT_FOUND", message);

export const conflict = (message = "Conflito com o estado atual do recurso.", fields?: ErrorFields) =>
  new AppError(409, "CONFLICT", message, fields);

export const unprocessable = (message = "Dados semanticamente inválidos.", fields?: ErrorFields) =>
  new AppError(422, "UNPROCESSABLE", message, fields);
