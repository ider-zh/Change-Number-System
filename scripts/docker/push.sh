#!/bin/bash
# Push Docker image to Alibaba Cloud Container Registry
# Usage: bash scripts/docker/push.sh <tag>

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

# Check if tag is provided
if [ -z "$1" ]; then
    echo "Error: Tag is required"
    echo "Usage: bash scripts/docker/push.sh <tag>"
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

TAG=$1
IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${TAG}"

# Check if image exists locally
if ! docker image inspect "${IMAGE_NAME}" &> /dev/null; then
    echo "Error: Image ${IMAGE_NAME} not found locally"
    echo "Build it first with: bash scripts/docker/build.sh ${TAG}"
    exit 1
fi

echo "Pushing Docker image: ${IMAGE_NAME}"
echo "================================"

# Push the image
docker push "${IMAGE_NAME}"

echo "================================"
echo "✓ Successfully pushed: ${IMAGE_NAME}"
