# Executive Summary

Zurich Verity found and proved a realistic breach path in the Hyper Challenge lab.

## Scope

Four services were assessed:

- `portal.acme.local`
- `apex-markets.acme.local`
- `customer-api.acme.local`
- `devops-hub.acme.local`

## Outcome

The assessment produced **63 evidence-backed findings**. The most important result is not the number of findings, but that Verity connected them into a provable breach path:

1. External-facing services exposed sensitive data and weak authentication paths.
2. Credential material and secrets were retrieved from unauthenticated or weakly protected services.
3. Those credentials enabled administrative access.
4. Administrative access exposed customer data, operational data, and source-control risk.
5. Each step was backed by concrete requests, responses, and artifacts.

## Highest Business Risks

| Priority | Risk | Business impact |
| --- | --- | --- |
| Critical | Customer API exposes plaintext credentials and admin access. | Customer data compromise and full trust loss in the affected API. |
| High | DevOps Hub exposes repositories, secrets, deploy keys, and weak developer credentials. | Source tampering, credential reuse, and operational compromise. |
| High | Apex Markets contains multiple exploitable application flaws. | Account takeover, fraud, data exposure, and customer-facing abuse. |

## Why This Matters

The lab shows why continuous proof matters. Static alerts alone would not communicate the real business issue. Verity shows the chain: exposed API, credential material, admin access, customer and operational impact, then owner-ready remediation.
