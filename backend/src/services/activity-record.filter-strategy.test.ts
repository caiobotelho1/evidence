import assert from "node:assert/strict";
import { test } from "node:test";
import { listActivityRecordsQuerySchema } from "../models/activity-record.schema.js";
import {
  buildActivityRecordFilterWhere,
  buildActivityRecordSearchWhere,
} from "./activity-record.filter-strategy.js";
import { buildActivityRecordListWhere } from "./activity-record.scope.js";

const tagA = "11111111-1111-4111-8111-111111111111";
const tagB = "22222222-2222-4222-8222-222222222222";
const employeeA = "33333333-3333-4333-8333-333333333333";

test("query de listagem normaliza filtros repetidos, remove duplicatas e valida datas", () => {
  const query = listActivityRecordsQuerySchema.parse({
    tagIds: [tagA, tagA, tagB],
    statuses: ["PENDING", "COMPLETED", "PENDING"],
    employeeIds: employeeA,
    dateFrom: "2026-11-01T03:00:00.000Z",
    dateTo: "2026-11-30T02:59:59.999Z",
    search: "  relatório  ",
  });

  assert.deepEqual(query.tagIds, [tagA, tagB]);
  assert.deepEqual(query.statuses, ["PENDING", "COMPLETED"]);
  assert.deepEqual(query.employeeIds, [employeeA]);
  assert.equal(query.search, "relatório");
  assert.equal(query.limit, 50);
});

test("query de listagem rejeita intervalo de datas invertido", () => {
  const result = listActivityRecordsQuerySchema.safeParse({
    dateFrom: "2026-11-30T03:00:00.000Z",
    dateTo: "2026-11-01T03:00:00.000Z",
  });

  assert.equal(result.success, false);
});

test("query de listagem rejeita status desconhecido", () => {
  const result = listActivityRecordsQuerySchema.safeParse({ statuses: "UNKNOWN" });

  assert.equal(result.success, false);
});

test("intervalo de datas compara instantes mesmo quando os fusos diferem", () => {
  const result = listActivityRecordsQuerySchema.safeParse({
    dateFrom: "2026-11-01T04:00:00+01:00",
    dateTo: "2026-11-01T03:30:00Z",
  });

  assert.equal(result.success, true);
});

test("estratégias combinam tags, período e funcionários como filtros distintos", () => {
  const query = listActivityRecordsQuerySchema.parse({
    tagIds: [tagA, tagB],
    statuses: ["COMPLETED", "CANCELED"],
    dateFrom: "2026-11-01T03:00:00.000Z",
    employeeIds: [employeeA],
  });

  assert.deepEqual(buildActivityRecordFilterWhere(query), [
    { tags: { some: { tagId: { in: [tagA, tagB] } } } },
    { status: { in: ["COMPLETED", "CANCELED"] } },
    { createdAt: { gte: new Date("2026-11-01T03:00:00.000Z") } },
    { authorId: { in: [employeeA] } },
  ]);
});

test("busca consulta título ou descrição sem misturar os filtros", () => {
  assert.deepEqual(buildActivityRecordSearchWhere("relatório"), {
    OR: [
      { title: { contains: "relatório", mode: "insensitive" } },
      { description: { contains: "relatório", mode: "insensitive" } },
    ],
  });
  assert.equal(buildActivityRecordSearchWhere(undefined), undefined);
});

test("busca e filtros preservam o escopo existente de funcionário", () => {
  const query = listActivityRecordsQuerySchema.parse({
    search: "plano",
    tagIds: [tagA],
    statuses: ["IN_PROGRESS"],
    employeeIds: [employeeA],
  });

  assert.deepEqual(
    buildActivityRecordListWhere(
      {
        type: "company",
        userId: "employee-user",
        companyId: "company-a",
        role: "EMPLOYEE",
      },
      query,
    ),
    {
      AND: [
        { companyId: "company-a", authorId: "employee-user" },
        {
          OR: [
            { title: { contains: "plano", mode: "insensitive" } },
            { description: { contains: "plano", mode: "insensitive" } },
          ],
        },
        { tags: { some: { tagId: { in: [tagA] } } } },
        { status: { in: ["IN_PROGRESS"] } },
        { authorId: { in: [employeeA] } },
      ],
    },
  );
});
