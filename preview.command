#!/bin/bash
cd "$(dirname "$0")"
PORT=8765
python3 -m http.server "$PORT" >/tmp/shoma_portfolio_preview.log 2>&1 &
PID=$!
sleep 0.6
open "http://localhost:$PORT"
echo "Portfolio preview: http://localhost:$PORT"
echo "Press Ctrl+C to stop."
trap 'kill $PID 2>/dev/null' INT TERM EXIT
wait $PID
