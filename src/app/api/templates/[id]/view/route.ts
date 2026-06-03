import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-client";

// POST: 增加模板浏览次数（使用 service_role 绕过 RLS）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createAdminClient();

  // 先查当前值再 +1
  const { data: current } = await supabase
    .from("templates")
    .select("view_count")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("templates")
    .update({ view_count: (current?.view_count || 0) + 1 })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
