"use client";

import { useState, useEffect, useMemo } from "react";

interface TemplateStat {
  template_id: string;
  title: string;
  copies: number;
  unique_users: number;
  member_users: number;
}

interface UserStat {
  user_id: string;
  email: string;
  is_member: boolean;
  copies: number;
  top_template: string;
}

interface AnalyticsData {
  templateStats: TemplateStat[];
  userStats: UserStat[];
  totalCopies: number;
  totalUsers: number;
  memberCopies: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"template" | "user">("template");
  const [memberFilter, setMemberFilter] = useState<"all" | "member" | "nonmember">("all");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredUserStats = useMemo(() => {
    if (!data) return [];
    return data.userStats.filter((u) => {
      if (memberFilter === "member") return u.is_member;
      if (memberFilter === "nonmember") return !u.is_member;
      return true;
    });
  }, [data, memberFilter]);

  if (loading) {
    return <p className="text-silver/40 text-sm">加载中...</p>;
  }

  if (!data) {
    return <p className="text-silver/40 text-sm">暂无数据</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">数据统计</h1>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-5">
          <p className="text-3xl font-bold text-silver mb-1">{data.totalCopies}</p>
          <p className="text-xs text-silver/50">总复制次数</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-3xl font-bold text-silver mb-1">{data.totalUsers}</p>
          <p className="text-xs text-silver/50">复制用户数</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-3xl font-bold text-amber-300 mb-1">{data.memberCopies}</p>
          <p className="text-xs text-silver/50">会员复制次数</p>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("template")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "template"
              ? "bg-lavender/20 text-lavender"
              : "text-silver/40 hover:text-silver/70"
          }`}
        >
          按模板查看
        </button>
        <button
          onClick={() => setTab("user")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "user"
              ? "bg-lavender/20 text-lavender"
              : "text-silver/40 hover:text-silver/70"
          }`}
        >
          按用户查看
        </button>

        {/* 用户视图下的会员筛选 */}
        {tab === "user" && (
          <div className="ml-auto flex items-center gap-1.5">
            {([
              ["all", "全部"],
              ["member", "会员"],
              ["nonmember", "非会员"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMemberFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  memberFilter === key
                    ? "bg-lavender/20 text-lavender"
                    : "text-silver/30 hover:text-silver/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 按模板查看 */}
      {tab === "template" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-left p-4 text-silver/50 font-medium">模板</th>
                  <th className="text-center p-4 text-silver/50 font-medium">复制次数</th>
                  <th className="text-center p-4 text-silver/50 font-medium">独立用户</th>
                  <th className="text-center p-4 text-silver/50 font-medium">会员用户</th>
                </tr>
              </thead>
              <tbody>
                {data.templateStats.map((t) => (
                  <tr
                    key={t.template_id}
                    className="border-b border-lavender/5 hover:bg-cosmic/10 transition-colors"
                  >
                    <td className="p-4 text-silver font-medium">{t.title}</td>
                    <td className="p-4 text-center text-silver/70">{t.copies}</td>
                    <td className="p-4 text-center text-silver/70">{t.unique_users}</td>
                    <td className="p-4 text-center">
                      {t.member_users > 0 ? (
                        <span className="text-amber-300/80">👑 {t.member_users}</span>
                      ) : (
                        <span className="text-silver/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.templateStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-silver/30">
                      暂无复制数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 按用户查看 */}
      {tab === "user" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-left p-4 text-silver/50 font-medium">用户</th>
                  <th className="text-center p-4 text-silver/50 font-medium">会员</th>
                  <th className="text-center p-4 text-silver/50 font-medium">复制次数</th>
                  <th className="text-left p-4 text-silver/50 font-medium">最爱模板</th>
                </tr>
              </thead>
              <tbody>
                {filteredUserStats.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-lavender/5 hover:bg-cosmic/10 transition-colors"
                  >
                    <td className="p-4 text-silver">{u.email}</td>
                    <td className="p-4 text-center">
                      {u.is_member ? (
                        <span className="text-amber-300/80">👑 会员</span>
                      ) : (
                        <span className="text-silver/30">普通</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-silver/70">{u.copies}</td>
                    <td className="p-4 text-silver/50 text-xs">{u.top_template}</td>
                  </tr>
                ))}
                {filteredUserStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-silver/30">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
