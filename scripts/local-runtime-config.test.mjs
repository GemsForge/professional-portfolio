import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_LOCAL_PORT, readLocalPort } from "./local-runtime-config.mjs";

test("uses the documented local port by default", () => {
  assert.equal(readLocalPort({}), DEFAULT_LOCAL_PORT);
});

test("allows PORT to override the local port", () => {
  assert.equal(readLocalPort({ PORT: "5199" }), 5199);
});

test("accepts VITE_PORT when PORT is not set", () => {
  assert.equal(readLocalPort({ VITE_PORT: "5200" }), 5200);
});

test("rejects invalid local ports", () => {
  assert.throws(() => readLocalPort({ PORT: "70000" }), /Invalid local port/);
});
