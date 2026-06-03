"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { centsToYuan } from "@/lib/utils";
import Link from "next/link";

const TIER_LABELS: Record<string, string> = {
  membership_yearly: "年度订阅 ¥99/年",
  membership_pro: "进阶会员 ¥168",
  membership_ultimate: "尊享会员 ¥399",
  membership: "会员开通",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待核验",
  paid: "已确认",
  cancelled: "已驳回",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-400",
  paid: "bg-emerald-400/15 text-emerald-400",
  cancelled: "bg-red-400/15 text-red-400",
};

const TYPE_LABELS: Record<string, string> = {
  template: "📄 模板购买",
  membership: "👑 会员开通",
  membership_yearly: "👑 年度订阅",
  membership_pro: "👑 进阶会员",
  membership_ultimate: "👑 尊享会员",
};

interface Profile {
  id: string;
  email: string | null;
  display_name: string;
  is_member: boolean;
  is_admin: boolean;
  membership_expires_at: string | null;
}

interface Order {
  id: string;
  type: string;
  amount: number;
  status: string;
  template_id: string | null;
  payment_method: string | null;
  buyer_email: string | null;
  created_at: string;
}

export default function AccountPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (user) {
        setUserEmail(user.email || "");
        setDisplayName(
          (user.user_metadata?.display_name as string) ||
            user.email?.split("@")[0] ||
            ""
        );

        // 加载 profile
        const { data: pf } = await supabase
          .from("profiles")
          .select("id, email, display_name, is_member, is_admin, membership_expires_at")
          .eq("id", user.id)
          .single();
        if (pf) setProfile(pf as Profile);

        // 加载订单（RLS 自动过滤）
        const { data: od } = await supabase
          .from("orders")
          .select("id, type, amount, status, template_id, payment_method, buyer_email, created_at")
          .order("created_at", { ascending: false });
        if (od) setOrders(od as Order[]);
      }

      setLoading(false);
    };
    load();
  }, []);

  // 计算会员到期倒计时
  const getExpiryInfo = () => {
    if (!profile?.is_member) return null;
    if (!profile.membership_expires_at) {
      return { text: "永久有效", urgent: false };
    }
    const now = new Date();
    const expiry = new Date(profile.membership_expires_at);
    const days = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return { text: "已过期", urgent: true };
    if (days <= 30) return { text: `还剩 ${days} 天`, urgent: true };
    return { text: `还剩 ${days} 天`, urgent: false };
  };

  const expiryInfo = getExpiryInfo();

  // 从订单推断套餐类型
  const lastMemberOrder = orders.find((o) => o.type.startsWith("membership") && o.status === "paid");
  const tierLabel = lastMemberOrder ? TIER_LABELS[lastMemberOrder.type] || "会员" : "—";

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <p className="text-silver/40 text-sm">加载中...</p>
      </main>
    );
  }

  // 未登录
  if (!userEmail) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-10"
          >
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-xl font-semibold text-silver mb-2">
              请先登录
            </h1>
            <p className="text-sm text-silver/50 mb-6">
              登录后查看您的会员状态和订单记录
            </p>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full text-sm bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors inline-block"
            >
              前往登录
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-silver mb-8"
        >
          我的账号
        </motion.h1>

        <div className="space-y-6">
          {/* 1. 用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-full bg-lavender/20 flex items-center justify-center text-xl text-lavender font-semibold flex-shrink-0">
              {displayName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-silver">
                {displayName}
              </h2>
              <p className="text-sm text-silver/40">{userEmail}</p>
            </div>
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="ml-auto px-4 py-1.5 rounded-full text-xs bg-lavender/15 text-lavender hover:bg-lavender/25 transition-colors"
              >
                ⚙️ 管理后台
              </Link>
            )}
          </motion.div>

          {/* 2. 会员状态卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`glass rounded-2xl p-6 border ${
              profile?.is_member
                ? "border-lavender/30"
                : "border-lavender/10"
            }`}
          >
            <h3 className="text-sm text-silver/40 mb-4">会员状态</h3>

            {profile?.is_member ? (
              <div className="flex items-start gap-4 flex-wrap">
                <div className="text-4xl">👑</div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-silver">
                    {tierLabel}
                  </p>
                  {expiryInfo && (
                    <p
                      className={`text-sm mt-1 ${
                        expiryInfo.urgent
                          ? "text-amber-400"
                          : "text-emerald-400/70"
                      }`}
                    >
                      {expiryInfo.urgent ? "⚠️ " : "✅ "}
                      {expiryInfo.text}
                    </p>
                  )}
                </div>
                <Link
                  href="/pricing"
                  className="px-4 py-1.5 rounded-full text-xs border border-lavender/30 text-silver/50 hover:bg-lavender/10 transition-colors"
                >
                  升级套餐 →
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-silver/40 text-sm mb-4">
                  还不是会员？解锁全部模板
                </p>
                <Link
                  href="/pricing"
                  className="px-6 py-2 rounded-full text-sm bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors inline-block"
                >
                  查看会员套餐
                </Link>
              </div>
            )}
          </motion.div>

          {/* 3. 订单记录 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-sm text-silver/40 mb-4">订单记录</h3>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-silver/30 text-sm">暂无订单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 border-b border-lavender/5 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-silver">
                          {TYPE_LABELS[order.type] || order.type}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            STATUS_COLORS[order.status] || ""
                          }`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        {order.payment_method && (
                          <span className="text-xs text-silver/30">
                            {order.payment_method === "wechat" ? "💚" : "💙"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-silver/30 mt-0.5">
                        {new Date(order.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-silver/70 flex-shrink-0 ml-3">
                      ¥{centsToYuan(order.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
