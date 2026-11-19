import { apiFetch } from "./api";

// CADASTRO DE USUÁRIO

export type CreateUserPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export function createUser(
  payload: CreateUserPayload
): Promise<PublicUser> {
  return apiFetch<PublicUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// CONFIGURAÇÕES DA CONTA

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type UpdateUserProfileInput = {
  name: string;
  email: string;
  phone: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

// Consultar dados do usuário autenticado
export function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me");
}

// Atualizar dados pessoais
export function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// Alterar senha
export function changeUserPassword(
  input: ChangePasswordInput
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
