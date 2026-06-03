# Notion 模板展示网站 — Claude 工作指引

## 项目概述

这是一个 Notion 模板展示网站，用户可浏览、购买、解锁 Notion 模板。支持画廊/列表双视图、付费解锁、三档会员订阅、Midnight Galaxy / Sunny 双主题切换、管理后台 CRUD。

**当前状态**：第 1-6 阶段已完成，待部署上线。

## 标准文件路径

在开始任何开发工作前，先阅读以下文件：

| 文件 | 路径 | 说明 |
|------|------|------|
| 项目需求 | [docs/requirements.md](docs/requirements.md) | 完整功能需求 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、数据库表、路由、编码约定 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 双主题（Midnight + Sunny）、色彩、字体、动效 |
| 开发路线图 | [docs/roadmap.md](docs/roadmap.md) | 7 阶段开发计划（前 6 阶段已完成） |
| 开发日志 | [devlog/](devlog/) | 每日开发记录 |

## 项目中已存在的内容（优先复用）

### 页面路由
- `/` — 首页（Hero + 画廊/列表双视图 + 搜索 + 标签筛选 + Supabase 数据）
- `/template/[id]` — 模板详情（封面/热度/预览/解锁/视频嵌入/图文教程/推荐/反馈）
- `/login` — 会员登录/注册
- `/pricing` — 会员套餐页（三档套餐 + 支付面板）
- `/account` — 用户中心（会员状态 + 订单记录）
- `/admin/*` — 管理后台（概览/模板CRUD/订单核验/数据统计/反馈/设置）

### 组件清单
- `src/components/ThemeProvider.tsx` — 双主题上下文 + CSS 变量注入
- `src/components/layout/Header.tsx` — 导航栏（搜索+用户菜单+主题切换+响应式）
- `src/components/layout/Footer.tsx` — 页脚
- `src/components/layout/ThemeToggle.tsx` — 主题切换按钮（太阳/月亮图标）
- `src/components/admin/AdminNav.tsx` — 管理后台导航
- `src/components/admin/TemplateForm.tsx` — 模板编辑表单（8分区+动态增删）
- `src/components/template/PaymentModal.tsx` — 支付弹窗（扫码+截图+提交）

### API 路由
- `api/admin/analytics` — GET 复制数据分析
- `api/admin/orders/confirm` — POST 确认订单+开通会员
- `api/admin/settings` — GET/PUT 站点设置
- `api/templates/[id]/copy` — POST 记录复制
- `api/templates/[id]/view` — POST 记录浏览
- `api/templates/[id]/preview` — GET 预览草稿（service_role）
- `api/templates/[id]/feedback` — POST 用户反馈

## 工作原则

1. **小步快跑**：每个功能产出可验证成果，不一口气写太多代码
2. **安全第一**：`.env.local` 绝不提交 Git；Supabase service_role key 只用在后端 API 路由
3. **遵守设计规范**：所有 UI 代码必须支持双主题（Midnight Galaxy + Sunny），使用 `var(--theme-xxx, fallback)` 模式的颜色变量
4. **每日记录**：每次开发完成后更新 `devlog/YYYY-MM-DD.md`
5. **先读文档**：接到新任务时先阅读对应的 docs 文档了解上下文

## 技术要点

- Next.js 16 App Router + TypeScript + Tailwind CSS 4
- Framer Motion 做动效，使用 `motion` 组件、`AnimatePresence`、`whileInView`、`whileHover`
- Supabase 做数据库（templates/profiles/orders/copy_logs/feedbacks/site_settings）、认证（Auth）、存储（covers bucket）
- 所有组件使用函数式组件 + Hooks
- 样式用 Tailwind 原子类 + 自定义 utility（`glass`/`text-gradient`/`bg-stars`）
- 双主题通过 ThemeProvider + CSS 变量覆盖实现，不使用 CSS 选择器优先级竞争
- 管理后台通过 `profiles.is_admin` 字段做权限校验

## 启动命令

```bash
npm run dev    # 开发服务器 (localhost:3000)
npm run build  # 生产构建
npm run lint   # 代码检查
```
