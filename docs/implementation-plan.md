# Implementation Plan

## Milestone 1: Curated Prototype Repository

- Publish the Docker harness foundation.
- Publish the Smithers workflow definition.
- Include product PDFs and slide images.
- Include executive and technical lab reports with evidence-backed findings.

## Milestone 2: Repeatable Runs

- Add run manifests with objective, scope, target, start time, end time, and result.
- Store raw evidence under immutable run IDs.
- Generate markdown and JSON reports from the same evidence model.
- Add diff support between current and previous runs.

## Milestone 3: CI/CD Integration

- Generalize the proven GitHub Actions PR entrypoint for main merges and scheduled validation.
- Use changed files and dependency graph context to focus testing.
- Post findings as GitHub comments or issues with exact remediation guidance.
- Add retest jobs that verify fixes and close the loop.

## Milestone 4: Production Controls

- Add per-team scope configuration.
- Add approval gates for invasive tests.
- Add central evidence retention policy.
- Add dashboards for risk trends, service ownership, and fix status.
