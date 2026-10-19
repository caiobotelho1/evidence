import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password.js";

test("hashPassword não devolve a senha em texto puro", async () => {
  const hash = await hashPassword("senha-segura");
  assert.notEqual(hash, "senha-segura");
  assert.ok(hash.startsWith("$argon2id$"));
});

test("verifyPassword aceita a senha correta", async () => {
  const hash = await hashPassword("senha-segura");
  assert.equal(await verifyPassword(hash, "senha-segura"), true);
});

test("verifyPassword rejeita senha errada", async () => {
  const hash = await hashPassword("senha-segura");
  assert.equal(await verifyPassword(hash, "outra-senha"), false);
});

test("verifyPassword rejeita hash malformado sem lançar erro", async () => {
  assert.equal(await verifyPassword("isso-nao-e-um-hash", "senha-segura"), false);
});
