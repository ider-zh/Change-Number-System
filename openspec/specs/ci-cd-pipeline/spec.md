## MODIFIED Requirements

### Requirement: Docker build and push triggers

The CI/CD pipeline SHALL trigger Docker build and push ONLY when a Git tag is pushed or a GitHub Release is published. It SHALL NOT trigger on branch pushes alone.

#### Scenario: Tag is pushed
- **WHEN** a Git tag is pushed (any tag pattern)
- **THEN** the workflow triggers lint/test, then Docker build and push with the tag name and SHA

#### Scenario: GitHub Release is published
- **WHEN** a GitHub Release is published
- **THEN** the workflow triggers lint/test, then Docker build and push with the release version tag

#### Scenario: Branch is pushed (not tagged)
- **WHEN** a branch is pushed without creating a tag
- **THEN** the workflow triggers lint/test ONLY, without Docker build and push
