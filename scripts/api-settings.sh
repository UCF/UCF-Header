#!/usr/bin/env bash
#
# Applies runtime settings to the API on a Static Web App.
#
# These are deliberately NOT in the deploy workflow. The CORS allowlist is the
# only thing preventing an arbitrary site from reading a user's name, and
# widening it should be a conscious, separately-audited act — not a side effect
# of merging a pull request.
#
# Usage:  scripts/api-settings.sh <resource-group> <swa-name> <dev|test|live>
#
# Requires the Azure CLI, logged in with rights on the Static Web App.

set -euo pipefail

RG="${1:?resource group required}"
APP="${2:?static web app name required}"
ENVIRONMENT="${3:?environment required: dev, test or live}"

case "$ENVIRONMENT" in
  dev|test)
    # The mock verifier is refused outright when NODE_ENV=production, so these
    # slots must not set it.
    VERIFIER="mock"
    DEV_LOGIN="1"
    ALLOW_LOCALHOST="1"
    ;;
  live)
    VERIFIER="jwks"
    DEV_LOGIN="0"
    ALLOW_LOCALHOST="0"
    ;;
  *)
    echo "unknown environment: $ENVIRONMENT" >&2
    exit 1
    ;;
esac

SETTINGS=(
  "ALLOWED_ORIGIN_SUFFIXES=.ucf.edu"
  # Exact origins outside ucf.edu. Every entry here is a domain trusted to read
  # signed-in user names; add one only with a reason.
  "ALLOWED_ORIGINS="
  "ALLOW_LOCALHOST=${ALLOW_LOCALHOST}"
  "AUTH_VERIFIER=${VERIFIER}"
  # How long the header may reuse a payload it already has. The hint cookie
  # invalidates it on sign-out, so this can be generous.
  "SESSION_TTL=3600"
  # How long the browser HTTP cache may reuse the response. Short on purpose:
  # this layer absorbs bursts, the header's own store does the real caching.
  "HTTP_MAX_AGE=300"
  # The cookie must be readable across every *.ucf.edu embedder, so it is set
  # on the registrable domain rather than the API host.
  "COOKIE_DOMAIN=.ucf.edu"
  "ENABLE_DEV_LOGIN=${DEV_LOGIN}"
)

if [ "$ENVIRONMENT" = "live" ]; then
  : "${JWKS_URI:?set JWKS_URI in the environment for a live deploy}"
  : "${JWT_ISSUER:?set JWT_ISSUER in the environment for a live deploy}"
  : "${JWT_AUDIENCE:?set JWT_AUDIENCE in the environment for a live deploy}"
  : "${HINT_SALT:?set HINT_SALT in the environment; rotating it clears every client cache}"

  SETTINGS+=(
    "NODE_ENV=production"
    "JWKS_URI=${JWKS_URI}"
    "JWT_ISSUER=${JWT_ISSUER}"
    "JWT_AUDIENCE=${JWT_AUDIENCE}"
    "HINT_SALT=${HINT_SALT}"
  )
fi

echo "Applying ${#SETTINGS[@]} settings to ${APP} (${ENVIRONMENT})..."
az staticwebapp appsettings set \
  --name "$APP" \
  --resource-group "$RG" \
  --setting-names "${SETTINGS[@]}" \
  --output table

echo
echo "Verify with:  curl -s https://<host>/api/health | jq"
