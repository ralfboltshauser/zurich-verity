#!/usr/bin/env bash
set -euo pipefail

mkdir -p .verity runs
run_id="verity-pr-${PR_NUMBER:-local}-$(date -u +%Y%m%dT%H%M%SZ)"
run_dir="runs/${run_id}"
mkdir -p "${run_dir}"

git config --global --add safe.directory "$(pwd)" >/dev/null 2>&1 || true

echo "[verity] scope intake"
cat "${VERITY_SCOPE:-harness/policies/scope.allowlist}" | tee "${run_dir}/scope.txt" >/dev/null

echo "[verity] changed file inventory"
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  git diff --name-only origin/main...HEAD | tee "${run_dir}/changed-files.txt" >/dev/null
else
  git diff --name-only HEAD~1...HEAD | tee "${run_dir}/changed-files.txt" >/dev/null || true
fi

echo "[verity] starting demo app inside Docker runner"
python3 demo_app/app.py >"${run_dir}/app.log" 2>&1 &
app_pid="$!"
trap 'kill "${app_pid}" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 30); do
  if ./harness/scripts/guarded-curl.sh http://127.0.0.1:8080/health >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

echo "[verity] executing proof request"
set +e
python3 harness/scripts/security_scan.py --json > "${run_dir}/scan.json"
scan_status="$?"
set -e

finding="$(jq -r '.finding' "${run_dir}/scan.json")"
finding_count="$(jq '.findings | length' "${run_dir}/scan.json")"

cat > "${run_dir}/status.json" <<JSON
{
  "run_id": "${run_id}",
  "repository": "${GITHUB_REPOSITORY:-local/zurich-verity-demo}",
  "pull_number": "${PR_NUMBER:-local}",
  "head_sha": "${GITHUB_SHA:-local}",
  "scanner_exit_code": ${scan_status},
  "finding_count": ${finding_count},
  "finding": ${finding}
}
JSON

cp "${run_dir}/status.json" .verity/status.json
cp "${run_dir}/scan.json" .verity/scan.json

agent_summary="No agent review was produced."
agent_findings_md="- No agent findings."
if [ -f .verity/agent-review.json ]; then
  agent_summary="$(jq -r '.summary // "No agent review summary."' .verity/agent-review.json)"
  agent_findings_md="$(jq -r '.findings // [] | if length == 0 then "- No agent findings." else map("- [" + .severity + "] " + .title + " - " + (.body | gsub("\\n"; " "))) | join("\n") end' .verity/agent-review.json)"
fi

if [ "${finding}" = "true" ]; then
  jq -r '.findings[] | "## " + .title + "\n\n**Asset:** `" + (.file // "unknown") + (if .line then ":" + (.line|tostring) else "" end) + "`" + (if .route then " / `" + .route + "`" else "" end) + "\n\n**Evidence:** " + .evidence + "\n\n**Proof:**\n\n```bash\n" + .proof + "\n```\n\n**Business impact:** " + .businessImpact + "\n\n**Recommended fix:** " + .recommendation + "\n"' "${run_dir}/scan.json" > "${run_dir}/finding.md"

  cp "${run_dir}/finding.md" .verity/finding.md
  cat > .verity/pr-comment.md <<MD
## Zurich Verity security review

**Status:** Blocking finding confirmed

Verity reviewed this pull request through the Smithers PR workflow:

1. Scope intake loaded \`harness/policies/scope.allowlist\`.
2. A Codex security reviewer analyzed the PR diff and application code inside the Smithers Docker sandbox.
3. The app was launched inside the Docker proof runner.
4. Scoped proof probes were executed against local lab targets only.
5. Evidence was written to \`${run_dir}\`.

### Agent review

${agent_summary}

${agent_findings_md}

### Confirmed finding

$(cat "${run_dir}/finding.md")

### Verity remediation

If a safe mechanical remediation is available, Verity will push it to this PR. Otherwise the finding remains blocked with the proof and fix guidance above.

<!-- zurich-verity-demo-review -->
MD
else
  cat > .verity/pr-comment.md <<MD
## Zurich Verity security review

**Status:** Passed

Verity reviewed this pull request through the Smithers PR workflow and did not confirm a blocking security issue.

### Agent review

${agent_summary}

${agent_findings_md}

Evidence was written to \`${run_dir}\`.

<!-- zurich-verity-demo-review -->
MD
fi

echo "[verity] run complete: ${run_id}"
