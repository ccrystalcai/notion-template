import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-client";

// POST: 增加模板复制次数并记录日志
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createAdminClient();

  // 获取当前用户信息
  let userId: string | null = null;
  let isMember = false;

  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData.user) {
        userId = userData.user.id;
        // 查询是否会员
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_member")
          .eq("id", userId)
          .single();
        if (profile?.is_member) isMember = true;
      }
    }
  } catch {
    // 未登录用户也可以复制
  }

  // 更新模板复制计数
  const { data: current } = await supabase
    .from("templates")
    .select("copy_count")
    .eq("id", id)
    .single();

  await supabase
    .from("templates")
    .update({ copy_count: (current?.copy_count || 0) + 1 })
    .eq("id", id);

  // 记录复制日志
  if (userId) {
    await supabase.from("copy_logs").insert({
      user_id: userId,
      template_id: id,
      is_member: isMember,
    });
  }

  return NextResponse.json({ success: true });
}
