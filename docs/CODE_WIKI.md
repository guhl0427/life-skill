# LifeSkill Code Wiki

> 本文档基于仓库当前源码（`src/`、构建配置、测试与 CI）整理，描述项目架构、模块职责、关键函数、依赖关系与运行方式。
>
> 适用版本：`package.json` 中 `life-skill@0.0.0`

---

## 1. 项目概览

LifeSkill（生活小技巧）是一个**纯前端、手绘风格的单页应用（SPA）**，用于记录、分类、检索生活小妙招。应用没有后端服务，所有数据保存在浏览器 `localStorage` 中，首次访问自动写入种子数据。

核心能力：

| 能力 | 说明 |
|---|---|
| 技巧 CRUD | 创建 / 查看 / 编辑 / 软删除，支持可选的分步说明 `steps` |
| 分类管理 | 分类含 emoji 与主题色，删除时级联把相关技巧置为未分类 |
| 标签管理 | 多标签关联，删除时级联从所有技巧中移除该标签 |
| 搜索 | 标题、正文、分类名、标签名全文匹配，多关键词 AND，结果高亮与摘要截取 |
| 筛选 / 排序 | 按分类、收藏、标签、未分类、无标签筛选；最新 / 最早 / 最近更新 / 最常用 / 标题排序 |
| 回收站 | 删除为软删除（`deletedAt`），可恢复、永久删除、清空 |
| 使用记录 | “今天用到了”累计 `usageCount` 与 `lastUsedAt` |
| 批量操作 | 多选后批量设置分类或批量移入回收站 |
| 备份 | 导出 JSON、覆盖导入、按 id 合并导入、导入前自动快照与恢复 |
| 统计看板 | 总量、分类分布、Top 5 标签、数据健康入口 |
| 主题 | 暗色模式（`ls_dark`），首屏内联脚本避免闪烁 |
| 跨标签页同步 | 监听 `storage` 事件，多标签页数据实时同步并提示 |

---

## 2. 快速开始（运行方式）

环境要求：Node.js（CI 使用 **Node 24**）、npm。

```sh
npm install          # 安装依赖
npm run dev          # 开发服务器，默认 http://localhost:5173
npm run build        # 生产构建，输出到 dist/
npm run preview      # 本地预览生产构建
npm run lint         # Oxlint 检查
npm test             # Vitest 单次运行
npm run test:watch   # Vitest 监听模式
```

### 构建变体

`vite.config.js` 中：

```js
base: process.env.PAGES_BASE || '/'
```

- 默认部署在域名根路径。
- 部署到 GitHub Pages 子路径时，通过 `PAGES_BASE=/<repo>/` 指定 base。

---

## 3. 技术栈与依赖

### 运行时依赖

| 依赖 | 版本 | 用途 |
|---|---|---|
| `react` | ^19.3.1 | UI 函数组件与 Hooks |
| `react-dom` | ^19.3.1 | 渲染到 DOM |
| `react-router-dom` | ^7.18.5 | 声明式路由、`NavLink`、URL 查询参数 |

### 开发依赖

| 依赖 | 用途 |
|---|---|
| `vite` ^8.3.8 | 开发服务器与构建 |
| `@vitejs/plugin-react` | JSX / Fast Refresh |
| `tailwindcss` ^4.3.5 + `@tailwindcss/vite` | 原子化样式与设计令牌 |
| `vitest` ^5.1.0 + `jsdom` | 单元测试与 DOM 环境 |
| `@testing-library/react`、`@testing-library/jest-dom` | 组件测试与断言 |
| `oxlint` ^1.93.0 | 代码检查（含 React Hooks / React Refresh 规则） |

> 项目**不使用 TypeScript**，没有类型检查步骤；源文件统一为 `.jsx`。

---

## 4. 目录结构

```
.
├── index.html                     # HTML 模板：挂载点、暗色首屏脚本、SVG 毛边滤镜
├── vite.config.js                 # Vite + Tailwind 插件 + Vitest 配置
├── vercel.json                    # Vercel SPA rewrite
├── public/
│   ├── _redirects                 # Netlify SPA fallback
│   ├── favicon.svg
│   └── icons.svg
├── .github/workflows/
│   ├── ci.yml                     # lint + test + build
│   └── deploy.yml                 # GitHub Pages 部署
├── docs/
│   ├── introduce.md               # 项目背景与核心逻辑说明
│   ├── plans.md                   # 需求文档
│   └── CODE_WIKI.md               # 本文档
└── src/
    ├── main.jsx                   # 入口：StrictMode + BrowserRouter + AppProvider
    ├── App.jsx                    # 路由表
    ├── index.css                  # Tailwind 入口、设计令牌、手绘效果与动画
    ├── context/
    │   ├── app-context.js         # createContext 对象
    │   ├── useApp.js              # 消费 Context 的 Hook
    │   ├── AppContext.jsx         # AppProvider：全局状态与全部 CRUD
    │   └── AppContext.test.jsx
    ├── hooks/
    │   ├── useLocalStorage.js     # 持久化 + 跨标签页同步
    │   └── useLocalStorage.test.js
    ├── components/
    │   ├── Layout.jsx             # 侧边栏 / 顶栏 / 搜索 / 主题 / 全局提示
    │   ├── TipCard.jsx            # 技巧卡片
    │   ├── TipForm.jsx            # 新建 / 编辑共用表单
    │   ├── FilterBar.jsx          # 分类、收藏芯片与排序
    │   ├── ConfirmDialog.jsx      # 可访问的确认弹窗
    │   ├── ui.js                  # 共享 Tailwind 类名常量
    │   └── TipForm.test.jsx
    ├── pages/
    │   ├── Home.jsx               # 首页：筛选、搜索、批量、备份
    │   ├── NewTip.jsx
    │   ├── EditTip.jsx
    │   ├── TipDetail.jsx
    │   ├── Categories.jsx
    │   ├── Tags.jsx
    │   ├── Stats.jsx
    │   ├── Trash.jsx
    │   ├── NotFound.jsx
    │   └── *.test.jsx
    ├── data/seed.js               # 初始分类 / 标签 / 技巧
    ├── utils/
    │   ├── format.js              # 日期格式化
    │   ├── search.js              # 关键词匹配、摘要、高亮切分
    │   ├── backup.js              # 备份构建、解析校验、合并、快照
    │   └── *.test.js
    ├── test/setup.js              # jest-dom 匹配器与 cleanup
    └── assets/                    # 静态图片（hero.png 等）
```

