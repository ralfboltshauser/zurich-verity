# Raw Agent Handoff Appendix

This appendix preserves detailed working notes from the lab investigation. It is included for traceability and auditability, not as the primary reader path. Start with the executive summary, technical findings, and full lab assessment before using this appendix.

Date: 2026-06-11

## Workspace

Repo/workspace:

```text
/home/ralf/prj/hackathons/hyperchallenge-zurich-insurance/cyber-challenge/cyber-challenge-pure-codex
```

This is a clean cyber challenge workspace with provider docs, Docker lab wrappers, and a mounted `workspace/` directory for scans, loot, scripts, and notes.

Important local instruction:

- The user accesses services from a Mac over Tailscale.
- Use network-bound previews/proxies.
- Prefer user-facing URLs like `http://ralfs-ubuntu:<port>`.

## Lab State

The Docker SSH tunnel was already running and healthy on host port `8081`.

Validated with:

```bash
./bin/preflight
./bin/lab-compose up -d tunnel
./bin/lab-compose run --rm toolbox lab-test
```

Smoke test result:

- `portal.acme.local` -> HTTP 302 to `/portal/auth`
- `apex-markets.acme.local` -> HTTP 200
- `customer-api.acme.local/openapi.json` -> HTTP 200
- `devops-hub.acme.local` -> HTTP 200

Browser/proxy access from the user's Mac:

```text
HTTP proxy: http://ralfs-ubuntu:8081
```

From host shell, use:

```bash
curl -x http://127.0.0.1:8081 http://customer-api.acme.local/openapi.json
```

## Files Created

Main working report:

```text
workspace/notes/security-assessment-report.md
```

Raw working handoff:

```text
preserved in this appendix
```

Collected OpenAPI and Apex data:

```text
workspace/scans/customer-api-openapi.json
workspace/scans/apex-challenges.json
workspace/scans/apex-main.js
```

Cloned Gitea repos:

```text
workspace/loot/repos/app-config
workspace/loot/repos/infrastructure-scripts
workspace/loot/repos/legacy-deployments
workspace/loot/repos/secrets-rotation-log
```

Downloaded Apex FTP artifacts:

```text
workspace/loot/apex-ftp/acquisitions.md
workspace/loot/apex-ftp/announcement_encrypted.md
workspace/loot/apex-ftp/coupons_2013.md.bak
workspace/loot/apex-ftp/eastere.gg
workspace/loot/apex-ftp/encrypt.pyc
workspace/loot/apex-ftp/incident-support.kdbx
workspace/loot/apex-ftp/legal.md
workspace/loot/apex-ftp/package.json.bak
workspace/loot/apex-ftp/suspicious_errors.yml
```

Docker-local KeePass check:

```text
workspace/scripts/check_kdbx_candidates.py
workspace/scans/docker-kdbx-candidate-check.txt
```

Latest Docker gap probes:

```text
workspace/scripts/customer_api_gap_probe.py
workspace/scans/docker-customer-api-gap-probes.csv
workspace/scripts/apex_gap_probe.py
workspace/scans/docker-apex-gap-probes.csv
workspace/scripts/apex_gap_summarize.py
workspace/scans/docker-apex-gap-evidence-summary.txt
workspace/scripts/portal_credential_probe.py
workspace/scans/docker-portal-credential-probe.csv
workspace/scripts/apex_artifact_probe.py
workspace/scans/docker-apex-artifact-probes.csv
workspace/scripts/apex_artifact_summarize.py
workspace/scans/docker-apex-artifact-evidence-summary.txt
workspace/scripts/apex_remaining_probe.py
workspace/scans/docker-apex-remaining-probes.csv
workspace/scripts/apex_jwt_none_evidence.py
workspace/scans/docker-apex-jwt-none-evidence.txt
workspace/scripts/apex_basket_context_probe.py
workspace/scans/docker-apex-basket-context-probes.csv
workspace/scans/docker-apex-basket-context-summary.txt
workspace/scripts/apex_review_feedback_probe.py
workspace/scans/docker-apex-review-feedback-probes.csv
workspace/scripts/apex_feedback_captcha_probe.py
workspace/scans/docker-apex-feedback-captcha-probes.csv
workspace/scans/docker-apex-feedback-captcha-summary.txt
workspace/scripts/apex_coupon_analysis_probe.py
workspace/scans/docker-apex-coupon-probes.csv
workspace/scans/docker-apex-coupon-summary.txt
workspace/scripts/apex_account_payment_probe.py
workspace/scans/docker-apex-account-payment-probes.csv
workspace/scans/docker-apex-account-payment-summary.txt
workspace/scripts/gitea_anonymous_surface_probe.py
workspace/scans/docker-gitea-anonymous-surface-probes.csv
workspace/scans/docker-gitea-anonymous-surface-summary.txt
workspace/scripts/apex_sqli_deep_probe.py
workspace/scans/docker-apex-sqli-deep-probes.csv
workspace/scans/docker-apex-sqli-deep-summary.txt
workspace/scripts/apex_schema_names.py
workspace/scripts/apex_security_answers_probe.py
workspace/scans/docker-apex-security-answers-probe.csv
workspace/scans/docker-apex-security-answers-summary.txt
workspace/scripts/apex_jwt_chain_probe.py
workspace/scans/docker-apex-jwt-chain-probes.csv
workspace/scans/docker-apex-jwt-chain-summary.txt
workspace/scripts/apex_reset_password_probe.py
workspace/scans/docker-apex-reset-password-probes.csv
workspace/scans/docker-apex-reset-password-summary.txt
workspace/scripts/apex_hash_crack_probe.py
workspace/scans/docker-apex-hash-crack-probes.csv
workspace/scans/docker-apex-hash-crack-summary.txt
workspace/scripts/apex_cracked_login_verify.py
workspace/scans/docker-apex-cracked-login-verify.csv
workspace/scans/docker-apex-cracked-login-verify-summary.txt
workspace/scans/docker-lab-derived-candidates.txt
workspace/scripts/apex_client_exposed_credentials_probe.py
workspace/scans/docker-apex-client-exposed-credentials-probes.csv
workspace/scans/docker-apex-client-exposed-credentials-summary.txt
workspace/scripts/apex_static_exposure_probe.py
workspace/scans/docker-apex-static-exposure-probes.csv
workspace/scans/docker-apex-static-exposure-summary.txt
workspace/scripts/apex_change_password_get_probe.py
workspace/scans/docker-apex-change-password-get-probes.csv
workspace/scans/docker-apex-change-password-get-summary.txt
workspace/scripts/portal_auth_gap_probe.py
workspace/scans/docker-portal-auth-gap-probes.csv
workspace/scans/docker-portal-auth-gap-summary.txt
workspace/scripts/portal_cracked_credential_followup.py
workspace/scans/docker-portal-cracked-credential-followup.csv
workspace/scans/docker-portal-cracked-credential-followup-summary.txt
workspace/scans/docker-portal-session-method-check.txt
```

## Service Inventory

Scoped services from provider docs:

- `http://portal.acme.local/` - Acme Internal Ops Portal
- `http://apex-markets.acme.local/` - Apex Markets, Juice Shop-derived
- `http://customer-api.acme.local/` - Customer API v2, OpenAPI at `/openapi.json`
- `http://devops-hub.acme.local/` - Gitea 1.21.11

Direct internal hosts tested through proxy returned edge error `{"error":"unknown service","hint":"check Host header"}`:

- `vault:8200`
- `vault.acme.internal:8200`
- `openldap:389`
- `dvwa`
- `wiki.acme.internal`
- `fileserver.acme.internal`
- `jumpbox`
- `juice-shop:3000`
- `vampi:5000`
- `vampi:5001`

## Method Used

The approach was deliberately broader than “find three bugs”:

1. Confirmed lab reachability and scoped hostnames.
2. Enumerated Gitea API and cloned every public repo.
3. Searched current files and full Git history for credentials, keys, hostnames, and Vault paths.
4. Downloaded Customer API OpenAPI and enumerated all documented routes.
5. Validated unauthenticated, authenticated, and admin behavior live.
6. Pulled Apex challenge metadata, main JS routes, public files, metrics, config, and auth/API behavior.
7. Recorded both positive and negative checks in the report.

## Confirmed Findings

See `workspace/notes/security-assessment-report.md` for full details. High-level list:

1. **Anonymous Gitea repo access**
   - `GET /api/v1/repos/search?limit=50` exposes four public repos.
   - All repos cloned anonymously.
   - Extended Docker probing confirmed recursive trees, raw reads, archive downloads, subscriber metadata, public settings, Swagger, and wiki routes are reachable anonymously; issues, pull requests, releases, labels, and milestones are empty; package endpoints require auth; collaborator/key/team endpoints did not disclose additional sensitive data. Evidence: `workspace/scans/docker-gitea-extended-surface-summary.txt`.
   - `workspace/loot/wiki-repos` is empty because wiki clone attempts failed for all four repos; `workspace/scans/docker-gitea-noncode-summary.txt` records `wiki_clone=fail` and empty issues/releases for each repo, so there was no additional wiki content to search locally.

2. **Secrets and infrastructure details in repos**
   - `MYSQL_ROOT_PASSWORD=rootpass`
   - `MYSQL_USER=dvwa`
   - `MYSQL_PASSWORD=p@ssw0rd`
   - `VAULT_TOKEN=decoy-readonly-internal-ops-2026q1`
   - `VAULT_ADDR=http://vault:8200`
   - Vault paths such as `secret/data/api-keys` and `kv-v2/internal/prod-ops/master-key`
   - Internal service topology and ports
   - `legacy_deploy_key` in current repo
   - `jumpbox_deploy_key` recoverable from `infrastructure-scripts` Git history commit `fd6c9eed2dc5`

