import { apiFetch } from "./api";

export type CreateCompanyPayload = {
  legalName: string;
  tradeName?: string;
  cnpj: string;
  businessEmail?: string;
  businessPhone?: string;
};

export type Company = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  businessEmail: string | null;
  businessPhone: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createCompany(
  payload: CreateCompanyPayload
): Promise<Company> {
  return apiFetch<Company>("/api/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
