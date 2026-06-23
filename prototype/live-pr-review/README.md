# Live PR Review Prototype

This folder contains the working Zurich Verity pull-request review prototype.

It is a minimal application plus the GitHub Action, Smithers workflows, Docker Codex sandbox, and Docker proof harness that were proven end to end in the companion demo repository:

- Demo repository: <https://github.com/ralfboltshauser/zurich-verity-demo>
- Proven PR: <https://github.com/ralfboltshauser/zurich-verity-demo/pull/3>
- Proven workflow run: <https://github.com/ralfboltshauser/zurich-verity-demo/actions/runs/28005618755>

## What It Shows

1. A developer opens a pull request with insecure code.
2. GitHub Actions dispatches the Verity workflow on a self-hosted Ubuntu runner.
3. Smithers runs the `verity-pr-review` workflow.
4. A Docker-isolated Codex reviewer analyzes the PR diff and application code.
5. A Docker proof harness starts the application and executes scoped local probes.
6. Verity posts a PR comment with agent reasoning, evidence, business impact, and remediation guidance.
7. When a safe mechanical remediation exists, Verity can push a fix commit and the next run retests the PR.

## Main Files

| File | Purpose |
| --- | --- |
| `.github/workflows/verity-pr-review.yml` | GitHub Actions trigger for pull requests and manual workflow dispatch. |
| `.smithers/workflows/verity-pr-review.tsx` | Parent Smithers workflow: scope intake, Codex review, Docker proof, report readiness. |
| `.smithers/workflows/sandboxed-security-review.tsx` | Child Smithers workflow that runs Codex security analysis inside Docker. |
| `.smithers/providers/docker-codex.ts` | Docker sandbox provider that mounts the repository and runs the child workflow. |
| `harness/scripts/security_scan.py` | Local proof scanner for exploitable demo issues. |
| `harness/scripts/verity-pr-review.sh` | Evidence capture and PR-comment generation. |
| `scripts/prepare-demo-pr.sh` | Creates a fresh demo branch with an intentionally vulnerable endpoint. |

## Demo Flow

Open a pull request against the demo repository with the intentionally vulnerable endpoint. The workflow will run automatically and produce the PR evidence comment.

## Notes

The `prototype/live-pr-review` folder is kept small and reviewable. It intentionally excludes `node_modules`, local Smithers runtime state, and self-hosted runner state.
