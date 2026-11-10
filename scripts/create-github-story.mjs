import { execFileSync } from "node:child_process";

const usage = `Usage: node scripts/create-github-story.mjs --title "..." [options]

Options:
  --body TEXT              Markdown issue body
  --labels a,b             Additional labels
  --assignees a,b          GitHub usernames to assign
  --milestone NUMBER       Milestone number
  --parent-issue NUMBER    Not supported yet; link in GitHub after creation
  --blocked-by a,b         Not supported yet; link in GitHub after creation
  --blocking a,b           Not supported yet; link in GitHub after creation
  --repo OWNER/REPOSITORY  Repository (defaults to GITHUB_REPOSITORY)
`;

const valueAfter = (args, index, option) => {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${option} requires a value.`);
  return value;
};
const parseList = (value) => value ? [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))] : [];
const typeLabels = new Map([["feat","feature"],["fix","fix"],["refactor","refactor"],["test","testing"],["docs","documentation"],["chore","chore"],["ci","ci"]]);
const scopeLabels = new Set(["api","ci","database","infrastructure","model","schema","security","service","swift","testing","ui","vapor"]);
export function inferLabels(title, explicitLabels = []) {
  const match = /^(feat|fix|refactor|test|docs|chore|ci)\(([a-z0-9-]+)\):\s+/.exec(title);
  if (!match) throw new Error("Title must use type(scope): short imperative description.");
  if (!scopeLabels.has(match[2])) throw new Error(`Unknown story scope '${match[2]}'. Use an existing scope label.`);
  return [...new Set([typeLabels.get(match[1]), match[2], ...explicitLabels])];
}
const parseArgs = (args) => {
  const options = { labels: [], assignees: [], blockedBy: [], blocking: [] };
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    if (option === "--help") return { help: true };
    const valueOptions = new Set(["--title","--body","--labels","--assignees","--milestone","--parent-issue","--blocked-by","--blocking","--repo"]);
    if (!valueOptions.has(option)) throw new Error(`Unknown option: ${option}`);
    const value = valueAfter(args, index, option); index += 1;
    if (option === "--title") options.title = value;
    else if (option === "--body") options.body = value;
    else if (option === "--labels") options.labels = parseList(value);
    else if (option === "--assignees") options.assignees = parseList(value);
    else if (option === "--milestone" || option === "--parent-issue") options[option === "--milestone" ? "milestone" : "parentIssue"] = value;
    else if (option === "--blocked-by") options.blockedBy = parseList(value);
    else if (option === "--blocking") options.blocking = parseList(value);
    else options.repo = value;
  }
  if (!options.title) throw new Error("--title is required.");
  if (!options.milestone) throw new Error("--milestone is required; select a milestone from the target repository.");
  options.repo ||= process.env.GITHUB_REPOSITORY;
  if (!options.repo || !/^[^/]+\/[^/]+$/.test(options.repo)) throw new Error("Set GITHUB_REPOSITORY or supply --repo OWNER/REPOSITORY.");
  return options;
};
const runGh = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
export function createStory(options, run = runGh) {
  const labels = inferLabels(options.title, options.labels);
  // The metadata workflow has no inputs for relationships; fail before creating
  // the issue rather than dropping them silently.
  if (options.parentIssue || options.blockedBy?.length || options.blocking?.length) {
    throw new Error("--parent-issue, --blocked-by, and --blocking are not supported by the metadata workflow; link them in GitHub after creation.");
  }
  const issueArgs = ["api", `repos/${options.repo}/issues`, "--method", "POST", "-f", `title=${options.title}`];
  if (options.body) issueArgs.push("-f", `body=${options.body}`);
  for (const label of labels) issueArgs.push("-f", `labels[]=${label}`);
  for (const assignee of options.assignees) issueArgs.push("-f", `assignees[]=${assignee}`);
  if (options.milestone) issueArgs.push("-f", `milestone=${options.milestone}`);
  const issue = run(issueArgs);
  const numberedTitle = options.title.replace(/^([^:]+):\s+/, `$1: #${issue.number} `);
  run(["api", `repos/${options.repo}/issues/${issue.number}`, "--method", "PATCH", "-f", `title=${numberedTitle}`]);
  // No manual dispatch: the workflow's `issues: opened` trigger syncs metadata
  // automatically, and its workflow_dispatch only accepts a PR number.
  const metadataWorkflow = options.metadataWorkflow || process.env.GITHUB_METADATA_WORKFLOW || "sync-issue-metadata.yml";
  return { issueNumber: issue.number, issueURL: issue.html_url, workflow: metadataWorkflow };
}
if (process.argv[1]?.endsWith("create-github-story.mjs")) {
  try { const options = parseArgs(process.argv.slice(2)); if (options.help) console.log(usage); else console.log(JSON.stringify(createStory(options), null, 2)); }
  catch (error) { console.error(`${error.message}\n\n${usage}`); process.exitCode = 1; }
}

