## MODIFIED Requirements

### Requirement: Multi-stage Docker build
The system SHALL provide a multi-stage Dockerfile that builds both frontend and backend into a single optimized image based on `node:20-alpine`, incorporating the unified project version.

#### Scenario: Build production image with version
- **WHEN** running `docker build -t change-number-system:v1.0 .` using the unified project version
- **THEN** the image SHALL include the version metadata and be built successfully
