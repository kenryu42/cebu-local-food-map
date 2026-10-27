#!/usr/bin/env bash
# Stop the processes this run started (by recorded pid, never by name) and delete the
# run's scratch dir. Evidence in $EVIDENCE_DIR is kept.
#   RUN_ID=<id> cleanup.sh
set -uo pipefail
source "$(dirname "$0")/env.sh"

for name in chrome preview; do
  pidfile="$RUN_DIR/$name.pid"
  [[ -f "$pidfile" ]] || continue
  pid=$(cat "$pidfile")
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.25; done
    kill -0 "$pid" 2>/dev/null && kill -9 "$pid"
    echo "stopped $name (pid $pid)"
  fi
done

if [[ -d "$RUN_DIR" ]]; then
  /bin/rm -rf "$RUN_DIR"
  echo "removed $RUN_DIR"
fi
echo "evidence kept in $EVIDENCE_DIR"