---

## 5. 整体架构

### 5.1 分层视图

```
┌──────────────────────────────────────────────────────────────┐
│ 表现层 (pages / components)                                   │
│   Layout、Home、TipDetail、TipForm、TipCard、FilterBar …      │
│   · 只通过 useApp() 读取状态、调用动作                         │
│   · 筛选/搜索/排序状态存放在 URL SearchParams                  │
└───────────────────────────┬──────────────────────────────────┘
                            │ useApp()
┌───────────────────────────▼──────────────────────────────────┐
│ 状态层 (context)                                              │
│   AppProvider：tips / categories / tags 单一数据源            │
│   · CRUD 方法（含软删除、级联清理、使用计数、批量导入）        │
│   · categoryMap / tagMap 派生索引（useMemo）                  │
└───────────────────────────┬──────────────────────────────────┘
                            │ [value, setValue]
┌───────────────────────────▼──────────────────────────────────┐
│ 持久化层 (hooks/useLocalStorage)                              │
│   · 懒初始化读取 localStorage                                 │
│   · state 变化 → JSON 序列化写回                              │
│   · storage 事件 → 跨标签页同步 + 广播自定义事件               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                   浏览器 localStorage
```

### 5.2 应用启动流程

1. `index.html` 加载，先执行内联脚本：若 `ls_dark === "true"`，给 `<html>` 加 `data-theme="dark"`，避免暗色模式闪白。
2. 加载 `/src/main.jsx`。
3. `createRoot(#root).render(...)`，组件树为：

```
StrictMode
└── BrowserRouter (basename = import.meta.env.BASE_URL)
    └── AppProvider
        └── App
            └── Layout
                └── <Routes> → 对应页面
```

4. `AppProvider` 中的三个 `useLocalStorage` 分别读取 `ls_tips`、`ls_categories`、`ls_tags`；不存在时使用 `src/data/seed.js` 的种子数据。
5. `Layout` 常驻渲染侧边栏、顶栏与全局提示，页面内容通过 `children` 注入 `<main>`。

### 5.3 关键数据流

```
创建技巧：
 TipForm.onSubmit(payload)
   → AppProvider.addTip(payload)
   → setTips(prev => [newTip, ...prev])     // 生成 id、时间戳、默认值
   → useLocalStorage 写入 ls_tips
   → Context 值变化 → 依赖组件重渲染

删除技巧（软删除）：
 ConfirmDialog.onConfirm
   → deleteTip(id) → 写入 deletedAt
   → 列表过滤 !deletedAt 后不再展示
   → 首页提示条提供“撤销” → restoreTip(id)

搜索 / 筛选：
 顶栏 form → navigate("/?q=关键词")
   → Home 读取 useSearchParams
   → useMemo 过滤 + 排序
   → TipCard 用 splitByKeywords 高亮、getSnippet 截取摘要

备份导入：
 选择文件 → parseBackup(raw) 校验并清洗
   → 弹窗选择“覆盖并导入”或“合并导入”
   → saveSnapshot(当前数据) 写入 ls_backup_auto
   → importData(next) 整体替换三类数据
```

### 5.4 状态管理策略

| 状态类型 | 存放位置 | 示例 |
|---|---|---|
| 业务数据 | `AppProvider` + `localStorage` | tips、categories、tags |
| 列表筛选/排序/搜索 | URL `SearchParams` | `?cat=`、`?q=`、`?tag=`、`?untagged=`、`?starred=`、`?sort=` |
| 页面局部 UI | 组件 `useState` | 弹窗开关、编辑态、批量选择集合、错误提示 |
| 主题 | `localStorage.ls_dark` + `data-theme` | 侧边栏切换 |
| 导入前快照 | `localStorage.ls_backup_auto` | 恢复上一次导入前的数据 |

> 设计要点：可分享、可刷新保持的列表状态一律进 URL；只有纯 UI 状态留在组件内。

---

## 6. 数据模型与持久化

### 6.1 实体定义

#### Tip（技巧）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识，`id-<时间戳36进制>-<自增序号>` |
| `title` | string | 标题，表单限制 60 字符 |
| `content` | string | 正文，表单限制 2000 字符 |
| `categoryId` | string \| null | 所属分类；`null` 表示未分类 |
| `tagIds` | string[] | 标签 ID 列表 |
| `steps` | string[] | 可选的分步说明 |
| `starred` | boolean | 是否收藏 |
| `usageCount` | number | 使用次数，默认 0 |
| `lastUsedAt` | number \| null | 最近一次使用时间戳 |
| `deletedAt` | number \| null | 软删除时间戳；有值即在回收站 |
| `createdAt` | number | 创建时间戳 |
| `updatedAt` | number | 更新时间戳 |

