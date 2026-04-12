## MODIFIED Requirements

### Requirement: Docker image build and push
The workflow SHALL build a Docker image and push it to Docker Hub on successful merge to `main` or on release tags.

#### Scenario: Push image with unified version tag
- **WHEN** a PR is merged to `main` or a tag is pushed
- **THEN** the built image SHALL be tagged with the project's unified version and the Git SHA

### Requirement: Semantic versioning for release tags
When a Git tag matching `v*` is pushed, the workflow SHALL tag the Docker image with the corresponding version (e.g., `v1.0.0`) in addition to the unified project version and `latest`.

#### Scenario: Versioned release with unified tag
- **WHEN** tag `v1.2.0` is pushed
- **THEN** the image SHALL be tagged as `v1.2.0`, the current unified project version, and `latest` on Docker Hub
