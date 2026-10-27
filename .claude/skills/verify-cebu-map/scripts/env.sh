# Shared settings for the verify-cebu-map scripts. Sourced, not executed.
# Every value can be overridden from the environment so two runs can sit side by side.

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$SKILL_DIR/../../.." && pwd)"

RUN_ID="${RUN_ID:-default}"
PORT="${PORT:-4174}"               # vite preview (the production build)
CDP_PORT="${CDP_PORT:-9333}"       # headless Chrome DevTools port
VIEWPORT="${VIEWPORT:-390,844}"    # phone by default; use 1280,900 for desktop
BASE_PATH="/cebu-local-food-map/"  # same path GitHub Pages serves

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

# Disposable state (pids, logs, Chrome profile). Cleanup deletes this.
RUN_DIR="${RUN_DIR:-${TMPDIR:-/tmp}/verify-cebu-map/$RUN_ID}"
# Proof artifacts. Cleanup never touches this. Gitignored.
EVIDENCE_DIR="${EVIDENCE_DIR:-$REPO_DIR/artifacts/verify/$RUN_ID}"

APP_URL="http://127.0.0.1:$PORT$BASE_PATH"

export RUN_ID PORT CDP_PORT VIEWPORT RUN_DIR EVIDENCE_DIR APP_URL