> 种子数据中的部分技巧没有 `steps` / `usageCount` / `lastUsedAt` / `deletedAt` 字段，读取处普遍使用可选链或默认值兜底（如 `t.tagIds || []`、`t.usageCount || 0`、`!t.deletedAt`）。

#### Category（分类）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识 |
| `name` | string | 分类名，最长 12 字符，重名（忽略大小写与首尾空格）被拒绝 |
| `emoji` | string | 图标，缺省 `📌` |
| `color` | string | 十六进制颜色，缺省 `#7EB8A0` |

#### Tag（标签）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识 |
| `name` | string | 标签名，最长 12 字符，重名被拒绝 |

### 6.2 localStorage 键

| 键 | 内容 | 写入方 |
|---|---|---|
| `ls_tips` | `Tip[]` | `AppProvider` 经 `useLocalStorage` |
| `ls_categories` | `Category[]` | 同上 |
| `ls_tags` | `Tag[]` | 同上 |
| `ls_dark` | `"true"` / `"false"` | `Layout` 主题切换、`index.html` 首屏脚本读取 |
| `ls_backup_auto` | 备份对象（`SNAPSHOT_KEY`） | `utils/backup.js` 的 `saveSnapshot` |

### 6.3 种子数据（`src/data/seed.js`）

- 分类 5 个：清洁妙招 🧹、收纳整理 📦、厨房技巧 🍳、生活窍门 💡、健康养生 🌿（各带主题色）。
- 标签 6 个：省钱、省时、环保、DIY、急救、冷知识。
- 技巧 6 条（`tip-1` ~ `tip-6`），创建时间从 5 天前到当天递增，其中 `tip-1`、`tip-5` 为收藏状态。

---

## 7. 路由与页面导航

路由定义在 `src/App.jsx`，所有页面共享 `Layout`。

| 路径 | 页面组件 | 关键行为 |
|---|---|---|
| `/` | `Home` | URL 驱动的筛选/搜索/排序；导出/导入备份；批量选择；删除撤销提示 |
| `/tips/new` | `NewTip` | 渲染 `TipForm`，提交后 `addTip` 并跳回 `/` |
| `/tips/:id` | `TipDetail` | 详情、收藏、使用记录、复制、编辑/删除入口、相关技巧 |
| `/tips/:id/edit` | `EditTip` | 以 `tip.id` 作为 `TipForm` 的 key 预填表单，提交后回退 |
| `/categories` | `Categories` | 分类增删改（行内编辑、颜色色板、级联删除） |
| `/tags` | `Tags` | 标签增删改（行内编辑、级联删除） |
| `/stats` | `Stats` | 统计汇总、分类分布条、Top 5 标签、数据健康入口 |
| `/trash` | `Trash` | 回收站列表、恢复、永久删除、清空 |
| `*` | `NotFound` | 未知路径兜底 |

### Home 支持的查询参数

| 参数 | 取值 | 含义 |
|---|---|---|
| `q` | 任意字符串 | 关键词搜索（多关键词空格分隔，AND 匹配） |
| `cat` | 分类 id 或 `__none__` | 按分类筛选；`__none__` 表示未分类 |
| `starred` | `1` | 只看收藏 |
| `tag` | 标签 id | 按标签筛选；仅当 `tagMap` 中存在时生效 |
| `untagged` | `1` | 只看无标签技巧 |
| `sort` | `newest`（默认）/`oldest`/`title`/`updated`/`most` | 排序方式 |

> 多种筛选可组合生效（如 `?cat=cat-1&tag=tag-1`）。非法/未知 `sort` 值回退为 `newest`。

---

## 8. 核心模块详解

### 8.1 Context 层

#### `src/context/app-context.js`

```js
export const AppContext = createContext(null)
```

单独抽出 Context 对象，避免与 Provider 组件混在一个文件里，便于 Fast Refresh 与按需引用。

#### `src/context/useApp.js`

```js
export function useApp() { ... }
```

读取 `AppContext`；若在 `AppProvider` 之外使用则抛出 `useApp must be used within AppProvider`，尽早暴露误用。

#### `src/context/AppContext.jsx`

`AppProvider` 是全局唯一的业务状态容器：

- 三个持久化状态：`tips`、`categories`、`tags`。
- 两个派生索引：`categoryMap`、`tagMap`（`Map<id, entity>`，`useMemo` 缓存），供列表卡片 O(1) 查找分类与标签。
- ID 生成：模块级自增变量 `_id` + `Date.now().toString(36)`，格式 `id-<base36>-<n>`。
- 所有动作均用 `useCallback` 包裹，保持引用稳定。

**Context 暴露的 API**

