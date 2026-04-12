#!/bin/bash
# Login to Alibaba Cloud Container Registry interactively
# Usage: bash scripts/docker/login.sh

set -e

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "Error: Docker daemon is not running"
    exit 1
fi

# Load configuration from .env file if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env" | xargs)
fi

# Set default registry if not configured
DOCKER_REGISTRY="${DOCKER_REGISTRY:-crpi-yl4pb9sg5y2myg6f.cn-hangzhou.personal.cr.aliyuncs.com}"

echo "Alibaba Cloud Container Registry Login"
echo "======================================="
echo "Registry: ${DOCKER_REGISTRY}"
echo ""

# Prompt for credentials
read -p "Username: " USERNAME
read -sp "Password: " PASSWORD
echo ""

# Login to Alibaba Cloud Container Registry
echo ""
echo "Logging in..."
echo "${PASSWORD}" | docker login "${DOCKER_REGISTRY}" -u "${USERNAME}" --password-stdin

if [ $? -eq 0 ]; then
    echo "✓ Successfully logged in to Alibaba Cloud Container Registry"
else
    echo "✗ Login failed"
    exit 1
fi
