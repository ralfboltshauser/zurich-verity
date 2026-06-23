#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path

path = Path("demo_app/app.py")
text = path.read_text()
start = "        # VERITY_DEMO_VULNERABLE_START\n"
end = "        # VERITY_DEMO_VULNERABLE_END\n"

if start not in text:
    print("No Verity demo vulnerability marker found; nothing to fix.")
    raise SystemExit(0)

before, rest = text.split(start, 1)
_, after = rest.split(end, 1)
path.write_text(before + after)
print("Removed unauthenticated debug endpoint from demo_app/app.py")
PY
