# Smithers

Smithers is the workflow control plane for Verity. It coordinates long-running agentic validation runs so work is durable, reviewable, and repeatable.

The workflow definition is in [workflows/autonomous-red-team.md](workflows/autonomous-red-team.md).

## Role In Verity

- Convert a trigger into a concrete security objective.
- Enforce scope before active testing.
- Run testing steps inside the Docker harness.
- Preserve evidence and intermediate state.
- Produce findings, recommendations, and retest instructions.
- Support human review gates before high-risk actions.
