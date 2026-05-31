import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// 处理邮箱确认等认证回调
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 出错则回到登录页
  return NextResponse.redirect(`${origin}/login`);
}
