#!/usr/bin/env bash
# Read-only: is this run's instance worth driving? Exits non-zero on any FAIL.
#   RUN_ID=<id> doctor.sh
set -uo pipefail
source "$(dirname "$0")/env.sh"

fail=0
ok() { echo "OK   $*"; }
bad() { echo "FAIL $*"; fail=1; }

for name in preview chrome; do
  pidfile="$RUN_DIR/$name.pid"
  if [[ -f "$pidfile" ]] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    ok "$name running (pid $(cat "$pidfile"))"
  else
    bad "$name not running for RUN_ID=$RUN_ID (no live pid in $pidfile)"
  fi
done

# The port must belong to the preview process this run started, not someone else's server
listener=$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1)
if [[ -n "$listener" && -f "$RUN_DIR/preview.pid" && "$listener" == "$(cat "$RUN_DIR/preview.pid")" ]]; then
  ok "port $PORT owned by this run's preview"
else
  bad "port $PORT listener is '${listener:-none}', not this run's preview"
fi

# Served page must be the current build in dist/
if [[ "$(curl -s "$APP_URL")" == "$(cat "$REPO_DIR/dist/index.html" 2>/dev/null)" ]]; then
  ok "served index.html matches dist/ ($(grep -o 'assets/index-[^"]*\.js' "$REPO_DIR/dist/index.html"))"
else
  bad "served page differs from dist/index.html (stale build or wrong server)"
fi

if curl -s "http://127.0.0.1:$CDP_PORT/json/version" | grep -q '"Browser"'; then
  ok "Chrome DevTools answering on $CDP_PORT"
else
  bad "Chrome DevTools not answering on $CDP_PORT"
fi

# The map needs the network: vector tiles, terrain, fonts and the exchange rate are all remote
for url in https://tiles.openfreemap.org/styles/liberty https://open.er-api.com/v6/latest/PHP; do
  code=$(curl -s -o /dev/null -m 8 -w '%{http_code}' "$url")
  [[ "$code" == 200 ]] && ok "reachable $url" || bad "unreachable $url (HTTP $code)"
done

exit $fail