| 方法 | 签名 | 行为 |
|---|---|---|
| `addTip` | `(tip) => void` | 生成 id，补默认值 `starred:false`、`usageCount:0`、`lastUsedAt:null`、`createdAt/updatedAt:now`，插入数组头部 |
| `updateTip` | `(id, updates) => void` | 合并字段并刷新 `updatedAt` |
| `deleteTip` | `(id) => void` | **软删除**，写入 `deletedAt: Date.now()` |
| `restoreTip` | `(id) => void` | `deletedAt` 置 `null` |
| `purgeTip` | `(id) => void` | 从数组永久移除 |
| `emptyTrash` | `() => void` | 移除所有 `deletedAt` 非空的技巧 |
| `getTip` | `(id) => Tip \| undefined` | 仅在未删除的技巧中查找 |
| `toggleStar` | `(id) => void` | 翻转 `starred` |
| `markUsed` | `(id) => void` | `usageCount + 1`、`lastUsedAt = now`；**不修改 `updatedAt`** |
| `addCategory` | `(cat) => Category` | 生成 id，追加到末尾，并返回新建对象（供表单自动选中） |
| `updateCategory` | `(id, updates) => void` | 合并更新 |
| `deleteCategory` | `(id) => void` | 删除分类，并把所有 `categoryId === id` 的技巧置为 `null` |
| `addTag` | `(tag) => Tag` | 生成 id，追加并返回新建对象 |
| `updateTag` | `(id, updates) => void` | 合并更新 |
| `deleteTag` | `(id) => void` | 删除标签，并从所有技巧的 `tagIds` 中过滤掉该 id |
| `importData` | `({tips, categories, tags}) => void` | 三类数据整体替换（覆盖导入 / 合并结果 / 快照恢复共用） |

级联清理（`deleteCategory` / `deleteTag`）是项目的关键一致性保证，`AppContext.test.jsx` 对其有专门覆盖。

---

### 8.2 Hooks 层

#### `src/hooks/useLocalStorage.js`

```js
const [value, setValue] = useLocalStorage(key, initialValue)
```

职责：把 `useState` 与 `localStorage` 双向绑定，并支持跨标签页同步。

**初始化**

- `useState` 惰性初始化：`localStorage.getItem(key)` 存在则 `JSON.parse`，解析失败或不存在时使用 `initialValue`。
- `serializedRef` 记录“最后一次已知写盘值”（初始为 `localStorage.getItem(key)`），用于去重。

**写盘副作用**

```js
useEffect(() => {
  const serialized = JSON.stringify(value)
  if (serialized === serializedRef.current) return   // 无变化不写
  try {
    localStorage.setItem(key, serialized)
    serializedRef.current = serialized
  } catch (e) {
    // 通常为配额不足
    window.dispatchEvent(new CustomEvent("ls-storage-error", { detail: { key } }))
  }
}, [key, value])
```

**跨标签页同步**

监听 `window` 的 `storage` 事件：

- 忽略 `e.key !== key` 与 `e.newValue === null`（删除操作不处理）。
- 若 `newValue` 与本地已序列化值相同则忽略，避免回环。
- 解析成功后更新 `serializedRef`、调用 `setValue`，并派发 `ls-storage-sync` 事件（`detail.key` 为键名）。

> 注意：`storage` 事件只会在**其他标签页**触发，不会在当前写入页触发。

**对外广播的两个自定义事件**

| 事件 | 触发时机 | 消费方 |
|---|---|---|
| `ls-storage-error` | 写盘失败（如超配额） | `Layout` 顶部错误横幅 |
| `ls-storage-sync` | 收到并应用其他标签页的更新 | `Layout` “已同步其他标签页的修改”提示 |

---

### 8.3 工具层（utils）

#### `src/utils/format.js`

| 函数 | 输出 | 说明 |
|---|---|---|
| `formatDate(ts)` | `yyyy/MM/dd` | 使用本地时区，手写补零，不依赖日期库 |
| `formatDateTime(ts)` | `yyyy/MM/dd HH:mm` | 在 `formatDate` 基础上追加时分 |

#### `src/utils/search.js`

| 函数 | 签名 | 说明 |
|---|---|---|
| `getKeywords` | `(query) => string[]` | 转小写后按空白切分并去空 |
| `matchesTip` | `(tip, query, categoryMap, tagMap) => boolean` | 把所有关键词与 `title`、`content`、分类名、标签名拼成的 haystack 做**全部包含**判断；无关键词返回 `true` |
| `getSnippet` | `(text, query, maxLength = 90) => string` | 找到最早出现的关键词位置，截取窗口（起点向前留约 1/3 长度），必要时首尾加 `…`；无命中或文本较短则原样返回 |
| `splitByKeywords` | `(text, query) => {text, match}[]` | 构造转义且按长度降序的关键词正则，保留分隔符切分，输出带 `match` 标记的片段，供 `<mark>` 高亮 |

#### `src/utils/backup.js`

| 导出 | 签名 | 说明 |
|---|---|---|
| `SNAPSHOT_KEY` | `"ls_backup_auto"` | 自动快照键 |
| `buildBackup` | `({tips, categories, tags}) => object` | 生成 `{ app:"lifeskill", version:1, exportedAt, tips, categories, tags }` |
| `mergeBackup` | `(current, incoming) => {tips,categories,tags}` | 按 `id` 去重合并：分类/标签冲突保留本地；技巧冲突保留 `updatedAt || createdAt` 较新者 |
| `saveSnapshot` | `(data) => boolean` | 写入 `ls_backup_auto`，失败返回 `false` |
| `readSnapshot` | `() => parsed \| null` | 读取并 `parseBackup`，损坏或不存在返回 `null` |
| `parseBackup` | `(raw) => {tips,categories,tags}` | 解析 + 校验 + 清洗，失败抛出中文错误 |

**`parseBackup` 的清洗规则**

