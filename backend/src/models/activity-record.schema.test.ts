import assert from "node:assert/strict";
import { test } from "node:test";
import { updateActivityRecordSchema } from "./activity-record.schema.js";

test("valida edição parcial e normaliza os campos enviados", () => {
  const result = updateActivityRecordSchema.parse({
    title: "  Reunião de acompanhamento  ",
    tagIds: [
      "8b754e4a-395c-4ed8-b55b-0319719410e3",
      "8b754e4a-395c-4ed8-b55b-0319719410e3",
    ],
  });

  assert.deepEqual(result, {
    title: "Reunião de acompanhamento",
    tagIds: ["8b754e4a-395c-4ed8-b55b-0319719410e3"],
  });
});

test("permite enviar uma lista vazia para remover todas as tags", () => {
  assert.deepEqual(updateActivityRecordSchema.parse({ tagIds: [] }), {
    tagIds: [],
  });
});

test("rejeita uma edição sem campos", () => {
  assert.equal(updateActivityRecordSchema.safeParse({}).success, false);
});

test("rejeita campos protegidos como autor e data de criação", () => {
  const result = updateActivityRecordSchema.safeParse({
    title: "Novo título",
    authorId: "8b754e4a-395c-4ed8-b55b-0319719410e3",
    createdAt: "2026-11-22T12:00:00.000Z",
  });

  assert.equal(result.success, false);
});
