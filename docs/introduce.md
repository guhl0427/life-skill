# LifeSkill - 生活小技巧

## 1. 项目解决的核心痛点

| 痛点 | 解决方案 |
|---|---|
| **生活小技巧零散难记** — 收藏在朋友圈、小红书、微博各处，真要用时想不起来 | 统一集中管理，所有技巧一条 App 搞定 |
| **缺乏结构化组织** — 笔记混在一起，找一条技巧要翻半天 | 分类 + 标签双维度组织，支持按分类筛选 |
| **检索困难** — 记得内容但记不清标题，只能逐条翻 | 关键词搜索（标题 + 内容全文）、排序 |
| **传统笔记应用太重** — Notion/Obsidian 功能过剩，记录一条"柠檬除水垢"不需要开一个数据库 | 纯前端 SPA，即开即用，轻量无感 |
| **数据丢失风险** — 第三方平台可能删帖、账号可能丢失 | localStorage 本地持久化，不依赖任何外部服务 |

## 2. 核心逻辑流

```
┌─────────────────────────────────────────────────────────────┐
│                        用户交互层                             │
│  TipForm (创建/编辑)  →   AppContext (CRUD 方法)              │
│  TipCard (点击删除)   →   ConfirmDialog →  AppContext         │
│  Home 筛选/搜索       ←   URL SearchParams → 过滤逻辑         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       数据管理层                              │
│  AppContext (React Context)                                  │
│    ├─ tips[]     (6 条种子数据)                               │
│    ├─ categories[]  (5 个预设分类)                             │
│    └─ tags[]     (6 个预设标签)                               │
│                                                              │
│  CRUD 操作→自动触发 setState → 组件重渲染                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       持久化层                                │
│  useLocalStorage hook                                        │
│    ├─ 初始化: localStorage.getItem → state                    │
│    ├─ 变更:   state 变化 → useEffect → localStorage.setItem   │
│    └─ 刷新后数据不丢失                                        │
└─────────────────────────────────────────────────────────────┘
```

### 关键数据流路径

```
创建:  用户填表 → TipForm.onSubmit → addTip({title,content,categoryId,tagIds})
        → setTips([newTip, ...prev]) → localStorage更新 → 列表重渲染

浏览:  Home加载 → 从Context读取tips[] → URL params筛选(cat/q/sort)
        → 客户端useMemo过滤/排序 → 渲染TipCard网格

搜索:  顶栏输入 → navigate("/?q=关键词") → Home读取searchParams
        → 按title/content.toLowerCase().includes(q)过滤

删除:  点击🗑️ → ConfirmDialog确认 → deleteTip(id)
        → setTips(prev.filter) + localStorage更新 → 列表重渲染

分类管理: Categories页 → addCategory/updateCategory/deleteCategory
        → 删除分类时自动将关联tips的categoryId置为null

标签管理: Tags页 → addTag/updateTag/deleteTag
        → 删除标签时自动从所有tips的tagIds数组中移除
```

### 路由流转

```
/ → Home（卡片网格 + 筛选 + 搜索）
  ├── /tips/new    → NewTip（创建表单 → 提交后跳转 /）
  ├── /tips/:id    → TipDetail（详情 → 编辑/删除）
  │   └── /tips/:id/edit → EditTip（编辑表单 → 提交后跳转回详情）
  ├── /categories  → Categories（分类 CRUD）
  └── /tags        → Tags（标签 CRUD）
```
