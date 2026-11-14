# LifeSkill — 生活小技巧

一个手绘风格的单页应用（SPA），用于记录、分类和检索生活小妙招。纯前端实现，数据保存在浏览器 `localStorage`，无需后端服务。

## 功能概览

- **技巧管理** — 创建、查看、编辑、软删除，支持可选的分步说明
- **分类与标签** — 自定义分类（emoji + 颜色）和标签，删除时自动级联清理关联数据
- **搜索** — 标题、正文、分类名、标签名全文匹配，多关键词 AND，结果高亮
- **筛选与排序** — 按分类、收藏、标签、未分类、无标签筛选；最新 / 最早 / 最近更新 / 最常用 / 标题排序
- **回收站** — 删除先进入回收站，可恢复、永久删除或清空
- **使用记录** — 记录使用次数与最近使用时间，并支持“最常用”排序
- **批量操作** — 多选后批量设置分类或批量移入回收站
- **备份** — JSON 导出、覆盖 / 合并导入、导入前自动快照与恢复
- **统计看板** — 总量、分类分布、Top 5 标签、数据健康入口
- **体验** — 暗色模式、跨标签页实时同步、响应式侧边栏 / 抽屉、手绘风格

## 技术栈

React 19 · react-router-dom v7 · Vite · Tailwind CSS 4 · Vitest + Testing Library

## 快速开始

```sh
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 生产构建到 dist/
npm run preview  # 预览生产构建
npm run lint     # Oxlint 检查
npm test         # Vitest 单元测试
```

## 文档

- [Code Wiki](docs/CODE_WIKI.md) — 整体架构、模块职责、关键函数、数据模型、依赖关系、样式系统、测试与部署细节
- [需求文档](docs/plans.md)
- [项目背景](docs/introduce.md)

## 部署

应用使用 `BrowserRouter`，静态托管需要配置 SPA fallback；仓库已内置 Vercel 与 Netlify 配置，GitHub Pages 由 CI 构建并生成 `404.html`。完整说明见 Code Wiki 的“构建、CI 与部署”章节。
