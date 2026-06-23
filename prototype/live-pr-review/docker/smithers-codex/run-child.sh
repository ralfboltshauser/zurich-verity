#!/bin/sh
set -eu

restore_mount_ownership() {
  if [ -n "${HOST_UID:-}" ] && [ -n "${HOST_GID:-}" ]; then
    chown -R "${HOST_UID}:${HOST_GID}" /sandbox-io /repo/.smithers 2>/dev/null || true
  fi
}

trap restore_mount_ownership EXIT

mkdir -p /codex-home-runtime
cp /codex-home-source/auth.json /codex-home-runtime/auth.json

if [ -f /codex-home-source/config.toml ]; then
  cp /codex-home-source/config.toml /codex-home-runtime/config.toml
fi

chmod -R u+w /codex-home-runtime
cd /repo

if [ -z "${GH_TOKEN:-}" ]; then
  if [ -n "${REVIEW_GITHUB_TOKEN:-}" ]; then
    export GH_TOKEN="${REVIEW_GITHUB_TOKEN}"
  elif [ -n "${GITHUB_TOKEN:-}" ]; then
    export GH_TOKEN="${GITHUB_TOKEN}"
  fi
fi

CODEX_HOME=/codex-home-runtime \
SANDBOX_RESULT_PATH=/sandbox-io/output.json \
smithers workflow run "${SMITHERS_CHILD_WORKFLOW:-sandboxed-security-review}" \
  --input "$(cat /sandbox-io/input.json)" \
  > /sandbox-io/run.log 2>&1

run_id="$(sed -n 's/^runId: //p' /sandbox-io/run.log | tail -n 1 | tr -d '\r')"
test -n "$run_id"
printf '%s\n' "$run_id" > /sandbox-io/run-id.txt
