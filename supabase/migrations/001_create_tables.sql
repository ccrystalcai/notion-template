-- ============================================
-- Notion 模板网站 — 数据库初始化
-- ============================================

-- 1. 模板表
CREATE TABLE IF NOT EXISTS public.templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_image TEXT,                              -- 封面图 URL
  tags        TEXT[] NOT NULL DEFAULT '{}',       -- 标签数组
  links       JSONB NOT NULL DEFAULT '[]',        -- 链接 [{label, url}]
  price       INTEGER NOT NULL DEFAULT 0,         -- 价格（分），0=免费
  is_limited_free BOOLEAN NOT NULL DEFAULT false, -- 限时免费
  status      TEXT NOT NULL DEFAULT 'draft',      -- draft | published
  published_at TIMESTAMPTZ,                       -- 发布时间
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 模板更新时自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. 用户资料表
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  is_member   BOOLEAN NOT NULL DEFAULT false,
  membership_expires_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. 订单表
CREATE TABLE IF NOT EXISTS public.orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  type        TEXT NOT NULL DEFAULT 'template',   -- template | membership
  amount      INTEGER NOT NULL DEFAULT 0,         -- 金额（分）
  status      TEXT NOT NULL DEFAULT 'pending',    -- pending | paid | cancelled
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 权限策略（RLS）
-- ============================================

-- 模板表：所有人可读已发布，管理员可全部操作
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可查看已发布模板"
  ON public.templates FOR SELECT
  USING (status = 'published');

CREATE POLICY "管理员可全部操作模板"
  ON public.templates FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- 用户资料表：用户可读所有，只能改自己的
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可查看资料"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "用户可修改自己的资料"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 订单表：用户只能看自己的
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户查看自己的订单"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户创建订单"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_templates_status ON public.templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_published_at ON public.templates(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON public.templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- ============================================
-- 插入示例数据
-- ============================================

INSERT INTO public.templates (title, description, tags, links, price, is_limited_free, status, published_at) VALUES
(
  '2026 年度计划模板',
  '整合目标追踪与习惯养成，帮你规划崭新的一年',
  ARRAY['年度计划', '效率'],
  '[{"label": "预览", "url": "https://example.com"}, {"label": "获取模板", "url": "https://notion.so/xxx"}]'::jsonb,
  0, false, 'published', '2026-01-15 10:00:00+08'
),
(
  '项目管理仪表盘',
  '可视化项目进度，团队协作更高效',
  ARRAY['项目管理', '仪表盘', '团队'],
  '[{"label": "预览", "url": "https://example.com"}, {"label": "获取模板", "url": "https://notion.so/xxx"}]'::jsonb,
  2900, true, 'published', '2025-11-20 10:00:00+08'
),
(
  '个人财务追踪器',
  '收支一目了然，轻松管理个人财务',
  ARRAY['财务', '个人'],
  '[{"label": "预览", "url": "https://example.com"}, {"label": "获取模板", "url": "https://notion.so/xxx"}]'::jsonb,
  1900, false, 'published', '2025-08-10 10:00:00+08'
),
(
  '读书笔记系统',
  '结构化记录读书心得，知识管理更系统',
  ARRAY['学习', '笔记', '知识管理'],
  '[{"label": "获取模板", "url": "https://notion.so/xxx"}]'::jsonb,
  0, false, 'published', '2024-06-01 10:00:00+08'
),
(
  '习惯追踪器',
  '每日打卡，21 天养成好习惯',
  ARRAY['习惯', '效率'],
  '[{"label": "预览", "url": "https://example.com"}, {"label": "获取模板", "url": "https://notion.so/xxx"}]'::jsonb,
  900, true, 'published', '2024-03-15 10:00:00+08'
),
(
  '内容创作日历',
  '规划你的社交媒体内容，保持持续输出',
  ARRAY['内容创作', '日历'],
  '[{"label": "获取模板", "url": "https://notion.so/xxx"}]'::jsonb,
  2500, false, 'published', '2023-09-01 10:00:00+08'
);
