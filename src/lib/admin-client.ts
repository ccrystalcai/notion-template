import { createClient } from "@supabase/supabase-js";

// 创建 service_role admin 客户端（用于 API 路由，绕过 RLS）
// 禁用自动刷新和 session 持久化（服务端不需要）
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
