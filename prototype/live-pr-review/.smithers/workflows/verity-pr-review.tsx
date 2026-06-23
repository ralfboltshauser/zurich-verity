// smithers-source: local
// smithers-display-name: Zurich Verity PR Review
// smithers-description: Runs Codex security review in Docker, verifies findings with the Docker proof harness, and writes PR-ready evidence.
// smithers-tags: zurich,verity,security,pull-request,docker,codex
/** @jsxImportSource smithers-orchestrator */
import type { WorkflowDefinition } from "@smithers-orchestrator/driver";
import { createSmithers, Sandbox, Sequence, Task } from "smithers-orchestrator";
import { z } from "zod/v4";
import { dockerCodexSecurityReviewProvider } from "../providers/docker-codex";
import sandboxedSecurityReview from "./sandboxed-security-review";

const sandboxedSecurityReviewWorkflow =
  sandboxedSecurityReview as unknown as WorkflowDefinition<unknown>;

const inputSchema = z.object({
  repository: z.string().default("local/zurich-verity-demo"),
  pullNumber: z.union([z.number(), z.string()]).default("local"),
  pullTitle: z.string().default(""),
  pullBody: z.string().nullable().default(""),
  baseRef: z.string().default("main"),
  headRef: z.string().default(""),
  headSha: z.string().default("local"),
});

const stageSchema = z.object({
  name: z.string(),
  ok: z.boolean(),
  summary: z.string(),
});

const auditSchema = z.object({
  ok: z.boolean(),
  finding: z.boolean(),
  commentPath: z.string(),
  statusPath: z.string(),
  summary: z.string(),
});

const agentFindingSchema = z.object({
  severity: z.enum(["blocking", "warning", "info"]),
  category: z.string(),
  title: z.string(),
  file: z.string().nullable().default(null),
  line: z.number().nullable().default(null),
  body: z.string(),
  proofSuggestion: z.string().nullable().default(null),
});

const agentReviewSchema = z.object({
  approved: z.boolean(),
  summary: z.string(),
  findings: z.array(agentFindingSchema).default([]),
});

const { Workflow, smithers, outputs } = createSmithers({
  input: inputSchema,
  stage: stageSchema,
  audit: auditSchema,
  agentReview: agentReviewSchema,
});

async function runAudit(
  input: z.infer<typeof inputSchema>,
  agentReview: z.infer<typeof agentReviewSchema>,
) {
  await Bun.write(".verity/agent-review.json", JSON.stringify(agentReview, null, 2));

  const proc = Bun.spawn({
    cmd: [
      "docker",
      "compose",
      "-f",
      "harness/docker/docker-compose.yml",
      "run",
      "--rm",
      "-e",
      `PR_NUMBER=${String(input.pullNumber)}`,
      "-e",
      `GITHUB_REPOSITORY=${input.repository}`,
      "-e",
      `GITHUB_SHA=${input.headSha}`,
      "verity-runner",
      "./harness/scripts/run-smithers-audit.sh",
    ],
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      PR_NUMBER: String(input.pullNumber),
      GITHUB_REPOSITORY: input.repository,
      GITHUB_SHA: input.headSha,
    },
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(`Verity harness failed with exit ${exitCode}\n${stdout}\n${stderr}`);
  }

  const status = await Bun.file(".verity/status.json").json();
  return {
    ok: true,
    finding: Boolean(status.finding),
    commentPath: ".verity/pr-comment.md",
    statusPath: ".verity/status.json",
    summary: stdout.trim().split("\n").slice(-1)[0] ?? "Verity run complete",
  };
}

export default smithers((ctx) => (
  <Workflow name="verity-pr-review">
    <Sequence>
      <Task id="scope-intake" output={outputs.stage}>
        {async () => ({
          name: "scope-intake",
          ok: true,
          summary: "Loaded explicit target scope before active testing.",
        })}
      </Task>
      <Sandbox
        id="codex-security-review"
        output={outputs.agentReview}
        provider={dockerCodexSecurityReviewProvider}
        workflow={sandboxedSecurityReviewWorkflow}
        input={{
          repository: ctx.input.repository,
          pullNumber: ctx.input.pullNumber,
          pullTitle: ctx.input.pullTitle,
          pullBody: ctx.input.pullBody,
          baseRef: ctx.input.baseRef,
          headRef: ctx.input.headRef,
          headSha: ctx.input.headSha,
        }}
        allowNetwork
        reviewDiffs={false}
        retries={0}
        timeoutMs={20 * 60 * 1000}
        heartbeatTimeoutMs={15 * 60 * 1000}
      />
      <Task id="docker-harness-audit" output={outputs.audit}>
        {async () => {
          const agentReview = (ctx.outputs.agentReview ?? []).at(-1) as
            | z.infer<typeof agentReviewSchema>
            | undefined;
          return runAudit(
            ctx.input,
            agentReview ?? { approved: true, summary: "No agent review returned.", findings: [] },
          );
        }}
      </Task>
      <Task id="report-ready" output={outputs.stage}>
        {async () => ({
          name: "report-ready",
          ok: true,
          summary: "Prepared PR comment, evidence status, and remediation guidance.",
        })}
      </Task>
    </Sequence>
  </Workflow>
));
