import type { Prisma } from "../generated/prisma/client.js";
import { badRequest } from "../lib/errors.js";
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
  status: true,
  createdAt: true,
  companyId: true,
  author: { select: { id: true, name: true } },
  tags: {
    orderBy: { tag: { name: "asc" } },
    select: {
      tag: { select: { id: true, name: true, description: true, color: true } },
    },
  },
} satisfies Prisma.ActivityRecordSelect;

type ActivityRecordRow = Prisma.ActivityRecordGetPayload<{
  select: typeof activityRecordSelect;
}>;

function toActivityRecord(row: ActivityRecordRow) {
  const { tags, ...record } = row;

  return {
    ...record,
    tags: tags.map((item) => item.tag),
  };
}

function scopeWhere(context: ActivityRecordContext): Prisma.ActivityRecordWhereInput {
  if (context.type === "personal") {
    return { authorId: context.userId, companyId: null };
  }

  return { companyId: context.companyId };
}

function availableTagsWhere(context: ActivityRecordContext): Prisma.TagWhereInput {
  if (context.type === "personal") {
    return { userId: context.userId, companyId: null, deletedAt: null };
  }

  return { companyId: context.companyId, userId: null, deletedAt: null };
}

async function assertTagsAvailable(
  context: ActivityRecordContext,
  tagIds: string[],
): Promise<void> {
  if (tagIds.length === 0) return;

  const count = await prisma.tag.count({
    where: { id: { in: tagIds }, ...availableTagsWhere(context) },
  });

  if (count !== tagIds.length) {
    throw badRequest("Uma ou mais tags não estão disponíveis.", {
      tagIds: ["Uma ou mais tags não estão disponíveis."],
    });
  }
}

export async function createActivityRecord(
  context: ActivityRecordContext,
  input: CreateActivityRecordInput,
) {
  await assertTagsAvailable(context, input.tagIds);

  const row = await prisma.activityRecord.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      authorId: context.userId,
      companyId: context.type === "company" ? context.companyId : null,
      tags: {
        create: input.tagIds.map((tagId) => ({ tagId })),
      },
    },
    select: activityRecordSelect,
  });

  return toActivityRecord(row);
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
  const page = hasMore ? rows.slice(0, query.limit) : rows;

  return {
    items: page.map(toActivityRecord),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  };
}
