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

export type MyCompany = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  role: "OWNER" | "EMPLOYEE";
};

export async function getMyCompanies(): Promise<MyCompany[]> {
  return apiFetch<MyCompany[]>("/api/companies/mine");
}


export type CompanyMember = {
  id: string;
  role: "EMPLOYEE";
  status: "ACTIVE";
  jobTitle: string | null;
  createdAt: string;
  decidedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};

export async function getCompanyMembers(
  companyId: string
): Promise<CompanyMember[]> {
  const response = await apiFetch<{ members: CompanyMember[] }>(
    `/api/companies/${companyId}/members`
  );

  return response.members;
}

export async function getCompanyMember(
  companyId: string,
  membershipId: string
): Promise<CompanyMember> {
  const response = await apiFetch<{ member: CompanyMember }>(
    `/api/companies/${companyId}/members/${membershipId}`
  );

  return response.member;
}

export async function removeCompanyMember(
  companyId: string,
  membershipId: string
): Promise<void> {
  await apiFetch<{ message: string }>(
    `/api/companies/${companyId}/members/${membershipId}`,
    {
      method: "DELETE",
    }
  );
}
