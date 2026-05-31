-- ============================================
-- 迁移 #7: 管理后台增强
-- ============================================

-- 1. 模板表：增加第二个视频源 + 图文排版
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS video_url_2 TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS rich_content JSONB;

-- 2. 反馈表：关联用户
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. 复制日志表
CREATE TABLE IF NOT EXISTS public.copy_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  is_member BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.copy_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "允许所有人查看复制日志" ON public.copy_logs;
CREATE POLICY "允许所有人查看复制日志"
  ON public.copy_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "允许认证用户插入复制日志" ON public.copy_logs;
CREATE POLICY "允许认证用户插入复制日志"
  ON public.copy_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
