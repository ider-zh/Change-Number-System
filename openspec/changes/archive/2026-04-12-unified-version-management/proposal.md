## Why

Currently, the project lacks a unified versioning system. Version information is either hardcoded or missing across different components (frontend, backend, Docker, GitHub Workflows). Establishing a single source of truth for the version (v1.0) ensures consistency across the entire stack, improves traceability, and facilitates better release management and CI/CD automation.

## What Changes

- **Unified Versioning**: Introduce a central version configuration for the whole project.
- **Frontend Display**: Add the version number to the frontend UI (e.g., in the layout or about section).
- **Docker Tagging**: Update Docker build scripts and compose files to use the unified version as a tag.
- **GitHub Workflow Integration**: Modify CI/CD workflows to automatically use the unified version for builds and releases.
- **Initial Version**: Set the project version to `v1.0`.

## Capabilities

### New Capabilities
- `unified-versioning`: Centralized version management system and its integration across the codebase.

### Modified Capabilities
- `github-workflow`: Update to use the unified version for tagging and build steps.
- `docker-build`: Update build scripts to incorporate the unified version tag.
- `docker-compose`: Update service image tags to use the unified version.
- `ci-cd-pipeline`: Ensure the pipeline respects and propagates the unified version.

## Impact

- **Frontend**: `frontend/src/components/Layout.tsx` or similar for display.
- **Backend/Root**: A central version file (e.g., `.version` or in `package.json`).
- **Docker**: `Dockerfile`, `docker-compose.yml`, and scripts in `scripts/docker/`.
- **GitHub Actions**: `.github/workflows/docker.yml`.
