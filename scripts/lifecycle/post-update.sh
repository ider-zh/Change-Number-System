#!/bin/sh
# Post-update script for Watchtower
# This script runs after the container is updated and restarted

echo "[$(date)] Post-update: Verifying service..."

# Wait for service to start
sleep 10

# Check health endpoint
if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health 2>/dev/null; then
    echo "[$(date)] Post-update: Service health check passed"
    exit 0
else
    echo "[$(date)] Post-update: Service health check failed"
    exit 1
fi
