import type { Prisma } from "../generated/prisma/client.js";
import type { MembershipRole } from "../generated/prisma/enums.js";

export type ActivityRecordListContext =
  | {
      type: "personal";
      userId: string;
    }
  | {
      type: "company";
      userId: string;
      companyId: string;
      role: MembershipRole;
    };

export function buildActivityRecordScope(
  context: ActivityRecordListContext,
): Prisma.ActivityRecordWhereInput {
  if (context.type === "personal") {
    return {
      authorId: context.userId,
      companyId: null,
    };
  }

  if (context.role === "OWNER") {
    return {
      companyId: context.companyId,
    };
  }

  return {
    companyId: context.companyId,
    authorId: context.userId,
  };
}
