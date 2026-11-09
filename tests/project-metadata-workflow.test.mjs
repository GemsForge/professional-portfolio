import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile(new URL('../.github/workflows/sync-pr-metadata.yml', import.meta.url), 'utf8');

test('project metadata sync passes a project item ID for existing and new items', () => {
  assert.match(workflow, /const addItem = async \(nodeId\) =>[\s\S]*?return data\.addProjectV2ItemById\.item\.id;/);
  assert.match(workflow, /const findItem = \(kind, number\) => items\.find\([\s\S]*?\)\?\.id;/);
  assert.match(workflow, /const issueItem = findItem\("Issue", issueNumber\) \|\| await addItem\(issue\.node_id\);/);
  assert.match(workflow, /const prItem = findItem\("PullRequest", pr\.number\) \|\| await addItem\(pr\.node_id\);/);
});
