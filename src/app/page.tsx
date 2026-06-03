"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase";
import type { Template } from "@/types";
import { centsToYuan } from "@/lib/utils";

type ViewMode = "gallery" | "list";

export default function Home() {
  const router = useRouter();
  // 从 URL 解析搜索关键词（避免 useSearchParams 的 Suspense 问题）
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("search") || "");
  }, []);

  const [view, setView] = useState<ViewMode>("gallery");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // 从 Supabase 加载已发布模板
  useEffect(() => {
    const fetchTemplates = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data) {
        setTemplates(data as Template[]);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  // 收集所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [templates]);

  // 过滤模板：搜索 + 标签
  const filteredTemplates = useMemo(() => {
    let result = templates;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (activeTag) {
      result = result.filter((t) => t.tags?.includes(activeTag));
    }
    return result;
  }, [templates, searchQuery, activeTag]);

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        {/* ========== Hero Section ========== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-stars pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-sm text-lavender/80 uppercase tracking-widest mb-4"
              >
                精选 Notion 模板
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-6"
              >
                让你的工作流
                <br />
                更优雅高效
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-lg text-silver/60 max-w-xl mx-auto mb-10"
              >
                {templates.length}+ 精心设计的 Notion 模板，覆盖效率、学习、财务、项目管理等场景。
                即拿即用，支持免费和高级模板。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center justify-center gap-4"
              >
                <a
                  href="#templates"
                  className="px-8 py-3 rounded-full bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors shadow-lg shadow-lavender/20"
                >
                  浏览模板
                </a>
                <a
                  href="/pricing"
                  className="px-8 py-3 rounded-full border border-lavender/40 text-silver hover:bg-lavender/10 transition-colors"
                >
                  成为会员
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight to-transparent pointer-events-none" />
        </section>

        {/* ========== 视图切换 + 模板区 ========== */}
        <section
          id="templates"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          {/* 搜索提示 */}
          {searchQuery && (
            <div className="mb-4 text-center">
              <span className="text-sm text-silver/50">
                搜索「{searchQuery}」找到 {filteredTemplates.length} 个模板
              </span>
              <button
                onClick={() => router.push("/")}
                className="ml-2 text-xs text-lavender/60 hover:text-lavender transition-colors"
              >
                清除
              </button>
            </div>
          )}

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !activeTag
                    ? "bg-lavender text-dark-purple"
                    : "bg-cosmic/30 text-silver/50 hover:text-silver border border-lavender/10"
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTag === tag
                      ? "bg-lavender text-dark-purple"
                      : "bg-cosmic/30 text-silver/50 hover:text-silver border border-lavender/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-silver">
              {activeTag ? activeTag : "全部模板"}
              <span className="text-sm text-silver/40 font-normal ml-2">
                {filteredTemplates.length} 个
              </span>
            </h2>

            <div className="flex items-center gap-1 p-1 rounded-full bg-cosmic/30 border border-lavender/10">
              <button
                onClick={() => setView("gallery")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  view === "gallery"
                    ? "bg-lavender text-dark-purple shadow-md"
                    : "text-silver/60 hover:text-silver"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                  画廊
                </span>
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  view === "list"
                    ? "bg-lavender text-dark-purple shadow-md"
                    : "text-silver/60 hover:text-silver"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="3" rx="0.5" />
                    <rect x="1" y="6.5" width="14" height="3" rx="0.5" />
                    <rect x="1" y="11" width="14" height="3" rx="0.5" />
                  </svg>
                  列表
                </span>
              </button>
            </div>
          </motion.div>

          {/* 加载状态 */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-cosmic/20" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-cosmic/30 rounded w-3/4" />
                    <div className="h-3 bg-cosmic/20 rounded w-full" />
                    <div className="h-3 bg-cosmic/20 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            /* 空状态 */
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-silver/50">暂无模板，敬请期待</p>
            </div>
          ) : (
            /* 视图内容 */
            <AnimatePresence mode="wait">
              {view === "gallery" ? (
                <GalleryView key="gallery" templates={filteredTemplates} />
              ) : (
                <ListView key="list" templates={filteredTemplates} />
              )}
            </AnimatePresence>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ============================================
   画廊视图
   ============================================ */
function GalleryView({ templates }: { templates: Template[] }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {templates.map((tpl, i) => (
        <motion.div
          key={tpl.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group cursor-pointer"
          onClick={() => router.push(`/template/${tpl.id}`)}
        >
          <div className="glass overflow-hidden rounded-2xl transition-shadow hover:shadow-xl hover:shadow-lavender/10">
            {/* 封面图 */}
            <div className="relative aspect-video bg-cosmic/40 overflow-hidden">
              {tpl.cover_image ? (
                <img
                  src={tpl.cover_image}
                  alt={tpl.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-lavender/20 text-sm">
                  暂无封面
                </div>
              )}
              {/* 标签 */}
              <div className="absolute top-3 left-3 flex gap-2">
                {tpl.is_limited_free && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 backdrop-blur-sm">
                    限免
                  </span>
                )}
                {tpl.price === 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-300 backdrop-blur-sm">
                    免费
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-lavender/20 text-lavender backdrop-blur-sm">
                    ¥{(tpl.price / 100).toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            {/* 信息区 */}
            <div className="p-5">
              <h3 className="text-base font-semibold text-silver group-hover:text-lavender transition-colors mb-2">
                {tpl.title}
              </h3>
              <p className="text-sm text-silver/50 line-clamp-2 mb-3">
                {tpl.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-lavender/10 text-lavender/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ============================================
   列表视图 — 按发布年份分组
   ============================================ */
function ListView({ templates }: { templates: Template[] }) {
  const router = useRouter();

  // 按年份分组
  const grouped = templates.reduce(
    (acc, tpl) => {
      const year = tpl.published_at
        ? new Date(tpl.published_at).getFullYear().toString()
        : "未知年份";
      if (!acc[year]) acc[year] = [];
      acc[year].push(tpl);
      return acc;
    },
    {} as Record<string, Template[]>
  );

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {years.map((year, yi) => (
        <div key={year}>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: yi * 0.1 }}
            className="text-xl font-semibold text-lavender mb-6 flex items-center gap-4"
          >
            <span className="w-8 h-px bg-lavender/30" />
            {year}
            <span className="text-sm text-silver/40 font-normal">
              {grouped[year].length} 个模板
            </span>
          </motion.h3>

          <div className="space-y-4">
            {grouped[year].map((tpl, i) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: yi * 0.1 + i * 0.06,
                  duration: 0.4,
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                onClick={() => router.push(`/template/${tpl.id}`)}
                className="group cursor-pointer"
              >
                <div className="glass overflow-hidden rounded-xl flex items-center gap-4 p-4 sm:p-5">
                  <div className="flex-shrink-0 w-20 h-14 sm:w-28 sm:h-16 rounded-lg bg-cosmic/40 flex items-center justify-center overflow-hidden">
                    {tpl.cover_image ? (
                      <img
                        src={tpl.cover_image}
                        alt={tpl.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lavender/20 text-xs">封面</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-silver group-hover:text-lavender transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-silver/50 mt-1 line-clamp-1">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div className="hidden sm:flex gap-1.5">
                      {tpl.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] bg-lavender/10 text-lavender/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {tpl.is_limited_free && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-400/20 text-amber-300">
                        限免
                      </span>
                    )}
                    {tpl.price === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-300">
                        免费
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-lavender/20 text-lavender">
                        ¥{centsToYuan(tpl.price)}
                      </span>
                    )}
                    <svg
                      className="w-4 h-4 text-silver/30 group-hover:text-lavender transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
