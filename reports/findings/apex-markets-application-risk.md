# ZV-004/ZV-005: Apex Markets Application Risk

Severity: High  
Asset: `apex-markets.acme.local`  
Category: injection, auth bypass, broken access control, XSS, fraud

## Scenario

Apex Markets exposed multiple independent application flaws. The highest-impact issues included login SQL injection, weak JWT handling, public configuration and metrics, stored XSS sinks, XXE in legacy upload parsing, coupon manipulation, exposed hashes, and object-level authorization failures.

## Impact

The combined impact is account compromise, fraud, sensitive data exposure, customer-facing abuse, and broader platform risk. Several issues also help attackers move from initial discovery to protected data access.

## Evidence

SQL injection login example:

```bash
curl --noproxy '*' -i -H 'Content-Type: application/json' \
  -d '{"email":"'\'' or 1=1--","password":"x"}' \
  http://apex-markets.acme.local/rest/user/login
```

Observed proof:

```text
HTTP 200
"authentication":{"token":"..."}
```

The full report contains the detailed evidence list for Apex-specific findings.

## Remediation

- Parameterize SQL queries and add regression tests for auth endpoints.
- Reject unsigned JWTs and validate issuer, audience, expiry, and algorithm.
- Enforce server-side ownership checks for orders, reviews, products, and profile actions.
- Disable legacy XML parsing or harden parsers against external entities.
- Move coupon validation server-side.
- Remove public metrics/configuration and sensitive static files.
- Add stored XSS sanitization and output encoding.