1. JSON 解析失败 → `文件不是合法的 JSON`。
2. 顶层必须是对象且 `tips` / `categories` / `tags` 均为数组，否则 `备份文件格式不正确`。
3. 分类：保留有 `id`、`name` 的项，缺失 `emoji` 补 `📌`，缺失 `color` 补 `#7EB8A0`。
4. 标签：保留有 `id`、`name` 的项。
5. 技巧：保留有 `id`、`title` 的项；`categoryId` 若指向不存在的分类则置 `null`；`tagIds` 过滤掉不存在的标签；`steps` 仅保留非空字符串并 trim；`starred` 布尔化；`usageCount` / `lastUsedAt` / `deletedAt` / `createdAt` / `updatedAt` 做数值校验并补默认值。
6. 三类数据全为空 → `备份文件里没有可导入的数据`。

---

### 8.4 组件层

#### `Layout.jsx`

全局框架，承托所有页面：

- **布局**：`grid md:grid-cols-[200px_1fr]`，桌面左侧固定侧边栏（`md:sticky`），移动端为抽屉。
- **侧边栏**：Logo、五个导航项（首页 / 统计看板 / 分类管理 / 标签管理 / 回收站 + 回收站数量角标）、分类快捷入口（带每个分类的技巧数）、底部深浅色切换。
- **移动端抽屉**：`menuOpen` / `closing` 双状态配合 CSS `slideIn` / `slideOut` 动画，`onAnimationEnd` 收尾关闭；遮罩层点击关闭。
- **顶栏**：移动端菜单按钮、搜索表单、`+ 新技巧` 按钮。搜索提交后 `navigate("/?q=...")`；输入框用 `key={location.key}` 强制在路由变化时重建，`defaultValue` 同步 URL 中的 `q`。
- **主题**：`dark` 初始值读取 `ls_dark`；变更时写 `document.documentElement` 的 `data-theme` 并持久化。
- **全局提示**：
  - `ls-storage-error` → 顶部“本地存储空间不足”横幅（可关闭）。
  - `ls-storage-sync` 且 key 属于三类业务数据 → 顶部“已同步其他标签页的修改”，3 秒后消失。
- **派生数据**：`tipsByCategory`（排除已删除）与 `trashedCount`。

#### `TipCard.jsx`

| Prop | 说明 |
|---|---|
| `tip` | 技巧对象 |
| `search` | 当前搜索词，非空时标题/正文/标签/分类名做高亮 |
| `showActions` | 是否显示 hover 出现的“编辑/删除” |
| `onDelete` | 删除回调（由父组件弹出确认框） |
| `selectable` | 批量选择模式下显示选择按钮 |
| `selected` | 当前卡片是否被选中 |
| `onSelect` | 选择切换回调 |

实现要点：整卡不是链接，标题与正文包在 `<Link>` 中；收藏按钮 `preventDefault + stopPropagation` 避免触发跳转；标签链接指向 `/?tag=<id>`；搜索态正文用 `getSnippet` 截取后再高亮。

#### `TipForm.jsx`

新建与编辑共用的受控表单。

| Prop | 说明 |
|---|---|
| `initial` | 初始值（编辑时传入完整 tip） |
| `onSubmit(data)` | 提交回调，`data = { title, content, categoryId, tagIds, steps }` |
| `onCancel()` | 取消回调 |

本地状态：标题、内容、分类、标签集合、步骤数组、错误信息、两个“快速新建”面板的开关与输入。

行为：

- 标题 / 内容为空时阻止提交并显示错误。
- 提交时对 `title`、`content`、每个 `step` 做 `trim`，并过滤空步骤。
- **就地新建分类**：校验非空与重名（忽略大小写、trim），`addCategory` 后自动选中新分类并收起输入。
- **就地新建标签**：同上，`addTag` 后自动加入已选标签。
- 标签以多选 chip 呈现，使用 `aria-pressed` 表达选中态。
- 输入长度限制：标题 60、内容 2000、步骤 200、分类/标签名 12。

#### `FilterBar.jsx`

- 芯片按钮：`全部`（清除所有筛选）、`⭐ 已收藏`、每个分类（激活时使用分类自身颜色）。
- 排序下拉：最新 / 最近更新 / 最常用 / 最早 / 标题 A-Z。
- 所有芯片为真实 `<button>`，选中态通过 `aria-pressed` 暴露。
- 移动端横向滚动容器 `.filter-scroll`。

#### `ConfirmDialog.jsx`

可访问的确认弹窗：

| Prop | 默认 | 说明 |
|---|---|---|
| `title` | — | 标题 |
| `message` | — | 描述 |
| `confirmText` | `"确认删除"` | 主按钮文案 |
| `secondaryText` / `onSecondary` | — | 可选第三按钮（如“合并导入”） |
| `onConfirm` / `onCancel` | — | 确认 / 取消 |

无障碍与交互：

- `role="dialog"`、`aria-modal`、`aria-labelledby`、`aria-describedby`。
- 打开时自动聚焦确认按钮，关闭时把焦点还给之前的元素。
- `Esc` 取消；`Tab` / `Shift+Tab` 在弹窗按钮间循环（简易焦点陷阱）。
- 点击遮罩取消，点击内容区 `stopPropagation`。

#### `ui.js`

集中共享的 Tailwind 类名常量，保证全站按钮、输入框、标题风格一致：

`btnPrimary`、`btnOutline`、`btnDanger`、`btnSm`、`field`、`label`、`pageTitle`、`pageDesc`、`backLink`。

---

### 8.5 页面层

