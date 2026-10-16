import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const policy = JSON.parse(readFileSync(join(here, "commit-policy.json"), "utf8"));
const shaPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const zero = (sha) => /^0+$/.test(sha);
const git = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

export function validateSubject(subject, rules = policy) {
  const match = /^([a-z]+)\(([a-z][a-z0-9-]*)\): #([1-9]\d*) (.+)$/.exec(subject);
  if (!match) return [`Expected ${rules.format}; use a positive issue number.`];
  const errors = [];
  if (!rules.types.includes(match[1])) errors.push(`Unapproved type '${match[1]}'.`);
  if (!rules.scopes.includes(match[2])) errors.push(`Unknown scope '${match[2]}'. Allowed: ${rules.scopes.join(", ")}.`);
  const description = match[4];
  if (description.trim() !== description || !/^[a-z][a-z0-9-]*(?:\s+\S.*)?$/.test(description) || /[\x00-\x1f\x7f]/.test(description)) errors.push("Description must start with a lowercase word and contain no surrounding whitespace or control characters.");
  return errors;
}

function requireCommit(sha) { if (!shaPattern.test(sha)) throw new Error("Invalid commit SHA."); git(["cat-file", "-e", `${sha}^{commit}`]); return sha; }
function commitExists(sha) { return shaPattern.test(sha) && (() => { try { git(["cat-file", "-e", `${sha}^{commit}`]); return true; } catch { return false; } })(); }
export function commitsBetween(head, exclusions = []) { requireCommit(head); requireCommit(policy.legacyBase); const output = git(["rev-list", head, "--not", policy.legacyBase, ...exclusions.map(requireCommit)]); return output ? output.split("\n") : []; }
export function pushExclusions(event, defaultBranch) { const exclusions = [defaultBranch]; if (!zero(event.before) && commitExists(event.before)) exclusions.push(event.before); return [...new Set(exclusions)]; }
function isStandardMergeCommit(sha, subject) { const parents = git(["show", "-s", "--format=%P", requireCommit(sha)]).split(/\s+/).filter(Boolean); return parents.length > 1 && /^(?:Merge (?:branch|remote-tracking branch) '.+'(?: into .+)?|Merge pull request #[1-9]\d* from .+)$/.test(subject); }
export function validateCommits(commits) { let failures = 0; for (const sha of new Set(commits)) { const subject = execFileSync("git", ["show", "-s", "--format=%B", requireCommit(sha)], { encoding: "utf8" }).split(/\r?\n/, 1)[0]; if (isStandardMergeCommit(sha, subject)) continue; const errors = validateSubject(subject); if (errors.length) { failures += 1; console.error(`Commit ${sha.slice(0, 12)}: ${subject}`); errors.forEach((error) => console.error(`  - ${error}`)); } } if (failures) console.error(`Commit policy failed for ${failures} commit(s). Example: ${policy.example}`); else console.log(`Commit policy passed (${new Set(commits).size} new commit(s)).`); return failures === 0; }
export function validateGitHubEvent(event, name) { if (name === "pull_request") { const errors = validateSubject(event.pull_request.title); if (errors.length) { console.error(`PR title is invalid: ${errors.join(" ")} Example: ${policy.example}`); return false; } const baseRef = `refs/remotes/origin/${event.pull_request.base.ref}`; const base = git(["rev-parse", "--verify", `${baseRef}^{commit}`]); return validateCommits(commitsBetween(event.pull_request.head.sha, [base])); } if (name === "push") { if (event.deleted || zero(event.after)) return true; const defaultBranch = git(["rev-parse", "--verify", `refs/remotes/origin/${event.repository.default_branch}^{commit}`]); return validateCommits(commitsBetween(event.after, pushExclusions(event, defaultBranch))); } throw new Error(`Unsupported workflow event: ${name}`); }

if (process.argv[1] === fileURLToPath(import.meta.url)) { if (process.argv[2] !== "github") throw new Error("Usage: node scripts/commit-policy.mjs github"); const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")); process.exitCode = validateGitHubEvent(event, process.env.GITHUB_EVENT_NAME) ? 0 : 1; }
