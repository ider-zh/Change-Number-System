## MODIFIED Requirements

### Requirement: Admin can edit existing projects

The admin dashboard SHALL provide an edit capability for each project in the projects list. Admins SHALL be able to modify the project `code` and `name` fields through a modal form pre-filled with current values.

#### Scenario: Admin opens edit form for a project
- **WHEN** admin clicks the "Edit" button on a project row in the projects table
- **THEN** a modal form opens with `code` and `name` fields pre-filled with the project's current values

#### Scenario: Admin successfully updates a project
- **WHEN** admin modifies one or more fields in the edit form and clicks "Save"
- **THEN** the system calls `PUT /api/projects/:id` with the updated values
- **THEN** the project list refreshes to show the updated data
- **THEN** a success message is displayed

#### Scenario: Admin cancels edit without saving
- **WHEN** admin opens the edit modal and clicks "Cancel" or closes the modal
- **THEN** no API call is made and the project list remains unchanged

#### Scenario: Update fails due to duplicate code
- **WHEN** admin changes the `code` to a value that already exists and clicks "Save"
- **THEN** the system displays an error message from the backend

### Requirement: Project name is optional

The project `name` field SHALL accept empty strings. It is not required for project creation or editing.

#### Scenario: Create project without name
- **WHEN** admin creates a project with only `code` filled and `name` left empty
- **THEN** the project is created successfully with an empty `name`

#### Scenario: Edit project to remove name
- **WHEN** admin edits a project and clears the `name` field
- **THEN** the project is updated with an empty `name`
