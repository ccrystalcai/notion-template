import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-client";

// GET: 获取所有设置
export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("*");

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

// PUT: 更新设置
export async function PUT(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await supabase.from("site_settings").upsert({ key, value: String(value) });
  }

  return NextResponse.json({ success: true });
}
