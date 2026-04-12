## 1. Project-wide Versioning Setup

- [x] 1.1 Create `VERSION` file in the project root with `v1.0`.
- [x] 1.2 Update `package.json` version to `1.0.0` (ensure consistency).

## 2. Frontend Integration

- [x] 2.1 Update `frontend/vite.config.ts` to inject the version from the `VERSION` file into `process.env.VITE_APP_VERSION`.
- [x] 2.2 Update `frontend/src/components/Layout.tsx` to display the project version (e.g., in the footer or sidebar).
- [x] 2.3 Verify the version display by running the frontend in development mode.

## 3. Docker & CI/CD Integration

- [x] 3.1 Update `Dockerfile` to include the project version as an image label.
- [x] 3.2 Update `scripts/docker/build.sh` to read from the `VERSION` file and tag the image accordingly.
- [x] 3.3 Update `docker-compose.yml` to use the versioned image name (or support a version environment variable).
- [x] 3.4 Update `.github/workflows/docker.yml` to read the version from the `VERSION` file and add it as a tag for the Docker image.

## 4. Final Verification

- [x] 4.1 Run a local build and verify the Docker image tags.
- [x] 4.2 Confirm that the frontend displays the correct version when running inside the container.
