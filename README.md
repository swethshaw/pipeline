# Pipeline Frontend – Minikube + CI/CD + Prometheus + Grafana + Autoscaling

A complete production-style Kubernetes setup for your React Flow pipeline builder.

---

## 📁 Project Structure

```
k8s-deploy/
├── app/
│   ├── Dockerfile          # Multi-stage: Node build → Nginx serve
│   └── nginx.conf          # SPA routing + /health + /nginx_status
├── frontend/               # ← paste your React app here
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml  # pipeline-app namespace
│   │   ├── deployment.yaml # 2-replica deployment + nginx-exporter sidecar
│   │   └── service.yaml    # NodePort :30080 + ServiceMonitor
│   ├── hpa/
│   │   └── hpa.yaml        # CPU 50% / Mem 70% → scale 2→10 pods
│   └── monitoring/
│       ├── monitoring-values.yaml    # Prometheus + Grafana Helm values
│       ├── grafana-dashboard-cm.yaml # Pre-built dashboard ConfigMap
│       └── alert-rules.yaml          # PrometheusRule alerts
├── .github/
│   └── workflows/
│       └── ci-cd.yaml      # GitHub Actions: test → build → push → deploy
└── scripts/
    ├── setup.sh            # One-shot bootstrap script
    ├── load-test.sh        # Trigger HPA scale-up with traffic
    └── teardown.sh         # Clean teardown
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Minikube | ≥ 1.32 | https://minikube.sigs.k8s.io |
| kubectl | ≥ 1.28 | https://kubernetes.io/docs/tasks/tools |
| Helm | ≥ 3.13 | https://helm.sh |
| Docker | ≥ 24 | https://docs.docker.com/engine/install |

### 1. Copy your React app

```bash
cp -r /path/to/your/frontend ./frontend
```

### 2. Run the setup script

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

This will:
- Start Minikube (4 CPU, 6 GB RAM)
- Enable metrics-server (required for HPA)
- Build your Docker image **inside** Minikube's daemon (no registry needed)
- Install kube-prometheus-stack via Helm
- Deploy the app, HPA, and all monitoring manifests

### 3. Access the services

| Service | URL |
|---|---|
| 🌐 React App | `http://$(minikube ip):30080` |
| 📊 Grafana | `http://$(minikube ip):30300` → admin / admin123 |
| 🔥 Prometheus | `kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring` |

---

## 📈 Autoscaling (HPA)

### How it works

```
CPU avg > 50%  OR  Memory avg > 70%
         │
         ▼
   HPA adds pods (up to 10)

Load drops for 5 min
         │
         ▼
   HPA removes pods (min 2)
```

### Watch scaling live

```bash
# Terminal 1 – watch pods appear/disappear
kubectl get pods -n pipeline-app -w

# Terminal 2 – watch HPA metrics
kubectl get hpa -n pipeline-app -w

# Terminal 3 – trigger load
./scripts/load-test.sh 120 50    # 120 seconds, 50 concurrent
```

### Manual override

```bash
# Force scale to 5 replicas
kubectl scale deployment pipeline-frontend -n pipeline-app --replicas=5

# Check current HPA status
kubectl describe hpa pipeline-frontend-hpa -n pipeline-app
```

---

## 📊 Grafana Dashboard

The pre-built **"Pipeline Frontend - Overview"** dashboard shows:

| Panel | What it tracks |
|---|---|
| 🟢 Pod Count | Live available replicas |
| 📈 CPU Usage | Per-pod millicores |
| 🧠 Memory Usage | Per-pod MB |
| ⚡ HPA Replicas | Current vs desired vs min/max |
| 🌐 Nginx Connections | Active connections per pod |
| 🔄 Requests/sec | HTTP throughput per pod |
| 💡 Pod Restarts | Crash detection |
| 📊 CPU % Gauge | HPA trigger indicator |

---

## 🚨 Alerts

PrometheusRule fires alerts for:

| Alert | Condition | Severity |
|---|---|---|
| `PipelineFrontendDown` | 0 pods available > 1 min | critical |
| `PipelineFrontendLowReplicas` | < 2 pods > 2 min | warning |
| `PipelineFrontendHighCPU` | CPU > 80% for 5 min | warning |
| `PipelineFrontendHighMemory` | Memory > 85% for 5 min | warning |
| `PipelineFrontendPodCrashLooping` | Restart rate > 0.05/s | critical |
| `PipelineFrontendHPAMaxed` | At max replicas for 5 min | warning |

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Setup

1. Add secrets to your GitHub repo:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

2. Install a [GitHub Actions self-hosted runner](https://docs.github.com/en/actions/hosting-your-own-runners) on your Minikube machine:
   ```bash
   # In GitHub: Settings → Actions → Runners → New self-hosted runner
   # Follow the instructions on that page
   ```

### Pipeline flow

```
git push main
     │
     ▼
① npm install + test
     │
     ▼
② npm run build
     │
     ▼
③ docker build + push (sha tag + latest)
     │
     ▼
④ kubectl apply (self-hosted runner on minikube host)
     │
     ▼
⑤ kubectl rollout status (waits for zero-downtime rollout)
```

---

## 🛠️ Useful Commands

```bash
# See all resources
kubectl get all -n pipeline-app

# Logs from all frontend pods
kubectl logs -l app=pipeline-frontend -n pipeline-app --tail=50

# Exec into a pod
kubectl exec -it -n pipeline-app \
  $(kubectl get pod -l app=pipeline-frontend -n pipeline-app -o name | head -1) -- sh

# Port-forward Prometheus UI
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring

# Describe HPA (see why it's scaling)
kubectl describe hpa pipeline-frontend-hpa -n pipeline-app

# Full teardown
./scripts/teardown.sh
```
