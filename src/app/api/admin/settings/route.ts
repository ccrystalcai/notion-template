import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// GET: 获取所有设置
export async function GET() {
  const supabase = adminSupabase();
  const { data } = await supabase.from("site_settings").select("*");

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

// PUT: 更新设置
export async function PUT(request: Request) {
  const supabase = adminSupabase();
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await supabase.from("site_settings").upsert({ key, value: String(value) });
  }

  return NextResponse.json({ success: true });
}
