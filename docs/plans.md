# LifeSkill 需求文档

## 项目概述

一款记录生活小技巧小妙招的轻量级网页应用。UI 风格为手绘风，简约清新。

## 技术选型

| 层 | 方案 |
|---|---|
| 框架 | React 19 + Vite 8 |
| 路由 | react-router-dom v7 |
| 状态管理 | React Context |
| 数据持久化 | localStorage |
| 字体 | ZCOOL KuaiLe（中文手绘）+ Caveat（英文手写） |
| 样式方案 | Tailwind CSS 4（`@theme` 设计令牌 + 工具类），手绘效果保留自定义 CSS |
| 测试 | Vitest + Testing Library + jsdom |

## 数据模型

### Tip（技巧）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 唯一标识 |
| title | string | 标题 |
| content | string | 详细内容（markdown 纯文本） |
| categoryId | string \| null | 所属分类 ID |
| tagIds | string[] | 标签 ID 列表 |
| createdAt | number | 创建时间戳 |
| updatedAt | number | 更新时间戳 |

### Category（分类）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 唯一标识 |
| name | string | 分类名称 |
| emoji | string | Emoji 图标 |
| color | string | 十六进制颜色 |

### Tag（标签）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 唯一标识 |
| name | string | 标签名称 |

## 功能清单

### 1. 技巧 CRUD
- [x] **创建** — 填写标题、内容、分类、标签后保存
- [x] **查看** — 卡片列表模式 + 详情页完整展示
- [x] **编辑** — 已有技巧内容可修改后保存
- [x] **删除** — 带二次确认弹窗的删除操作

### 2. 分类管理
- [x] **预设数据** — 5 个内置分类（清洁妙招、收纳整理、厨房技巧、生活窍门、健康养生）
- [x] **新建分类** — 指定名称、Emoji、颜色
- [x] **编辑分类** — 行内编辑模式
- [x] **删除分类** — 级联取消关联技巧的分类

### 3. 标签管理
- [x] **预设数据** — 6 个内置标签（省钱、省时、环保、DIY、急救、冷知识）
- [x] **新建标签** — 输入名称
- [x] **编辑标签** — 行内编辑模式
- [x] **删除标签** — 级联移除关联技巧的标签引用

### 4. 搜索
- [x] **关键词搜索** — 匹配技巧标题和内容，大小写不敏感
- [x] **URL 同步** — 搜索词通过 `?q=` 参数同步到地址栏

### 5. 筛选与排序
- [x] **按分类筛选** — 点击分类芯片过滤，支持 URL 状态同步（`?cat=`）
- [x] **按时间排序** — 最新/最早
- [x] **按标题排序** — A-Z

### 6. 数据持久化
- [x] **localStorage 存储** — 刷新不丢失
- [x] **种子数据** — 首次使用时自动填充示例数据
- [x] **useLocalStorage hook** — 封装存储与序列化逻辑

### 7. UI/UX
- [x] **手绘风格** — ZCOOL KuaiLe 中文字体、卡片微旋转、SVG 毛边滤镜
- [x] **动效** — 卡片入场动画（slideUp staggered）、按钮 hover wiggle
- [x] **空状态** — 无数据/无结果时的友好提示
- [x] **响应式** — 桌面侧边栏 + 移动端抽屉菜单
- [x] **颜色主题** — 暖白纸纹背景、低饱和暖色盘

## 页面路由

| 路径 | 页面 | 功能 |
|---|---|---|
| `/` | Home | 技巧卡片网格 + 分类筛选 + 搜索 + 排序 |
| `/tips/new` | NewTip | 新建技巧表单 |
| `/tips/:id` | TipDetail | 技巧详情、编辑/删除按钮 |
| `/tips/:id/edit` | EditTip | 编辑技巧表单 |
| `/categories` | Categories | 分类管理（增删改） |
| `/tags` | Tags | 标签管理（增删改） |

## 组件树

```
App (BrowserRouter)
└── Layout
    ├── Sidebar
    │   ├── Logo
    │   ├── NavLink (首页)
    │   ├── NavLink (分类管理)
    │   ├── NavLink (标签管理)
    │   └── CategoryList (快捷筛选)
    ├── TopBar
    │   ├── MobileMenuBtn
    │   ├── SearchBox
    │   └── + 新技巧 Button
    └── MainContent (Routes)
        ├── Home
        │   ├── FilterBar
        │   ├── TipCard[] (网格)
        │   └── ConfirmDialog
        ├── NewTip → TipForm
        ├── EditTip → TipForm
        ├── TipDetail
        │   └── ConfirmDialog
        ├── Categories
        │   └── ConfirmDialog
        └── Tags
            └── ConfirmDialog
```

## 数据流架构

```
用户交互层  →  数据管理层 (Context)  →  持久化层 (localStorage)
   │                    │                      │
   └── CRUD 调用 ───────┴── setState ──────────┴── useEffect 自动同步
```

## 种子数据

### 预设分类
| 名称 | Emoji | 颜色 |
|---|---|---|
| 清洁妙招 | 🧹 | #7EB8A0 |
| 收纳整理 | 📦 | #F4A261 |
| 厨房技巧 | 🍳 | #E8A87C |
| 生活窍门 | 💡 | #A8D5BA |
| 健康养生 | 🌿 | #C9B8E0 |

### 预设标签
省钱、省时、环保、DIY、急救、冷知识

### 预设技巧（6 条）
涵盖不同分类和标签组合，作为应用启动时的初始展示数据。
