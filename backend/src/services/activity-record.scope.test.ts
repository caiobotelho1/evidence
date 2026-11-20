import assert from "node:assert/strict";
import { test } from "node:test";
import { buildActivityRecordScope } from "./activity-record.scope.js";

test("usuário consulta somente os próprios registros pessoais", () => {
  const scope = buildActivityRecordScope({
    type: "personal",
    userId: "user-a",
  });

  assert.deepEqual(scope, {
    authorId: "user-a",
    companyId: null,
  });
});

test("proprietário consulta todos os registros da própria empresa", () => {
  const scope = buildActivityRecordScope({
    type: "company",
    userId: "owner-a",
    companyId: "company-a",
    role: "OWNER",
  });

  assert.deepEqual(scope, {
    companyId: "company-a",
  });
});

test("funcionário consulta somente os próprios registros da empresa", () => {
  const scope = buildActivityRecordScope({
    type: "company",
    userId: "employee-a",
    companyId: "company-a",
    role: "EMPLOYEE",
  });

  assert.deepEqual(scope, {
    companyId: "company-a",
    authorId: "employee-a",
  });
});

test("funcionários diferentes possuem escopos de registros isolados", () => {
  const employeeA = buildActivityRecordScope({
    type: "company",
    userId: "employee-a",
    companyId: "company-a",
    role: "EMPLOYEE",
  });

  const employeeB = buildActivityRecordScope({
    type: "company",
    userId: "employee-b",
    companyId: "company-a",
    role: "EMPLOYEE",
  });

  assert.notDeepEqual(employeeA, employeeB);
  assert.equal(employeeA.authorId, "employee-a");
  assert.equal(employeeB.authorId, "employee-b");
});

test("funcionário permanece limitado à empresa do próprio contexto", () => {
  const scopeA = buildActivityRecordScope({
    type: "company",
    userId: "employee-a",
    companyId: "company-a",
    role: "EMPLOYEE",
  });

  const scopeB = buildActivityRecordScope({
    type: "company",
    userId: "employee-a",
    companyId: "company-b",
    role: "EMPLOYEE",
  });

  assert.equal(scopeA.companyId, "company-a");
  assert.equal(scopeB.companyId, "company-b");
});
