import assert from "node:assert/strict";
import { test } from "node:test";
import { createStory, inferLabels } from "./create-github-story.mjs";

/** Fake `gh` runner: JSON responses for API calls, a run URL for `workflow run`. */
function fakeGh(calls) {
  return (args, options = {}) => {
    calls.push({ args, options });
    if (args[0] === "workflow") return "https://github.com/o/r/actions/runs/42";
    if (args.includes("POST")) return { number: 7, html_url: "https://github.com/o/r/issues/7" };
    if (args[0] === "repo") return { defaultBranchRef: { name: "main" } };
    return {};
  };
}

test("dispatches metadata workflow as text output and returns its run URL", () => {
  const calls = [];
  const result = createStory({ title: "docs(ci): fix story script", milestone: "1", repo: "o/r", labels: [], assignees: [], blockedBy: [], blocking: [] }, fakeGh(calls));
  const workflowCall = calls.find((call) => call.args[0] === "workflow");
  assert.deepEqual(workflowCall.options, { json: false });
  assert.ok(workflowCall.args.includes("issue_number=7"));
  assert.deepEqual(result, { issueNumber: 7, issueURL: "https://github.com/o/r/issues/7", workflow: "sync-issue-metadata.yml", workflowRunURL: "https://github.com/o/r/actions/runs/42" });
  assert.ok(calls.some((call) => call.args.includes("title=docs(ci): #7 fix story script")));
});

test("infers type and scope labels", () => {
  assert.deepEqual(inferLabels("feat(api): add endpoint", ["enhancement"]), ["feature", "api", "enhancement"]);
  assert.deepEqual(inferLabels("fix(database): repair migration"), ["fix", "database"]);
});
test("rejects malformed titles and unknown scopes", () => {
  assert.throws(() => inferLabels("feature(api): invalid"), /type\(scope\)/);
  assert.throws(() => inferLabels("feat(unknown): invalid"), /Unknown story scope/);
});

