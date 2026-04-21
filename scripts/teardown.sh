#!/usr/bin/env bash
# =============================================================================
#  teardown.sh  –  Remove everything cleanly
# =============================================================================
set -euo pipefail

echo "🗑️  Removing pipeline-app namespace..."
kubectl delete namespace pipeline-app --ignore-not-found

echo "🗑️  Removing Prometheus stack..."
helm uninstall prometheus -n monitoring 2>/dev/null || true
kubectl delete namespace monitoring --ignore-not-found

echo "🛑  Stopping Minikube..."
minikube stop

echo "✅  Teardown complete"
