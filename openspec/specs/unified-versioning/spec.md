## ADDED Requirements

### Requirement: Centralized version definition
The project SHALL have a single source of truth for its version number, stored in a file accessible by all build and deployment components.

#### Scenario: Version retrieval
- **WHEN** any component (frontend, backend, Docker, CI/CD) needs the project version
- **THEN** it SHALL read the version from the centralized version file

### Requirement: Frontend version display
The frontend application SHALL display the current project version in a visible but non-intrusive location (e.g., footer or navigation bar).

#### Scenario: Version visible to user
- **WHEN** the user navigates to any page in the frontend
- **THEN** the project version (e.g., "v1.0") SHALL be displayed in the UI

### Requirement: Initial project version
The project version SHALL be initialized to `v1.0` as the first official release.

#### Scenario: Verify initial version
- **WHEN** the project version is checked for the first time after this change
- **THEN** the version SHALL be `v1.0`
