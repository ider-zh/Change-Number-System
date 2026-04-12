## ADDED Requirements

### Requirement: Automated build on push
The GitHub Actions workflow SHALL trigger on every push to any branch and on pull requests to the `main` branch.

#### Scenario: Trigger on push
- **WHEN** code is pushed to any branch
- **THEN** the workflow SHALL start automatically

### Requirement: Lint and test execution
The workflow SHALL run linting and tests before attempting to build the Docker image. If linting or tests fail, the workflow SHALL fail without building.

#### Scenario: Fail on test failure
- **WHEN** any test fails during the test job
- **THEN** the workflow SHALL stop and report failure without proceeding to build

### Requirement: Docker image build and push
The workflow SHALL build a Docker image and push it to Docker Hub on successful merge to `main` or on release tags.

#### Scenario: Push image on main branch merge
- **WHEN** a PR is merged to `main`
- **THEN** the built image SHALL be pushed to Docker Hub with the `latest` tag

### Requirement: Semantic versioning for release tags
When a Git tag matching `v*` is pushed, the workflow SHALL tag the Docker image with the corresponding version (e.g., `v1.0.0`) in addition to `latest`.

#### Scenario: Versioned release
- **WHEN** tag `v1.2.0` is pushed
- **THEN** the image SHALL be tagged as `v1.2.0` and `latest` on Docker Hub

### Requirement: Git SHA tagging
Every successful build SHALL tag the Docker image with the short Git SHA (7 characters) for traceability.

#### Scenario: SHA-tagged build
- **WHEN** the workflow completes successfully
- **THEN** the image SHALL be accessible via `<username>/change-number-system:<short-sha>`

### Requirement: Multi-platform build support
The workflow SHALL support building images for both `linux/amd64` and `linux/arm64` platforms.

#### Scenario: Multi-platform build
- **WHEN** the build job runs on a release tag
- **THEN** images SHALL be built for both `linux/amd64` and `linux/arm64` architectures
