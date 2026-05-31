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
| links | jsonb | '[]' | 链接数组 [{label, url}] |
| price | integer | 0 | 价格（分），0=免费 |
| is_limited_free | boolean | false | 限时免费 |
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
| is_member | boolean | false | 是否会员 |
| membership_expires_at | timestamptz | null | 会员到期时间 |

### orders（订单表）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | uuid | gen_random_uuid() | 主键 |
| user_id | uuid | — | 关联 auth.users |
| template_id | uuid | null | 单模板购买时关联 |
| type | text | — | 'template' / 'membership' |
| amount | integer | — | 金额（分） |
| status | text | 'pending' | pending / paid / cancelled |
| created_at | timestamptz | now() | 创建时间 |

---

## 路由设计

```
/                         首页（画廊视图，默认）
/list                     列表视图（按年份）
/template/[id]            模板详情页
/login                    登录注册页
/pricing                  会员套餐页
/account                  用户中心
/admin                    管理后台首页
/admin/templates          模板管理列表
/admin/templates/new      新建模板
/admin/templates/[id]     编辑模板
```

---

## 组件命名规范

- 页面组件：`src/app/<route>/page.tsx`
- 布局组件：`src/app/<route>/layout.tsx`
- UI 组件：`src/components/ui/<name>.tsx`
- 业务组件：`src/components/<feature>/<name>.tsx`
- 工具函数：`src/lib/<name>.ts`
- 类型定义：`src/types/<name>.ts`

---

## 编码约定

- 使用函数组件 + Hooks
- 所有组件使用 TypeScript
- 样式用 Tailwind 原子类，避免内联 style
- 动画用 Framer Motion 的 motion 组件
- 异步操作使用 async/await + try/catch 错误处理
- 所有面向用户的文案使用中文