#### `Home.jsx`（最复杂页面）

职责：

1. **读取 URL 筛选条件**：`cat`、`q`、`starred`、`tag`、`untagged`、`sort`（含合法性校验）。
2. **过滤 + 排序**（`useMemo`）：
   - 先排除 `deletedAt`。
   - 收藏 → 分类（`__none__` 特判）→ 标签 → 无标签 → 关键词搜索，逐层收窄。
   - 排序：`newest` / `oldest` / `updated`（回退 `createdAt`）/ `most`（按 `usageCount`，再用 `lastUsedAt` 兜底）/ `title`（`localeCompare(..., "zh")`）。
3. **筛选交互**：全部、收藏、分类、标签、未分类/无标签的切换都通过修改 `SearchParams` 完成，保证可刷新、可分享。
4. **删除与撤销**：单条删除弹 `ConfirmDialog`；确认后 `deleteTip` 并显示 4 秒提示条，带“撤销”按钮调用 `restoreTip`。
5. **批量模式**：进入多选后可按当前可见列表全选/取消全选，批量设置分类（含“未分类”）或批量删除（需二次确认）。
6. **备份**：
   - 导出：`buildBackup` → `Blob` → 触发下载，文件名 `lifeskill-<yyyy-MM-dd>.json`。
   - 导入：读取文件文本 → `parseBackup`；失败提示错误信息。
   - 覆盖 / 合并：确认弹窗支持“覆盖并导入”与“合并导入”。
   - 导入前调用 `saveSnapshot(当前数据)`；若存在 `ls_backup_auto`，可“恢复导入前备份”。
7. **空状态**：无结果时按“是否处于搜索”给出不同引导文案。

#### `TipDetail.jsx`

- 通过 `getTip(id)` 获取未删除的技巧；不存在时展示“技巧不存在 + 返回首页”。
- 展示分类 chip（分类色淡化背景）、收藏按钮、创建时间与编辑时间。
- 正文 `whitespace-pre-wrap`；有 `steps` 时按编号渲染列表。
- “✅ 今天用到了”→ `markUsed`，展示累计次数与最近使用日期。
- 标签可点击跳转 `/?tag=<id>`。
- **复制**：拼接“分类 / 标题 / 正文 / 步骤 / 标签 / 来源与创建时间”，写入剪贴板，成功后按钮短暂显示“已复制”。
- **相关技巧**：在未删除技巧中，排除自身后匹配“同分类或共享任一标签”，取前 3 条。
- 删除：确认后 `deleteTip` 并 `navigate("/", { state: { deletedId } })`，首页据此显示撤销提示。

#### `NewTip.jsx` / `EditTip.jsx`

- `NewTip`：`TipForm.onSubmit → addTip → navigate("/")`。
- `EditTip`：不存在时展示兜底；存在时以 `key={tip.id}` 渲染 `TipForm`（确保切换技巧时重新初始化表单）。提交 `updateTip(id, data)` 后返回上一页：`window.history.length > 1 ? navigate(-1) : navigate("/")`。

#### `Categories.jsx`

- 新增表单：名称、emoji、8 色色板（`ColorSwatches` 子组件）。
- 校验：名称非空、重名（忽略大小写/首尾空格）拒绝。
- 列表：显示颜色块、emoji、名称、该分类下未删除技巧数；行内编辑可改名/图标/颜色。
- 删除：`ConfirmDialog` 说明“该分类下的技巧将变为未分类”，确认后 `deleteCategory` 级联清理。

#### `Tags.jsx`

- 新增：仅名称；非空、重名校验。
- 列表：显示名称与关联的未删除技巧数；行内改名。
- 删除：确认后 `deleteTag`，级联移除所有技巧中的该标签。

#### `Stats.jsx`

- 基础卡片：总技巧数、分类数、标签数、已收藏数。
- 分类分布：`usedCats` 按数量降序渲染进度条（使用分类颜色），比例以**全部未删除技巧**为分母；额外展示“未分类”占比。
- 最常用标签 Top 5：仅统计计数 > 0 的标签。
- 数据健康入口：未分类技巧（`/?cat=__none__`）、无标签技巧（`/?untagged=1`）、空分类数（跳 `/categories`）、回收站数量（跳 `/trash`）。
- 最新技巧摘要。
- 无任何技巧时展示空状态。

#### `Trash.jsx`

- 仅列出 `deletedAt` 非空的技巧，按删除时间倒序。
- 支持单条恢复（`restoreTip`）、永久删除（`purgeTip`，二次确认）、清空回收站（`emptyTrash`，二次确认）。
- 显示删除时间。

#### `NotFound.jsx`

未知路径兜底页，提供返回首页链接。

---

## 9. 关键函数索引