3. **Customer API unauthenticated plaintext credential dump**
   - `GET /api/internal/system/users-dump`
   - Returns `name1/pass1`, `name2/pass2`, `admin/pass1`, emails, and admin flag.

4. **Customer API unauthenticated user enumeration**
   - `GET /users/v1`
   - `GET /users/v1/{username}`

5. **Customer API unauthenticated DB reset/populate**
   - `GET /createdb` returns `Database populated.`

6. **Customer API broken object-level authorization**
   - Login as `name1`.
   - Get live `name2` book title from `GET /books/v1`.
   - `GET /books/v1/<name2-book-title>` with `name1` token returns owner `name2` and secret.
   - Docker matrix rerun after fixing response parsing confirms a seeded `name2` book and a newly created `name1` book are readable by all authenticated contexts tested: `name1`, `name2`, seeded `admin`, mass-assigned admin, and normal disposable user. Unauthenticated reads remained `401`.

7. **Customer API empty user registration**
   - `POST /users/v1/register` with empty username/email/password succeeded.
   - Used `/createdb` afterward to restore seeded data.

8. **Customer API mass-assignment admin registration**
   - `POST /users/v1/register` accepts `admin: true`.
   - A user registered this way returns `"admin": true` from `GET /me`.
   - The latest Docker matrix confirmed the mass-assigned admin can execute admin-only delete.
   - Evidence saved in `workspace/scans/customer-api-deep-probes.csv` and `workspace/scans/docker-customer-api-matrix-probes.csv`.

9. **Customer API cross-user password change**
   - `name1` token can call `PUT /users/v1/name2/password` with `{"password":"newpass"}`.
   - `name2/pass2` then fails and `name2/newpass` succeeds.
   - Customer API was reset afterward with `/createdb`.
   - The latest Docker matrix reconfirmed this from a clean seeded state and separately showed `/users/v1/name2/email` with a `name1` token changes `name1`'s email, not `name2`'s email.

10. **Apex Markets SQL injection admin login**
   - `POST /rest/user/login`
   - Payload:

```json
{"email":"' or 1=1--","password":"x"}
```

   - Returned admin JWT for `admin@apex-markets.example`.

11. **Apex Markets mass-assignment admin creation**
   - `POST /api/Users/` accepted `"role":"admin"`.
   - Created `test-admin@example.com` as admin.

12. **Apex Markets broken access control**
   - Newly registered normal customer token could read:
     - `GET /rest/basket/1`
     - `GET /rest/basket/2`
     - `GET /api/Users`
   - `/api/Users` includes emails, roles, last login IPs, profile paths, and deluxe tokens.

13. **Apex Markets public indexed FTP**
   - `GET /ftp` lists sensitive artifacts.
   - `/robots.txt` disallows `/ftp`, making it easy to discover.

14. **Apex Markets file-extension filter bypass**
   - Non-allowed extensions return 403 directly.
   - Appending `%2500.md` bypasses:
     - `/ftp/eastere.gg%2500.md`
     - `/ftp/suspicious_errors.yml%2500.md`
     - `/ftp/incident-support.kdbx%2500.md`

15. **Apex Markets public Prometheus metrics**
   - `GET /metrics`

16. **Apex Markets public admin config**
   - `GET /rest/admin/application-configuration`
   - Exposes server/app config, OAuth client/redirect allowlist, product list, challenge settings.

17. **Apex Markets verbose stack traces**
   - Examples:
     - `/api/`
     - `/api/version`
     - `/rest/user/login` malformed/incorrect method
     - `/ftp/eastere.gg`
     - `/rest/track-order/'`

18. **Apex Markets open redirect to allowlisted legacy crypto address**
   - `/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm`
   - Returns `302 Found`.

19. **Apex Markets weak announcement encryption**
   - `encrypt.pyc` decompiled as Python 2.7 bytecode.
   - Decompiled source saved at `workspace/scans/encrypt_decompiled.py`.
   - It performs deterministic raw RSA per character:
     `pow(ord(char), 65537, N)`.
   - `announcement_encrypted.md` was decrypted by precomputing all 256 byte values.
   - Plaintext saved at `workspace/loot/apex-ftp/announcement_decrypted.md`.
   - Revealed hidden SPA route: `/#/tokensale-ico-ea`.

20. **Apex Markets CAPTCHA answer disclosure**
   - Docker-authenticated request to `/rest/captcha` returned both challenge and answer.
   - Evidence: `workspace/scans/docker-apex-auth-critical-probes.csv`.

21. **Apex Markets password hash disclosure**
   - Docker-authenticated request to `/rest/saveLoginIp` returned the caller user object including `password:"05827d098bccfd3d461ef56a18329d56"`.
   - Evidence: `workspace/scans/docker-apex-auth-critical-probes.csv`.

22. **Apex Markets product search SQL injection credential dump**
   - `GET /rest/products/search?q=...` accepted a UNION payload.
   - The payload extracted user rows into product fields.
   - Evidence summary:
     - `product_search_union_sqli_status=200`
     - `product_search_union_sqli_user_rows=19`
     - `product_search_union_sqli_first_email=admin@apex-markets.example`
     - `product_search_union_sqli_first_hash=0192023a7bbd73250516f069df18b500`
     - `product_search_union_sqli_first_role=admin`
   - Evidence: `workspace/scans/docker-apex-gap-probes.csv` and `workspace/scans/docker-apex-gap-evidence-summary.txt`.

23. **Apex Markets public memories expose embedded user records**
   - Unauthenticated `GET /rest/memories` returned nested `User` objects.
   - Evidence includes `bjoern@owasp.org`, password hash `9283f1b2e9669749081963be0462e466`, and a 64-byte deluxe token.
   - Follow-up memory encoding probe confirmed the same public record exposes caption `😼 #zatschi #whoneedsfourlegs`, profile image `assets/public/images/uploads/13.jpg`, and API image path `assets/public/images/uploads/ᓚᘏᗢ-#zatschi-#whoneedsfourlegs-1572600969477.jpg`. The fully percent-encoded path returns `image/jpeg`, while preserving raw `#` delimiters returns the SPA shell. Evidence: `workspace/scans/docker-apex-memory-encoding-summary.txt` and `workspace/scans/docker-apex-memory-encoding-probes.csv`.
   - Evidence: `workspace/scans/docker-apex-gap-evidence-summary.txt`.

24. **Apex Markets reset questions are enumerable without authentication**
   - Unauthenticated `GET /rest/user/security-question?email=admin%40apex-markets.example` returned `Mother's maiden name?`.
   - Evidence: `workspace/scans/docker-apex-gap-evidence-summary.txt`.

25. **Apex Markets low-privilege users can read authentication details for all accounts**
   - Authenticated request to `/rest/user/authentication-details/` returned 26 user records to a non-admin context.
   - Fields include email, role, deluxeToken, TOTP field, profile image, last login time, account state, and masked password.
   - Evidence: `workspace/scans/docker-apex-gap-probes.csv` and `workspace/scans/docker-apex-gap-evidence-summary.txt`.

26. **Apex Markets complaint creation accepts forged UserId**
   - A normal Apex customer token submitted `POST /api/Complaints/` with `{"message":"artifact probe","UserId":1}`.
   - API returned `201` and persisted/echoed `UserId:1`.
   - Evidence: `workspace/scans/docker-apex-artifact-probes.csv`.

27. **Apex Markets exposes hidden private assets and dependency inventory**
   - Hidden route from `eastere.gg` returned `200` and references `/assets/private/three.js` and `/assets/private/OrbitControls.js`.
   - Both private assets are directly retrievable.
   - `package.json.bak` discloses old dependencies including `express-jwt: 0.1.3`, `js-yaml: 3.10`, `libxmljs: ~0.18`, `sanitize-html: 1.4.2`, and `sqlite3: ~3.1.13`.
   - Later Docker-local dependency/supply-chain audit parsed `package.json.bak`: 39 runtime deps, 35 dev deps, 10 locally interesting dependencies mapped to already proven exploit classes (`express-jwt`, `libxmljs`, `marsdb`, `z85`, `serve-index`, etc.). Bounded typo near-miss checks found 0 hits, so no new typosquatting finding was claimed from local evidence.
   - Evidence: `workspace/scans/docker-apex-artifact-evidence-summary.txt`.

28. **Apex Markets accepts unsigned JWTs**
   - Generated a JWT with `{"alg":"none","typ":"JWT"}`, admin-like payload, and no signature.
   - Protected endpoints accepted it:
     - `api_users_status=200`
     - `api_users_contains_admin=True`
     - `authentication_details_status=200`
     - `authentication_details_contains_admin=True`
   - Evidence: `workspace/scans/docker-apex-jwt-none-evidence.txt`.

29. **Apex Markets accepts negative basket quantities**
   - Fresh customer login returned `bid=6`.
   - `POST /api/BasketItems/` with `{"ProductId":2,"BasketId":6,"quantity":-50}` returned `200`.
   - Checkout on the same basket returned an order confirmation.
   - Evidence: `workspace/scans/docker-apex-basket-context-probes.csv` and `workspace/scans/docker-apex-basket-context-summary.txt`.

