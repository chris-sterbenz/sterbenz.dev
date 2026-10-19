#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo=chris-sterbenz/sterbenz.dev
gh api --method PUT "repos/$repo/environments/production" --input .github/settings/production.json >/dev/null
policy_id=$(gh api "repos/$repo/environments/production/deployment-branch-policies" --jq '.branch_policies[] | select(.name == "main" and .type == "branch") | .id')
if [ -z "$policy_id" ]; then
  gh api --method POST "repos/$repo/environments/production/deployment-branch-policies" --input .github/settings/main-deployment-policy.json >/dev/null
fi
if [ "${1:-}" != '--environment-only' ]; then
  gh api --method PUT "repos/$repo/branches/main/protection" --input .github/settings/main-protection.json >/dev/null
fi
echo 'Applied checked-in GitHub settings.'
