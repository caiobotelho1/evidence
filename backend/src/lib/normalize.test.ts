import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeEmail, normalizePhone, onlyDigits } from "./normalize.js";

test("normalizeEmail remove espaços e converte para minúsculas", () => {
  assert.equal(normalizeEmail("  Joao@Example.COM "), "joao@example.com");
});

test("onlyDigits mantém apenas números", () => {
  assert.equal(onlyDigits("00.000.000/0001-91"), "00000000000191");
});

test("normalizePhone remove máscara", () => {
  assert.equal(normalizePhone("(44) 99999-9999"), "44999999999");
});

test("normalizePhone devolve vazio quando não há dígitos", () => {
  assert.equal(normalizePhone("abc"), "");
});
