"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface Feedback {
  id: string;
  template_id: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string | null;
  email: string | null;
  template_title?: string;
}

export default function AdminFeedbacksPage() {
  const supabase = createClient();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    // 先获取反馈
    const { data: fb } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    if (fb) {
      // 补上模板标题
      const withTitles = await Promise.all(
        fb.map(async (f) => {
          const { data: tpl } = await supabase
            .from("templates")
            .select("title")
            .eq("id", f.template_id)
            .single();
          return { ...f, template_title: tpl?.title || "已删除" };
        })
      );
      setFeedbacks(withTitles);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const markResolved = async (id: string) => {
    await supabase.from("feedbacks").update({ status: "resolved" }).eq("id", id);
    fetchFeedbacks();
  };

  if (loading) {
    return <p className="text-silver/40 text-sm">加载中...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">用户反馈</h1>

      {feedbacks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-silver/40">
          暂无反馈
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`glass rounded-xl p-4 ${
                fb.status === "resolved" ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-silver/70 mb-1">{fb.message}</p>
                  <div className="flex items-center gap-3 text-xs text-silver/40 flex-wrap">
                    <span>📁 {fb.template_title}</span>
                    {fb.email && <span>📧 {fb.email}</span>}
                    <span>
                      {new Date(fb.created_at).toLocaleDateString("zh-CN")}
                    </span>
                    <span
                      className={
                        fb.status === "open"
                          ? "text-amber-400/70"
                          : "text-emerald-400/70"
                      }
                    >
                      {fb.status === "open" ? "待处理" : "已解决"}
                    </span>
                  </div>
                </div>
                {fb.status === "open" && (
                  <button
                    onClick={() => markResolved(fb.id)}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                  >
                    标记已解决
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
