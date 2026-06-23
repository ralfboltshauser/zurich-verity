#!/usr/bin/env bash
set -euo pipefail

branch="demo/recording-$(date -u +%Y%m%d-%H%M%S)"

git fetch origin main
git checkout -B "$branch" origin/main

python3 - <<'PY'
from pathlib import Path

path = Path("demo_app/app.py")
text = path.read_text()

if "VERITY_DEMO_VULNERABLE_START" in text:
    raise SystemExit("demo vulnerability already present")

needle = '''        if self.path == "/api/users":
            public_users = [{"id": user["id"], "role": user["role"]} for user in USERS]
            json_response(self, 200, {"users": public_users})
            return

'''

insert = needle + '''        # VERITY_DEMO_VULNERABLE_START
        if self.path == "/api/debug/users":
            debug_users = [
                {
                    "id": 1,
                    "email": "alice@example.test",
                    "password": "<demo-password-placeholder>",
                    "api_key": "<demo-api-key-placeholder>",
                    "ssn": "<demo-ssn-placeholder>",
                },
                {
                    "id": 2,
                    "email": "ops@example.test",
                    "password": "<demo-password-placeholder>",
                    "api_key": "<demo-api-key-placeholder>",
                    "ssn": "<demo-ssn-placeholder>",
                },
            ]
            json_response(self, 200, {"users": debug_users})
            return
        # VERITY_DEMO_VULNERABLE_END

'''

if needle not in text:
    raise SystemExit("could not find insertion point in demo_app/app.py")

path.write_text(text.replace(needle, insert))
PY

git add demo_app/app.py
git commit -m "feat: add recording demo debug users endpoint"
git push -u origin "$branch"

gh pr create \
  --base main \
  --head "$branch" \
  --title "Recording demo: debug users endpoint" \
  --body "Recording demo PR for Zurich Verity. This intentionally introduces an unauthenticated debug endpoint with placeholder sensitive fields so the Verity Smithers workflow can prove the issue, comment with evidence, and apply a remediation commit."