30. **Apex Markets product reviews can be modified or forged by low-privilege users**
   - Low-privilege user patched an existing admin-authored review to message `isolated patch`.
   - Low-privilege user created a review with `author:"admin@apex-markets.example"`.
   - Evidence: `workspace/scans/docker-apex-review-feedback-probes.csv`.

31. **Apex Markets feedback accepts zero ratings and forged UserId**
   - With valid CAPTCHA fields from `/rest/captcha`, `POST /api/Feedbacks/` accepted `rating:0`.
   - With valid CAPTCHA fields, it also accepted `UserId:1` in the request body.
   - Evidence: `workspace/scans/docker-apex-feedback-captcha-probes.csv` and `workspace/scans/docker-apex-feedback-captcha-summary.txt`.

32. **Apex Markets grants deluxe membership for free payment mode**
   - `POST /rest/deluxe-membership` with `{"paymentMode":"free","paymentId":"free"}` returned `200`.
   - Response confirmation: `Congratulations! You are now a deluxe member!`
   - Returned token had deluxe role for the test customer.
   - Evidence: `workspace/scans/docker-apex-account-payment-summary.txt`.

33. **Apex Markets exposes 2FA setup secrets and setup tokens**
   - Authenticated `GET /rest/2fa/status` returned `secret:"ARDVAETNFNYGIMDG"` and a `setupToken`.
   - Evidence: `workspace/scans/docker-apex-account-payment-summary.txt`.

34. **Apex Markets product-search SQLi exposes broader DB contents**
   - UNION SQLi in `/rest/products/search?q=` extracted schema, users, cards, addresses, security questions, and security-answer hashes.
   - Example table data includes full saved card numbers, physical addresses/phone numbers, and account-recovery answer hashes.
   - Evidence:
     - `workspace/scans/docker-apex-sqli-deep-summary.txt`
     - `workspace/scans/docker-apex-security-answers-summary.txt`

## Negative Checks / Non-Findings So Far

- Portal login did not accept reused Customer API credentials:
  - `admin/pass1`
  - `name1/pass1`
  - `developer/pass1`
  - `dvwa/p@ssw0rd`
  - `admin/password`
  - `admin/admin`
- Basic portal SQLi payloads did not bypass login:
  - `' OR '1'='1`
  - `admin'--`
  - `' OR 1=1--`
  - `ops' OR '1'='1`
