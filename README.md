# LifeSkill — 生活小技巧

一个手绘风格的 SPA，用于记录、管理和发现生活小妙招。

## 功能

- **技巧管理** — 创建、编辑、删除生活技巧，支持分类和标签
- **分类 & 标签** — 自定义分类（含 emoji + 颜色）和标签，删除时自动级联清理
- **搜索 & 筛选** — 关键词搜索，按分类/收藏筛选，多种排序（最新/最早/标题）
- **收藏 ⭐** — 标记常用技巧，首页可单独筛选已收藏内容
- **随机一条 🎲** — 一键随机跳转，适合灵感浏览
- **一键复制 📋** — 详情页复制技巧内容到剪贴板
- **搜索高亮 🔍** — 搜索结果中关键词自动高亮
- **统计看板 📊** — 总技巧数、分类分布柱状图、最常用标签 Top 5
- **暗色模式 🌙** — 侧边栏一键切换，设置持久化到 localStorage
- **手绘风格** — ZCOOL KuaiLe 字体，随机卡片旋转，SVG 毛边滤镜
- **数据持久化** — 所有数据自动同步到 localStorage

## 技术栈

- **React 19** — 函数组件 + Hooks
- **react-router-dom v7** — 声明式路由，URL 驱动筛选
- **Vite** — 构建工具
- **纯 CSS** — 无 UI 框架，全部手写样式 + CSS 变量换肤

## 快速开始

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # 生产构建到 dist/
npm run preview  # 预览生产构建
npm run lint     # ESLint 检查
```

## 项目结构

```
src/
├── context/AppContext.jsx    # 全局状态，所有 CRUD 方法
├── components/               # Layout, TipCard, TipForm, FilterBar, ConfirmDialog
├── pages/                    # Home, NewTip, EditTip, TipDetail, Categories, Tags, Stats
├── data/seed.js              # 初始种子数据（6 条技巧、5 个分类、6 个标签）
├── hooks/useLocalStorage.js  # localStorage 同步 Hook
├── index.css                 # 全部样式
├── App.jsx                   # 路由定义
└── main.jsx                  # 入口
```

## 数据模型

| 实体 | 字段 | localStorage 键 |
|---|---|---|
| Tip | id, title, content, categoryId, tagIds[], starred, createdAt, updatedAt | `ls_tips` |
| Category | id, name, emoji, color | `ls_categories` |
| Tag | id, name | `ls_tags` |

所有数据存储在浏览器 localStorage 中，首次访问自动加载种子数据。
