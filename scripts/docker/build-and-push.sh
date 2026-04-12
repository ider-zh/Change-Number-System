#!/bin/bash
# Build and push Docker image in one command
# Usage: bash scripts/docker/build-and-push.sh [tag]
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
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-9992099/change_number_system}"

# Set default tag or use provided argument
TAG=${1:-latest}
IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${TAG}"

echo "Build and Push Docker Image"
echo "==========================="
echo "Registry: ${DOCKER_REGISTRY}"
echo "Image: ${DOCKER_IMAGE_NAME}"
echo "Tag: ${TAG}"
echo ""

# Build the image
echo "Step 1/2: Building image..."
docker build -t "${IMAGE_NAME}" .
echo "✓ Build complete"
echo ""

# Push the image
echo "Step 2/2: Pushing image..."
docker push "${IMAGE_NAME}"
echo "✓ Push complete"
echo ""
echo "==========================="
echo "✓ Successfully built and pushed: ${IMAGE_NAME}"
