import type { Prisma } from "../generated/prisma/client.js";
import type { MembershipRole } from "../generated/prisma/enums.js";
import type { ListActivityRecordsQuery } from "../models/activity-record.schema.js";
import {
  buildActivityRecordFilterWhere,
  buildActivityRecordSearchWhere,
} from "./activity-record.filter-strategy.js";

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

export function buildActivityRecordListWhere(
  context: ActivityRecordListContext,
  query: ListActivityRecordsQuery,
): Prisma.ActivityRecordWhereInput {
  const searchWhere = buildActivityRecordSearchWhere(query.search);
  const filters = buildActivityRecordFilterWhere(query);

  return {
    AND: [
      buildActivityRecordScope(context),
      ...(searchWhere ? [searchWhere] : []),
      ...filters,
    ],
  };
}

export function buildActivityRecordDetailWhere(
  context: ActivityRecordListContext,
  recordId: string,
): Prisma.ActivityRecordWhereInput {
  return {
    AND: [{ id: recordId }, buildActivityRecordScope(context)],
  };
}
