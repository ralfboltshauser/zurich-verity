#!/usr/bin/env bash
set -euo pipefail

echo "== Zurich Verity / Smithers PR workflow =="
echo "stage 1: scope intake"
echo "stage 2: diff-aware test planning"
echo "stage 3: Docker-only proof execution"
echo "stage 4: evidence capture"
echo "stage 5: PR-ready remediation"

./harness/scripts/verity-pr-review.sh
