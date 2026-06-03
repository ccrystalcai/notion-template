"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { INPUT_CLASS } from "@/lib/styles";
import { centsToYuan } from "@/lib/utils";
import Link from "next/link";

type PaymentMethod = "wechat" | "alipay";
type TierKey = "yearly" | "pro" | "ultimate";

interface Tier {
  key: TierKey;
  name: string;
  price: number; // 分
  period: string;
  icon: string;
  color: string;
  borderColor: string;
  features: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    key: "yearly",
    name: "年度订阅",
    price: 9900,
    period: "/年",
    icon: "📅",
    color: "bg-sky-400/15 text-sky-400",
    borderColor: "border-sky-400/30",
    features: [
      "订阅期内发布的基础模板",
      "基础 Notion 教程",
      "模板使用指南",
      "年度专属标识",
    ],
  },
  {
    key: "pro",
    name: "进阶会员",
    price: 16800,
    period: "永久",
    icon: "⚡",
    color: "bg-lavender/15 text-lavender",
    borderColor: "border-lavender/40",
    features: [
      "全部基础会员模板",
      "进阶版模板",
      "进阶使用教程",
      "永久专属标识 👑",
    ],
    highlight: true,
  },
  {
    key: "ultimate",
    name: "尊享会员",
    price: 39900,
    period: "永久",
    icon: "💎",
    color: "bg-amber-400/15 text-amber-400",
    borderColor: "border-amber-400/40",
    features: [
      "全部模板（含高阶限量款）",
      "全部快捷指令 + 进阶功能",
      "独家高阶模板",
      "优先技术支持",
      "模板定制建议",
      "至尊专属标识 💎",
    ],
  },
];