- Customer API admin-only delete rejected a normal `name1` token.
- Customer API email update with `name1` token against `/users/v1/name2/email` changed the authenticated user rather than `name2`; odd behavior, but not counted as cross-user modification.
- Customer API JWT `alg:none` and a small set of common HMAC secrets failed against `/me`.
- KeePass quick candidate opening via `pykeepass` failed for 182 artifact-derived/common candidates.
- Docker-local KeePass parsing/checking used `workspace/scripts/check_kdbx_candidates.py`. It identified KDBX3, AES-CBC, gzip compression, and `transform_rounds=1`. The checker now uses Python `ctypes` against the toolbox image's local `libcrypto` for AES and was validated against OpenSSL for AES-256-ECB and AES-256-CBC behavior. The latest rerun tested 3,023,421 focused, lab-derived, and refreshed incremental evidence-derived candidates. None opened `incident-support.kdbx`. Evidence: `workspace/scans/docker-kdbx-candidate-check.txt`, `workspace/scans/docker-kdbx-incremental-check.txt`, and `workspace/scans/docker-kdbx-incremental-check-rerun.txt`; candidate files: `workspace/scans/docker-kdbx-focused-candidates.txt`, `workspace/scans/docker-lab-derived-candidates.txt`, and `workspace/scans/docker-kdbx-incremental-candidates.txt`.
- Portal path probing was reproduced inside Docker: `workspace/scans/docker-portal-path-probe.csv`.
- Targeted portal credential probing was reproduced inside Docker: `workspace/scans/docker-portal-credential-probe.csv`. It tested 99 lab-derived username/password combinations and found 0 successful logins.
- Apex extracted-route probing was reproduced inside Docker: `workspace/scans/docker-apex-extracted-path-probe.csv`.
- Critical Customer API findings were reproduced inside Docker: `workspace/scans/docker-customer-api-critical-probes.csv`.
- Customer API gap probing found `/users/v1/_debug` returns 404 live despite being in OpenAPI, unauthenticated book creation is rejected, normal user delete is rejected, admin delete works, and `/users/v1/name2/email` with a `name1` token changes the authenticated user's email rather than `name2`. Evidence: `workspace/scans/docker-customer-api-gap-probes.csv`.
- Customer API parser/injection edge probing is complete. Docker-only tests reset the API, then checked login SQLi/object/array/SSTI payloads, form content-type login/register variants, path-parameter SQLi/SSTI/wildcard payloads for user and book routes, and stored book-title/secret edge values. It ended with `/createdb`. No SQLi auth bypass, backend error leak, template evaluation, wildcard book exfiltration, or parser content-type bypass was observed. Evidence: `workspace/scans/docker-customer-api-injection-edge-summary.txt` and `workspace/scans/docker-customer-api-injection-edge-probes.csv`.
- Apex gap probing found new data exposure and injection findings listed above. Evidence: `workspace/scans/docker-apex-gap-probes.csv` and `workspace/scans/docker-apex-gap-evidence-summary.txt`.
- Apex artifact probing covered `/file-upload`, `/api/Complaints/`, `/rest/user/data-export`, `/rest/user/erasure-request`, reviews, and the hidden easter path. The original `/file-upload` artifact probe already showed XML/YAML are parsed before the deprecated `410` error is returned, including `file:///etc/hostname` XXE expansion. Data export ignored the requested admin email and exported the authenticated user. A later Docker-only disposable owner/victim GDPR matrix tested data-export body, query, form, and GET variants with victim/admin emails; all successful exports still returned the authenticated owner email, and erasure path candidates did not delete either disposable account. Evidence: `workspace/scans/docker-apex-artifact-probes.csv`, `workspace/scans/docker-apex-gdpr-export-erasure-summary.txt`, and `workspace/scans/docker-apex-gdpr-export-erasure-probes.csv`.
- Apex remaining-class probing covered unsigned JWTs, basket item creation, coupon candidates, checkout, reviews, and feedback. Unsigned JWT was confirmed. Basket writes to basket `1` returned `Invalid BasketId`; coupon candidates from `coupons_2013.md.bak` returned `Invalid coupon`; checkout returned an insufficient-wallet stack trace; review/feedback endpoints returned `502` during that run and should be retested separately before any finding is claimed. Evidence: `workspace/scans/docker-apex-remaining-probes.csv`.
- Apex basket context probing fixed the earlier hardcoded-basket limitation by using the login `bid`. Negative quantities and checkout were confirmed. Evidence: `workspace/scans/docker-apex-basket-context-summary.txt`.
- Apex review/feedback isolation showed feedback POSTs without CAPTCHA fields return verbose 500 stack traces, while review patch/forged-author operations succeed. Evidence: `workspace/scans/docker-apex-review-feedback-probes.csv`.
- Apex review-like race probing is complete and documented as F-59. A sequential duplicate like had previously returned `403`, but a Docker-only concurrent probe created a disposable review `tchWTLgqWNT2gHrfq` with marker `review-like-race-1781188207873` and sent 12 simultaneous likes from `race-liker-1781188207347@example.com`; all 12 returned `200`, final `likesCount=12`, and the same liker email appeared 12 times in `likedBy`. Lab-state note: disposable users `race-owner-1781188206797@example.com` and `race-liker-1781188207347@example.com` plus that inflated review remain in Apex state. Evidence: `workspace/scans/docker-apex-review-like-race-summary.txt` and `workspace/scans/docker-apex-review-like-race-probes.csv`.
- Apex feedback/CAPTCHA probing confirmed zero-star feedback and feedback `UserId` mass assignment when valid disclosed CAPTCHA fields are supplied. Bulk CAPTCHA follow-up requested fresh disclosed CAPTCHA answers and submitted 12 feedback records in 6.497 seconds; all 12 were accepted and retrievable afterward. This is F-58. Lab-state note: records with marker `bulk-captcha-probe-1781187976-*` and IDs 19-30 were added. A follow-up public feedback probe found an unauthenticated 12-word Web3 wallet phrase in seeded feedback tied to `/juicy-nft`: `purpose betray marriage blame crunch monitor spin slide donate sport lift clutch`. This is F-48. It was not escalated into external on-chain activity because that would leave the lab. Evidence: `workspace/scans/docker-apex-feedback-captcha-summary.txt`, `workspace/scans/docker-apex-captcha-bulk-feedback-summary.txt`, `workspace/scans/docker-apex-captcha-bulk-feedback-probes.csv`, `workspace/scans/docker-apex-public-wallet-seed-summary.txt`, and `workspace/scans/docker-apex-public-wallet-seed-probes.csv`.
- Coupon backup analysis decoded `coupons_2013.md.bak` as Z85: `JAN13-10`, `FEB13-10`, ..., `DEC13-15`. Raw, decoded, and small obvious 2013 variants were rejected for a fresh basket. Evidence: `workspace/scans/docker-apex-coupon-summary.txt`.
- Coupon checkout follow-up is complete for expired client-side campaign couponData. Frontend review showed `couponDetails` is stored as `<couponCode>-<clientDate>` and checkout sends `btoa(couponDetails)`. Docker probing confirmed `POST /rest/basket/:id/checkout` trusts this base64 `couponData`: normal positive card orders with `ORANGE2023-1683154800000` and `ORANGE2020-1588546800000` got promotional amounts `1.59` and `1.99`, while empty and `NOTREAL-1683154800000` stayed at `0`. This is F-46. Follow-up Z85 derivation showed the chatbot coupon `n(XRwhz3Tq` decodes to `JUN26-10`; encoding `JUN26-80` and `JUN26-99` produced accepted forged codes with 80% and 99% discounts, and checkout applied the 99% coupon to a normal positive card order. This is F-56. Evidence: `workspace/scans/docker-apex-checkout-coupondata-summary.txt`, `workspace/scans/docker-apex-checkout-coupondata-probes.csv`, `workspace/scans/docker-apex-coupondata-positive-checkout-summary.txt`, `workspace/scans/docker-apex-coupondata-positive-checkout-probes.csv`, `workspace/scans/docker-apex-forged-coupon-summary.txt`, `workspace/scans/docker-apex-forged-coupon-probes.csv`, `workspace/scans/docker-apex-forged-coupon-checkout-summary.txt`, and `workspace/scans/docker-apex-forged-coupon-checkout-probes.csv`.
- Chatbot coupon follow-up is complete. The first Docker conversation probe showed `setname` returns a replacement JWT, and the corrected run used that token before issuing coupon prompts. Authenticated admin and deluxe contexts disclosed `n(XRwhz3Tq` as a 10% coupon after simple prompting. A separate Docker redemption probe confirmed `PUT /rest/basket/:id/coupon/n%28XRwhz3Tq` returns `{"discount":10}` and a normal checkout records `promotionalAmount "0.40"`. This is F-47. Evidence: `workspace/scans/docker-apex-chatbot-conversation-summary.txt`, `workspace/scans/docker-apex-chatbot-conversation-probes.csv`, `workspace/scans/docker-apex-chatbot-coupon-redeem-summary.txt`, and `workspace/scans/docker-apex-chatbot-coupon-redeem-probes.csv`.
- Arbitrary file-write follow-up tried traversal/null-byte filenames against `/file-upload` and checked `/ftp/legal.md` before and after each attempt. The marker never appeared in `legal.md` and the baseline content was unchanged, so no overwrite/retrieval path was proven. Evidence: `workspace/scans/docker-apex-arbitrary-file-write-summary.txt` and `workspace/scans/docker-apex-arbitrary-file-write-probes.csv`.
- SSRF follow-up for `/rest/track-order/:id` used lab-only targets: Apex, Customer API, DevOps Hub, loopback Apex ports, and `file:///etc/passwd`. Encoded URLs were reflected as order IDs rather than fetched; unencoded slash variants produced existing-style Angular route stack traces. No SSRF impact was proven. Evidence: `workspace/scans/docker-apex-ssrf-track-order-summary.txt` and `workspace/scans/docker-apex-ssrf-track-order-probes.csv`.
- Accounting order-history follow-up is complete and documented as F-60. A Docker-only probe created two disposable orders (`f854-50a3b0fdbac7ba88` and `419e-db71e468aecad4fe`) and tested `/rest/order-history/orders`. Unauthenticated, normal customer, and legitimate admin contexts returned `403 Malicious activity detected`, while a forged unsigned `alg:none` JWT with role `accounting` for `acc0unt4nt@apex-markets.example` returned `200` and bulk order data containing both disposable orders plus existing order `45f6-d460aa07d19d5d1f`. The same forged accounting token got `200 {"status":"success"}` from `PUT /rest/order-history/419e-db71e468aecad4fe/delivery-status`, though an immediate public track read still showed `delivered:false`. Evidence: `workspace/scans/docker-apex-accounting-order-history-summary.txt` and `workspace/scans/docker-apex-accounting-order-history-probes.csv`.
- Deleted/unlisted product checkout is complete and documented as F-61. Docker SQLi enumeration showed product `10` is deleted `Christmas Super-Surprise-Box (2014 Edition)` and product `11` is deleted `Rippertuer Special Juice`; public `/api/Products` omitted both and direct `/api/Products/10` plus `/api/Products/11` returned `404`. A disposable customer `deleted-product-1781189730656@example.com` added both raw ProductIds to basket `70`; `/api/BasketItems/` returned `200` for each, checkout returned order `60dd-a32bef2817cf015d`, and `/rest/order-history` contained both deleted products. Lab-state note: basket items `56` and `57`, saved card/address records `27`, and order `60dd-a32bef2817cf015d` remain. Evidence: `workspace/scans/docker-apex-deleted-product-checkout-summary.txt`, `workspace/scans/docker-apex-deleted-product-checkout-probes.csv`, and `workspace/scripts/apex_deleted_product_checkout_probe.py`.
- Recycle pickup BOLA is complete and documented as F-62. A Docker-only generated API table coverage matrix tested 21 endpoint names across unauthenticated, customer, and admin contexts. Follow-up unauthenticated enumeration of `/api/Recycles/1..15` exposed 11 recycle pickup records by predictable ID, including seeded `UserId`, `AddressId`, pickup date, pickup flag, and quantity. Referenced address IDs `1,2,3,4,6` were checked through unauthenticated `/api/Addresses/:id` and `/rest/user/address/:id`; those returned Angular-route stack traces rather than full address data, so impact is bounded to recycle metadata and internal user/address linkage. Evidence: `workspace/scans/docker-apex-generated-api-table-coverage-summary.txt`, `workspace/scans/docker-apex-generated-api-table-coverage-probes.csv`, `workspace/scans/docker-apex-recycles-bola-summary.txt`, `workspace/scans/docker-apex-recycles-bola-probes.csv`, `workspace/scripts/apex_generated_api_table_coverage_probe.py`, and `workspace/scripts/apex_recycles_bola_probe.py`.
- Legacy profile CSRF is complete and documented as F-63. Docker-authenticated fetch of `/profile` with a disposable token cookie recovered a legacy HTML form `POST ./profile` with `name="username"` and no CSRF token. Exact cross-origin form POST with only a `token` cookie changed disposable user `legacy-profile-csrf-1781191542186@example.com` from empty username to `legacy-profile-csrf-1781191542186`; Authorization-header-only control returned a blocked illegal-activity `500` and did not change the username. Caveat: `/rest/user/login` did not set `Set-Cookie` in this probe, so the proven issue is exploitable when a valid token cookie is present. Evidence: `workspace/scans/docker-apex-legacy-profile-csrf-form-summary.txt`, `workspace/scans/docker-apex-legacy-profile-csrf-form-probes.csv`, `workspace/scans/apex-profile-page/profile-cookie.html`, `workspace/scans/apex-profile-page/profile-fetch-summary.txt`, `workspace/scripts/apex_fetch_profile_assets.py`, and `workspace/scripts/apex_legacy_profile_csrf_form_probe.py`.
- Legacy profile image URL probing is complete as negative SSRF/LFR coverage. A disposable user `profile-image-url-1781191830256@example.com` exercised `POST /profile/image/url` with same-origin Apex, Customer API, DevOps Hub, and `file://` payloads using the legacy token cookie form flow. HTTP URLs were stored exactly in `profileImage` and rendered back as `<img src>`, but no server-side response body was fetched or stored; `file:///etc/hostname` and `file:///etc/passwd` returned invalid-URI `500` errors and left the prior image URL unchanged. Evidence: `workspace/scans/docker-apex-profile-image-url-summary.txt`, `workspace/scans/docker-apex-profile-image-url-probes.csv`, and `workspace/scripts/apex_profile_image_url_probe.py`.
- Apex account/payment probing covered 2FA status/setup/disable, deluxe upgrade modes, saved address creation, saved card creation, and wallet balance. Free deluxe upgrade was accepted. Address/card `UserId` mass assignment was not accepted; API stored the authenticated user ID. Card creation echoed full submitted card number, while later GET masked it. Evidence: `workspace/scans/docker-apex-account-payment-summary.txt`.
- Apex cookie-auth/CSRF profile probing showed `/rest/user/whoami` and legacy `/profile` honor a frontend-set `token` cookie, but Authorization-protected JSON APIs still require the header. Cookie-only password change failed. The first `/profile` username/name/user probes missed the exact legacy form content type, but the later exact form probe proved F-63: cross-origin form POST with token cookie changes username. Evidence: `workspace/scans/docker-apex-cookie-csrf-summary.txt`, `workspace/scans/docker-apex-profile-csrf-summary.txt`, and `workspace/scans/docker-apex-legacy-profile-csrf-form-summary.txt`.
- Apex user-record write-side BOLA probing used disposable attacker/victim accounts. The attacker could read `GET /api/Users/:victim_id` as already covered by F-12, but `PUT` and `DELETE` were rejected with `401`, and `PATCH` hit the SPA error path. No cross-user user-record write/delete was proven. Evidence: `workspace/scans/docker-apex-user-record-bola-summary.txt`.
- Apex SQLi deep probing expanded the known product-search SQLi from user hashes to schema, payment cards, addresses, security questions, and account-recovery answer hashes. A direct user/security-answer join returned 500, but separate table dumps succeeded. Evidence: `workspace/scans/docker-apex-sqli-deep-summary.txt` and `workspace/scans/docker-apex-security-answers-summary.txt`.
- Apex unsigned JWT route-matrix probing showed `alg:none` tokens are accepted by `/api/Users` and `/rest/user/authentication-details/` for admin/Jim/Bjoern-shaped payloads, but rejected by several more stateful account/payment routes. `/rest/order-history` returns a verbose 500 illegal-activity stack trace. Evidence: `workspace/scans/docker-apex-jwt-chain-probes.csv`.
- Apex password-reset probing now uses the actual frontend registration sequence: `POST /api/Users/`, then `POST /api/SecurityAnswers/`. With a disposable user, SQLi extracted a 64-character stored recovery-answer hash. Reset rejected the leaked hash and the locally computed SHA-256 with `401`, but accepted the plaintext answer and the new password then logged in successfully. A later Docker follow-up dumped 20 live Apex security-answer SHA-256 hashes through separate SQLi table reads and tested 3,024,811 current lab-derived candidates; none matched. Evidence: `workspace/scans/docker-apex-reset-password-summary.txt`, `workspace/scans/docker-apex-security-answer-crack-followup-summary.txt`, and `workspace/scans/docker-apex-security-answer-crack-followup.csv`.
- Apex hash cracking used SQLi-dumped user MD5 hashes and security-answer SHA-256 hashes plus a local lab-derived candidate set. It cracked 6 of 29 user hashes and 0 of 21 security-answer hashes in the original run; the later focused recovery-answer follow-up also cracked 0 of 20 current live answer hashes. Confirmed valid logins:
  - `admin@apex-markets.example / admin123` -> role `admin`
  - `testing@apex-markets.example / IamUsedForTesting` -> role `admin`
  - `ethereum@apex-markets.example / private` -> role `deluxe`
  Evidence: `workspace/scans/docker-apex-hash-crack-summary.txt` and `workspace/scans/docker-apex-cracked-login-verify-summary.txt`.
