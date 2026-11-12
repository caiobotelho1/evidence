import { apiFetch } from "./api";

export type MembershipRequest = {
  id: string;
  role: "EMPLOYEE";
  status: "PENDING" | "ACTIVE" | "REJECTED";
  jobTitle: string | null;
  message: string | null;
  createdAt: string;
  decidedById?: string | null;
  decidedAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  company: {
    id: string;
    legalName: string;
    tradeName: string | null;
  };
};

type MembershipRequestsResponse = {
  requests: MembershipRequest[];
};

type MembershipRequestResponse = {
  request: MembershipRequest;
};

export async function listPendingMembershipRequests(
  companyId: string
): Promise<MembershipRequest[]> {
  const { requests } = await apiFetch<MembershipRequestsResponse>(
    `/api/companies/${encodeURIComponent(companyId)}/membership-requests`
  );

  return requests;
}

async function decidirSolicitacao(
  companyId: string,
  membershipId: string,
  decision: "approve" | "reject"
): Promise<MembershipRequest> {
  const { request } = await apiFetch<MembershipRequestResponse>(
    `/api/companies/${encodeURIComponent(companyId)}/membership-requests/${encodeURIComponent(membershipId)}/${decision}`,
    {
      method: "PATCH",
    }
  );

  return request;
}

export function approveMembershipRequest(
  companyId: string,
  membershipId: string
): Promise<MembershipRequest> {
  return decidirSolicitacao(companyId, membershipId, "approve");
}

export function rejectMembershipRequest(
  companyId: string,
  membershipId: string
): Promise<MembershipRequest> {
  return decidirSolicitacao(companyId, membershipId, "reject");
}
