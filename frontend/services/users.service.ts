import { apiFetch } from "./api";

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

export function createUser(payload: CreateUserPayload): Promise<PublicUser> {
  return apiFetch<PublicUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
