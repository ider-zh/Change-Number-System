#!/bin/bash
# Build Docker image locally
# Usage: bash scripts/docker/build.sh [tag]
# Default tag: latest

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

# Set defaults if not configured
DOCKER_REGISTRY="${DOCKER_REGISTRY:-crpi-yl4pb9sg5y2myg6f.cn-hangzhou.personal.cr.aliyuncs.com}"
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-9992099/chang_number_system}"

# Set default tag or use provided argument
TAG=${1:-latest}
IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${TAG}"

echo "Building Docker image: ${IMAGE_NAME}"
echo "================================"

# Build the Docker image
docker build -t "${IMAGE_NAME}" .

echo "================================"
echo "✓ Successfully built: ${IMAGE_NAME}"
echo ""
echo "Run with: docker run -p 3000:3001 --env-file .env ${IMAGE_NAME}"
