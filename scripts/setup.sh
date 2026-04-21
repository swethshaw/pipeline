#!/usr/bin/env bash
# =============================================================================
#  setup.sh  –  Full bootstrap: Minikube → App → Prometheus → Grafana → HPA
# =============================================================================
set -euo pipefail
BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
section() { echo -e "\n${BOLD}══════════════════════════════════════════${NC}"; \
            echo -e "${BOLD}  $*${NC}"; \
            echo -e "${BOLD}══════════════════════════════════════════${NC}"; }

# ── Prerequisites check ────────────────────────────────────────────────────
section "1. Checking prerequisites"
for cmd in minikube kubectl helm docker; do
  if command -v "$cmd" &>/dev/null; then
    info "$cmd found: $(which $cmd)"
  else
    echo -e "${RED}[ERR]${NC}  '$cmd' not found. Please install it first."
    exit 1
  fi
done

# ── Start Minikube ─────────────────────────────────────────────────────────
section "2. Starting Minikube"
if minikube status &>/dev/null; then
  warn "Minikube already running – skipping start"
else
  minikube start \
    --cpus=4 \
    --memory=6144 \
    --driver=docker \
    --addons=metrics-server \
    --addons=ingress
  info "Minikube started"
fi

# Enable addons (idempotent)
minikube addons enable metrics-server 2>/dev/null || true
minikube addons enable ingress        2>/dev/null || true
info "Addons: metrics-server, ingress enabled"

# ── Build Docker image inside Minikube ────────────────────────────────────
section "3. Building Docker image inside Minikube"
eval $(minikube docker-env)            # point Docker CLI at minikube daemon
docker build \
  -t pipeline-frontend:latest \
  -f "$(dirname "$0")/../app/Dockerfile" \
  "$(dirname "$0")/../"
info "Image built: pipeline-frontend:latest"

# ── Deploy Prometheus + Grafana ───────────────────────────────────────────
section "4. Installing Prometheus & Grafana (kube-prometheus-stack)"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --values "$(dirname "$0")/../k8s/monitoring/monitoring-values.yaml" \
  --wait --timeout 8m

info "Prometheus stack installed"

# ── Deploy the app ────────────────────────────────────────────────────────
section "5. Deploying Pipeline Frontend app"
K8S_DIR="$(dirname "$0")/../k8s"

kubectl apply -f "$K8S_DIR/base/namespace.yaml"
kubectl apply -f "$K8S_DIR/base/deployment.yaml"
kubectl apply -f "$K8S_DIR/base/service.yaml"
kubectl apply -f "$K8S_DIR/hpa/hpa.yaml"
kubectl apply -f "$K8S_DIR/monitoring/grafana-dashboard-cm.yaml"
kubectl apply -f "$K8S_DIR/monitoring/alert-rules.yaml"

kubectl rollout status deployment/pipeline-frontend -n pipeline-app --timeout=3m
info "Deployment ready"

# ── Print summary ─────────────────────────────────────────────────────────
section "6. Access URLs"
MINIKUBE_IP=$(minikube ip)
echo ""
echo -e "  🌐 ${BOLD}React App${NC}  →  http://${MINIKUBE_IP}:30080"
echo -e "  📊 ${BOLD}Grafana${NC}    →  http://${MINIKUBE_IP}:30300   (admin / admin123)"
echo -e "  🔥 ${BOLD}Prometheus${NC} →  run: kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring"
echo ""
echo -e "  📈 ${BOLD}Watch HPA${NC}  →  kubectl get hpa -n pipeline-app -w"
echo -e "  🔍 ${BOLD}Watch pods${NC} →  kubectl get pods -n pipeline-app -w"
echo ""
info "Setup complete! 🎉"
