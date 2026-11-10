import type { MembershipRole, MembershipStatus } from "../generated/prisma/enums.js";

export const PERMISSIONS = [
  "company:manage", 
  "membership:review", 
  "record:read", 
  "record:write", 
] as const;

export type Permission = (typeof PERMISSIONS)[number];


const ROLE_PERMISSIONS: Record<MembershipRole, readonly Permission[]> = {
  OWNER: ["company:manage", "membership:review", "record:read", "record:write"],
  EMPLOYEE: ["record:read", "record:write"],
};


export const PERSONAL_PERMISSIONS: readonly Permission[] = ["record:read", "record:write"];


export function permissionsFor(role: MembershipRole, status: MembershipStatus): Permission[] {
  return status === "ACTIVE" ? [...ROLE_PERMISSIONS[role]] : [];
}

type MembershipLike = {
  companyId: string;
  permissions: readonly Permission[];
};


export function hasPermission(
  memberships: readonly MembershipLike[],
  permission: Permission,
  companyId?: string,
): boolean {
  return memberships.some(
    (membership) =>
      (companyId === undefined || membership.companyId === companyId) &&
      membership.permissions.includes(permission),
  );
}
