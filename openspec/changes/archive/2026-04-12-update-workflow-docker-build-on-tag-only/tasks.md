## 1. Update workflow trigger configuration

- [x] 1.1 Open `.github/workflows/docker.yml` and locate the `on:` trigger section
- [x] 1.2 Change `push` trigger from `branches: ['**']` to `tags: ['*']` (match all tags)
- [x] 1.3 Remove `pull_request` trigger section
- [x] 1.4 Verify `release` trigger remains for GitHub Release published events

## 2. Adjust docker-build-push job conditions

- [x] 2.1 Update `docker-build-push` job `if:` condition to trigger on tag pushes and releases
- [x] 2.2 Remove `main branch push` condition from build step (no longer needed)
- [x] 2.3 Ensure tag-based build uses correct tag name in Docker tags

## 3. Verify and test workflow changes

- [x] 3.1 Validate YAML syntax with `actionlint` or manual review
- [x] 3.2 Commit changes and push to a test branch *(done during commit)*
- [ ] 3.3 Create a test tag and verify Docker build triggers correctly *(manual: push a tag to GitHub and check Actions tab)*
- [ ] 3.4 Verify pushing a branch without a tag does NOT trigger Docker build *(manual: push a branch and confirm no Docker build runs)*
