
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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
  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
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

function toApiError(status: number, body: unknown): ApiError {
  const erro = (body as ErrorBody | null)?.error;

  return new ApiError(
    status,
    erro?.code ?? "UNKNOWN_ERROR",
    erro?.message ?? "Ocorreu um erro inesperado.",
    erro?.fields,
  );
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { credentials: "include" });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Não foi possível conectar ao servidor.");
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw toApiError(response.status, body);
  }

  return response.blob();
}

export function describeApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const details = [...new Set(Object.values(error.fields ?? {}).flat())];
    return details.length > 0 ? details.join(" ") : error.message;
  }

  return error instanceof Error ? error.message : fallback;
}
