# 设计规范

## 双主题系统

项目支持两套视觉主题，通过 CSS 变量覆盖切换，无需 CSS 选择器优先级竞争。

### Midnight Galaxy（午夜星系）— 默认主题

深紫色调，神秘、高级、有质感。半透明玻璃拟态 + 星光粒子背景。

### Sunny（阳光清新）— 第二主题

暖橙色 + 奶油白调，明亮、温暖、现代。

---

## 色彩系统

### Midnight Galaxy（默认 fallback）

| 色阶 | 色值 | CSS 变量 | 用途 |
|------|------|----------|------|
| 深紫底 | `#2b1e3e` | `--color-midnight` | 页面主背景、深色区块 |
| 亮紫底 | `#3a2d52` | `--color-midnight-light` | 略亮背景 |
| 极深紫 | `#1a1028` | `--color-dark-purple` | 最深背景、文字反色 |
| 宇宙蓝 | `#4a4e8f` | `--color-cosmic` | 卡片背景、次要区块 |
| 亮宇宙蓝 | `#5d61a3` | `--color-cosmic-light` | 卡片悬停态 |
| 淡紫 | `#a490c2` | `--color-lavender` | 强调色、按钮、标签 |
| 亮淡紫 | `#c4b8d8` | `--color-lavender-light` | 按钮悬停态 |
| 银白 | `#e6e6fa` | `--color-silver` | 正文、标题文字 |

### Sunny（CSS 变量覆盖）

| 色阶 | 色值 | 覆盖变量 | 用途 |
|------|------|----------|------|
| 奶油白 | `#fef9ef` | `--theme-midnight` | 页面主背景 |
| 浅米色 | `#faf3e6` | `--theme-midnight-light` | 略深背景 |
| 深米色 | `#f5ecd7` | `--theme-dark-purple` | 最深背景 |
| 纯白 | `#ffffff` | `--theme-cosmic` | 卡片背景 |
| 浅暖白 | `#faf7f0` | `--theme-cosmic-light` | 卡片悬停 |
| 暖橙 | `#e8943a` | `--theme-lavender` | 强调色、按钮 |
| 亮暖橙 | `#f0b86c` | `--theme-lavender-light` | 按钮悬停 |
| 深棕 | `#3d3530` | `--theme-silver` | 正文文字 |

### 功能色

| 用途 | 色值 | Tailwind 类 |
|------|------|------------|
| 免费标签 | `emerald-400` | `text-emerald-300 bg-emerald-400/20` |
| 限免标签 | `amber-400` (midnight) / `red-400` (sunny) | `text-amber-300 bg-amber-400/20` |
| 会员标签 | `amber-400` | `text-amber-300 bg-amber-400/20` |
| 微信支付 | `emerald-400` | `text-emerald-300 bg-emerald-400/20` |
| 支付宝 | `blue-400` | `text-blue-300 bg-blue-400/20` |

### CSS 变量架构

```css
@theme inline {
  /* 所有 Tailwind 颜色使用 var(--theme-xxx, fallback) */
  --color-midnight: var(--theme-midnight, #2b1e3e);
  --color-lavender: var(--theme-lavender, #a490c2);
  /* ... 默认 fallback = Midnight Galaxy */
}

body {
  background: var(--theme-gradient-body, linear-gradient(135deg, #2b1e3e 0%, ...));
}
```

切换主题时，JS 直接设置 `document.documentElement.style.setProperty("--theme-midnight", "#fef9ef")` 覆盖变量值；切回默认时 `removeProperty()` 让 fallback 自动生效。

---

## 视觉风格

### 背景
- Midnight：深紫渐变 `linear-gradient(135deg, #2b1e3e 0%, #1a1028 50%, #4a4e8f 100%)` + 紫色星光粒子
- Sunny：暖色渐变 `linear-gradient(135deg, #fef9ef 0%, #faf3e6 50%, #fef5e1 100%)` + 暖金色星光粒子
- 导航栏：`backdrop-blur-md bg-midnight/70`（跟随主题背景色变化）
- Hero 区底部渐变过渡到内容区

