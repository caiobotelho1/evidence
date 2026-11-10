import { ApiError, apiFetch } from "./api";

export type Permission =
  | "company:manage"
  | "membership:review"
  | "record:read"
  | "record:write";

export type MembershipRole = "OWNER" | "EMPLOYEE";
export type MembershipStatus = "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";

export type AuthMembership = {
  id: string;
  role: MembershipRole;
  status: MembershipStatus;
  companyId: string;
  company: { id: string; legalName: string; tradeName: string | null };
  /** Permissões válidas apenas dentro desta empresa. */
  permissions: Permission[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  /** Permissões no escopo pessoal (registros próprios, fora de empresas). */
  personalPermissions: Permission[];
  memberships: AuthMembership[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

type UserResponse = { user: AuthUser };

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const { user } = await apiFetch<UserResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return user;
}

export async function logout(): Promise<void> {
  await apiFetch<null>("/api/auth/logout", { method: "POST" });
}

/**
 * Usuário da sessão atual, ou `null` se não houver sessão válida (401).
 * Outros erros (rede, servidor) são repassados para quem chamou.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await apiFetch<UserResponse>("/api/auth/me");
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
