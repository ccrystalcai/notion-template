import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-client";

// GET: 获取模板数据（绕过 RLS，用于管理员预览草稿）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "模板未找到" }, { status: 404 });
  }

  return NextResponse.json(data);
}
