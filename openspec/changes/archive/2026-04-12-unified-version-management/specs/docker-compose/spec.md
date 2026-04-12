## MODIFIED Requirements

### Requirement: Single command application startup
The docker-compose.yml SHALL allow starting the application (backend and frontend) with the image tagged with the unified project version.

#### Scenario: Start versioned image
- **WHEN** running `docker-compose up -d`
- **THEN** the application image using the current unified project version (e.g., `v1.0`) SHALL be started
