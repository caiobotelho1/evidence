import { apiFetch } from "./api";
import type { CompanyByCnpj } from "./companies.service";

export type CreateMembershipRequestPayload = {
  jobTitle: string;
  message?: string;
};

export type MembershipRequest = {
  id: string;
  role: "EMPLOYEE";
  status: "PENDING";
  jobTitle: string;
  message: string | null;
  createdAt: string;
  company: CompanyByCnpj;
};

type MembershipRequestResponse = {
  request: MembershipRequest;
};

export async function createMembershipRequest(
  companyId: string,
  payload: CreateMembershipRequestPayload
): Promise<MembershipRequest> {
  const { request } = await apiFetch<MembershipRequestResponse>(
    `/api/companies/${encodeURIComponent(companyId)}/membership-requests`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return request;
}