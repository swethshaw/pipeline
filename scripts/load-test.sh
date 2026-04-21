#!/usr/bin/env bash
# =============================================================================
#  load-test.sh  –  Generate traffic to trigger HPA scale-up
#  Usage:  ./load-test.sh [duration_seconds] [concurrency]
# =============================================================================
set -euo pipefail

DURATION="${1:-120}"       # default 2 min
CONCURRENCY="${2:-50}"     # default 50 concurrent requests
MINIKUBE_IP=$(minikube ip)
APP_URL="http://${MINIKUBE_IP}:30080"

echo "🚀 Load test → $APP_URL"
echo "   Duration:    ${DURATION}s"
echo "   Concurrency: ${CONCURRENCY} workers"
echo ""
echo "Watch HPA in another terminal:"
echo "  kubectl get hpa -n pipeline-app -w"
echo ""

# Use 'hey' if available, otherwise fallback to curl loop
if command -v hey &>/dev/null; then
  hey -z "${DURATION}s" -c "$CONCURRENCY" "$APP_URL"
elif command -v ab &>/dev/null; then
  REQUESTS=$(( DURATION * CONCURRENCY * 10 ))
  ab -n "$REQUESTS" -c "$CONCURRENCY" -t "$DURATION" "${APP_URL}/"
else
  echo "Neither 'hey' nor 'ab' found – using curl loop (less accurate)"
  END=$(( $(date +%s) + DURATION ))
  while [ $(date +%s) -lt $END ]; do
    for _ in $(seq 1 "$CONCURRENCY"); do
      curl -s -o /dev/null "$APP_URL" &
    done
    wait
  done
fi

echo ""
echo "✅ Load test finished"
echo ""
kubectl get hpa  -n pipeline-app
kubectl get pods -n pipeline-app
