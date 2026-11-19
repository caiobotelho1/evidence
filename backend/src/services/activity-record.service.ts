import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateActivityRecordInput,
  ListActivityRecordsQuery,
} from "../models/activity-record.schema.js";

export type ActivityRecordContext =
  | {
      type: "personal";
      userId: string;
    }
  | {
      type: "company";
      userId: string;
      companyId: string;
    };

const activityRecordSelect = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  companyId: true,
  author: { select: { id: true, name: true } },
} satisfies Prisma.ActivityRecordSelect;

function scopeWhere(context: ActivityRecordContext): Prisma.ActivityRecordWhereInput {
  if (context.type === "personal") {
    return { authorId: context.userId, companyId: null };
  }

  return { companyId: context.companyId };
}

export async function createActivityRecord(
  context: ActivityRecordContext,
  input: CreateActivityRecordInput,
) {
  return prisma.activityRecord.create({
    data: {
      title: input.title,
      description: input.description,
      authorId: context.userId,
      companyId: context.type === "company" ? context.companyId : null,
    },
    select: activityRecordSelect,
  });
}

export async function listActivityRecords(
  context: ActivityRecordContext,
  query: ListActivityRecordsQuery,
) {
  const rows = await prisma.activityRecord.findMany({
    where: scopeWhere(context),
    select: activityRecordSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > query.limit;
  const items = hasMore ? rows.slice(0, query.limit) : rows;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]!.id : null,
  };
}
