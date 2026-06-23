# ZV-002/ZV-003: DevOps Hub Source And Secret Exposure

Severity: High  
Asset: `devops-hub.acme.local`  
Category: source exposure, secrets management, weak authentication

## Scenario

The DevOps Hub exposed public repositories without authentication. Repository contents and history disclosed internal topology, Vault paths, database credentials, and deploy keys. A weak `developer / developer123` login then proved authenticated repository ownership with admin, pull, and push permissions.

## Impact

This creates a path from external discovery to operational compromise. An attacker can learn internal architecture, reuse credentials, tamper with deployment code, or prepare targeted attacks against internal systems.

## Evidence

```bash
curl --noproxy '*' -sS http://devops-hub.acme.local/api/v1/repos/search?limit=50
git clone http://devops-hub.acme.local/developer/app-config.git
git clone http://devops-hub.acme.local/developer/legacy-deployments.git
```

Observed proof:

```text
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_PASSWORD=p@ssw0rd
VAULT_TOKEN=decoy-readonly-internal-ops-2026q1
-----BEGIN OPENSSH PRIVATE KEY-----
```

Weak account proof:

```bash
curl --noproxy '*' -u developer:developer123 \
  http://devops-hub.acme.local/api/v1/user
```

## Remediation

- Make repositories private by default.
- Remove secrets from current files and Git history.
- Rotate all exposed keys, passwords, tokens, and deploy credentials.
- Enforce strong passwords and MFA for source-control accounts.
- Add branch protection and signed commits for deployment repositories.
