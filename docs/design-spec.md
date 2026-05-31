# 设计规范

## 主题：Midnight Galaxy（午夜星系）

基于 theme-factory skill 的 Midnight Galaxy 主题，营造神秘、高级、有质感的视觉体验。

---

## 色彩系统

| 色阶 | 色值 | Tailwind 类名 | 用途 |
|------|------|--------------|------|
| 深紫底 | `#2b1e3e` | `bg-midnight` | 页面主背景、深色区块 |
| 宇宙蓝 | `#4a4e8f` | `bg-cosmic` | 卡片背景、次要区块 |
| 淡紫 | `#a490c2` | `text-lavender` / `bg-lavender` | 强调色、按钮、标签 |
| 银白 | `#e6e6fa` | `text-silver` | 正文、标题文字 |
| 深色文字 | `#1a1028` | `text-dark` | 浅色背景上的文字 |
| 半透紫 | `rgba(164,144,194,0.15)` | — | 玻璃拟态边框/背景 |
| 半透深紫 | `rgba(43,30,62,0.8)` | — | 遮罩、弹窗背景 |

### Tailwind 配置扩展

```css
@theme inline {
  --color-midnight: #2b1e3e;
  --color-cosmic: #4a4e8f;
  --color-lavender: #a490c2;
  --color-silver: #e6e6fa;
  --color-dark-purple: #1a1028;
}
```

---

## 字体规范

| 用途 | 字体 | 备选 |
|------|------|------|
| 标题 | Geist Sans Bold | system-ui |
| 正文 | Geist Sans | system-ui |
| 代码/标签 | Geist Mono | monospace |

### 字号层级

| 层级 | 尺寸 | 用途 |
|------|------|------|
| H1 | 3rem (48px) | 页面主标题 |
| H2 | 2rem (32px) | 区块标题 |
| H3 | 1.5rem (24px) | 卡片标题 |
| Body | 1rem (16px) | 正文 |
| Caption | 0.875rem (14px) | 辅助文字、标签 |

---

## 视觉风格

### 背景
- 主背景使用深紫色渐变：`from-midnight via-midnight to-cosmic`
- 点缀星光/粒子动效（Framer Motion 实现）
- 卡片使用半透明玻璃拟态效果

### 卡片设计
- 圆角：`rounded-2xl` (16px)
- 边框：淡紫色半透明 `border border-lavender/20`
- 背景：半透宇宙蓝 `bg-cosmic/30`
- 悬停：放大 1.02x + 阴影加深
- 封面图：`rounded-t-2xl` 顶部圆角

### 按钮
- 主按钮：淡紫渐变 `bg-lavender text-dark-purple`
- 次按钮：透明边框 `border border-lavender/40 text-silver`
- 悬停：亮度提升 + 轻微缩放

### 标签
- 圆角药丸形状 `rounded-full`
- 淡紫半透明背景 `bg-lavender/20 text-lavender`
- 限免标签：金色/橙色高亮 `bg-amber-400/20 text-amber-300`

---

## 动效规范

### 页面进入
- 页面加载时元素从下方淡入 (`y: 20, opacity: 0 → y: 0, opacity: 1`)
- Stagger 级联延迟（每个卡片 0.05s 间隔）

### 视图切换
- 画廊 ↔ 列表切换时使用 `AnimatePresence` 实现淡入淡出
- 卡片布局变化使用 `layoutId` 共享元素过渡

### 卡片交互
- 悬停：`scale: 1.02, y: -4` + 阴影增强
- 点击：`scale: 0.98` 短暂按压反馈

### 页面滚动
- 使用 `useScroll` + `useTransform` 实现视差效果
- Hero 区域渐变到透明
- 元素进入视口时触发入场动画 (`whileInView`)

---

## 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| Mobile | < 640px | 单列，卡片全宽 |
| Tablet | 640px - 1024px | 2 列网格 |
| Desktop | > 1024px | 3 列网格（画廊）/ 单列（列表） |

---

## 图标

- 使用 SVG 图标或简单的 emoji/CSS 图标
- 避免引入重量级图标库
- 模板卡片上的操作图标使用半透明淡紫色
