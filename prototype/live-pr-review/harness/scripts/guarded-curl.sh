#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <url> [curl args...]" >&2
  exit 2
fi

scope_file="${VERITY_SCOPE:-/workspace/harness/policies/scope.allowlist}"
url="$1"
host="$(python3 - "$url" <<'PY'
from urllib.parse import urlparse
import sys
print(urlparse(sys.argv[1]).hostname or "")
PY
)"

if [ -z "$host" ] || ! grep -Fxq "$host" "$scope_file"; then
  echo "blocked: host '$host' is not in scope file '$scope_file'" >&2
  exit 1
fi

exec curl --fail-with-body --show-error --silent "$@"
