## Why

当前 GitHub Workflow 在每次推送任意分支时都会触发 lint/test，且在推送到 main 分支时会执行 Docker build & push。这导致频繁的 CI 资源消耗和不必要的镜像构建。改为仅在创建 Git tag 时才触发 Docker build & push，可以显著减少 CI 资源消耗，同时保持发布流程的可控性。

## What Changes

- 修改 `.github/workflows/docker.yml` 的触发条件，移除 main 分支的自动 Docker build & push
- Docker build & push 仅在 Git tag 推送时触发（匹配 `v*` 或任意 tag 模式）
- 保留 lint & test 在所有分支推送时触发
- 移除 `pull_request` 触发条件（可选，避免重复触发）

## Capabilities

### New Capabilities
<!-- 无新能力 -->

### Modified Capabilities
- `ci-cd-pipeline`: Docker 构建触发条件从 main 分支推送改为仅 tag 推送

## Impact

- 受影响文件：`.github/workflows/docker.yml`
- 不再在推送到 main 分支时自动构建 Docker 镜像
- 需要创建 Git tag 才能触发镜像构建和推送
