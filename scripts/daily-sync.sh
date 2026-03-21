#!/bin/bash
# linkedin-clay-sync — daily auto-sync script
# Auto-generated. Modify install-cron options to reconfigure.

DOWNLOADS="$HOME/Downloads"
LOG="/tmp/linkedin-clay-sync.log"
CSV=$(find "$DOWNLOADS" -name "Connections.csv" -not -path "*/\.*" 2>/dev/null | tail -1)

echo "$(date): Starting LinkedIn → Clay sync" >> "$LOG"

if [ -z "$CSV" ]; then
  echo "$(date): No Connections.csv found in $DOWNLOADS — skipping" >> "$LOG"
  echo ""
  echo "To sync, download your LinkedIn export:"
  echo "  linkedin.com → Settings → Data Privacy → Get a copy of your data → Connections"
  exit 0
fi

echo "$(date): Found CSV at $CSV" >> "$LOG"
npx tsx "$(dirname "$0")/../src/cli.ts" sync "$CSV" >> "$LOG" 2>&1
echo "$(date): Done" >> "$LOG"
