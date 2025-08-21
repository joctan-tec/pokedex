#!/bin/bash

# Delete Redis
helm uninstall redis-ha --namespace monitoring

# Delete Redis API
helm uninstall redis-api

# Delete Web App
helm uninstall web-app

# Delete Grafana config
helm uninstall grafana-config --namespace monitoring

# Delete Grafana Operator
helm uninstall grafana-operator --namespace monitoring

# Delete Prometheus stack
helm uninstall prometheus --namespace monitoring

# Delete namespace (esto eliminará todos los recursos restantes en el namespace)
kubectl delete namespace monitoring

helm uninstall namespace

# Clean up Helm repos (opcional)
helm repo remove prometheus-community
helm repo remove grafana

echo "Uninstall completed. All monitoring resources have been removed."