## ADDED Requirements

### Requirement: Multi-stage Docker build
The system SHALL provide a multi-stage Dockerfile that builds both frontend and backend into a single optimized image based on `node:20-alpine`.

#### Scenario: Build production image
- **WHEN** running `docker build -t change-number-system .`
- **THEN** the image SHALL be built successfully with all frontend static assets served by the backend

### Requirement: Optimized image size
The final Docker image SHALL be less than 200MB by using Alpine base image and excluding development dependencies and build tools.

#### Scenario: Verify image size
- **WHEN** inspecting the built image size with `docker images`
- **THEN** the image size SHALL be under 200MB

### Requirement: Production-only dependencies
The Dockerfile SHALL install only production dependencies using `npm ci --omit=dev` in the final stage.

#### Scenario: Install production dependencies
- **WHEN** the Dockerfile reaches the production stage
- **THEN** only dependencies listed in `package.json` `dependencies` (not `devDependencies`) SHALL be installed

### Requirement: Health check endpoint
The Dockerfile SHALL define a HEALTHCHECK instruction that verifies the application is running on the configured port.

#### Scenario: Container health check
- **WHEN** running `docker inspect` on a running container
- **THEN** the health status SHALL be reported as "healthy" after startup

### Requirement: Non-root user execution
The container SHALL run as a non-root user for security purposes.

#### Scenario: Run as non-root
- **WHEN** the container starts
- **THEN** the process SHALL run under a dedicated `appuser` with limited permissions
