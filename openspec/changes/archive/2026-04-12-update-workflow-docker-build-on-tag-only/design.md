## Context

当前 `.github/workflows/docker.yml` 在以下情况触发：
- `push` 到任意分支 → lint/test + (main 分支时) docker build & push
- `pull_request` 到 main → lint/test
- `release` published → docker build & push

需要改为仅在 tag 推送时触发 docker build & push。

## Goals / Non-Goals

**Goals:**
- Docker build & push 仅在 tag 推送时触发
- 保留 lint & test 在 push 时触发（所有分支）
- 保持 release published 触发 docker build & push（可选，视需求而定）

**Non-Goals:**
- 不改变 Dockerfile 或构建逻辑
- 不改变 lint/test 触发条件

## Decisions

1. **触发条件改为 `push.tags` + `release`**：移除 `push.branches` 的 docker build，改为 `push.tags: ['v*', '*']` 匹配所有 tag。保留 release 触发以兼容 GitHub Release 发布流程。

2. **保留 lint & test**：lint & test 仍在所有 push 时触发，确保代码质量检查不间断。

3. **移除 pull_request 触发**：当前 pull_request 仅触发 lint/test，与 push 触发重复。移除以避免重复 CI 运行。

## Risks / Trade-offs

- [中等风险] 推送到 main 分支不再自动构建镜像 → 团队需适应新流程：合并到 main 后，手动创建 tag 触发构建。Mitigation: 在 README 或 CONTRIBUTING 中记录新流程。
- [低风险] 移除 pull_request 触发 → PR 页面不再显示 CI 状态。Mitigation: 如需要可恢复 PR 触发但仅 lint/test。
