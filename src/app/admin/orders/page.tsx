"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { centsToYuan } from "@/lib/utils";

const TIER_NAMES: Record<string, string> = {
  membership: "会员开通",
  membership_yearly: "年度订阅",
  membership_pro: "进阶会员",
  membership_ultimate: "尊享会员",
};

interface Order {
  id: string;
  user_id: string | null;
  template_id: string | null;
  type: string;
  amount: number;
  status: string;
  screenshot_url: string | null;
  payment_method: string | null;
  buyer_email: string | null;
  created_at: string;
  template_title?: string;
  template_links?: { label: string; url: string }[];
}

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "cancelled">(
    "pending"
  );

  const fetchOrders = async () => {
    const query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query.eq("status", filter);
    }

    const { data } = await query;
    if (data) {
      const enriched = await Promise.all(
        (data as Order[]).map(async (order) => {
          let template_title = "—";
          let template_links: { label: string; url: string }[] = [];

          if (order.template_id) {
            const { data: tpl } = await supabase
              .from("templates")
              .select("title, links")
              .eq("id", order.template_id)
              .single();
            if (tpl) {
              template_title = tpl.title;
              template_links = tpl.links || [];
            }
          }

          return { ...order, template_title, template_links };
        })
      );
      setOrders(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [filter]);

  const handleConfirm = async (order: Order) => {
    const isMembership = order.type.startsWith("membership");
    const msg = isMembership
      ? `确认收到 ¥${centsToYuan(order.amount)} 并开通会员？`
      : `确认已收到 ¥${centsToYuan(order.amount)} 并发送模板链接？`;
    if (!confirm(msg)) return;

    // 使用 API 路由（service_role），会员订单会自动设置 is_member
    const res = await fetch("/api/admin/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    if (res.ok) {
      fetchOrders();
    } else {
      alert("操作失败");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("确定驳回该订单？")) return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    fetchOrders();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-400/15 text-amber-400",
      paid: "bg-emerald-400/15 text-emerald-400",
      cancelled: "bg-red-400/15 text-red-400",
    };
    const label: Record<string, string> = {
      pending: "待核验",
      paid: "已发货",
      cancelled: "已驳回",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ""}`}
      >
        {label[status] || status}
      </span>
    );
  };

  if (loading) {
    return <p className="text-silver/40 text-sm">加载中...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">订单核验</h1>

      {/* 筛选 */}
      <div className="flex items-center gap-2 mb-6">
        {([
          ["pending", "待核验"],
          ["paid", "已发货"],
          ["cancelled", "已驳回"],
          ["all", "全部"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
              filter === key
                ? "bg-lavender/20 text-lavender"
                : "text-silver/40 hover:text-silver/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-silver/40">
          暂无订单
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass rounded-2xl p-5">
              <div className="flex items-start gap-4">
                {/* 截图 */}
                {order.screenshot_url && (
                  <a
                    href={order.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <img
                      src={order.screenshot_url}
                      alt="转账截图"
                      className="w-20 h-20 object-cover rounded-xl border border-lavender/10 hover:border-lavender/40 transition-colors"
                    />
                  </a>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    {/* 会员订单 */}
                    {order.type.startsWith("membership") ? (
                      <span className="text-sm font-medium text-silver">
                        👑 {TIER_NAMES[order.type] || "会员开通"}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-silver">
                        {order.template_title || "—"}
                      </span>
                    )}
                    {/* 类型标签 */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      order.type.startsWith("membership")
                        ? "bg-amber-400/15 text-amber-400"
                        : "bg-sky-400/15 text-sky-400"
                    }`}>
                      {order.type.startsWith("membership") ? "会员" : "模板"}
                    </span>
                    {statusBadge(order.status)}
                    {order.payment_method && (
                      <span className="text-xs text-silver/30">
                        {order.payment_method === "wechat" ? "💚" : "💙"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-silver/40 mb-3 flex-wrap">
                    <span>📧 {order.buyer_email || "未填写"}</span>
                    <span className="text-silver/70 font-medium">
                      ¥{centsToYuan(order.amount)}
                    </span>
                    <span>
                      {new Date(order.created_at).toLocaleString("zh-CN")}
                    </span>
                  </div>

                  {/* 模板链接（仅模板订单，待核验时显示） */}
                  {!order.type.startsWith("membership") && order.template_links && order.template_links.length > 0 && (
                    <div className="mb-3 p-3 rounded-xl bg-cosmic/20 border border-lavender/10">
                      <p className="text-xs text-silver/40 mb-2">
                        📎 模板链接（确认后发到用户邮箱）
                      </p>
                      {order.template_links.map((link, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs mb-1"
                        >
                          <span className="text-silver/30 flex-shrink-0">
                            {link.label}:
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lavender/60 hover:text-lavender truncate"
                          >
                            {link.url}
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(link.url)}
                            className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] bg-lavender/10 text-lavender/60 hover:bg-lavender/20 transition-colors"
                          >
                            复制
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {order.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirm(order)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 transition-colors"
                      >
                      {order.type.startsWith("membership")
                          ? "✅ 确认收款并开通会员"
                          : "✅ 确认收款并发货"}
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                      >
                        驳回
                      </button>
                    </div>
                  )}

                  {order.status === "paid" && (
                    <p className="text-xs text-emerald-400/50">
                      {order.type.startsWith("membership") ? "✅ 已开通 — " : "✅ 已发货 — "}
                      {new Date(order.created_at).toLocaleString("zh-CN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
