const seedCategories = [
  { id: "cat-1", name: "清洁妙招", emoji: "🧹", color: "#7EB8A0" },
  { id: "cat-2", name: "收纳整理", emoji: "📦", color: "#F4A261" },
  { id: "cat-3", name: "厨房技巧", emoji: "🍳", color: "#E8A87C" },
  { id: "cat-4", name: "生活窍门", emoji: "💡", color: "#A8D5BA" },
  { id: "cat-5", name: "健康养生", emoji: "🌿", color: "#C9B8E0" },
]

const seedTags = [
  { id: "tag-1", name: "省钱" },
  { id: "tag-2", name: "省时" },
  { id: "tag-3", name: "环保" },
  { id: "tag-4", name: "DIY" },
  { id: "tag-5", name: "急救" },
  { id: "tag-6", name: "冷知识" },
]

const seedTips = [
  {
    id: "tip-1",
    title: "柠檬除水垢",
    content: "用新鲜柠檬切片放入水壶中加水煮沸，静置30分钟后倒掉，水垢就会自然脱落。柠檬酸能有效溶解水垢，而且留下清新香气。",
    categoryId: "cat-1",
    tagIds: ["tag-1", "tag-3"],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "tip-2",
    title: "衣服折叠法省空间",
    content: "将T恤折叠成统一大小的方块竖着放入抽屉，比平铺叠放多出至少一倍空间，而且抽取时不会弄乱其他衣服。裤子和裙子也可以采用同样的卷叠法。",
    categoryId: "cat-2",
    tagIds: ["tag-2", "tag-4"],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: "tip-3",
    title: "切洋葱不流泪",
    content: "切洋葱前将其放入冰箱冷冻15分钟，或者切的时候在案板旁边点一根蜡烛。低温会减缓酶的释放，蜡烛燃烧会改变气流方向带走刺激气体。",
    categoryId: "cat-3",
    tagIds: ["tag-5", "tag-6"],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "tip-4",
    title: "香蕉保鲜法",
    content: "用保鲜膜包裹香蕉的把柄部位，可以延长保鲜期3-5天。因为乙烯气体主要从把柄处释放，包裹后能减缓成熟过程。",
    categoryId: "cat-4",
    tagIds: ["tag-1", "tag-6"],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "tip-5",
    title: "早起提神按揉穴位",
    content: "早上起床后，用拇指按揉太阳穴和风池穴各30秒，然后搓热双手敷在眼睛上。可以快速驱散睡意，比喝咖啡更健康。",
    categoryId: "cat-5",
    tagIds: ["tag-5"],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "tip-6",
    title: "废旧牙刷再利用",
    content: "淘汰的牙刷不要扔，用打火机加热刷头弯曲成90度，就变成了清洁水龙头缝隙、键盘缝隙、窗轨等死角的神器。",
    categoryId: "cat-1",
    tagIds: ["tag-3", "tag-4"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export { seedCategories, seedTags, seedTips }
