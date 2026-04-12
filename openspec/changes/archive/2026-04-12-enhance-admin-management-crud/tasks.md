## 1. Database migration - relax number type name constraint

- [x] 1.1 Add migration logic in `backend/src/db/init.js` to check if `number_types` table needs migration
- [x] 1.2 Implement table rebuild migration: rename old table → create new table without `type_name NOT NULL` → copy data → drop old table
- [x] 1.3 Verify migration is idempotent (safe to run multiple times)

## 2. Add edit UI to ProjectsPage

- [x] 2.1 Add "Edit" button to each project row in the table (next to "Delete" button)
- [x] 2.2 Create edit modal state and handler in `ProjectsPage.tsx`
- [x] 2.3 Pre-fill edit form with current project `code` and `name`
- [x] 2.4 Wire up edit form submission to `projectAPI.update()` and refresh list on success
- [x] 2.5 Display error message when update fails (e.g., duplicate code)

## 3. Add edit UI to NumberTypesPage

- [x] 3.1 Add "Edit" button to each number type row in the table (next to "Delete" button)
- [x] 3.2 Create edit modal state and handler in `NumberTypesPage.tsx`
- [x] 3.3 Pre-fill edit form with current `type_code`, `type_name`, and `description`
- [x] 3.4 Wire up edit form submission to `numberTypeAPI.update()` and refresh list on success
- [x] 3.5 Display error message when update fails (e.g., duplicate type_code)

## 4. Verify and test

- [x] 4.1 Test project edit flow: create → edit code → edit name → clear name → verify changes persist
- [x] 4.2 Test number type edit flow: create → edit fields → verify changes persist
- [x] 4.3 Test database migration: verify `type_name` accepts empty string after migration
- [x] 4.4 Test duplicate code/type_code error handling in edit forms