export default function PricingPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTier, setActiveTier] = useState<TierKey | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("wechat");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  const activeTierData = TIERS.find((t) => t.key === activeTier);

  // 加载所有收款码 + 检查登录
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setQrUrls(data))
      .catch(() => {});

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        setIsLoggedIn(true);
      }
    });
  }, []);

  // 切换套餐时重置
  const selectTier = (key: TierKey) => {
    if (activeTier === key) {
      setActiveTier(null);
      return;
    }
    setActiveTier(key);
    setScreenshot(null);
    setScreenshotPreview(null);
    setSubmitted(false);
  };

  const getQrUrl = (tier: TierKey, method: PaymentMethod) => {
    return qrUrls[`qr_${method}_${tier}`] || "";
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!screenshot || !email.trim() || !activeTierData) return;
    setSubmitting(true);

    try {
      const ext = screenshot.name.split(".").pop() || "jpg";
      const fileName = `membership-${activeTier}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, screenshot, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("orders").insert({
        user_id: user?.id || null,
        template_id: null,
        type: `membership_${activeTier}`,
        amount: activeTierData.price,
        status: "pending",
        screenshot_url: urlData?.publicUrl || "",
        payment_method: method,
        buyer_email: email.trim(),
      });

      setSubmitted(true);
    } catch (err) {
      alert("提交失败，请重试");
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-semibold text-silver mb-3">
            👑 选择会员方案
          </h1>
          <p className="text-silver/50">
            选择适合你的方案，解锁 Notion 模板
          </p>
        </motion.div>

        {/* 三栏套餐卡 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => selectTier(tier.key)}
              className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col
                ${activeTier === tier.key
                  ? `ring-2 ${tier.borderColor} scale-[1.02]`
                  : "hover:scale-[1.01]"
                }
                ${tier.highlight ? "relative" : ""}`}
            >
              {/* 推荐标签 */}
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium bg-lavender text-dark-purple">
                  🔥 最受欢迎
                </div>
              )}

              <div className="text-center mb-5">
                <span className="text-3xl">{tier.icon}</span>
                <h3 className="text-lg font-semibold text-silver mt-2">
                  {tier.name}
                </h3>
              </div>

              {/* 价格 */}
              <div className="text-center mb-5">
                <span className="text-4xl font-bold text-silver">
                  ¥{(tier.price / 100).toFixed(0)}
                </span>
                <span className="text-sm text-silver/40 ml-1">{tier.period}</span>
              </div>

              {/* 权益列表 */}
              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-silver/60">
                    <span className="text-lavender text-xs">✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* 选择按钮 */}
              <button
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all mt-auto
                  ${activeTier === tier.key
                    ? "bg-lavender/20 text-lavender border border-lavender/40"
                    : `${tier.color} border ${tier.borderColor} hover:brightness-125`
                  }`}
              >
                {activeTier === tier.key ? "已选择" : "选择此方案"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* 支付区域 */}
        <AnimatePresence mode="wait">
          {activeTier && activeTierData && (
            <motion.div
              key={activeTier}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="max-w-md mx-auto">
                {/* 已提交 */}
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-8 text-center"
                  >
                    <div className="text-5xl mb-4">📩</div>
                    <h2 className="text-lg font-semibold text-silver mb-2">
                      订单已提交
                    </h2>
                    <p className="text-sm text-silver/50 mb-1">
                      预计 2 小时内开通
                    </p>
                    <p className="text-sm font-medium text-lavender mb-1">
                      {activeTierData.name} — ¥{centsToYuan(activeTierData!.price)}
                    </p>
                    <p className="text-xs text-silver/30 mb-6">
                      请留意 {email}，开通后将发送通知
                    </p>
                    <button
                      onClick={() => {
                        setActiveTier(null);
                        setSubmitted(false);
                      }}
                      className="px-6 py-2 rounded-full text-sm bg-lavender/20 text-lavender hover:bg-lavender/30 transition-colors"
                    >
                      完成
                    </button>
                  </motion.div>
                ) : (
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-semibold text-silver">
                        💳 {activeTierData.name} — ¥{centsToYuan(activeTierData!.price)}
                      </h2>
                      <button
                        onClick={() => setActiveTier(null)}
                        className="text-xs text-silver/30 hover:text-silver/60 transition-colors"
                      >
                        ✕ 收起
                      </button>
                    </div>

                    {/* 邮箱 */}
                    <div className="mb-5">
                      <label className="block text-xs text-silver/50 mb-1.5">
                        接收通知的邮箱 *
                      </label>
                      <input
                        className={INPUT_CLASS}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={isLoggedIn}
                      />
                      {isLoggedIn && (
                        <p className="text-xs text-silver/30 mt-1">
                          ✅ 已使用登录邮箱，2 小时内开通
                        </p>
                      )}
                    </div>

                    {/* 支付方式切换 */}
                    <div className="flex gap-3 mb-5">
                      <button
                        onClick={() => setMethod("wechat")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          method === "wechat"
                            ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                            : "bg-cosmic/20 text-silver/40 border border-lavender/10"
                        }`}
                      >
                        💚 微信
                      </button>
                      <button
                        onClick={() => setMethod("alipay")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          method === "alipay"
                            ? "bg-blue-400/20 text-blue-300 border border-blue-400/40"
                            : "bg-cosmic/20 text-silver/40 border border-lavender/10"
                        }`}
                      >
                        💙 支付宝
                      </button>
                    </div>

                    {/* 收款码 */}
                    <div className="bg-white rounded-xl p-4 mb-4 text-center">
                      {getQrUrl(activeTier, method) ? (
                        <img
                          src={getQrUrl(activeTier, method)}
                          alt={`${activeTierData.name} ${method === "wechat" ? "微信" : "支付宝"}收款码`}
                          className="w-52 h-52 mx-auto object-contain"
                        />
                      ) : (
                        <div className="w-52 h-52 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">收款码暂未设置</span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-700 mt-3">
                        转账{" "}
                        <span className="text-lg font-bold text-rose-500">
                          ¥{centsToYuan(activeTierData!.price)}
                        </span>
                      </p>
                    </div>

                    {/* 上传截图 */}
                    <div className="mb-4">
                      <p className="text-xs text-silver/50 mb-2">上传转账截图 *</p>
                      {screenshotPreview ? (
                        <div className="relative">
                          <img
                            src={screenshotPreview}
                            alt="截图"
                            className="w-full h-32 object-cover rounded-xl"
                          />
                          <button
                            onClick={handleRemoveScreenshot}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 rounded-xl border-2 border-dashed border-lavender/20 text-silver/30 hover:border-lavender/40 hover:text-silver/50 transition-colors text-sm flex flex-col items-center gap-2"
                        >
                          📎 点击上传转账截图
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotChange}
                      />
                    </div>

                    {/* 提交按钮 */}
                    <button
                      onClick={handleSubmit}
                      disabled={!screenshot || !email.trim() || submitting}
                      className="w-full py-3 rounded-full font-medium transition-all
                        bg-lavender text-dark-purple hover:bg-lavender-light disabled:opacity-40"
                    >
                      {submitting ? "提交中..." : "已转账，提交审核 →"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
