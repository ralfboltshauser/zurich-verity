# Live Prototype Proof

Zurich Verity was proven as a working pull-request security review workflow, not only as a report generator.

## Proven Demo

- Demo repository: <https://github.com/ralfboltshauser/zurich-verity-demo>
- Proven PR: <https://github.com/ralfboltshauser/zurich-verity-demo/pull/3>
- Proven workflow run: <https://github.com/ralfboltshauser/zurich-verity-demo/actions/runs/28005618755>

## End-To-End Behavior

The proven run used the self-hosted Ubuntu runner `ralfs-ubuntu-zurich-verity-demo` and executed:

1. GitHub pull-request trigger.
2. `smithers workflow run verity-pr-review`.
3. `codex-security-review` inside the Docker Codex sandbox.
4. `docker-harness-audit` inside the Docker proof runner.
5. PR comment generation with evidence and remediation guidance.

## Confirmed Security Finding

The proof PR introduced an unauthenticated route:

```bash
curl http://127.0.0.1:8080/ops/snapshot
```

Verity confirmed that the route returned sensitive fields including `database_password` and `session_token`. The PR comment includes:

- agent security reasoning,
- affected asset,
- concrete curl proof,
- business impact,
- recommended fix,
- evidence run path.

## Why This Matters

This proves the core Zurich Verity loop:

```text
new code -> agent review -> Docker proof -> evidence-backed PR comment -> remediation/retest
```

The demo is intentionally small, but the workflow shape is the same one used by a production validation service: teams choose trigger points, Smithers orchestrates agent work, Docker isolates active validation, and findings are reported where developers already work.