### 玻璃拟态
- 使用自定义 `glass` utility
- 背景：`rgba(74, 78, 143, 0.15)` (midnight) / `rgba(255, 255, 255, 0.75)` (sunny)
- 模糊：`backdrop-filter: blur(12px)`
- 边框：`1px solid rgba(164, 144, 194, 0.15)`（跟随主题）
- 圆角：`rounded-xl` 或 `rounded-2xl`

### 按钮层级
| 层级 | 样式 | 用途 |
|------|------|------|
| Primary | `bg-lavender text-dark-purple font-medium hover:bg-lavender-light` | 主要操作（提交、解锁） |
| Secondary | `border border-lavender/40 text-silver hover:bg-lavender/10` | 次要操作（预览） |
| Ghost | `text-silver/50 hover:text-lavender` | 导航/返回/取消 |
| Membership | `border border-amber-400/40 text-amber-300 hover:bg-amber-400/10` | 会员入口 |

### 标签/徽章
- 药丸形状 `rounded-full`
- 标签：`bg-lavender/10 text-lavender/80`
- 价格：`bg-lavender/20 text-lavender`
- 限免：`bg-amber-400/20 text-amber-300`
- 免费：`bg-emerald-400/20 text-emerald-300`
- 状态：`text-xs font-medium`

### 文字渐变
- 使用自定义 `text-gradient` utility
- Midnight：紫色 → 银白 → 亮紫渐变
- Sunny：暖橙 → 亮橙 → 深橙渐变
- 实现：`background-clip: text` + `-webkit-text-fill-color: transparent`

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
| H1 | 3-3.75rem (48-60px) | 页面主标题 |
| H2 | 1.5-1.875rem (24-30px) | 区块标题 |
| H3 | 1-1.25rem (16-20px) | 卡片标题、区块小标题 |
| Body | 0.875-1rem (14-16px) | 正文、描述 |
| Caption | 0.625-0.75rem (10-12px) | 辅助文字、标签、徽章 |

---

## 动效规范

### 页面入场
- 元素从下方淡入：`{ opacity: 0, y: 20 }` → `{ opacity: 1, y: 0 }`
- 级联延迟：每个子项 0.06-0.08s 延迟

### 视图切换
- 画廊 ↔ 列表使用 `AnimatePresence mode="wait"` 淡入淡出

### 卡片交互
- 悬停：`scale: 1.02, y: -4, shadow-xl`
- 点击：`scale: 0.98`
- 列表行悬停：`scale: 1.01, x: 4`

### 弹窗
- 入场：spring 弹性动画 `{ stiffness: 300, damping: 25 }`
- 入场：`{ opacity: 0, scale: 0.95, y: 20 }` → `{ opacity: 1, scale: 1, y: 0 }`

### 主题切换
- 图标 180° 旋转 + 缩放弹跳：`rotate: 180, scale: [1, 0.85, 1]`
- duration: 0.4s, ease: easeInOut

### 滚动
- Hero 区底部渐变过渡（`bg-gradient-to-t from-midnight to-transparent`）

---

## 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| Mobile | < 640px | 单列，卡片全宽 |
| Tablet | 640px - 1024px | 2 列网格（画廊）/ 单列（列表/详情） |
| Desktop | > 1024px | 3 列网格（画廊）/ 5:3 分栏（详情） |

---

## 自定义 Tailwind Utilities

```css
@utility glass {
  background: var(--theme-glass-bg, rgba(74, 78, 143, 0.15));
  backdrop-filter: blur(12px);
  border: 1px solid var(--theme-glass-border, rgba(164, 144, 194, 0.15));
  border-radius: 1rem;
}

@utility text-gradient {
  background: var(--theme-gradient-text, linear-gradient(135deg, #a490c2, #e6e6fa, #c4b8d8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@utility bg-stars {
  background-image: var(--theme-stars,
    radial-gradient(...7个星光粒子位置...)
  );
}
```

---

## 图标

- 使用内联 SVG（搜索、视图切换、太阳/月亮、锁、预览等）
- 少量 emoji 用于强调（✦, 👑, 📩, 💎 等）
- 避免引入重量级图标库

## 视频嵌入

- B站：将 `bilibili.com/video/` 替换为 `player.bilibili.com/player.html?bvid=`
- YouTube：将 `watch?v=` 替换为 `embed/`
- 其他链接（小红书等）：显示跳转按钮
