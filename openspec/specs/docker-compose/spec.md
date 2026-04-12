## ADDED Requirements

### Requirement: Single command application startup
The docker-compose.yml SHALL allow starting the entire application (backend API serving frontend static files) with a single `docker-compose up -d` command.

#### Scenario: Start all services
- **WHEN** running `docker-compose up -d`
- **THEN** the application SHALL be accessible at http://localhost:3000

### Requirement: SQLite data persistence
The compose configuration SHALL mount a volume for the SQLite database directory to ensure data persists across container restarts.

#### Scenario: Data persists after restart
- **WHEN** the container is stopped and restarted
- **THEN** all application data SHALL remain intact

### Requirement: Environment variable configuration
The compose file SHALL support loading environment variables from a `.env` file and passing them to the application container.

#### Scenario: Load environment variables
- **WHEN** a `.env` file exists in the project root
- **THEN** variables defined in the file SHALL be available to the application

### Requirement: Automatic container restart on failure
The compose configuration SHALL set restart policy to `unless-stopped` for the application service.

#### Scenario: Auto-restart on crash
- **WHEN** the application container exits with a non-zero code
- **THEN** Docker SHALL automatically restart the container

### Requirement: Port mapping configuration
The compose file SHALL map host port 3000 to container port 3001 for the application service.

#### Scenario: Access application
- **WHEN** navigating to http://localhost:3000
- **THEN** the application SHALL be accessible via the mapped port
