-- ============================================
-- 迁移 #6: 修复注册问题
-- ============================================

-- 1. 修复触发器函数：用 SECURITY DEFINER 绕过权限限制
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''));
  RETURN NEW;
END;
$$;

-- 2. 补充 profiles INSERT 权限
DROP POLICY IF EXISTS "允许插入自己的资料" ON public.profiles;
CREATE POLICY "允许插入自己的资料"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