| 文件 | 函数 / 导出 | 一句话说明 |
|---|---|---|
| `src/context/AppContext.jsx` | `genId` | 生成带模块自增序号的唯一 id |
| `src/context/AppContext.jsx` | `AppProvider` | 组装全局状态、派生索引与全部 CRUD 方法 |
| `src/context/useApp.js` | `useApp` | 读取 Context，缺失 Provider 时抛错 |
| `src/hooks/useLocalStorage.js` | `useLocalStorage` | localStorage 双向同步 + 跨标签页广播 |
| `src/utils/format.js` | `formatDate` / `formatDateTime` | 本地时区日期/时间格式化 |
| `src/utils/search.js` | `getKeywords` | 拆分并小写化关键词 |
| `src/utils/search.js` | `matchesTip` | 多关键词 AND 全文匹配 |
| `src/utils/search.js` | `getSnippet` | 命中位置附近截取摘要 |
| `src/utils/search.js` | `splitByKeywords` | 切分文本并标记命中片段 |
| `src/utils/backup.js` | `buildBackup` | 构建带元信息的备份对象 |
| `src/utils/backup.js` | `mergeBackup` | 按 id 合并，技巧取更新时间较新者 |
| `src/utils/backup.js` | `parseBackup` | 导入文件校验与数据清洗 |
| `src/utils/backup.js` | `saveSnapshot` / `readSnapshot` | 导入前快照的写 / 读 |
| `src/components/TipCard.jsx` | `highlightText` | 将文本按关键词渲染为 `<mark>` 片段 |
| `src/components/Categories.jsx` | `ColorSwatches` | 分类颜色选择色板 |
| `src/pages/EditTip.jsx` | `goBack` | 有历史记录则回退，否则回首页 |

---

## 10. 依赖关系

### 10.1 模块依赖图

```
main.jsx
├── react-dom/client
├── react-router-dom (BrowserRouter)
├── context/AppContext.jsx
│   ├── context/app-context.js
│   ├── hooks/useLocalStorage.js
│   └── data/seed.js
├── App.jsx
│   ├── components/Layout.jsx
│   │   ├── context/useApp.js → context/app-context.js
│   │   └── components/ui.js
│   └── pages/*
│       ├── components/TipCard.jsx
│       │   ├── context/useApp.js
│       │   ├── utils/format.js
│       │   └── utils/search.js
│       ├── components/TipForm.jsx
│       │   ├── context/useApp.js
│       │   └── components/ui.js
│       ├── components/FilterBar.jsx
│       │   └── context/useApp.js
│       ├── components/ConfirmDialog.jsx
│       │   └── components/ui.js
│       ├── utils/backup.js
│       ├── utils/format.js
│       └── utils/search.js
└── index.css
```

依赖原则：

- `pages` / `components` 只依赖 `useApp` 与纯函数工具，不直接触碰 `localStorage`（备份快照与 `ls_dark` 除外）。
- `utils` 全部为无副作用纯函数（`backup` 中的快照读写除外），可独立单测。
- `context` 是唯一修改业务数据的地方，级联逻辑集中在 `deleteCategory` / `deleteTag`。

### 10.2 运行时第三方依赖关系

| 模块 | 依赖 |
|---|---|
| 入口 / 页面 | `react`、`react-dom`、`react-router-dom` |
| 样式 | `tailwindcss`（通过 Vite 插件，构建期） |
| 测试 | `vitest`、`jsdom`、`@testing-library/react`、`@testing-library/jest-dom` |

---

## 11. 样式系统

### 11.1 Tailwind CSS 4 接入

- `src/index.css` 通过 `@import "tailwindcss"` 引入。
- `@custom-variant dark` 定义暗色变体，匹配 `[data-theme="dark"]` 及其后代。
- `@theme inline` 把 CSS 变量映射为 Tailwind 设计令牌：
  - 颜色：`paper`、`paper-deep`、`card`、`primary`、`primary-hover`、`primary-light`、`accent*`、`danger*`、`ink*`、`line*`。
  - 字体：`font-display`（中文手绘 ZCOOL KuaiLe）、`font-hand`（Caveat）。
  - 阴影：`shadow-ink`、`shadow-ink-hover`。
  - 圆角：`rounded-sketch-sm/sketch/sketch-lg/pill`（不规则手绘圆角）。
  - 缓动：`ease-spring`。

### 11.2 暗色模式

- 变量在 `[data-theme="dark"]` 下覆盖（纸张、卡片、文字、线条、阴影等）。
- `index.html` 首屏内联脚本 + `Layout` 的 `useEffect` 共同维护 `data-theme`。
- 主题偏好保存在 `ls_dark`。

### 11.3 手绘效果（`@layer components`）

| 类名 | 作用 |
|---|---|
| `.hand-underline` | 标题下方手绘感下划线（伪元素） |
| `.hand-card` | 外层虚线描边 |
| `.tip-card:nth-child(...)` | 卡片随机微旋转（奇数 / 3n / 5n / 7n），hover 回正并上浮 |
| `.tip-card` / `.mgmt-item` | `slideUp` 入场动画与错峰延迟 |
| `.btn-wiggle` | hover 轻微摇摆 |
| `.tip-grid` | 自适应卡片网格（`minmax(300px, 1fr)`） |
| `.select-arrow` | 自定义下拉箭头 |
| `.app-sidebar` / `.sidebar-overlay` | 桌面常驻、移动端抽屉与遮罩动画 |
| `.filter-scroll` | 移动端筛选条横向滚动并隐藏滚动条 |

- 动画关键帧：`fadeIn`、`fadeOut`、`slideUp`、`slideIn`、`slideOut`、`wiggle`。
- `index.html` 预置 SVG 滤镜 `#rough`、`#rough-edge`、`#scribble`（基于 `feTurbulence` + `feDisplacementMap`）。
- `@media (hover: none)` 下卡片操作按钮常显、取消 hover 位移，保证触屏可用。

---

## 12. 测试

### 12.1 配置

- `vite.config.js` 的 `test` 段：`environment: "jsdom"`，`setupFiles: "./src/test/setup.js"`。
- `src/test/setup.js`：引入 `@testing-library/jest-dom/vitest` 并在每个用例后 `cleanup()`。

