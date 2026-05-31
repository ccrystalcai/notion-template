"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Template } from "@/types";

export default function AdminTemplatesPage() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTemplates(data as Template[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleStatus = async (tpl: Template) => {
    const newStatus = tpl.status === "published" ? "draft" : "published";
    await supabase
      .from("templates")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", tpl.id);
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("确定删除这个模板？")) return;
    await supabase.from("templates").delete().eq("id", id);
    fetchTemplates();
  };

  if (loading) {
    return <p className="text-silver/40 text-sm">加载中...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-silver">模板管理</h1>
        <Link
          href="/admin/templates/new"
          className="px-4 py-2 rounded-full bg-lavender text-dark-purple text-sm font-medium hover:bg-lavender-light transition-colors"
        >
          + 新建
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-silver/40">
          暂无模板
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-left p-4 text-silver/50 font-medium">封面</th>
                  <th className="text-left p-4 text-silver/50 font-medium">标题</th>
                  <th className="text-left p-4 text-silver/50 font-medium">价格</th>
                  <th className="text-left p-4 text-silver/50 font-medium">状态</th>
                  <th className="text-left p-4 text-silver/50 font-medium">热度</th>
                  <th className="text-right p-4 text-silver/50 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr
                    key={tpl.id}
                    className="border-b border-lavender/5 hover:bg-cosmic/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-16 h-10 rounded-lg bg-cosmic/30 overflow-hidden">
                        {tpl.cover_image ? (
                          <img
                            src={tpl.cover_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lavender/20 text-xs">
                            ✦
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-silver font-medium">{tpl.title}</p>
                      <p className="text-silver/30 text-xs mt-0.5 line-clamp-1">
                        {tpl.description}
                      </p>
                    </td>
                    <td className="p-4 text-silver/70">
                      {tpl.price === 0 ? (
                        <span className="text-emerald-400/70">免费</span>
                      ) : (
                        `¥${(tpl.price / 100).toFixed(0)}`
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(tpl)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          tpl.status === "published"
                            ? "bg-emerald-400/15 text-emerald-400"
                            : "bg-silver/10 text-silver/40"
                        }`}
                      >
                        {tpl.status === "published" ? "已发布" : "草稿"}
                      </button>
                    </td>
                    <td className="p-4 text-silver/40 text-xs">
                      👀{tpl.view_count} 📋{tpl.copy_count}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                            href={`/template/${tpl.id}${tpl.status === "draft" ? "?preview=true" : ""}`}
                            target="_blank"
                            className="px-3 py-1 rounded-full text-xs bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-colors"
                          >
                            预览
                          </Link>
                        <Link
                          href={`/admin/templates/${tpl.id}/edit`}
                          className="px-3 py-1 rounded-full text-xs bg-lavender/10 text-lavender hover:bg-lavender/20 transition-colors"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => deleteTemplate(tpl.id)}
                          className="px-3 py-1 rounded-full text-xs bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
