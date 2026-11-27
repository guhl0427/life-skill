# LifeSkill — 生活小技巧

LifeSkill 是一个手绘风格的生活技巧管理应用：把散落在收藏夹、备忘录和聊天记录里的生活小妙招集中记录下来，再用分类、标签和搜索快速找回来。

项目是纯前端单页应用（SPA），没有账号体系，也没有后端服务，全部数据保存在浏览器 `localStorage` 中。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [可用脚本](#可用脚本)
- [键盘快捷键](#键盘快捷键)
- [路由](#路由)
- [数据模型](#数据模型)
- [本地存储](#本地存储)
- [项目结构](#项目结构)
- [开发约定](#开发约定)
- [测试与持续集成](#测试与持续集成)
- [部署](#部署)
- [数据与隐私](#数据与隐私)
- [相关文档](#相关文档)

## 功能特性

### 记录与管理

- 创建、查看、编辑、删除技巧，支持标题、正文、适用场景、耗时、难度、材料清单、分步说明、注意事项等字段
- 新建和编辑表单会自动把未提交内容暂存到 `sessionStorage`，中途离开后再次进入可恢复草稿
- 标题、正文、注意事项等输入带实时字数提示和长度限制
- 收藏、置顶技巧；置顶内容始终排在列表最前
- 详情页可记录「今天用到了」，累计使用次数与最近使用时间
- 详情页按同分类或同标签推荐 3 条相关技巧

### 检索与筛选

- 全文搜索：匹配标题、正文、适用场景、耗时、难度、注意事项、材料、分类名和标签名
- 多关键词以空格分隔，按 AND 逻辑匹配，卡片中的命中词会高亮
- 按分类、收藏、标签（可多选，按 AND 组合）、未分类、无标签筛选
- 支持最新、最早、最近更新、最常用、最少使用、标题六种排序
- 搜索、筛选和排序状态保存在 URL 查询参数中，可直接分享或刷新恢复
- 首页提供「今天试试这个」随机推荐和最近浏览记录（最多 6 条）

### 批量操作

- 进入批量选择模式后可全选 / 取消全选当前筛选结果
- 批量设置分类、批量添加标签、批量收藏 / 取消收藏、批量移入回收站
- 筛选条件变化时会自动清空已选条目，避免误操作不可见的技巧

### 分类与标签

- 分类支持自定义名称、emoji 图标和颜色（预设色板、调色盘或十六进制色值）
- 标签支持新增、重命名、删除，以及把两个标签合并
- 分类和标签名称在新增、编辑时都会做重名校验
- 删除分类会把关联技巧的 `categoryId` 置空；删除标签会把该标签从所有技巧中移除；合并标签会把源标签替换为目标标签

### 回收站与撤销

- 删除技巧是软删除，先进入回收站，首页提示条支持立即撤销
- 回收站支持单条恢复、全部恢复、永久删除和清空
- 侧边栏会显示回收站中的条目数量

### 数据备份与迁移

- 一键导出全部技巧、分类、标签为 JSON 备份文件
- 导入支持「覆盖」和「合并」两种模式；合并时按 `id` 去重，保留更新时间较新的版本
- 导入前自动保存当前数据快照，可在设置页恢复到上次导入前的状态
- 导入的 JSON 会经过格式校验和字段清洗，非法条目会被过滤

### 导出与分享

- 单条技巧可复制为纯文本、导出为 Markdown 文件
- 首页可把当前筛选结果整体导出为 Markdown 合集
- 详情页可生成 1080 × 1440 的分享图片，提供手绘便签、墨绿夜读、编辑排版三种样式

### 统计看板

- 总技巧数、分类数、标签数、收藏数
- 累计使用次数、用过的技巧数、从未使用的技巧数
- 最常使用 Top 5、最久没用 Top 5
- 分类分布条形图、常用标签 Top 5
- 未分类、无标签、空分类、回收站等数据健康入口

### 界面与体验

- 手绘纸张风格：ZCOOL KuaiLe + Noto Sans SC + Caveat 字体，本地自托管，不依赖 Google Fonts
- 支持暗色模式，偏好写入 `localStorage`，并在 React 挂载前恢复以避免闪烁
- 桌面端固定侧边栏，移动端抽屉式导航；响应式卡片网格和筛选栏
- 多个标签页之间通过 `storage` 事件实时同步，并给出同步提示
- 存储空间不足时顶部显示错误横幅，避免修改静默丢失

## 技术栈

| 技术 | 用途 |
|---|---|
| React 19 | 组件与状态管理（Context + Hooks） |
| react-router-dom v7 | 客户端路由与 URL 查询参数 |
| Vite 8 | 开发服务器与生产构建 |
| Tailwind CSS 4 | 通过 `@tailwindcss/vite` 接入，设计令牌集中在 `src/index.css` |
| Vitest 5 + Testing Library | 单元测试与组件测试 |
| Oxlint | 代码检查 |
| @fontsource 字体包 | 本地自托管中文与手写字体 |
| localStorage / sessionStorage | 数据持久化、草稿暂存、最近浏览 |

项目只使用 JSX，不使用 TypeScript，也没有类型检查步骤。

## 快速开始

建议使用 Node 24（与 CI 保持一致），包管理器使用 npm。

```sh
npm install
npm run dev
```

开发服务器默认运行在 http://localhost:5173。

首次访问会写入预设数据：78 条技巧、24 个分类、24 个标签。之后启动只会在预设数据升级时补充缺失条目，不会覆盖用户自己创建或导入的数据。

## 可用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | 使用 Oxlint 检查 JS/JSX |
| `npm test` | 运行全部 Vitest 单元测试 |
| `npm run test:watch` | 监听模式运行测试 |

## 键盘快捷键

| 快捷键 | 作用 |
|---|---|
| `/` 或 `Ctrl/Cmd + K` | 聚焦顶部搜索框 |
| `N` | 打开新建技巧页 |
| `Esc` | 关闭确认弹窗或分享图弹窗 |

在输入框、文本域、下拉框或可编辑区域内输入时，快捷键不会触发。

## 路由

| 路径 | 页面 | 主要行为 |
|---|---|---|
| `/` | 首页 | 卡片网格、搜索、筛选、排序、批量操作、Markdown 导出 |
| `/tips/new` | 新建技巧 | 提交后创建技巧并返回首页 |
| `/tips/:id` | 技巧详情 | 完整内容、使用记录、复制、导出、分享图、编辑、删除 |
| `/tips/:id/edit` | 编辑技巧 | 预填表单，提交后返回详情页 |
| `/categories` | 分类管理 | 新增、编辑、删除分类，展示每个分类的技巧数 |
| `/tags` | 标签管理 | 新增、编辑、删除、合并标签，展示使用次数 |
| `/stats` | 统计看板 | 总量、使用情况、分类分布、Top 标签、数据健康入口 |
| `/trash` | 回收站 | 恢复、全部恢复、永久删除、清空 |
| `/settings` | 设置 | 导出备份、覆盖 / 合并导入、恢复导入前快照 |
| `*` | 404 | 未匹配路径的回退页面 |

首页支持的查询参数：`?cat=`、`?q=`、`?starred=1`、`?tag=`（可重复）、`?untagged=1`、`?sort=`。

## 数据模型

### 技巧（Tip）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识 |
| `title` | string | 标题，最多 60 字 |
| `content` | string | 正文，最多 2000 字 |
| `categoryId` | string \| null | 所属分类 |
| `tagIds` | string[] | 标签 id 列表 |
| `steps` | string[] | 分步说明 |
| `materials` | string[] | 材料清单 |
| `scenario` | string | 适用场景 |
| `duration` | string | 耗时描述 |
| `difficulty` | string | 难度：简单 / 适中 / 较难 / 空 |
| `notes` | string | 注意事项，最多 300 字 |
| `starred` | boolean | 是否收藏 |
| `pinned` | boolean | 是否置顶 |
| `usageCount` | number | 使用次数 |
| `lastUsedAt` | number \| null | 最近使用时间戳 |
| `deletedAt` | number \| null | 删除时间戳；非空表示在回收站 |
| `createdAt` | number | 创建时间戳 |
| `updatedAt` | number | 更新时间戳 |

### 分类（Category）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识 |
| `name` | string | 分类名称，最多 12 字 |
| `emoji` | string | 图标 |
| `color` | string | 十六进制颜色值 |

### 标签（Tag）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识 |
| `name` | string | 标签名称，最多 12 字 |

技巧与分类、标签之间通过 id 关联。删除分类或标签时会级联更新技巧数据。

## 本地存储

| 键 | 存储位置 | 内容 |
|---|---|---|
| `ls_tips` | localStorage | 全部技巧（含回收站条目） |
| `ls_categories` | localStorage | 分类列表 |
| `ls_tags` | localStorage | 标签列表 |
| `ls_seed_version` | localStorage | 预设数据版本，用于增量补充新预设 |
| `ls_dark` | localStorage | 暗色模式偏好 |
| `ls_recent_tips` | localStorage | 最近浏览的技巧 id，最多 6 条 |
| `ls_backup_auto` | localStorage | 导入前自动生成的 JSON 快照 |
| `ls_draft:<id \| new>` | sessionStorage | 未提交的表单草稿 |

`useLocalStorage` 会在值变化时自动写回，并监听其他标签页的 `storage` 事件；写入失败会派发 `ls-storage-error` 事件，由布局层展示错误横幅。

## 项目结构

```
life-skill/
├── .github/workflows/          # CI 与 GitHub Pages 部署
├── docs/                       # Code Wiki、需求与项目背景
├── public/                     # favicon、SVG 图标、Netlify 重定向
├── src/
│   ├── components/             # Layout、TipCard、TipForm、FilterBar、Select、弹窗等
│   ├── context/
│   │   ├── app-context.js      # createContext 对象
│   │   ├── useApp.js           # 消费 Hook
│   │   └── AppContext.jsx      # AppProvider、全部 CRUD 与级联逻辑
│   ├── data/seed.js            # 预设技巧、分类、标签
│   ├── hooks/useLocalStorage.js
│   ├── pages/                  # Home、NewTip、EditTip、TipDetail、Categories、Tags、Stats、Trash、Settings、NotFound
│   ├── utils/                  # 日期格式化、搜索、备份、Markdown 导出、分享图、最近浏览
│   ├── test/setup.js           # jest-dom 匹配器
│   ├── index.css               # Tailwind 入口、主题变量、手绘效果
│   ├── App.jsx                 # 路由定义
│   └── main.jsx                # 入口（BrowserRouter + AppProvider）
├── index.html                  # 暗色模式预置脚本与 SVG 滤镜
├── vite.config.js              # Vite + Tailwind + Vitest 配置
├── vercel.json                 # Vercel SPA 回退
└── package.json
```

## 开发约定

- 只写 `.jsx` / `.js`，不使用 TypeScript；组件使用函数组件和 Hooks
- 全局状态统一放在 `AppProvider` 中，组件通过 `useApp` 读取；Provider 文件保持只导出组件，便于 Fast Refresh
- 状态持久化统一使用 `useLocalStorage`，不要自行散写 `localStorage.setItem`
- 样式直接使用 Tailwind 工具类；共享的按钮、表单类名放在 `src/components/ui.js`
- `src/index.css` 只放 Tailwind 引入、主题变量、基础样式和 `@layer components` 中的手绘效果，不为单个组件新建 CSS 文件
- 颜色、字体、阴影使用 `index.css` 中定义的设计令牌（`--color-*`、`font-display`、`shadow-ink` 等）
- 图标使用 `src/components/Icon.jsx`；分类和标签的 emoji 属于数据，不放进图标组件
- 日期统一通过 `src/utils/format.js` 格式化，不引入额外日期库
- 可点击的分类、标签、筛选项使用真实的 `<button>`，选中状态通过 `aria-pressed` 表达
- 新增或修改核心逻辑时同步补充对应的 `*.test.js(x)`

## 测试与持续集成

```sh
npm run lint
npm test
npm run build
```

测试覆盖 Context 的 CRUD 与级联删除、首页筛选与搜索、表单、详情页、分类 / 标签 / 回收站 / 设置页，以及 `useLocalStorage`、备份解析、搜索、日期格式化、Markdown 导出和最近浏览等工具函数。

`.github/workflows/ci.yml` 在 GitHub Actions 上使用 Node 24 执行 `npm ci`、`npm run lint`、`npm test` 和 `npm run build`；推送和 Pull Request 都会触发。

## 部署

应用使用 `BrowserRouter`，静态托管必须配置 SPA 回退，否则刷新子路径会 404。

仓库已内置：

- **Vercel**：`vercel.json` 将所有路径重写到 `index.html`
- **Netlify**：`public/_redirects` 提供回退规则
- **GitHub Pages**：`.github/workflows/deploy.yml` 在 `main` 分支推送时构建，使用 `PAGES_BASE=/<仓库名>/` 作为 base，并把 `index.html` 复制为 `404.html` 作为回退

部署到其他静态平台时，需要把 `vite.config.js` 的 `base` 调整为实际子路径，并配置等价的 SPA fallback。

## 数据与隐私

- 所有数据只存在于当前浏览器，不会上传到服务器，也没有账号或云同步
- 清除浏览器站点数据、使用无痕模式或更换浏览器 / 设备都会导致数据不可用
- 建议定期在「设置」页导出 JSON 备份；导入前系统还会自动保留一份当前数据快照
- 浏览器存储配额不足时，页面顶部会出现提示，最近的修改可能未保存

## 相关文档

- [Code Wiki](docs/CODE_WIKI.md)：整体架构、模块职责、关键函数、数据模型、样式系统、测试与部署细节
- [需求文档](docs/plans.md)
- [项目背景](docs/introduce.md)
