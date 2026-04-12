## Context

The project currently uses a hardcoded `1.0.0` in `package.json` but lacks a consistent version display in the UI and a unified way to tag Docker images and GitHub releases. The goal is to establish a single source of truth for the project version (`v1.0`).

## Goals / Non-Goals

**Goals:**
- Provide a single file (`VERSION`) at the project root to define the current version.
- Display the version number in the frontend UI.
- Tag Docker images with the version from the `VERSION` file.
- Update GitHub Workflows to use the `VERSION` file for tagging.

**Non-Goals:**
- Automatic semantic versioning (auto-incrementing version numbers based on commits).
- Complex release notes generation.

## Decisions

- **Source of Truth**: A `VERSION` file in the root directory. This is easily readable by shell scripts and CI/CD pipelines without needing a JSON parser.
- **Frontend Integration**: Use a pre-build script or a `.env` file generation step during build to inject the version from the `VERSION` file into Vite's environment variables (`VITE_APP_VERSION`).
- **Docker Integration**: Modify `docker-build.sh` or the `Dockerfile` to accept the version as a build argument or read it directly from the `VERSION` file.
- **Tagging Strategy**: Docker images will be tagged with the version from the `VERSION` file (e.g., `v1.0`) in addition to `latest` and the Git SHA.

## Risks / Trade-offs

- **[Risk]** Out-of-sync version between `VERSION` file and `package.json` → **[Mitigation]** Use a single script to update both files simultaneously if needed, or primarily rely on the `VERSION` file for build artifacts.
- **[Risk]** Build failures due to missing `VERSION` file → **[Mitigation]** Provide a default value or fail the build with a clear error message.
