import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 服务端 Supabase 客户端工厂（用于 Server Components / Route Handlers）
async function createServerSupabaseClient(apiKey: string) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    apiKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 中无法设置 cookie，忽略
          }
        },
      },
    }
  );
}

// 使用 anon key 的常规服务端客户端
export async function createServerSupabase() {
  return createServerSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

// 使用 Service Role Key 的管理端客户端（仅在安全的 API Route 中使用）
export async function createAdminSupabase() {
  return createServerSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