### 12.2 覆盖范围

| 测试文件 | 覆盖点 |
|---|---|
| `src/context/AppContext.test.jsx` | 分类/标签删除级联、收藏切换、新增默认值、软删除/恢复/永久删除、清空回收站、`markUsed` 不改变 `updatedAt`、新建返回 id、导入整体替换 |
| `src/hooks/useLocalStorage.test.js` | 状态变化写盘、`storage` 事件同步、同步后广播 `ls-storage-sync` |
| `src/utils/format.test.js` | 日期与日期时间格式 |
| `src/utils/search.test.js` | 关键词拆分、AND 匹配、摘要截取、高亮切分不丢字符 |
| `src/utils/backup.test.js` | 导入清洗与补默认值、保留使用记录/步骤/回收站状态、非法输入报错、合并策略、快照读写 |
| `src/pages/Home.test.jsx` | 筛选组合、排序（最近更新/最常用）、删除撤销、标签筛选、批量设置分类/删除、未分类/无标签筛选、搜索、导出备份 |
| `src/pages/TipDetail.test.jsx` | 步骤渲染与复制内容、相关技巧、使用次数累计 |
| `src/pages/Stats.test.jsx` | 分类占比（含失效分类计为未分类）、数据健康入口链接 |
| `src/pages/Trash.test.jsx` | 只展示已删除、恢复、永久删除 |
| `src/components/TipForm.test.jsx` | 就地新建分类/标签并自动选中、步骤增删与提交 |

运行方式：`npm test`（单次）或 `npm run test:watch`（监听）。

---

## 13. 构建、CI 与部署

### 13.1 CI（`.github/workflows/ci.yml`）

在 `push` 与 `pull_request` 时于 Node 24 上执行：

```sh
npm ci
npm run lint
npm test
npm run build   # PAGES_BASE=/
```

### 13.2 GitHub Pages（`.github/workflows/deploy.yml`）

- 触发：推送到 `main` 或手动 `workflow_dispatch`。
- 构建时 `PAGES_BASE=/<repo>/`，以适配子路径部署。
- SPA fallback：`cp dist/index.html dist/404.html`，让 GitHub Pages 的 404 也能交给 React Router 处理。
- 通过 `actions/upload-pages-artifact` + `actions/deploy-pages` 发布。

### 13.3 其他静态托管

因为使用 `BrowserRouter`（history 路由），刷新 `/tips/:id` 等子路径必须回退到 `index.html`：

| 平台 | 配置 |
|---|---|
| Vercel | `vercel.json`：`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |
| Netlify | `public/_redirects`：`/* /index.html 200`（构建时复制到 `dist/`） |
| 其他 | 配置等价的 SPA fallback（404 → `index.html`） |

### 13.4 构建产物

- `npm run build` 输出到 `dist/`。
- `vite.config.js` 的 `base` 决定资源前缀，部署在子路径时必须设置 `PAGES_BASE`。

---

## 14. 开发约定与扩展指引

### 14.1 约定

1. **仅 JSX**：不引入 TypeScript，文件后缀 `.jsx`；导入默认导出时不加大括号（React 风格）。
2. **样式**：Tailwind 工具类直接写在 JSX 中；可复用类名字符串放 `src/components/ui.js`；**不要新增组件级 `.css` 文件**。
3. **设计令牌**：新增颜色/字体/阴影时在 `src/index.css` 的 `:root`、暗色块与 `@theme inline` 三处同步。
4. **业务数据变更**：统一在 `AppProvider` 中实现，页面不得直接操作 `localStorage` 中的三类业务键。
5. **列表状态**：可分享的筛选/排序/搜索状态放进 URL，纯 UI 状态留在组件内。
6. **可访问性**：弹窗使用 `role="dialog"` + 焦点管理；可点击 chip/标签用 `<button>`；选中态用 `aria-pressed`。
7. **日期格式**：统一使用 `utils/format.js`，不引入日期库。

### 14.2 常见扩展点

| 需求 | 修改位置 |
|---|---|
| 新增页面 | `src/pages/` 新建组件 → `src/App.jsx` 注册路由 → `Layout` 侧边栏加导航 |
| 新增 Tip 字段 | `AppContext.addTip` 默认值、`utils/backup.parseBackup` 清洗、`TipForm` 表单、展示组件 |
| 新增筛选维度 | `Home.jsx` 读取 `SearchParams` + `FilterBar` 增加控件 |
| 新增排序方式 | `Home.jsx` 的 `sort` 白名单与排序分支 + `FilterBar` 的 `<option>` |
| 调整主题色 | `src/index.css` 的 `:root` 与 `[data-theme="dark"]` |
| 新增备份字段 | `utils/backup.buildBackup` / `parseBackup`（注意 `version` 演进） |

### 14.3 已知注意事项

- 文档 `AGENTS.md` 与 `README.md` 中的路由/功能列表早于“回收站、使用记录、批量操作、步骤、导入快照”等特性，属于历史描述；以本 Wiki 与源码为准。
- `useLocalStorage` 的 `storage` 监听只处理 `newValue !== null`，其他标签页执行 `removeItem` 不会同步清除内存状态。
- 技巧排序在 `useMemo` 中直接对 `filter` 产生的新数组调用 `.sort()`（`filter` 已返回新数组，不会修改 Context 原数组）。
- `parseBackup` 会丢弃坏引用，因此导入后不会出现指向不存在分类/标签的脏数据。
