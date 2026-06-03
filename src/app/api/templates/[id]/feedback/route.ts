import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-client";

// POST: 提交模板问题反馈
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { message } = await request.json();

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 尝试获取当前用户信息
  let userId: string | null = null;
  let email: string | null = null;

  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData.user) {
        userId = userData.user.id;
        email = userData.user.email || null;
      }
    }
  } catch {
    // 非登录用户也可以提交反馈
  }

  const { error } = await supabase.from("feedbacks").insert({
    template_id: id,
    message: message.trim(),
    user_id: userId,
    email: email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
