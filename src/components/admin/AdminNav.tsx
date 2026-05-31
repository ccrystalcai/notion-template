"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const links = [
  { href: "/admin", label: "概览" },
  { href: "/admin/templates", label: "模板管理" },
  { href: "/admin/orders", label: "订单核验" },
  { href: "/admin/analytics", label: "数据统计" },
  { href: "/admin/feedbacks", label: "用户反馈" },
  { href: "/admin/settings", label: "站点设置" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight/90 backdrop-blur-md border-b border-lavender/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="text-sm font-semibold text-lavender">
            ⚙️ 管理后台
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-lavender/20 text-lavender"
                    : "text-silver/50 hover:text-silver"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-silver/40 hover:text-silver transition-colors"
          >
            返回前台 →
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-silver/40 hover:text-red-400 transition-colors"
          >
            退出
          </button>
        </div>
      </div>
    </header>
  );
}