- Apex client bundle hardcodes `testing@juice-sh.op / IamUsedForTesting`. The literal upstream-style email is rejected in this lab, but the same password works for `testing@apex-markets.example` and returns role `admin`. Evidence: `workspace/scans/docker-apex-client-exposed-credentials-summary.txt`.
- Apex static exposure probing covered FTP artifacts, hidden/private assets, language candidates, and access-log candidates. New distinct exposure: `/assets/i18n/tlh_AA.json` is public and returns the hidden Klingon language file. HTTP access-log candidates returned SPA fallback HTML, not logs, and a later XXE log-path matrix did not recover log content. Evidence: `workspace/scans/docker-apex-static-exposure-summary.txt` and `workspace/scans/docker-apex-xxe-log-path-summary.txt`.
- Apex password-change behavior was verified with a disposable account. `/rest/user/change-password` is a GET request with `current`, `new`, and `repeat` passwords in the query string; old login failed and new login succeeded after the request. Evidence: `workspace/scans/docker-apex-change-password-get-summary.txt`.
- Apex XSS sink probing confirmed raw iframe JavaScript payload storage in product reviews, complaints, and Photo Wall memory captions. The first probe submitted `<iframe src="javascript:alert(`codex-xss-1781179925`)">`; `/rest/products/1/reviews` returned it as a stored review `message`, and both `POST /api/Complaints/` plus low-privilege `GET /api/Complaints` returned it as a stored complaint `message`. `/api/Feedbacks/` sanitized the same payload to an empty comment. A follow-up Photo Wall probe uploaded a tiny PNG with caption `<iframe src="javascript:alert(`codex-photo-1781180328`)">`; authenticated `POST /rest/memories` stored it and public `GET /rest/memories/` returned it. Unauthenticated memory upload was rejected with `401`, SVG upload was rejected with `Invalid mime type`, and a PNG-magic `photo.php` upload was stored as a `.png` path, publicly retrievable, and served as `image/png`, not executed in the tested path. Evidence: `workspace/scans/docker-apex-xss-sink-summary.txt`, `workspace/scans/docker-apex-xss-sink-probes.csv`, `workspace/scans/docker-apex-photo-wall-summary.txt`, `workspace/scans/docker-apex-photo-wall-probes.csv`, and `workspace/scans/docker-apex-photo-wall-file-fetch-summary.txt`.
- Chatbot-name/username XSS follow-up used fresh accounts and `<iframe>`, `<img onerror>`, `<svg onload>`, quote-breakout, and plain markers through `/rest/chatbot/respond` action `setname`. The field stored only mangled fragments such as `rc=x onerror=...>` or `nload=...>` rather than complete executable tags; the plain marker stored exactly. No additional username XSS finding was claimed. Evidence: `workspace/scans/docker-apex-username-xss-summary.txt`, `workspace/scans/docker-apex-username-xss-probes.csv`, `workspace/scans/docker-apex-username-xss-variant-summary.txt`, and `workspace/scans/docker-apex-username-xss-variant-probes.csv`.
- Apex misc/generated route coverage includes the original helper matrix across `Deliverys`, `Quantitys`, `Recycles`, `country-mapping`, `image-captcha`, `languages`, `whoami`, continue-code, repeat-notification, track-order, and basket helpers plus a later complete table-backed generated API matrix across 21 endpoint names. It found public quantity/delivery metadata, unauthenticated `/rest/continue-code`, and the F-62 recycle-record BOLA. Most other sensitive generated endpoints required auth, returned existing verbose SPA errors, or were already covered as public products/challenges/feedback/security-question behavior. A reversible delivery-method mutation follow-up fetched `/api/Deliverys/1`, tried `PUT /api/Deliverys/1` with a marker as unauthenticated, customer, and admin contexts, and verified final state: all PUTs returned existing SPA stack traces, `mutation_success_contexts=none`, and `final_has_marker=False`. Evidence: `workspace/scans/docker-apex-misc-route-matrix-summary.txt`, `workspace/scans/docker-apex-generated-api-table-coverage-summary.txt`, `workspace/scans/docker-apex-recycles-bola-summary.txt`, `workspace/scans/docker-apex-delivery-mutation-summary.txt`, and `workspace/scans/docker-apex-delivery-mutation-probes.csv`.
- Product/quantity generated-API mutation follow-up is complete. Unauthenticated `PUT /api/Products/1` changed the product description to include marker `codex-prodqty-1781184195398`; unauthenticated follow-up `GET /api/Products/1` showed the marker persisted. The probe restored the product through admin `PUT` and confirmed the marker was gone. This is F-49. In the same run, `/api/Quantitys/1` `PUT`, `PATCH`, and `GET` returned `403 {"error":"Malicious activity detected"}` for unauthenticated, customer, and admin contexts, so no quantity tampering was claimed. Evidence: `workspace/scans/docker-apex-product-quantity-mutation-summary.txt` and `workspace/scans/docker-apex-product-quantity-mutation-probes.csv`.
- Generated API synthetic-record mutation follow-up tested `Deliverys`, `SecurityQuestions`, and `Recycles` with unauthenticated, customer, and admin contexts. `Deliverys` POST returned verbose Angular-route `500` stack traces; `SecurityQuestions` POST was blocked with authorization/token errors; unauthenticated `Recycles` POST was `401`; authenticated customer/admin `Recycles` POST created null-owner synthetic rows ids `10` and `11`. Recycles PUT/DELETE cleanup attempts returned `401 invalid_token`, and a follow-up GET confirmed ids `10` and `11` remained retrievable. This is recorded as coverage/lab-state nuance, not a new standalone finding beyond the existing Recycles note. Evidence: `workspace/scans/docker-apex-generated-api-mutation-summary.txt` and `workspace/scans/docker-apex-generated-api-mutation-probes.csv`.
- Track-order NoSQL/operator probing is complete. The Docker script created two disposable accounts/orders, then tested valid, invalid, encoded JSON/operator, bracket, query-string, and POST body shapes against `/rest/track-order`. Operator payloads such as `{"$ne":null}`, `{"$regex":".*"}`, nested `{"orderId":{"$ne":null}}`, bracket forms, and query/body variants were reflected as literal order IDs or returned `500`; no multi-order NoSQL exfiltration was proven. The same run confirmed a separate BOLA finding: unauthenticated requests and user A's token can retrieve user B's full tracking details by valid order ID. This is F-50. Evidence: `workspace/scans/docker-apex-track-order-nosql-summary.txt` and `workspace/scans/docker-apex-track-order-nosql-probes.csv`.
- Continue-code apply probing is complete. The frontend service shows `GET /rest/continue-code` and `PUT /rest/continue-code/apply/:code`. Docker probing confirmed unauthenticated `GET /rest/continue-code` returns `REw3bOxm9248vVA65TYf4S1nul6hDOtnJfXrSBBuM6coQ0jWKnoaJqPpLyrk`, and unauthenticated `PUT /rest/continue-code/apply/<code>` returns `{"data":"11 solved challenges have been restored."}`. Customer/admin contexts return the same success. Invalid/prefix/URL-like codes return `404`. Read-only follow-up showed 11 challenges marked solved after restore. This is F-51 as a low-severity score/progress integrity issue. `findIt`/`fixIt` code endpoints returned empty code in this lab state, and empty apply variants produced verbose `500` route errors. Evidence: `workspace/scans/docker-apex-continue-code-apply-summary.txt` and `workspace/scans/docker-apex-continue-code-apply-probes.csv`.
- Apex Web3 endpoint matrix extracted the frontend service endpoints `/rest/web3/nftUnlocked`, `/rest/web3/nftMintListen`, `/rest/web3/submitKey`, `/rest/web3/walletNFTVerify`, and `/rest/web3/walletExploitAddress`. Docker probing confirmed unauthenticated `GET /rest/web3/nftMintListen` returns `{"success":true,"message":"Event Listener Created"}`. A separate follow-up, run without first calling `nftMintListen`, showed unauthenticated `POST /rest/web3/walletExploitAddress` with `{}` also returns the same success. Malformed/dummy Web3 POSTs to `walletExploitAddress`, `walletNFTVerify`, and `submitKey` returned proxy `502` responses instead of clean validation; known non-Web3 Apex routes still responded normally afterward. This is now F-40 as a low-severity unauthenticated listener/control exposure; no wallet takeover or on-chain state change was proven. Evidence: `workspace/scans/docker-apex-web3-endpoint-matrix-summary.txt`, `workspace/scans/docker-apex-web3-endpoint-matrix-probes.csv`, and `workspace/scans/docker-apex-web3-post-followup.txt`.
- Cross-service CORS probing used `Origin: https://attacker.example` against sensitive Portal, Customer API, Apex, and Gitea endpoints. Apex returned `Access-Control-Allow-Origin: *` on `GET /rest/admin/application-configuration`, `GET /rest/memories`, and `GET /rest/captcha`; Apex OPTIONS also allowed `GET,HEAD,PUT,PATCH,POST,DELETE` and `authorization,content-type`. This is now F-42 because arbitrary websites can browser-read Apex's exposed admin config, CAPTCHA answers, and memory/user-hash data. Portal, Customer API, and Gitea did not return permissive CORS headers on the tested sensitive endpoints. Evidence: `workspace/scans/docker-cors-matrix-summary.txt` and `workspace/scans/docker-cors-matrix.csv`.
- Apex HTTP header XSS/storage probing is complete for `/rest/saveLoginIp`. Docker probing with marker `codex-header-xss-1781181714` showed only `True-Client-IP` is stored verbatim as `lastLoginIp`; `X-Forwarded-For`, `X-Real-IP`, `Forwarded`, and `User-Agent` did not persist the payload. The stored iframe JavaScript payload reappeared in the immediate save response and in authenticated `/rest/user/authentication-details/` plus `/api/Users` reads. This is now F-43; API storage is proven, while browser execution depends on a frontend/admin view rendering `lastLoginIp` without escaping. Evidence: `workspace/scans/docker-apex-header-xss-summary.txt` and `workspace/scans/docker-apex-header-xss-probes.csv`.
- Apex file-handling follow-up is complete for the non-destructive upload cases. Docker probing confirmed unauthenticated XXE through `POST /file-upload`: `file:///etc/passwd` was expanded and reflected in the deprecated-interface `410` error page, and authenticated `file:///etc/hostname` still expands. This is now F-44. The same run showed `invoice.pdf.php` and a 110 KB PDF both returned `204`, documented as F-45 type/size validation bypass; no execution/retrieval/overwrite path was proven. YAML `!!js/regexp` and anchor payloads were parsed/reflected but did not prove code execution. A follow-up XXE path matrix tested 20 likely local paths including `/proc/self/*`, `/apex-markets/package*.json`, `/apex-markets/config/*`, `/apex-markets/ftp/*`, `/apex-markets/build/*`, `/app/package.json`, and `/juice-shop/package.json`; it confirmed `/etc/passwd` and `/etc/hostname` reads but did not expose additional high-value config/secrets. A later XXE log-path matrix tested 25 common runtime log paths and recovered no log content. Evidence: `workspace/scans/docker-apex-file-handling-summary.txt`, `workspace/scans/docker-apex-file-handling-probes.csv`, `workspace/scans/docker-apex-xxe-path-summary.txt`, `workspace/scans/docker-apex-xxe-path-probes.csv`, `workspace/scans/docker-apex-xxe-log-path-summary.txt`, and `workspace/scans/docker-apex-xxe-log-path-probes.csv`.
- Gitea anonymous surface probing confirmed unauthenticated user search exposes `developer`; repo search returns all four repos; branches, commits, and content APIs expose metadata for every public repo. Extended probing covered recursive trees, raw reads, archives, subscribers, public API settings, Swagger, wiki routes, packages, collaborators, keys, teams, issues, pull requests, releases, labels, and milestones. No additional secrets beyond the already public repos were found; Gitea version is `1.21.11`. Evidence: `workspace/scans/docker-gitea-anonymous-surface-summary.txt` and `workspace/scans/docker-gitea-extended-surface-summary.txt`.
- Gitea authenticated follow-up found weak credentials: `developer / developer123` authenticates to `GET /api/v1/user`. Read-only follow-up showed this account has `admin`, `pull`, and `push` permissions on all four repos (`app-config`, `infrastructure-scripts`, `legacy-deployments`, `secrets-rotation-log`). No extra orgs, teams, user keys, GPG keys, notifications, issues, pulls, releases, repo deploy keys, or hooks were present in tested read endpoints. This is F-57. Evidence: `workspace/scans/docker-gitea-auth-summary.txt`, `workspace/scans/docker-gitea-auth-probes.csv`, `workspace/scans/docker-gitea-developer-followup-summary.txt`, and `workspace/scans/docker-gitea-developer-followup-probes.csv`.
- Portal session/method checks showed no cookies on GET `/portal/auth` or failed login, and unauthenticated `/portal/tools/upload` redirects for GET/POST/HEAD while OPTIONS only discloses `HEAD, OPTIONS, POST, GET`. Evidence: `workspace/scans/docker-portal-session-method-check.txt`.
- Portal auth-gap probing tested SQLi-style logins, platform-ops clue variants, trusted identity headers, simple user/session cookie tampering, path normalization, static traversal, and `next` variants. No bypass was found; the only `200` responses were login pages and upload stayed protected by redirect. Evidence: `workspace/scans/docker-portal-auth-gap-summary.txt`.
- Portal proxy-header/method follow-up tested `X-Original-URL`, `X-Rewrite-URL`, `X-Forwarded-Uri`, `X-Forwarded-Prefix`, `X-Script-Name`, `X-Accel-Redirect`, local-IP headers, PUT/PATCH/DELETE/TRACE, and upload path suffix/encoding variants against `/portal/tools/upload`. No bypass was found: header cases rendered the sign-in page after redirects, unsupported methods returned `405`, and malformed path variants returned `404` or sign-in. Evidence: `workspace/scans/docker-portal-proxy-header-method-followup.txt`.
- Portal static follow-up fetched `/portal/auth` and referenced `/static/css/style.css`. There was no JavaScript and no hidden login field, but the public login HTML discloses `platform-ops@acme.internal`, `http://wiki.acme.internal/`, `file://fileserver.acme.internal/corporate`, and build/version `2.4.1`. This is now F-41 as low-severity live Portal information disclosure. Evidence: `workspace/scans/docker-portal-static-followup-summary.txt` and `workspace/scans/portal-static-followup/auth.html`.
- Portal login/header behavior follow-up tested clue-derived usernames/passwords and repeated invalid attempts. All 48 login attempts returned `401` with identical length `1568`; the 20 repeated invalid attempts showed no visible lockout/throttle state. Portal login has `X-Frame-Options: SAMEORIGIN` but misses HSTS, CSP, `X-Content-Type-Options`, Referrer-Policy, and Permissions-Policy. This is recorded as coverage/hardening context, not a standalone finding. Evidence: `workspace/scans/docker-portal-headers-login-behavior-summary.txt`, `workspace/scans/docker-portal-login-behavior.csv`, and `workspace/scans/docker-security-header-matrix.csv`.
- Portal cracked-credential follow-up tried 143 combinations built from newly cracked Apex credentials, platform-ops clues, and repo secrets. It found 0 successful Portal logins. Evidence: `workspace/scans/docker-portal-cracked-credential-followup-summary.txt`.
- Portal Gitea credential-reuse follow-up tested newly discovered `developer / developer123` plus related usernames against `/portal/auth` and `/portal/auth?next=/portal/tools/upload`, using form and JSON bodies with `username/password`, `user/pass`, and `email/password` field sets. All 48 attempts returned `401`, with 0 success hints. Evidence: `workspace/scans/docker-portal-gitea-credential-followup-summary.txt` and `workspace/scans/docker-portal-gitea-credential-followup.csv`.
- Portal newly surfaced credential follow-up tested Bender's newly verified password, the deleted-product probe password, and the Amy/MC/Jim targeted passwords against high-signal Portal identities (`platform-ops`, `support`, `bender`, `jdoe`, `jsmith`) on `/portal/auth?next=/portal/tools/upload`. The bounded Docker-only form-login matrix made 40 attempts; all returned `401`, with 0 success hints. Evidence: `workspace/scans/docker-portal-new-credential-followup-summary.txt`, `workspace/scans/docker-portal-new-credential-followup.csv`, and `workspace/scripts/portal_new_credential_followup.py`.
- Portal login rendering follow-up tested crafted `next`, `error`, username, and password values for reflected XSS, Jinja-style template evaluation, debug/template errors, and external redirects. The 35 Docker-toolbox cases returned only `200` or `401`, with 0 interesting hits: no raw HTML/script reflection, no `{{7*7}}` evaluation, no debug/template error, no `Set-Cookie`, and no external redirect. Evidence: `workspace/scans/docker-portal-login-rendering-summary.txt` and `workspace/scans/docker-portal-login-rendering-probes.csv`.
- Portal surface/config probing tested 178 Docker-toolbox requests covering Flask/Werkzeug debug paths, config/source files, `.git`, static backup/source-map variants, leaked log paths, simple cookie/header auth shapes, and upload JSON/multipart edge cases. The only new reachable route was unauthenticated `GET /healthz`, returning only `ok`; POST is `405`, OPTIONS allows `HEAD, OPTIONS, GET`. Debug/config/source/log paths returned standard 404s, and upload stayed protected by auth redirect before processing tested bodies. Evidence: `workspace/scans/docker-portal-surface-summary.txt` and `workspace/scans/docker-portal-healthz-followup.txt`.
- Portal credential-source audit was expanded locally across cloned repo working trees and full Git history, including the deeper `secrets-rotation-log/docs/runbooks/secret-rotation.md` runbook. No direct Portal password/session secret/upload-tool credential was found beyond already known clues (`jdoe`, `jsmith`, `platform-ops@acme.internal`, Vault token/path notes, LDAP notes, and F-02 service credentials). Those sources were already exercised by Docker Portal login matrices with 0 successful logins: `workspace/scans/docker-portal-login-behavior.csv`, `workspace/scans/docker-portal-credential-probe.csv`, `workspace/scans/docker-portal-cracked-credential-followup.csv`, `workspace/scans/docker-portal-parameter-credential-matrix.csv`, and `workspace/scans/docker-portal-new-credential-followup-summary.txt`.
- Portal auth-variant follow-up tested 618 Docker-only cases against `/portal/tools/upload`: likely Flask/itsdangerous signed session cookies with plausible lab secrets, alternate cookie names, unsigned JWT bearer/cookie variants, trusted auth-header combinations, and Basic auth with high-signal lab credentials. Every case returned `302` to `/portal/auth?next=/portal/tools/upload`, with 0 authenticated-content hints. Evidence: `workspace/scans/docker-portal-auth-variant-summary.txt` and `workspace/scans/docker-portal-auth-variant-probes.csv`.

