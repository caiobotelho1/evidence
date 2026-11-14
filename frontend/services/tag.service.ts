import { apiFetch } from "./api";
import type { CreateTagInput } from "../features/tags/types";

export type Tag = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateTagInput = Partial<CreateTagInput>;

// Tags pessoais

export async function createPersonalTag(
  payload: CreateTagInput
): Promise<Tag> {
  return apiFetch<Tag>("/api/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPersonalTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>("/api/tags");
}

export async function updatePersonalTag(
  tagId: string,
  payload: UpdateTagInput
): Promise<Tag> {
  return apiFetch<Tag>(
    `/api/tags/${encodeURIComponent(tagId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function deletePersonalTag(
  tagId: string
): Promise<void> {
  await apiFetch<unknown>(
    `/api/tags/${encodeURIComponent(tagId)}`,
    { method: "DELETE" }
  );
}

// Tags empresariais

export async function createCompanyTag(
  companyId: string,
  payload: CreateTagInput
): Promise<Tag> {
  return apiFetch<Tag>(
    `/api/companies/${encodeURIComponent(companyId)}/tags`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getCompanyTags(
  companyId: string
): Promise<Tag[]> {
  return apiFetch<Tag[]>(
    `/api/companies/${encodeURIComponent(companyId)}/tags`
  );
}

export async function updateCompanyTag(
  companyId: string,
  tagId: string,
  payload: UpdateTagInput
): Promise<Tag> {
  return apiFetch<Tag>(
    `/api/companies/${encodeURIComponent(companyId)}/tags/${encodeURIComponent(tagId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteCompanyTag(
  companyId: string,
  tagId: string
): Promise<void> {
  await apiFetch<unknown>(
    `/api/companies/${encodeURIComponent(companyId)}/tags/${encodeURIComponent(tagId)}`,
    { method: "DELETE" }
  );
}
