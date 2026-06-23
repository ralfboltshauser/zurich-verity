# Security Model

Zurich Verity is designed for controlled validation, not uncontrolled scanning.

## Scope Boundary

All active testing must target explicitly authorized lab or application assets. The harness uses an allowlist file to make scope visible and reviewable before a run starts.

Current lab assets:

- `portal.acme.local`
- `apex-markets.acme.local`
- `customer-api.acme.local`
- `devops-hub.acme.local`

## Docker Boundary

Active testing should run from the Docker runner. The host is used for orchestration, file editing, and report generation only. This keeps tools, dependencies, and network assumptions contained.

## Evidence Handling

Evidence should be split into two layers:

- **Raw evidence:** requests, responses, logs, screenshots, tokens, and timestamps.
- **Curated evidence:** redacted proof, reproduction commands, impact explanation, and remediation guidance.

Sensitive values should be redacted before public sharing. Internal audit packages can retain exact lab evidence where policy allows.

## Guardrails

- No targets outside the allowlist.
- No destructive actions unless the lab is resettable and the step is required for proof.
- No persistence, malware, or credential reuse outside the lab.
- Findings must be reproducible or clearly marked as hypotheses.
