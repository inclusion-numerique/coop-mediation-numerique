#!/bin/sh
# Optionally open an SSH tunnel to the entrepôt (Dataspace) database before starting the app.
#
# The entrepôt PostgreSQL instance only exposes a PRIVATE endpoint, reachable through MIN's
# bastion. We forward a local port to it so the app can read the cohabiting schemas
# (admin/main/reference/audit) via `ENTREPOT_DATABASE_URL` pointing at localhost.
#
# - No-op when ENTREPOT_BASTION_HOST is unset → environments without entrepôt access start as
#   before, nothing changes for them.
# - Fail-soft: a tunnel that fails to come up NEVER blocks the Coop app (which uses its own
#   DATABASE_URL); only the entrepôt-backed pages (e.g. /tmp) degrade until the tunnel is up.
set -e

if [ -n "${ENTREPOT_BASTION_HOST}" ]; then
  key_file="$(mktemp)"
  printf '%s\n' "${ENTREPOT_BASTION_SSH_KEY}" >"${key_file}"
  chmod 600 "${key_file}"

  echo "[entrypoint] opening entrepôt SSH tunnel via ${ENTREPOT_BASTION_USER}@${ENTREPOT_BASTION_HOST}"
  AUTOSSH_GATETIME=0 autossh -M 0 -f -N \
    -o StrictHostKeyChecking=accept-new \
    -o UserKnownHostsFile=/tmp/known_hosts \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -i "${key_file}" \
    -p "${ENTREPOT_BASTION_PORT:-22}" \
    -L "${ENTREPOT_TUNNEL_PORT:-5433}:${ENTREPOT_DB_HOST}:${ENTREPOT_DB_PORT:-5432}" \
    "${ENTREPOT_BASTION_USER}@${ENTREPOT_BASTION_HOST}" &&
    echo "[entrypoint] autossh tunnel started" ||
    echo "[entrypoint] WARNING: autossh tunnel failed to start — entrepôt pages unavailable"
fi

exec "$@"
