import type { Prisma } from "../generated/prisma/client.js";
import type { ListActivityRecordsQuery } from "../models/activity-record.schema.js";

export interface ActivityRecordFilterStrategy {
  isActive(query: ListActivityRecordsQuery): boolean;
  buildWhere(query: ListActivityRecordsQuery): Prisma.ActivityRecordWhereInput;
}

const tagFilterStrategy: ActivityRecordFilterStrategy = {
  isActive: (query) => query.tagIds.length > 0,
  buildWhere: (query) => ({
    tags: { some: { tagId: { in: query.tagIds } } },
  }),
};

const statusFilterStrategy: ActivityRecordFilterStrategy = {
  isActive: (query) => query.statuses.length > 0,
  buildWhere: (query) => ({ status: { in: query.statuses } }),
};

const periodFilterStrategy: ActivityRecordFilterStrategy = {
  isActive: (query) => Boolean(query.dateFrom || query.dateTo),
  buildWhere: (query) => ({
    createdAt: {
      ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
    },
  }),
};

const employeeFilterStrategy: ActivityRecordFilterStrategy = {
  isActive: (query) => query.employeeIds.length > 0,
  buildWhere: (query) => ({ authorId: { in: query.employeeIds } }),
};

export const activityRecordFilterStrategies: ActivityRecordFilterStrategy[] = [
  tagFilterStrategy,
  statusFilterStrategy,
  periodFilterStrategy,
  employeeFilterStrategy,
];

export function buildActivityRecordFilterWhere(
  query: ListActivityRecordsQuery,
): Prisma.ActivityRecordWhereInput[] {
  return activityRecordFilterStrategies
    .filter((strategy) => strategy.isActive(query))
    .map((strategy) => strategy.buildWhere(query));
}

export function buildActivityRecordSearchWhere(
  search: string | undefined,
): Prisma.ActivityRecordWhereInput | undefined {
  if (!search) return undefined;

  return {
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ],
  };
}
