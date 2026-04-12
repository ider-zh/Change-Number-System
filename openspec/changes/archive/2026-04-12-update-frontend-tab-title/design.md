## Context

当前 `frontend/index.html` 中的 `<title>` 标签使用 Vite 默认的 "frontend"。这是一个纯文本修改，将其更改为 "自动取号系统" 以反映实际业务功能。

## Goals / Non-Goals

**Goals:**
- 更新浏览器 tab 标题为 "自动取号系统"

**Non-Goals:**
- 不涉及动态标题（如路由变化时更新标题）
- 不涉及 SEO meta 标签的其他修改

## Decisions

直接在 `frontend/index.html` 中硬编码中文标题。理由：
- 简单直接，无需引入 i18n 或动态标题逻辑
- 当前应用无多语言需求，中文标题固定

## Risks / Trade-offs

- [低风险] 硬编码中文标题 → 若未来需要多语言支持，需重构为动态标题方案。当前无此需求，可接受。
