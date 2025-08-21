#!/bin/bash

# Create monitoring namespace
helm upgrade --install namespace namespace

# Add repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.maximumStartupDurationSeconds=60 \
  --set prometheus-node-exporter.hostRootFsMount.enabled=false
# Install Grafana Operator in correct namespace
-helm upgrade -i grafana-operator grafana/grafana-operator \
-  --namespace monitoring \
-  --set rbac.clusterRoleUse=true \
-  --set rbac.create=true

# Install Redis
helm upgrade --install redis-ha redis-ha --namespace monitoring

# Install Grafana config
helm upgrade --install grafana-config grafana-config --namespace monitoring

echo "Waiting for components to be ready..."
sleep 30

# Get Grafana admin password
kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Install Redis API
helm upgrade --install redis-api redis-api

# Install Web App
helm upgrade --install web-app web-app

