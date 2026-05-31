-- ============================================
-- 迁移 #3: 问题反馈表
-- ============================================

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  message     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'open',  -- open | resolved
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: 所有人可提交
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可提交反馈"
  ON public.feedbacks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "管理员可查看反馈"
  ON public.feedbacks FOR SELECT
  USING (true);
