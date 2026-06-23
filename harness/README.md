# Harness

The harness is the controlled execution layer for Zurich Verity. It provides the environment and policy boundary for active security validation.

## Contents

- [docker/](docker/): runner image and compose entrypoint.
- [policies/](policies/): explicit target allowlist.
- [scripts/](scripts/): helper scripts for guarded execution.

## Design Goals

- All active testing runs inside Docker.
- Scope is declared before execution.
- Evidence is written to predictable run folders.
- The same harness can run locally, in CI, or in an ephemeral validation worker.
