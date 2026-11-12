import { apiFetch } from "./api";

export type CompanyByCnpj = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
};

type CompanyResponse = {
  company: CompanyByCnpj;
};

export async function getCompanyByCnpj(
  cnpj: string
): Promise<CompanyByCnpj> {
  const { company } = await apiFetch<CompanyResponse>(
    `/api/companies/cnpj/${encodeURIComponent(cnpj)}`
  );

  return company;
}