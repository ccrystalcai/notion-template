"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PaymentModal from "@/components/template/PaymentModal";
import VideoEmbed from "@/components/template/VideoEmbed";
import FeedbackSection from "@/components/template/FeedbackForm";
import { createClient } from "@/lib/supabase";
import { formatCount, centsToYuan } from "@/lib/utils";
import type { Template } from "@/types";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const id = params.id as string;
  const isPreview = searchParams.get("preview") === "true";

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copying, setCopying] = useState(false);
  const [recommended, setRecommended] = useState<Template[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const viewTracked = useRef(false);

  const fetchTemplate = useCallback(async () => {
    let data: Template | null = null;

    if (isPreview) {
      // 预览模式：通过 API 绕过 RLS 获取草稿数据
      const res = await fetch(`/api/templates/${id}/preview`);
      if (res.ok) {
        data = await res.json();
      }
    } else {
      // 正常模式：通过 Supabase 客户端获取（RLS 仅返回已发布）
      const { data: supabaseData } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .single();
      data = supabaseData as Template | null;
    }

    if (data) {
      setTemplate(data);
      if (!viewTracked.current && !isPreview) {
        viewTracked.current = true;
        fetch(`/api/templates/${id}/view`, { method: "POST" }).catch(() => {});
      }
      const tags = data.tags || [];
      if (tags.length > 0) {
        const { data: related } = await supabase
          .from("templates")
          .select("*")
          .eq("status", "published")
          .neq("id", id)
          .order("published_at", { ascending: false })
          .limit(3);
        if (related) {
          const scored = (related as Template[]).map((t) => ({
            ...t,
            _score: t.tags?.filter((tag: string) => tags.includes(tag)).length || 0,
          }));
          scored.sort((a, b) => (b._score as number) - (a._score as number));
          setRecommended(scored.slice(0, 3));
        }
      }
    }
    setLoading(false);
  }, [id, supabase, isPreview]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSessionToken(session.access_token);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_member, is_admin")
            .eq("id", user.id)
            .single();
          if (profile?.is_member) setIsMember(true);
          if (profile?.is_admin) setIsAdmin(true);
        }
      }
    };

    fetchTemplate();
    checkUser();
  }, [fetchTemplate, supabase]);

  // 是否能直接解锁
  const canUnlock = template && (template.price === 0 || isMember || paid);

  // 获取预览链接（第一个链接）
  const previewLink = template?.links?.[0];
  // 获取解锁链接（第二个链接，或第一个）
  const unlockLink = template?.links?.[1] || template?.links?.[0];

  const handlePreview = () => {
    if (previewLink?.url) window.open(previewLink.url, "_blank");
  };

  const handleUnlock = async () => {
    if (!template) return;
    if (canUnlock) {
      if (!copying) {
        setCopying(true);
        fetch(`/api/templates/${id}/copy`, {
          method: "POST",
          headers: sessionToken
            ? { Authorization: `Bearer ${sessionToken}` }
            : {},
        }).catch(() => {});
        setTemplate({
          ...template,
          copy_count: (template.copy_count || 0) + 1,
        });
        setCopying(false);
      }
      if (unlockLink?.url) window.open(unlockLink.url, "_blank");
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = () => {
    setPaid(true);
    setShowPayment(false);
    // 付完直接解锁
    setTimeout(() => {
      if (unlockLink?.url) window.open(unlockLink.url, "_blank");
    }, 500);
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-lavender/30 border-t-lavender rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  // ==========================================
  // Not Found
  // ==========================================
  if (!template) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-silver/50 mb-4">模板未找到</p>
            <Link
              href="/"
              className="text-sm text-lavender hover:text-lavender-light transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ==========================================
  // Detail Page
  // ==========================================
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        {/* 预览模式横幅 */}
        {isPreview && (
          <div className="bg-amber-400/15 border-b border-amber-400/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <p className="text-sm text-amber-300">
                👁️ 正在预览草稿 — 仅管理员可见
              </p>
              <Link
                href={`/admin/templates/${template.id}/edit`}
                className="text-xs text-amber-300/70 hover:text-amber-300 transition-colors underline"
              >
                返回编辑
              </Link>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* 返回 */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className="text-sm text-silver/50 hover:text-lavender transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              返回
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* ========== 左侧：封面 + 功能点 + 热度 ========== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start"
            >
              {/* 封面图 */}
              <div className="glass overflow-hidden rounded-2xl aspect-[4/3]">
                {template.cover_image ? (
                  <img
                    src={template.cover_image}
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-cosmic/30 text-lavender/20">
                    <div className="text-center">
                      <span className="text-5xl block mb-2">✦</span>
                      <span className="text-sm">暂无封面</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 热度统计 */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-xs text-silver/40 uppercase tracking-wider mb-4">
                  模板热度
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👀</span>
                    <div>
                      <p className="text-lg font-semibold text-silver">
                        {formatCount(template.view_count || 0)}
                      </p>
                      <p className="text-xs text-silver/40">浏览</p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-lavender/10" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <div>
                      <p className="text-lg font-semibold text-silver">
                        {formatCount(template.copy_count || 0)}
                      </p>
                      <p className="text-xs text-silver/40">复制</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 功能点列表 */}
              {template.features && template.features.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-xs text-silver/40 uppercase tracking-wider mb-4">
                    功能亮点
                  </h3>
                  <ul className="space-y-2.5">
                    {template.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-silver/70"
                      >
                        <span className="text-lavender mt-0.5 flex-shrink-0">
                          ✦
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* ========== 右侧：信息 + 操作按钮 ========== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="glass rounded-2xl p-6 sm:p-8">
                {/* 状态标签 */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {template.is_limited_free && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300">
                      ⚡ 限时免费
                    </span>
                  )}
                  {template.price === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-300">
                      免费
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-lavender/20 text-lavender">
                      ¥{centsToYuan(template.price)}
                    </span>
                  )}
                  {isMember && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300">
                      👑 会员已解锁
                    </span>
                  )}
                  {paid && !isMember && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-300">
                      ✅ 已购买
                    </span>
                  )}
                </div>

                {/* 标题 */}
                <h1 className="text-2xl sm:text-3xl font-bold text-silver mb-4">
                  {template.title}
                </h1>

                {/* 描述 */}
                <p className="text-silver/60 leading-relaxed mb-6">
                  {template.description}
                </p>

                {/* 标签 */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs bg-lavender/10 text-lavender/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* ===== 两个操作按钮 ===== */}
                <div className="space-y-3 mb-8">
                  {/* 预览按钮 */}
                  {previewLink && (
                    <button
                      onClick={handlePreview}
                      className="w-full py-3 rounded-full font-medium transition-all
                        border border-lavender/40 text-silver hover:bg-lavender/10
                        flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      模板预览
                    </button>
                  )}

                  {/* 解锁按钮 */}
                  {unlockLink && (
                    <button
                      onClick={handleUnlock}
                      disabled={copying}
                      className="w-full py-3 rounded-full font-medium transition-all text-lg
                        bg-lavender text-dark-purple hover:bg-lavender-light
                        shadow-lg shadow-lavender/20 disabled:opacity-70
                        flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                      {canUnlock
                        ? "解锁模板 →"
                        : `¥${(template.price / 100).toFixed(0)} 解锁模板`}
                    </button>
                  )}
                </div>

                {/* ===== 问题反馈入口 ===== */}
                <FeedbackSection templateId={template.id} sessionToken={sessionToken} />

                {/* ===== 推荐模板 ===== */}
                {recommended.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-lavender/10">
                    <h3 className="text-xs text-silver/40 uppercase tracking-wider mb-4">
                      推荐模板
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {recommended.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => router.push(`/template/${rec.id}`)}
                          className="text-left group"
                        >
                          <div className="glass rounded-xl overflow-hidden transition-all hover:border-lavender/30">
                            <div className="aspect-video bg-cosmic/30 flex items-center justify-center overflow-hidden">
                              {rec.cover_image ? (
                                <img
                                  src={rec.cover_image}
                                  alt={rec.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lavender/20">✦</span>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-medium text-silver group-hover:text-lavender transition-colors truncate">
                                {rec.title}
                              </p>
                              <p className="text-[10px] text-silver/40 mt-0.5">
                                {rec.price === 0
                                  ? "免费"
                                  : `¥${centsToYuan(rec.price)}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 会员入口（仅付费模板非会员显示） */}
                {!isMember && template.price > 0 && !paid && (
                  <div className="text-center pt-4 border-t border-lavender/10">
                    <Link
                      href="/login"
                      className="text-sm text-lavender/60 hover:text-lavender transition-colors"
                    >
                      👑 成为会员，解锁全部 50+ 模板
                    </Link>
                  </div>
                )}

                {/* 发布信息 */}
                <div className="mt-6 pt-4 border-t border-lavender/10 flex items-center gap-4 text-xs text-silver/30">
                  {template.published_at && (
                    <span>
                      发布于{" "}
                      {new Date(template.published_at).toLocaleDateString(
                        "zh-CN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========== 使用说明模块 ========== */}
          {(template.video_url ||
            template.video_url_2 ||
            (template.tutorial_steps &&
              template.tutorial_steps.length > 0) ||
            (template.rich_content &&
              template.rich_content.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-semibold text-silver text-center mb-10">
                使用说明
              </h2>

              <div className="glass rounded-2xl p-6 sm:p-8">
                {/* 视频嵌入（双源） */}
                {(template.video_url || template.video_url_2) && (
                  <div className="mb-10">
                    <h3 className="text-sm text-silver/50 mb-4">
                      📺 演示视频
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[template.video_url, template.video_url_2]
                        .filter(Boolean)
                        .map((url, idx) => (
                          <div key={idx}>
                            {idx === 0 && template.video_url_2 && (
                              <p className="text-xs text-silver/40 mb-2">视频 {idx + 1}</p>
                            )}
                            {idx === 1 && (
                              <p className="text-xs text-silver/40 mb-2">视频 2</p>
                            )}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-cosmic/40">
                              <VideoEmbed url={url!} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 图文教程步骤 */}
                {template.tutorial_steps &&
                  template.tutorial_steps.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-sm text-silver/50 mb-6">
                        📖 图文教程
                      </h3>
                      <div className="space-y-8">
                        {template.tutorial_steps.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lavender/20 flex items-center justify-center text-sm font-medium text-lavender">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-silver mb-1.5">
                                {step.title}
                              </h4>
                              <p className="text-sm text-silver/50 leading-relaxed">
                                {step.description}
                              </p>
                              {step.image_url && (
                                <img
                                  src={step.image_url}
                                  alt={step.title}
                                  className="mt-3 rounded-xl max-w-full"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 图文排版内容块 */}
                {template.rich_content &&
                  template.rich_content.length > 0 && (
                    <div>
                      <h3 className="text-sm text-silver/50 mb-6">
                        🖼️ 详细说明
                      </h3>
                      <div className="space-y-8">
                        {template.rich_content.map((block, i) => (
                          <div key={i} className="space-y-4">
                            {block.image_url && (
                              <img
                                src={block.image_url}
                                alt=""
                                className="rounded-xl max-w-full"
                              />
                            )}
                            {block.text && (
                              <p className="text-sm text-silver/60 leading-relaxed whitespace-pre-wrap">
                                {block.text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />

      {/* 支付弹窗 */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        template={template}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}

