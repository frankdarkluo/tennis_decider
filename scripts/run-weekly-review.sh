#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CODEX_BIN="${CODEX_BIN:-/opt/homebrew/bin/codex}"
LOG_DIR="${CODEX_LOG_DIR:-${HOME}/.codex/automation-logs/tennis_level}"
STATE_DIR="${LOG_DIR}/state"
PROMPT_FILE="$(mktemp "${TMPDIR:-/tmp}/tennislevel-weekly-prompt.XXXXXX")"
LAST_RUN_FILE="${STATE_DIR}/weekly-review.last"

cleanup() {
  rm -f "${PROMPT_FILE}"
}

trap cleanup EXIT

mkdir -p "${LOG_DIR}" "${STATE_DIR}"

export TZ="America/Edmonton"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

if [ ! -x "${CODEX_BIN}" ]; then
  echo "[run-weekly-review] codex binary not found at ${CODEX_BIN}" >&2
  exit 1
fi

LAST_RUN_WEEK_KEY=""
if [ -f "${LAST_RUN_FILE}" ]; then
  LAST_RUN_WEEK_KEY="$(cat "${LAST_RUN_FILE}")"
fi

GENERATOR_ARGS=("--last-run-week-key=${LAST_RUN_WEEK_KEY}")
FORCE_RUN=0
if [ "${1:-}" = "--force" ]; then
  FORCE_RUN=1
  GENERATOR_ARGS+=("--force")
fi

set +e
node "${REPO_ROOT}/scripts/automation/weekly-review.mjs" "${GENERATOR_ARGS[@]}" >"${PROMPT_FILE}"
GENERATOR_EXIT=$?
set -e

if [ "${GENERATOR_EXIT}" -eq 10 ] || [ "${GENERATOR_EXIT}" -eq 11 ]; then
  exit 0
fi

if [ "${GENERATOR_EXIT}" -ne 0 ]; then
  exit "${GENERATOR_EXIT}"
fi

if [ ! -s "${PROMPT_FILE}" ]; then
  exit 0
fi

TIMESTAMP="$(date '+%Y-%m-%dT%H-%M-%S')"
STDOUT_LOG="${LOG_DIR}/weekly-review-${TIMESTAMP}.stdout.log"
STDERR_LOG="${LOG_DIR}/weekly-review-${TIMESTAMP}.stderr.log"
LAST_MESSAGE_FILE="${LOG_DIR}/weekly-review-${TIMESTAMP}.last-message.txt"

"${CODEX_BIN}" exec \
  --cd "${REPO_ROOT}" \
  --sandbox workspace-write \
  --color never \
  --output-last-message "${LAST_MESSAGE_FILE}" \
  - <"${PROMPT_FILE}" >"${STDOUT_LOG}" 2>"${STDERR_LOG}"

if [ "${FORCE_RUN}" -eq 0 ]; then
  date '+%G-W%V' >"${LAST_RUN_FILE}"
fi
