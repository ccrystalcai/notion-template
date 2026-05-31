import { createServerSupabase } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();

  const { count: total } = await supabase
    .from("templates")
    .select("*", { count: "exact", head: true });

  const { count: published } = await supabase
    .from("templates")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: feedbacks } = await supabase
    .from("feedbacks")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const stats = [
    { label: "模板总数", value: total || 0, href: "/admin/templates" },
    { label: "已发布", value: published || 0, href: "/admin/templates" },
    { label: "草稿", value: (total || 0) - (published || 0), href: "/admin/templates" },
    { label: "待处理反馈", value: feedbacks || 0, href: "/admin/feedbacks" },
    { label: "数据统计", value: "📊", href: "/admin/analytics" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">概览</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="glass rounded-xl p-5 hover:border-lavender/30 transition-colors"
          >
            <p className="text-3xl font-bold text-silver mb-1">{s.value}</p>
            <p className="text-xs text-silver/50">{s.label}</p>
          </Link>
        ))}
      </div>
      <Link
        href="/admin/templates/new"
        className="inline-flex px-6 py-3 rounded-full bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors"
      >
        + 新建模板
      </Link>
    </div>
  );
}
