# 技术规范

## 技术栈

| 层面 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js (App Router) | 16.x | 前端框架，SSR/SSG |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS |
| 动效 | Framer Motion | 12.x | React 动画库 |
| 数据库 | Supabase | 2.x | PostgreSQL + Auth + Storage |
| 认证 | Supabase Auth | — | 邮箱登录 + OAuth |
| 部署 | Vercel | — | 免费部署平台 |

---

## 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 数据库表结构

### templates（模板表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | uuid | gen_random_uuid() | 主键 |
| title | text | — | 模板名称 |
| description | text | '' | 模板描述 |
| cover_image | text | null | 封面图 URL |
| tags | text[] | '{}' | 模板标签 |
| links | jsonb | '[]' | 链接数组 [{label, url}]，第1个=预览，第2个=解锁 |
| features | text[] | '{}' | 功能亮点列表 |
| price | integer | 0 | 价格（分），0=免费 |
| is_limited_free | boolean | false | 限时免费标记 |
| video_url | text | null | 演示视频1 URL（B站/YouTube/小红书等） |
| video_url_2 | text | null | 演示视频2 URL |
| tutorial_steps | jsonb | null | 图文教程步骤 [{title, description, image_url}] |
| rich_content | jsonb | null | 图文排版内容块 [{image_url, text}] |
| view_count | integer | 0 | 浏览量计数 |
| copy_count | integer | 0 | 复制/解锁计数 |
| status | text | 'draft' | draft / published |
| published_at | timestamptz | null | 发布时间 |
| created_at | timestamptz | now() | 创建时间 |
| updated_at | timestamptz | now() | 更新时间 |

### profiles（用户资料表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | uuid | — | 关联 auth.users |
| email | text | — | 邮箱 |
| display_name | text | '' | 显示名称 |
| is_admin | boolean | false | 是否管理员 |
| is_member | boolean | false | 是否会员 |
| membership_expires_at | timestamptz | null | 会员到期时间（null=永久） |

### orders（订单表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | uuid | gen_random_uuid() | 主键 |
| user_id | uuid | null | 关联 auth.users（匿名购买可为空） |
| template_id | uuid | null | 单模板购买时关联 |
| type | text | — | template / membership_yearly / membership_pro / membership_ultimate |
| amount | integer | — | 金额（分） |
| status | text | 'pending' | pending / paid / cancelled |
| screenshot_url | text | null | 转账截图 URL |
| payment_method | text | null | wechat / alipay |
| buyer_email | text | null | 买家联系邮箱 |
| created_at | timestamptz | now() | 创建时间 |

### copy_logs（复制日志表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | uuid | gen_random_uuid() | 主键 |
| user_id | uuid | — | 操作用户 |
| template_id | uuid | — | 被复制的模板 |
| is_member | boolean | false | 操作时是否为会员 |
| created_at | timestamptz | now() | 操作时间 |

### feedbacks（用户反馈表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | uuid | gen_random_uuid() | 主键 |
| template_id | uuid | — | 关联模板 |
| user_id | uuid | null | 反馈用户 |
| message | text | — | 反馈内容 |
| status | text | 'open' | open / closed |
| created_at | timestamptz | now() | 提交时间 |

### site_settings（站点设置表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| key | text | — | 设置键名（如 qr_wechat_yearly） |
| value | text | — | 设置值（URL 或文本） |

---

## 路由设计

### 前台页面

```
/                              首页（画廊/列表双视图 + 搜索 + 标签筛选）
/template/[id]                 模板详情页（预览+解锁+视频+教程+推荐）
/login                         会员登录/注册页
/pricing                       会员套餐页（三档 + 支付面板）
/account                       用户中心（会员状态 + 订单记录）
```

### 管理后台（需管理员权限）

```
/admin                         概览仪表盘（统计数据卡片）
/admin/templates               模板管理列表（CRUD + 状态切换）
/admin/templates/new           新建模板
/admin/templates/[id]/edit     编辑模板
/admin/orders                  订单核验（确认/驳回 + 截图预览）
/admin/analytics               数据统计（复制分析）
/admin/feedbacks                用户反馈管理
/admin/settings                站点设置（收款码等）
```

### API 路由

```
/api/admin/analytics               GET  — 复制数据分析（按模板/按用户）
/api/admin/orders/confirm           POST — 确认订单并自动开通会员
/api/admin/settings                 GET/PUT — 站点设置读写
/api/templates/[id]/copy            POST — 记录模板复制
/api/templates/[id]/view            POST — 记录模板浏览
/api/templates/[id]/preview         GET  — 预览任意状态模板（service_role）
/api/templates/[id]/feedback        POST — 提交用户反馈
```

---

## 组件目录结构

```
src/
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 根布局（ThemeProvider + 字体）
│   ├── globals.css               # 全局样式 + 双主题变量
│   └── (routes)/**/page.tsx      # 各页面路由
├── components/
│   ├── ThemeProvider.tsx          # 主题上下文（Midnight ↔ Sunny）
│   ├── layout/
│   │   ├── Header.tsx            # 导航栏（搜索+用户菜单+主题切换+响应式）
│   │   ├── Footer.tsx            # 页脚
│   │   └── ThemeToggle.tsx       # 主题切换按钮
│   ├── admin/
│   │   ├── AdminNav.tsx          # 管理后台导航
│   │   └── TemplateForm.tsx      # 模板编辑表单（8分区 + 动态增删）
│   └── template/
│       └── PaymentModal.tsx      # 支付弹窗（扫码+截图+提交）
├── lib/
│   ├── supabase.ts               # 浏览器端 Supabase 客户端
│   └── supabase-server.ts        # 服务端 Supabase 客户端
├── types/
│   └── index.ts                  # 全局类型定义
└── proxy.ts                      # Next.js 16 请求代理（session 管理）
```

## 编码约定

- 使用函数组件 + Hooks
- 所有组件使用 TypeScript
- 样式用 Tailwind 原子类，配合 `glass`/`text-gradient`/`bg-stars` 自定义 utility
- 动画用 Framer Motion 的 `motion` 组件和 `AnimatePresence`
- 异步操作使用 async/await + try/catch 错误处理
- 所有面向用户的文案使用中文
- 主题切换通过 `ThemeProvider` + CSS 变量覆盖实现，不使用 CSS 选择器优先级竞争
