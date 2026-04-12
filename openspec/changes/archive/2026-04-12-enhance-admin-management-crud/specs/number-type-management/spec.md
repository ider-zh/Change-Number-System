## MODIFIED Requirements

### Requirement: Admin can edit existing number types

The admin dashboard SHALL provide an edit capability for each number type in the number types list. Admins SHALL be able to modify the `type_code`, `type_name`, and `description` fields through a modal form pre-filled with current values.

#### Scenario: Admin opens edit form for a number type
- **WHEN** admin clicks the "Edit" button on a number type row in the number types table
- **THEN** a modal form opens with `type_code`, `type_name`, and `description` fields pre-filled with the current values

#### Scenario: Admin successfully updates a number type
- **WHEN** admin modifies one or more fields in the edit form and clicks "Save"
- **THEN** the system calls `PUT /api/number-types/:id` with the updated values
- **THEN** the number types list refreshes to show the updated data
- **THEN** a success message is displayed

#### Scenario: Admin cancels edit without saving
- **WHEN** admin opens the edit modal and clicks "Cancel" or closes the modal
- **THEN** no API call is made and the number types list remains unchanged

#### Scenario: Update fails due to duplicate type_code
- **WHEN** admin changes the `type_code` to a value that already exists and clicks "Save"
- **THEN** the system displays an error message from the backend

### Requirement: Number type name is optional

The number type `type_name` field SHALL accept empty strings or null. It is not required for number type creation or editing.

#### Scenario: Create number type without name
- **WHEN** admin creates a number type with only `type_code` filled and `type_name` left empty
- **THEN** the number type is created successfully with an empty `type_name`

#### Scenario: Edit number type to remove name
- **WHEN** admin edits a number type and clears the `type_name` field
- **THEN** the number type is updated with an empty `type_name`
