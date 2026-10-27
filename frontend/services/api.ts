const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export type ApiFields = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: ApiFields;

  constructor(status: number, code: string, message: string, fields?: ApiFields) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type ErrorBody = {
  error?: { code?: string; message?: string; fields?: ApiFields };
};

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Não foi possível conectar ao servidor.");
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const erro = (body as ErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      erro?.code ?? "UNKNOWN_ERROR",
      erro?.message ?? "Ocorreu um erro inesperado.",
      erro?.fields,
    );
  }

  return body as T;
}
