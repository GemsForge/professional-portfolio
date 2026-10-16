import assert from "node:assert/strict";
import { test } from "node:test";
import { pushExclusions, validateSubject } from "./commit-policy.mjs";

test("accepts issue-linked conventional subjects", () => {
  assert.deepEqual(validateSubject("feat(build): #3 add project board"), []);
  assert.deepEqual(validateSubject("chore(ci): #3 maintain portfolio commit policy"), []);
});

test("rejects malformed subjects and unknown scopes", () => {
  assert.notDeepEqual(validateSubject("feature(ui): #3 missing supported type"), []);
  assert.match(validateSubject("feat(ui): #3 add support").join(" "), /Unknown scope/);
});

test("push validation always excludes default-branch history", () => {
  const defaultBranch = "a".repeat(40);
  const previousHead = "b".repeat(40);
  assert.deepEqual(pushExclusions({ before: previousHead }, defaultBranch), [defaultBranch, previousHead]);
  assert.deepEqual(pushExclusions({ before: "0".repeat(40) }, defaultBranch), [defaultBranch]);
  assert.deepEqual(pushExclusions({ before: defaultBranch }, defaultBranch), [defaultBranch]);
});
