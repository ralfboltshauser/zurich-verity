# Technical Findings

This document summarizes the most important findings for engineering teams. The full working report is in [full-lab-security-assessment.md](full-lab-security-assessment.md).

## Finding Index

| ID | Severity | Asset | Finding |
| --- | --- | --- | --- |
| ZV-001 | Critical | Customer API | Unauthenticated plaintext credential dump enables admin takeover. |
| ZV-002 | High | DevOps Hub | Public repositories expose infrastructure secrets and internal topology. |
| ZV-003 | High | DevOps Hub | Weak developer credentials grant repository admin and push access. |
| ZV-004 | High | Apex Markets | SQL injection and JWT weaknesses enable protected data access. |
| ZV-005 | High | Apex Markets | XXE, XSS, coupon fraud, broken access control, and exposed hashes expand impact. |

## Remediation Themes

- Remove debug and internal endpoints from public routing.
- Stop storing plaintext passwords and rotate all exposed credentials.
- Make repository access private by default and remove secrets from Git history.
- Enforce strong authentication and MFA for developer systems.
- Fix object-level authorization and role checks server-side.
- Replace weak JWT validation and reject unsigned tokens.
- Add regression tests for every confirmed finding and retest through Verity.

## Evidence Standard

Every confirmed issue should include:

- Command or HTTP request.
- Response proof.
- Authentication context.
- Artifact path.
- Business impact.
- Fix recommendation.
- Retest command.
