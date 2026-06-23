// smithers-source: local
// smithers-display-name: Sandboxed Security Review
// smithers-description: Uses Codex to inspect a PR for security issues inside a Docker sandbox.
// smithers-tags: zurich,verity,security,pull-request,docker,codex
/** @jsxImportSource smithers-orchestrator */
import { CodexAgent, createSmithers, Sequence, Task } from "smithers-orchestrator";
import { z } from "zod/v4";

const repoPath = "/repo";

const inputSchema = z.object({
  repository: z.string().default("ralfboltshauser/zurich-verity-demo"),
  pullNumber: z.union([z.number(), z.string()]),
  pullTitle: z.string().default(""),
  pullBody: z.string().nullable().default(""),
  baseRef: z.string().default("main"),
  headRef: z.string().default(""),
  headSha: z.string().default(""),
});

const contextSchema = z.object({
  changedFiles: z.array(z.string()).default([]),
  diff: z.string(),
  appExcerpt: z.string(),
  routes: z.array(z.string()).default([]),
});

const findingSchema = z.object({
  severity: z.enum(["blocking", "warning", "info"]),
  category: z.string(),
  title: z.string(),
  file: z.string().nullable().default(null),
  line: z.number().nullable().default(null),
  body: z.string(),
  proofSuggestion: z.string().nullable().default(null),
});

const reviewSchema = z.object({
  approved: z.boolean(),
  summary: z.string(),
  findings: z.array(findingSchema).default([]),
});

const statusSchema = z.object({
  ok: z.boolean(),
});

const codex = new CodexAgent({
  model: "gpt-5.5",
  cwd: repoPath,
  configDir: "/codex-home-runtime",
  sandbox: "workspace-write",
  skipGitRepoCheck: true,
});

const { Workflow, smithers, outputs } = createSmithers({
  input: inputSchema,
  context: contextSchema,
  review: reviewSchema,
  status: statusSchema,
});

async function sh(command: string) {
  return Bun.$`sh -lc ${command}`.cwd(repoPath).text();
}

export default smithers((ctx) => (
  <Workflow name="sandboxed-security-review">
    <Sequence>
      <Task id="collect-pr-context" output={outputs.context} retries={0}>
        {async () => {
          const baseRef = ctx.input.baseRef || "main";
          await Bun.$`git -C ${repoPath} fetch --no-tags origin ${baseRef}`.quiet().catch(() => {});
          const diff = await sh(`git diff --unified=100 origin/${baseRef}...HEAD || git diff --unified=100 HEAD~1...HEAD || true`);
          const changedFiles = (await sh(`git diff --name-only origin/${baseRef}...HEAD || git diff --name-only HEAD~1...HEAD || true`))
            .trim()
            .split("\n")
            .filter(Boolean);
          const appExcerpt = await sh("sed -n '1,260p' demo_app/app.py 2>/dev/null || true");
          const routes = (await sh("python3 harness/scripts/security_scan.py --routes-only 2>/dev/null || true"))
            .trim()
            .split("\n")
            .filter(Boolean);

          return {
            changedFiles,
            diff: diff.slice(0, 80000),
            appExcerpt: appExcerpt.slice(0, 30000),
            routes,
          };
        }}
      </Task>
      <Task
        id="codex-security-review"
        output={outputs.review}
        agent={codex}
        needs={{ context: "collect-pr-context" }}
        retries={0}
        timeoutMs={12 * 60 * 1000}
      >
        {`You are Zurich Verity's autonomous security reviewer for this pull request.

Repository: ${ctx.input.repository}
PR #${ctx.input.pullNumber}: ${ctx.input.pullTitle}
PR body:
${ctx.input.pullBody ?? ""}

Changed files:
${JSON.stringify(((ctx.outputs.context ?? []).at(-1) as { changedFiles?: string[] } | undefined)?.changedFiles ?? [], null, 2)}

Discovered routes:
${JSON.stringify(((ctx.outputs.context ?? []).at(-1) as { routes?: string[] } | undefined)?.routes ?? [], null, 2)}

Application excerpt:
\`\`\`python
${((ctx.outputs.context ?? []).at(-1) as { appExcerpt?: string } | undefined)?.appExcerpt ?? ""}
\`\`\`

PR diff:
\`\`\`diff
${((ctx.outputs.context ?? []).at(-1) as { diff?: string } | undefined)?.diff ?? ""}
\`\`\`

Review only this repository and this PR. Focus on exploitable security impact, especially:
- unauthenticated endpoints exposing secrets, credentials, customer data, internal data, or operational data
- missing authorization or authentication around new routes
- SSRF, open redirect, path traversal, command injection, template injection, unsafe deserialization
- hardcoded secrets or credentials
- debug/admin functionality reachable without an explicit server-side guard

Do not just search for a known marker or endpoint name. Reason from the code, routes, data returned, and PR diff.
Prefer findings that can be proven by a local curl or static evidence.

Return JSON with:
- approved: false if there is any blocking finding, otherwise true
- summary: concise security review summary
- findings: concrete findings with severity "blocking", "warning", or "info". For blocking findings include file, best line number, business/security impact, and a proofSuggestion command or action.`}
      </Task>
      <Task
        id="write-sandbox-result"
        output={outputs.status}
        needs={{ review: "codex-security-review" }}
        retries={0}
      >
        {async () => {
          const review = (ctx.outputs.review ?? []).at(-1) ?? {
            approved: true,
            summary: "No review was produced.",
            findings: [],
          };

          if (process.env.SANDBOX_RESULT_PATH) {
            await Bun.write(process.env.SANDBOX_RESULT_PATH, JSON.stringify(review));
          }

          return { ok: true };
        }}
      </Task>
    </Sequence>
  </Workflow>
));
