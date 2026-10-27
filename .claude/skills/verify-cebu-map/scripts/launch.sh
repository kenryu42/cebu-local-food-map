#!/usr/bin/env bash
# Build the app, serve the production build on 127.0.0.1:$PORT, and start an isolated
# headless Chrome on $CDP_PORT. Prints READY when both answer.
#   RUN_ID=<id> [PORT=4174] [CDP_PORT=9333] [VIEWPORT=390,844] [SKIP_BUILD=1] launch.sh
set -euo pipefail
source "$(dirname "$0")/env.sh"

if [[ -f "$RUN_DIR/preview.pid" ]] && kill -0 "$(cat "$RUN_DIR/preview.pid")" 2>/dev/null; then
  echo "Run '$RUN_ID' is already running (pid $(cat "$RUN_DIR/preview.pid")). Use another RUN_ID or run cleanup.sh." >&2
  exit 1
fi
for port in "$PORT" "$CDP_PORT"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use by something this run did not start. Pick another PORT/CDP_PORT." >&2
    exit 1
  fi
done
[[ -x "$CHROME" ]] || { echo "Chrome not found at $CHROME (set CHROME=...)" >&2; exit 1; }

mkdir -p "$RUN_DIR" "$EVIDENCE_DIR"
cd "$REPO_DIR"

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  echo "Building..."
  npm run build >"$RUN_DIR/build.log" 2>&1 || { echo "Build failed; see $RUN_DIR/build.log" >&2; tail -20 "$RUN_DIR/build.log" >&2; exit 1; }
fi
[[ -f dist/index.html ]] || { echo "dist/index.html missing; run without SKIP_BUILD" >&2; exit 1; }

# Bind to loopback explicitly: vite.config.ts sets host: true, which would expose it on the LAN
nohup node node_modules/vite/bin/vite.js preview --port "$PORT" --strictPort --host 127.0.0.1 \
  >"$RUN_DIR/preview.log" 2>&1 &
echo $! >"$RUN_DIR/preview.pid"

nohup "$CHROME" --headless=new --remote-debugging-port="$CDP_PORT" \
  --user-data-dir="$RUN_DIR/chrome-profile" --window-size="$VIEWPORT" \
  --no-first-run --no-default-browser-check --enable-unsafe-swiftshader \
  about:blank >"$RUN_DIR/chrome.log" 2>&1 &
echo $! >"$RUN_DIR/chrome.pid"

for _ in $(seq 1 60); do
  app=$(curl -s -o /dev/null -w '%{http_code}' "$APP_URL" || true)
  cdp=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$CDP_PORT/json/version" || true)
  if [[ "$app" == 200 && "$cdp" == 200 ]]; then
    echo "READY app=$APP_URL cdp=$CDP_PORT viewport=$VIEWPORT run_dir=$RUN_DIR evidence=$EVIDENCE_DIR"
    exit 0
  fi
  sleep 0.5
done
echo "Not ready after 30s (app=$app cdp=$cdp). Logs: $RUN_DIR/preview.log $RUN_DIR/chrome.log" >&2
exit 1
