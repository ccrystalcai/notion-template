"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { INPUT_CLASS } from "@/lib/styles";
import type { Template, TutorialStep, RichContentBlock } from "@/types";

interface Props {
  template?: Template | null;
}

export default function TemplateForm({ template }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!template;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 基本信息
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [link1Label, setLink1Label] = useState("预览");
  const [link1Url, setLink1Url] = useState("");
  const [link2Label, setLink2Label] = useState("解锁模板");
  const [link2Url, setLink2Url] = useState("");
  const [price, setPrice] = useState(0);
  const [isLimitedFree, setIsLimitedFree] = useState(false);

  // 状态
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // 功能亮点（一行一个）
  const [featuresText, setFeaturesText] = useState("");

  // 视频源（一行一个）
  const [videoUrlsText, setVideoUrlsText] = useState("");

  // 教程步骤（动态）
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  // 图文排版（动态）
  const [richBlocks, setRichBlocks] = useState<RichContentBlock[]>([]);

  // 加载已有数据
  useEffect(() => {
    if (template) {
      setTitle(template.title || "");
      setDescription(template.description || "");
      setCoverImage(template.cover_image || "");
      setTags((template.tags || []).join(", "));
      setLink1Label(template.links?.[0]?.label || "预览");
      setLink1Url(template.links?.[0]?.url || "");
      setLink2Label(template.links?.[1]?.label || "解锁模板");
      setLink2Url(template.links?.[1]?.url || "");
      setPrice(template.price || 0);
      setIsLimitedFree(template.is_limited_free || false);
      setStatus(template.status || "draft");
      setFeaturesText((template.features || []).join("\n"));
      setVideoUrlsText(
        [template.video_url, template.video_url_2]
          .filter(Boolean)
          .join("\n")
      );
      setSteps(
        template.tutorial_steps && template.tutorial_steps.length > 0
          ? template.tutorial_steps
          : []
      );
      setRichBlocks(template.rich_content || []);
    }
  }, [template]);

  // ========== 封面上传 ==========
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("上传失败: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("covers")
      .getPublicUrl(fileName);

    if (urlData?.publicUrl) {
      setCoverImage(urlData.publicUrl);
    }
    setUploading(false);
  };

  // ========== 保存 ==========
  const handleSave = async (saveStatus: "draft" | "published") => {
    setSaving(true);

    const links = [];
    if (link1Url) links.push({ label: link1Label || "预览", url: link1Url });
    if (link2Url) links.push({ label: link2Label || "解锁模板", url: link2Url });

    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const tagsArr = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const videoUrls = videoUrlsText
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      title,
      description,
      cover_image: coverImage || null,
      tags: tagsArr,
      links,
      features,
      price,
      is_limited_free: isLimitedFree,
      status: saveStatus,
      video_url: videoUrls[0] || null,
      video_url_2: videoUrls[1] || null,
      tutorial_steps: steps.length > 0 ? steps : null,
      rich_content: richBlocks.length > 0 ? richBlocks : null,
      ...(saveStatus === "published" && !template?.published_at
        ? { published_at: new Date().toISOString() }
        : {}),
    };

    if (isEdit) {
      await supabase.from("templates").update(payload).eq("id", template!.id);
    } else {
      await supabase.from("templates").insert(payload);
    }

    setSaving(false);
    router.push("/admin/templates");
    router.refresh();
  };

  // ========== 样式 ==========
  const labelClass = "block text-xs text-silver/50 mb-1.5";
  const sectionClass = "glass rounded-2xl p-6 space-y-4";

  return (
    <div className="space-y-6">
      {/* ===== 状态切换（仅编辑模式） ===== */}
      {isEdit && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-silver">发布状态</h2>
              <p className="text-xs text-silver/40 mt-1">
                当前：{status === "published" ? "✅ 已发布" : "📝 草稿"}
              </p>
            </div>
            <button
              onClick={() =>
                setStatus(status === "published" ? "draft" : "published")
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                status === "published"
                  ? "bg-silver/10 text-silver/50 hover:bg-silver/20"
                  : "bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25"
              }`}
            >
              {status === "published" ? "切换为草稿" : "切换为发布"}
            </button>
          </div>
        </div>
      )}

      {/* ===== 基本信息 ===== */}
      <div className={sectionClass}>
        <h2 className="text-sm font-medium text-silver mb-4">基本信息</h2>
        <div>
          <label className={labelClass}>标题 *</label>
          <input
            className={INPUT_CLASS}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="模板名称"
          />
        </div>
        <div>
          <label className={labelClass}>描述</label>
          <textarea
            className={INPUT_CLASS + " resize-none"}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="模板描述..."
          />
        </div>

        {/* 封面图：上传 + URL */}
        <div>
          <label className={labelClass}>封面图</label>
          <div className="flex items-center gap-3">
            <input
              className={INPUT_CLASS + " flex-1"}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... 或上传图片"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadCover}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs border border-lavender/30 text-silver/60 hover:bg-lavender/10 transition-colors disabled:opacity-50"
            >
              {uploading ? "上传中..." : "上传"}
            </button>
          </div>
          {coverImage && (
            <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden bg-cosmic/30">
              <img
                src={coverImage}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>标签（逗号分隔）</label>
            <input
              className={INPUT_CLASS}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="效率, 项目管理"
            />
          </div>
          <div>
            <label className={labelClass}>价格（元，0=免费）</label>
            <input
              className={INPUT_CLASS}
              type="number"
              value={price / 100}
              onChange={(e) => setPrice(Number(e.target.value) * 100)}
              placeholder="29"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-silver/60 cursor-pointer">
          <input
            type="checkbox"
            checked={isLimitedFree}
            onChange={(e) => setIsLimitedFree(e.target.checked)}
            className="rounded accent-lavender"
          />
          限时免费
        </label>
      </div>

      {/* ===== 链接配置 ===== */}
      <div className={sectionClass}>
        <h2 className="text-sm font-medium text-silver mb-4">模板链接</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>链接1 — 标签</label>
            <input
              className={INPUT_CLASS}
              value={link1Label}
              onChange={(e) => setLink1Label(e.target.value)}
              placeholder="预览"
            />
            <label className={labelClass + " mt-2"}>链接1 — URL</label>
            <input
              className={INPUT_CLASS}
              value={link1Url}
              onChange={(e) => setLink1Url(e.target.value)}
              placeholder="https://notion.so/..."
            />
          </div>
          <div>
            <label className={labelClass}>链接2 — 标签</label>
            <input
              className={INPUT_CLASS}
              value={link2Label}
              onChange={(e) => setLink2Label(e.target.value)}
              placeholder="解锁模板"
            />
            <label className={labelClass + " mt-2"}>链接2 — URL</label>
            <input
              className={INPUT_CLASS}
              value={link2Url}
              onChange={(e) => setLink2Url(e.target.value)}
              placeholder="https://notion.so/..."
            />
          </div>
        </div>
      </div>

      {/* ===== 功能亮点 ===== */}
      <div className={sectionClass}>
        <h2 className="text-sm font-medium text-silver mb-4">功能亮点</h2>
        <div>
          <label className={labelClass}>每行一个功能点</label>
          <textarea
            className={INPUT_CLASS + " resize-none"}
            rows={6}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="功能点 1&#10;功能点 2&#10;功能点 3&#10;..."
          />
          <p className="text-xs text-silver/30 mt-1">
            {featuresText.split("\n").filter(Boolean).length} 个功能点
          </p>
        </div>
      </div>

      {/* ===== 演示视频 ===== */}
      <div className={sectionClass}>
        <h2 className="text-sm font-medium text-silver mb-4">演示视频</h2>
        <div>
          <label className={labelClass}>视频链接（一行一个）</label>
          <textarea
            className={INPUT_CLASS + " resize-none"}
            rows={2}
            value={videoUrlsText}
            onChange={(e) => setVideoUrlsText(e.target.value)}
            placeholder={"https://www.bilibili.com/video/...\nhttps://www.xiaohongshu.com/..."}
          />
          <p className="text-xs text-silver/30 mt-1">
            支持 B站 / YouTube 嵌入，小红书等链接显示跳转按钮
          </p>
        </div>
      </div>

      {/* ===== 图文教程步骤 ===== */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-silver">图文教程步骤</h2>
          <button
            onClick={() =>
              setSteps([...steps, { title: "", description: "", image_url: null }])
            }
            className="px-3 py-1.5 rounded-full text-xs border border-lavender/30 text-lavender/70 hover:bg-lavender/10 transition-colors"
          >
            + 添加步骤
          </button>
        </div>

        {steps.length === 0 && (
          <p className="text-xs text-silver/30 text-center py-4">
            暂无步骤，点击"+ 添加步骤"开始
          </p>
        )}

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-cosmic/20 border border-lavender/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-silver/40">步骤 {i + 1}</span>
                <button
                  onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  删除
                </button>
              </div>
              <input
                className={INPUT_CLASS}
                value={step.title}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = { ...updated[i], title: e.target.value };
                  setSteps(updated);
                }}
                placeholder="步骤标题"
              />
              <textarea
                className={INPUT_CLASS + " resize-none"}
                rows={2}
                value={step.description}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = { ...updated[i], description: e.target.value };
                  setSteps(updated);
                }}
                placeholder="步骤描述"
              />
              <input
                className={INPUT_CLASS}
                value={step.image_url || ""}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = {
                    ...updated[i],
                    image_url: e.target.value || null,
                  };
                  setSteps(updated);
                }}
                placeholder="步骤配图 URL（选填）"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== 图文排版模块 ===== */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-silver">图文排版</h2>
            <p className="text-xs text-silver/40 mt-0.5">
              自由的图片+文字排版内容块
            </p>
          </div>
          <button
            onClick={() =>
              setRichBlocks([...richBlocks, { image_url: "", text: "" }])
            }
            className="px-3 py-1.5 rounded-full text-xs border border-lavender/30 text-lavender/70 hover:bg-lavender/10 transition-colors"
          >
            + 添加内容块
          </button>
        </div>

        {richBlocks.length === 0 && (
          <p className="text-xs text-silver/30 text-center py-4">
            暂无内容块，点击"+ 添加内容块"开始
          </p>
        )}

        <div className="space-y-4">
          {richBlocks.map((block, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-cosmic/20 border border-lavender/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-silver/40">内容块 {i + 1}</span>
                <button
                  onClick={() =>
                    setRichBlocks(richBlocks.filter((_, idx) => idx !== i))
                  }
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  删除
                </button>
              </div>
              <input
                className={INPUT_CLASS}
                value={block.image_url}
                onChange={(e) => {
                  const updated = [...richBlocks];
                  updated[i] = { ...updated[i], image_url: e.target.value };
                  setRichBlocks(updated);
                }}
                placeholder="图片 URL"
              />
              {block.image_url && (
                <img
                  src={block.image_url}
                  alt=""
                  className="max-h-32 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <textarea
                className={INPUT_CLASS + " resize-none"}
                rows={3}
                value={block.text}
                onChange={(e) => {
                  const updated = [...richBlocks];
                  updated[i] = { ...updated[i], text: e.target.value };
                  setRichBlocks(updated);
                }}
                placeholder="文字说明..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== 操作按钮 ===== */}
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full text-sm text-silver/50 hover:text-silver transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving || !title}
          className="px-6 py-2.5 rounded-full text-sm border border-lavender/40 text-silver hover:bg-lavender/10 transition-colors disabled:opacity-40"
        >
          存草稿
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving || !title}
          className="px-6 py-2.5 rounded-full text-sm bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors disabled:opacity-40"
        >
          {saving ? "保存中..." : "发布"}
        </button>
      </div>
    </div>
  );
}
