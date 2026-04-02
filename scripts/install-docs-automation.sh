#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE_DIR="${REPO_ROOT}/ops/launchd"
LAUNCH_AGENTS_DIR="${HOME}/Library/LaunchAgents"
LOG_DIR="${CODEX_LOG_DIR:-${HOME}/.codex/automation-logs/tennis_level}"
CODEX_BIN="${CODEX_BIN:-/opt/homebrew/bin/codex}"
USER_DOMAIN="gui/$(id -u)"

if [ ! -x "${CODEX_BIN}" ]; then
  echo "[install-docs-automation] codex binary not found at ${CODEX_BIN}" >&2
  exit 1
fi

mkdir -p "${LAUNCH_AGENTS_DIR}" "${LOG_DIR}" "${LOG_DIR}/state"

render_plist() {
  local template_path="$1"
  local target_path="$2"

  REPO_ROOT="${REPO_ROOT}" LOG_DIR="${LOG_DIR}" CODEX_BIN="${CODEX_BIN}" perl -0pe '
    s/__REPO_ROOT__/$ENV{REPO_ROOT}/g;
    s/__LOG_DIR__/$ENV{LOG_DIR}/g;
    s/__CODEX_BIN__/$ENV{CODEX_BIN}/g;
  ' "${template_path}" >"${target_path}"
}

DAILY_TARGET="${LAUNCH_AGENTS_DIR}/com.tennislevel.daily-progress.plist"
WEEKLY_TARGET="${LAUNCH_AGENTS_DIR}/com.tennislevel.weekly-review.plist"

render_plist "${TEMPLATE_DIR}/com.tennislevel.daily-progress.plist" "${DAILY_TARGET}"
render_plist "${TEMPLATE_DIR}/com.tennislevel.weekly-review.plist" "${WEEKLY_TARGET}"

launchctl bootout "${USER_DOMAIN}/com.tennislevel.daily-progress" >/dev/null 2>&1 || true
launchctl bootout "${USER_DOMAIN}/com.tennislevel.weekly-review" >/dev/null 2>&1 || true

launchctl bootstrap "${USER_DOMAIN}" "${DAILY_TARGET}"
launchctl bootstrap "${USER_DOMAIN}" "${WEEKLY_TARGET}"

echo "Installed LaunchAgents:"
echo "  ${DAILY_TARGET}"
echo "  ${WEEKLY_TARGET}"
echo
echo "Logs directory:"
echo "  ${LOG_DIR}"
echo
echo "Manual checks:"
echo "  launchctl kickstart -k ${USER_DOMAIN}/com.tennislevel.daily-progress"
echo "  launchctl kickstart -k ${USER_DOMAIN}/com.tennislevel.weekly-review"