## Docker-Only Constraint

The user explicitly clarified that all further testing must stay inside the lab and should be done in Docker. Earlier in the session, some tooling ran on the host and made external package/web requests. Do not repeat that.

From this point forward:

- Use `./bin/lab-compose run --rm toolbox ...` for testing.
- Only contact lab hostnames:
  - `portal.acme.local`
  - `apex-markets.acme.local`
  - `customer-api.acme.local`
  - `devops-hub.acme.local`
- Do not call PyPI, GitHub, package repos, public search, or external URLs.
- Use local scripts/artifacts under `/workspace` inside the toolbox.
- The dependency-free Apex decryptor is `workspace/scripts/decrypt_apex_announcement.py`.

## Useful Commands

List public Gitea repos:

```bash
curl -sS -x http://127.0.0.1:8081 \
  'http://devops-hub.acme.local/api/v1/repos/search?limit=50' | jq .
```

Clone all public repos:

```bash
cd workspace/loot/repos
for r in app-config infrastructure-scripts legacy-deployments secrets-rotation-log; do
  git -c http.proxy=http://127.0.0.1:8081 clone \
    http://devops-hub.acme.local/developer/$r.git
done
```

Search Git history:

```bash
for r in workspace/loot/repos/*; do
  (cd "$r" && git grep -n -I -i -E \
    '(password|passwd|secret|token|key|jwt|admin|flag|private|BEGIN|credential|api[_-]?key|DB_|DATABASE|portal|customer|ssh)' \
    $(git rev-list --all))
done
```

