## ADDED Requirements

### Requirement: Local Docker build script
The project SHALL provide a shell script (`scripts/docker/build.sh`) that builds the Docker image locally with a configurable tag.

#### Scenario: Build with default tag
- **WHEN** running `bash scripts/docker/build.sh` without arguments
- **THEN** the image SHALL be built with the tag `change-number-system:latest`

#### Scenario: Build with custom tag
- **WHEN** running `bash scripts/docker/build.sh my-custom-tag`
- **THEN** the image SHALL be built with the tag `change-number-system:my-custom-tag`

### Requirement: Docker Hub login script
The project SHALL provide a script (`scripts/docker/login.sh`) that prompts for Docker Hub credentials and logs in via the Docker CLI.

#### Scenario: Interactive login
- **WHEN** running `bash scripts/docker/login.sh`
- **THEN** the script SHALL prompt for username and password and execute `docker login`

### Requirement: Image push script
The project SHALL provide a script (`scripts/docker/push.sh`) that pushes a locally built image to Docker Hub with a specified tag.

#### Scenario: Push image with tag
- **WHEN** running `bash scripts/docker/push.sh v1.0.0`
- **THEN** the image `change-number-system:v1.0.0` SHALL be pushed to Docker Hub

### Requirement: One-command build and push
The project SHALL provide a combined script (`scripts/docker/build-and-push.sh`) that builds and pushes the image in a single command.

#### Scenario: Build and push latest
- **WHEN** running `bash scripts/docker/build-and-push.sh`
- **THEN** the image SHALL be built with the latest tag and pushed to Docker Hub

### Requirement: Script error handling
All scripts SHALL exit immediately on error (set -e) and print meaningful error messages if Docker is not installed or not running.

#### Scenario: Docker not installed
- **WHEN** running any script without Docker installed
- **THEN** the script SHALL exit with code 1 and print "Error: Docker is not installed"

#### Scenario: Docker not running
- **WHEN** running any script with Docker daemon stopped
- **THEN** the script SHALL exit with code 1 and print "Error: Docker daemon is not running"
