import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-client";

// GET: 获取复制统计数据
export async function GET() {
  const supabase = createAdminClient();

  // 所有复制日志（含用户邮箱、模板标题、是否会员）
  const { data: logs } = await supabase
    .from("copy_logs")
    .select("*")
    .order("created_at", { ascending: false });

  // 获取所有模板标题
  const { data: templates } = await supabase
    .from("templates")
    .select("id, title");

  // 获取所有用户资料
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, is_member");

  const templateMap = new Map(
    (templates || []).map((t) => [t.id, t.title])
  );
  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { email: p.email, is_member: p.is_member }])
  );

  // 按模板统计
  const byTemplate: Record<
    string,
    { copies: number; uniqueUsers: Set<string>; memberUsers: Set<string> }
  > = {};

  // 按用户统计
  const byUser: Record<
    string,
    {
      email: string;
      is_member: boolean;
      copies: number;
      templates: Record<string, number>;
    }
  > = {};

  for (const log of logs || []) {
    const tid = log.template_id;
    const uid = log.user_id;

    // 按模板
    if (!byTemplate[tid]) {
      byTemplate[tid] = {
        copies: 0,
        uniqueUsers: new Set(),
        memberUsers: new Set(),
      };
    }
    byTemplate[tid].copies++;
    if (uid) {
      byTemplate[tid].uniqueUsers.add(uid);
      if (log.is_member) byTemplate[tid].memberUsers.add(uid);
    }

    // 按用户
    if (uid) {
      const profile = profileMap.get(uid);
      if (!byUser[uid]) {
        byUser[uid] = {
          email: profile?.email || "未知",
          is_member: profile?.is_member || false,
          copies: 0,
          templates: {},
        };
      }
      byUser[uid].copies++;
      byUser[uid].templates[tid] = (byUser[uid].templates[tid] || 0) + 1;
    }
  }

  // 格式化按模板数据
  const templateStats = Object.entries(byTemplate)
    .map(([tid, stats]) => ({
      template_id: tid,
      title: templateMap.get(tid) || "已删除",
      copies: stats.copies,
      unique_users: stats.uniqueUsers.size,
      member_users: stats.memberUsers.size,
    }))
    .sort((a, b) => b.copies - a.copies);

  // 格式化按用户数据
  const userStats = Object.entries(byUser)
    .map(([uid, stats]) => ({
      user_id: uid,
      email: stats.email,
      is_member: stats.is_member,
      copies: stats.copies,
      top_template: templateMap.get(
        Object.entries(stats.templates).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
      ) || "—",
    }))
    .sort((a, b) => b.copies - a.copies);

  return NextResponse.json({
    templateStats,
    userStats,
    totalCopies: (logs || []).length,
    totalUsers: Object.keys(byUser).length,
    memberCopies: (logs || []).filter((l) => l.is_member).length,
  });
}