Customer API dump:

```bash
curl -sS -x http://127.0.0.1:8081 \
  http://customer-api.acme.local/api/internal/system/users-dump | jq .
```

Customer API login:

```bash
curl -sS -x http://127.0.0.1:8081 \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"pass1"}' \
  http://customer-api.acme.local/users/v1/login | jq .
```

Apex SQLi login:

```bash
curl -sS -x http://127.0.0.1:8081 \
  -H 'Content-Type: application/json' \
  -d '{"email":"'\'' or 1=1--","password":"x"}' \
  http://apex-markets.acme.local/rest/user/login | jq .
```

Apex normal user registration:

```bash
curl -sS -x http://127.0.0.1:8081 \
  -H 'Content-Type: application/json' \
  -d '{"email":"audit@example.com","password":"AuditPass123!","passwordRepeat":"AuditPass123!","securityQuestion":{"id":1,"question":"Your eldest siblings middle name?"},"securityAnswer":"x"}' \
  http://apex-markets.acme.local/api/Users/ | jq .
```

Apex admin mass assignment:

```bash
curl -sS -x http://127.0.0.1:8081 \
  -H 'Content-Type: application/json' \
  -d '{"email":"test-admin@example.com","password":"Pass12345!","passwordRepeat":"Pass12345!","role":"admin","securityQuestion":{"id":1,"question":"Your eldest siblings middle name?"},"securityAnswer":"x"}' \
  http://apex-markets.acme.local/api/Users/ | jq .
```

Apex file bypass:

```bash
curl -sS -x http://127.0.0.1:8081 \
  http://apex-markets.acme.local/ftp/suspicious_errors.yml%2500.md
```

## Apex FTP Notes

`eastere.gg` contained base64:

```text
L2d1ci9xcmlmL25lci9mYi9zaGFhbC9ndXJsL3V2cS9uYS9ybmZncmUvcnR0L2p2Z3V2YS9ndXIvcm5mZ3JlL3J0dA==
```

Decoded:

```text
/gur/qrif/ner/fb/shaal/gurl/uvq/na/rnfgre/rtt/jvguva/gur/rnfgre/rtt
```

ROT13:

```text
/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg
```

Downloaded binaries/artifacts not yet deeply analyzed:

- `incident-support.kdbx`

Analyzed:

- `encrypt.pyc` -> `workspace/scans/encrypt_decompiled.py`
- `announcement_encrypted.md` -> `workspace/loot/apex-ftp/announcement_decrypted.md`

## Recommended Next Steps

1. Continue portal-specific work:
   - Enumerate routes more deeply.
   - Fuzz likely `/portal/*` routes.
   - Find credentials from other artifacts or chains; current Docker credential pass tested 99 lab-derived combinations with 0 successes.
   - Current auth-gap pass found no trusted-header, simple cookie, SQLi-login, path-normalization, static-traversal, or unauthenticated `next` bypass.
   - Additional parameter/content-type matrix tested 1,152 POST attempts across `/portal/auth` and `/portal/auth?next=/portal/tools/upload`, form and JSON bodies, `username/password`, `user/pass`, and `email/password` field sets, and lab-derived users/passwords. All returned `401`; no upload redirect, session cookie, or authenticated marker. Evidence: `workspace/scans/docker-portal-parameter-credential-matrix-summary.txt`.
   - Login rendering matrix tested crafted `next`, `error`, username, and password values for reflected XSS/SSTI/open-redirect behavior. No raw reflection, template evaluation, debug error, cookie, or external redirect was observed. Evidence: `workspace/scans/docker-portal-login-rendering-summary.txt`.
   - Surface/config probing found only `/healthz` as an extra unauthenticated route; it returns `ok` only. No debug/config/source/log exposure or upload pre-auth processing was observed. Evidence: `workspace/scans/docker-portal-surface-summary.txt`.
   - Flask-style session-forgery smoke test tried 30 signed `session` cookies against `/portal/tools/upload` using high-signal lab secrets and common `platform-ops` payload keys. All returned `302`, with 0 authenticated upload markers. Evidence: `workspace/scans/docker-portal-session-forgery-summary.txt`.
   - Auth-variant follow-up tried 618 signed-cookie/JWT/header/Basic-auth variants against `/portal/tools/upload`. All returned `302`, with 0 authenticated-content hints. Evidence: `workspace/scans/docker-portal-auth-variant-summary.txt`.
   - Artifact-derived credential expansion tried 1,000 new Portal username/password pairs extracted from current `loot`, `scans`, and `notes`, after skipping 263 previously tested pairs. All returned `401`, with 0 upload redirects. Evidence: `workspace/scans/docker-portal-artifact-credential-expansion-summary.txt` and `workspace/scans/docker-portal-artifact-credential-expansion.csv`.
   - Inspect session/cookie handling if login is achieved.

2. Analyze Apex FTP artifacts:
   - Continue with `incident-support.kdbx` only if new candidate sources are found; the Docker-local checker failed after 3,023,421 focused, lab-derived, and refreshed incremental evidence-derived candidates, including newly cracked Apex passwords and candidates extracted from current notes/scripts/scans/loot.
   - Distro `john` was installed on the host earlier, but do not use host tooling going forward; use Docker-local/lab-local tooling only.
   - Further KeePass work should derive genuinely new candidates from lab clues; do not repeat the existing focused/lab-derived set unless the checker changes materially.

