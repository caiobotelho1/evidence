import type { Prisma } from "../generated/prisma/client.js";
import type { UploadedFile } from "../lib/attachment-upload.js";
import { badRequest, conflict, unprocessable } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { checkStatusChange, resolveCreateStatus } from "../lib/record-status.js";
import type {
  CreateActivityRecordInput,
  ListActivityRecordsQuery,
  UpdateActivityRecordInput,
} from "../models/activity-record.schema.js";
import {
  buildActivityRecordDetailWhere,
  buildActivityRecordListWhere,
  buildActivityRecordScope,
  type ActivityRecordListContext,
} from "./activity-record.scope.js";
import {
  assertWithinRecordLimit,
  toAttachmentCreateData,
  validateAttachmentFiles,
} from "./attachment.service.js";

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
  updatedAt: true,
  companyId: true,
  author: { select: { id: true, name: true } },
  attachments: {
    orderBy: { createdAt: "asc" },
    select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
  },
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

function availableTagsWhere(context: ActivityRecordContext): Prisma.TagWhereInput {
  if (context.type === "personal") {
    return { userId: context.userId, companyId: null, deletedAt: null };
  }

  return { companyId: context.companyId, userId: null, deletedAt: null };
}

async function assertTagsAvailable(
  context: ActivityRecordContext,
  tagIds: string[],
  database: Pick<typeof prisma, "tag"> = prisma,
): Promise<void> {
  if (tagIds.length === 0) return;

  const count = await database.tag.count({
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
  files: UploadedFile[] = [],
) {
  const status = resolveCreateStatus(input.status, files.length > 0);

  if (!status.ok) {
    throw unprocessable(status.message, { status: [status.message] });
  }

  const validFiles = validateAttachmentFiles(files);
  assertWithinRecordLimit(0, validFiles.length);

  await assertTagsAvailable(context, input.tagIds);

  const row = await prisma.activityRecord.create({
    data: {
      title: input.title,
      description: input.description,
      status: status.value,
      authorId: context.userId,
      companyId: context.type === "company" ? context.companyId : null,
      tags: {
        create: input.tagIds.map((tagId) => ({ tagId })),
      },
      attachments: {
        create: validFiles.map((file) => toAttachmentCreateData(file, context.userId)),
      },
    },
    select: activityRecordSelect,
  });

  return toActivityRecord(row);
}

export async function listActivityRecords(
  context: ActivityRecordListContext,
  query: ListActivityRecordsQuery,
) {
  const rows = await prisma.activityRecord.findMany({
    where: buildActivityRecordListWhere(context, query),
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

export async function getActivityRecord(
  context: ActivityRecordListContext,
  recordId: string,
) {
  const row = await prisma.activityRecord.findFirst({
    where: buildActivityRecordDetailWhere(context, recordId),
    select: activityRecordSelect,
  });

  return row ? toActivityRecord(row) : null;
}

export async function updateActivityRecord(
  context: ActivityRecordListContext,
  recordId: string,
  input: UpdateActivityRecordInput,
) {
  const where = buildActivityRecordDetailWhere(context, recordId);

  const row = await prisma.$transaction(async (transaction) => {
    const current = await transaction.activityRecord.findFirst({
      where,
      select: { status: true },
    });

    if (!current) return null;

    const change = checkStatusChange(current.status, input.status);
    if (!change.ok) {
      throw unprocessable(change.message, { status: [change.message] });
    }

    const result = await transaction.activityRecord.updateMany({
      where: { AND: [where, { status: current.status }] },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw conflict("O registro foi alterado por outra ação. Recarregue e tente novamente.");
    }

    if (input.tagIds !== undefined) {
      await assertTagsAvailable(context, input.tagIds, transaction);

      await transaction.activityRecordTag.deleteMany({
        where: { activityRecordId: recordId },
      });

      if (input.tagIds.length > 0) {
        await transaction.activityRecordTag.createMany({
          data: input.tagIds.map((tagId) => ({
            activityRecordId: recordId,
            tagId,
          })),
        });
      }
    }

    return transaction.activityRecord.findFirst({
      where,
      select: activityRecordSelect,
    });
  });

  return row ? toActivityRecord(row) : null;
}
