## MODIFIED Requirements

### Requirement: Docker build and push triggers

The CI/CD pipeline SHALL trigger Docker build and push whenever a new release version is tagged, or when the unified project version is updated on `main`.

#### Scenario: Unified version update on main branch
- **WHEN** changes are pushed to `main` branch that include a version change
- **THEN** the pipeline SHALL trigger Docker build and push with the new unified version tag