3. Expand Apex validation:
   - Complete only challenge paths that add distinct business-impact findings.
   - Newly added Apex gap findings are in `workspace/scans/docker-apex-gap-evidence-summary.txt`; do not duplicate them unless adding stronger proof or exploit chaining.
   - Artifact-derived probes are in `workspace/scans/docker-apex-artifact-probes.csv`.
   - JWT forging is now confirmed via `alg:none`.
   - Basket negative quantity and review forgery are now confirmed.
   - Feedback zero-star and forged `UserId` are now confirmed; CAPTCHA anti-automation bypass is confirmed as F-58 with 12 accepted submissions in 6.5 seconds; public feedback also exposes the Web3 wallet seed phrase documented as F-48.
   - Product catalog tampering is confirmed as F-49: unauthenticated `PUT /api/Products/:id` updates catalog fields. Quantity item mutation stayed blocked with `403`.
   - Track-order BOLA is confirmed as F-50: valid order IDs return full tracking details without authentication, and user A's token can retrieve user B's order. NoSQL/operator payloads did not produce multi-order exfiltration; they reflected as literal order IDs or returned `500`.
   - Accounting order-history forged-role access is confirmed as F-60: `/rest/order-history/orders` blocks unauthenticated/customer/admin contexts but accepts a forged unsigned JWT with role `accounting`, returning bulk order data.
   - Deleted/unlisted product checkout is confirmed as F-61: public product APIs hide deleted products and direct product reads return `404`, but a normal customer can add raw deleted ProductIds `10` and `11` to a basket and complete checkout. Evidence: `workspace/scans/docker-apex-deleted-product-checkout-summary.txt` and `workspace/scans/docker-apex-deleted-product-checkout-probes.csv`.
   - Recycle pickup BOLA is confirmed as F-62: unauthenticated `GET /api/Recycles/:id` exposes recycle pickup records by predictable ID. Bounded enumeration of IDs 1-15 exposed 11 records with seeded `UserId`, `AddressId`, date, pickup flag, and quantity; unauthenticated address routes did not expose full address objects. Evidence: `workspace/scans/docker-apex-generated-api-table-coverage-summary.txt` and `workspace/scans/docker-apex-recycles-bola-summary.txt`.
   - Legacy profile CSRF is confirmed as F-63: exact `application/x-www-form-urlencoded` cross-origin `POST /profile` with a valid `token` cookie changes a disposable user's `username`; Authorization-header-only control is rejected. Caveat: login did not set the cookie automatically in the probe. Evidence: `workspace/scans/docker-apex-legacy-profile-csrf-form-summary.txt`.
   - Legacy profile image URL SSRF/LFR follow-up is negative: `POST /profile/image/url` stores lab-local HTTP URLs verbatim as `profileImage`, does not store fetched response bodies, and rejects `file:///etc/hostname` plus `file:///etc/passwd` as invalid URI without changing the stored image. Evidence: `workspace/scans/docker-apex-profile-image-url-summary.txt`.
   - Continue-code restore is confirmed as F-51: public `/rest/continue-code` plus unauthenticated `PUT /rest/continue-code/apply/:code` restores 11 solved challenges, compromising score/progress integrity.
   - 2FA verify unsigned-temp-token acceptance is confirmed as F-52: after enabling 2FA on a disposable account, `/rest/2fa/verify` rejected missing/random/setup-token temp values but accepted an unsigned `alg:none` temp JWT with the expected `userId` and `type` when paired with a valid TOTP, returning a full auth token. Legitimate temp tokens were also reusable after successful verification. Evidence: `workspace/scans/docker-apex-2fa-verify-summary.txt` and `workspace/scans/docker-apex-2fa-verify-probes.csv`.
   - Client-side XSS is documented as F-53: local review of `workspace/scans/apex-js-chunks/tutorial.js` found the intended search-result DOM XSS (`#searchValue` renders attacker-controlled iframe markup) and track-result hash reflected XSS (`#/track-result/new?id=<iframe ...>`). Evidence summary: `workspace/scans/apex-client-xss-static-summary.txt`.
   - Feedback server-side XSS bypass matrix is negative so far: exact iframe, mixed-case JavaScript URI, tab/newline/entity JavaScript URI, image `onerror`, SVG `onload`, and math/broken-tag variants were accepted as requests but stored as empty comments. Plain control text stored normally. Evidence: `workspace/scans/docker-apex-feedback-xss-bypass-summary.txt` and `workspace/scans/docker-apex-feedback-xss-bypass-probes.csv`.
   - Registration validation is documented as F-54: Docker probing showed `/api/Users/` accepts mismatched password confirmation, missing `passwordRepeat`, and one-character passwords that can log in; empty email/password were rejected. Evidence: `workspace/scans/docker-apex-registration-validation-summary.txt` and `workspace/scans/docker-apex-registration-validation-probes.csv`.
   - Product-review NoSQL manipulation is documented as F-55: Docker probing showed `PATCH /rest/products/reviews` passes the `id` body into a MarsDB selector. Unsupported `$eq` leaked MarsDB stack traces, `$regex` was accepted with `modified:0` for no match, and `{"id":{"$ne":"<second-disposable-review-id>"}}` returned `modified:29`, changing seeded and disposable review messages. Evidence: `workspace/scans/docker-apex-nosql-review-summary.txt` and `workspace/scans/docker-apex-nosql-review-probes.csv`. Lab-state note: this proof changed multiple review messages; full restore was not attempted because the saved compact response did not include all original messages.
   - Product-review like race is documented as F-59: 12 concurrent same-user likes against one disposable review all returned `200`, raising `likesCount` from 0 to 12 despite sequential duplicates being rejected. Evidence: `workspace/scans/docker-apex-review-like-race-summary.txt` and `workspace/scans/docker-apex-review-like-race-probes.csv`.
   - Coupon backup decoding is done, expired campaign couponData is exploitable, chatbot-disclosed 10% coupon `n(XRwhz3Tq` is valid, and forged Z85 high-value coupons are confirmed as F-56. `JUN26-99` encodes to `n(XRwhz3{H`; Docker checkout evidence shows it applies a 99% discount to a normal positive card order. Evidence: `workspace/scans/docker-apex-forged-coupon-summary.txt` and `workspace/scans/docker-apex-forged-coupon-checkout-summary.txt`.
   - Account/payment probing found free deluxe upgrade, 2FA secret exposure, and the F-52 2FA verify temp-token weakness.
   - Password reset hash replay was tested with a disposable account; leaked answer hashes were not replayable, plaintext answer reset succeeded, and a 3,024,811-candidate Docker follow-up did not crack any current live recovery-answer hashes.
   - SQLi-dumped MD5 password hashes were cracked offline into valid admin/testing-admin/deluxe Apex credentials.
   - Targeted identity follow-up is complete for the high-signal punctuation-heavy seeded candidates that the broad tokenizer missed. Docker verification confirmed valid logins for `amy@apex-markets.example` with `K1f.....................`, `mc.safesearch@apex-markets.example` with `Mr. N00dles`, and `jim@apex-markets.example` with `ncc-1701`. Evidence: `workspace/scans/docker-apex-targeted-identity-login-summary.txt` and `workspace/scans/docker-apex-targeted-identity-login-probes.csv`. A later artifact-derived hash-match pass parsed current `scans`, `loot`, `notes`, and `scripts` artifacts into 114,284 candidate strings, compared them with 27 SQLi-exfiltrated Apex MD5 password hashes, and attempted live login only for exact hash matches; it newly verified `bender@apex-markets.example / OhG0dPlease1nsertLiquor!` and revalidated the Amy/MC/Jim credentials. Evidence: `workspace/scans/docker-apex-artifact-password-hash-matches-summary.txt`, `workspace/scans/docker-apex-artifact-password-hash-matches.csv`, and `workspace/scripts/apex_artifact_password_hash_match_probe.py`. This strengthens F-35 rather than creating a new finding.
   - Client-side testing credential exposure is confirmed; the lab-domain testing account is admin with the bundled password.
   - Web3/chatbot route probes are complete for unauthenticated, admin, testing-admin, deluxe, and disposable customer contexts. Unauthenticated chatbot response calls are rejected; authenticated unknown chatbot actions timed out; corrected chatbot conversation probing found and verified valid 10% coupon disclosure as F-47. Lazy-loaded Web3 chunks were reviewed: sandbox/wallet/bee-haven mostly use browser MetaMask/Sepolia interactions and only the already known `/rest/web3/*` lab backend routes, so do not probe external RPC/on-chain infrastructure. Unauthenticated `/rest/web3/nftUnlocked` returned false. Web3 listener/control exposure is documented separately as F-40: unauthenticated `nftMintListen` and `walletExploitAddress` can start listener behavior, while malformed Web3 control POSTs return proxy `502`. Public feedback seed exposure is F-48. Evidence: `workspace/scans/docker-apex-web3-chatbot-summary.txt`, `workspace/scans/docker-apex-chatbot-conversation-summary.txt`, `workspace/scans/docker-apex-chatbot-coupon-redeem-summary.txt`, `workspace/scans/docker-apex-web3-endpoint-matrix-summary.txt`, `workspace/scans/docker-apex-web3-post-followup.txt`, and `workspace/scans/docker-apex-public-wallet-seed-summary.txt`.
   - Remaining likely high-yield areas include deeper chained exploitation, portal authentication, and KeePass cracking.
   - New negative coverage: `/file-upload` traversal did not overwrite `/ftp/legal.md`; XXE did not recover content from 25 common runtime log paths; `/rest/track-order/:id` did not dereference encoded lab-local URLs and did not accept tested NoSQL/operator shapes for multi-order exfiltration.
   - Avoid listing every Juice Shop exercise unless scoring demands exhaustive challenge completion.

4. Finalize report:
   - Add concise request/response excerpts.
   - Group duplicate Apex symptoms under root causes where possible.
   - Include coverage reasoning from the existing report.
   - Customer API route matrix is now fixed and rerun cleanly. Latest summary: 97 rows, seeded `admin/pass1` valid, target seeded book title parsed, HS256 candidate-secret JWT forgery did not work, and evidence is in `workspace/scans/docker-customer-api-matrix-summary.txt`.
   - Customer API parser/injection edge matrix is also complete with no new finding: tested login SQLi/object/array/SSTI payloads, form content-type login/register, user/book path SQLi/SSTI/wildcards, and stored book-title/secret edge values. Evidence: `workspace/scans/docker-customer-api-injection-edge-summary.txt`.

5. Clean up lab state if needed:
   - Customer API can be reset with `GET /createdb`.
   - Apex has newly created users:
     - `audit1781167578@example.com`
     - `test-admin@example.com`
