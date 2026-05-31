-- ============================================
-- 迁移 #8: 支付核验 + 站点设置
-- ============================================

-- 1. 订单表：增加截图、支付方式、买家邮箱
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_email TEXT;

-- 2. 站点设置表
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "允许所有人查看设置" ON public.site_settings;
CREATE POLICY "允许所有人查看设置"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role 管理设置" ON public.site_settings;
CREATE POLICY "Service role 管理设置"
  ON public.site_settings FOR ALL
  USING (true);
