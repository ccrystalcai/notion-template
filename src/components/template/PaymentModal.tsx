"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import type { Template } from "@/types";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  template: Template;
  onSuccess: () => void;
}

type PaymentMethod = "wechat" | "alipay";

const DEFAULT_QR: Record<PaymentMethod, string> = { wechat: "", alipay: "" };

export default function PaymentModal({
  open,
  onClose,
  template,
  onSuccess,
}: PaymentModalProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [method, setMethod] = useState<PaymentMethod>("wechat");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [qrUrls, setQrUrls] = useState(DEFAULT_QR);

  // 站外购买链接 = 模板第二个链接
  const externalLink = template.links?.[1];

  // 加载收款码 + 检查登录状态
  useEffect(() => {
    if (!open) return;

    // 加载收款码
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.wechat_qr) setQrUrls((p) => ({ ...p, wechat: data.wechat_qr }));
        if (data.alipay_qr) setQrUrls((p) => ({ ...p, alipay: data.alipay_qr }));
      })
      .catch(() => {});

    // 检查登录状态，自动填充邮箱
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        setIsLoggedIn(true);
      } else {
        setEmail("");
        setIsLoggedIn(false);
      }
    });
  }, [open]);

  // ========== 截图 ==========
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

  // ========== 提交 ==========
  const handleSubmit = async () => {
    if (!screenshot) return;
    if (!email.trim()) return;
    setSubmitting(true);

    try {
      // 上传截图
      const ext = screenshot.name.split(".").pop() || "jpg";
      const fileName = `payment-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, screenshot, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      // 获取当前用户 ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 创建订单
      await supabase.from("orders").insert({
        user_id: user?.id || null,
        template_id: template.id,
        type: "template",
        amount: template.price,
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

  // ========== 站外购买 ==========
  const handleExternalPurchase = () => {
    if (externalLink?.url) {
      window.open(externalLink.url, "_blank");
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl bg-cosmic/30 border border-lavender/20 text-sm text-silver placeholder:text-silver/20 focus:outline-none focus:border-lavender/50 transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* ===== 已提交 ===== */}
            {submitted ? (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-5xl mb-4"
                >
                  📩
                </motion.div>
                <h2 className="text-lg font-semibold text-silver mb-2">
                  订单已提交
                </h2>
                <p className="text-sm text-silver/50 mb-1">
                  预计 2 小时内发货至
                </p>
                <p className="text-sm font-medium text-lavender mb-4">
                  {email}
                </p>
                <p className="text-xs text-silver/30 mb-6">
                  请留意邮箱，模板链接将发送到该邮箱
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full text-sm bg-lavender/20 text-lavender hover:bg-lavender/30 transition-colors"
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                {/* 标题 */}
                <h2 className="text-lg font-semibold text-silver text-center mb-1">
                  获取模板
                </h2>
                <p className="text-sm text-silver/40 text-center mb-4">
                  {template.title}
                </p>

                {/* 价格 */}
                <p className="text-center mb-5">
                  <span className="text-4xl font-bold text-silver">
                    ¥{(template.price / 100).toFixed(0)}
                  </span>
                </p>

                {/* 邮箱输入 */}
                <div className="mb-5">
                  <label className="block text-xs text-silver/50 mb-1.5">
                    接收模板的邮箱 *
                  </label>
                  <input
                    className={inputClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isLoggedIn}
                  />
                  {isLoggedIn && (
                    <p className="text-xs text-silver/30 mt-1">
                      ✅ 已使用登录邮箱，2 小时内发货
                    </p>
                  )}
                </div>

                {/* 支付方式选择 */}
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
                  {qrUrls[method] ? (
                    <img
                      src={qrUrls[method]}
                      alt={method === "wechat" ? "微信收款码" : "支付宝收款码"}
                      className="w-44 h-44 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-400">
                        收款码（后台设置）
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-700 mt-3">
                    转账{" "}
                    <span className="text-lg font-bold text-rose-500">
                      ¥{(template.price / 100).toFixed(0)}
                    </span>
                  </p>
                </div>

                {/* 上传截图 */}
                <div className="mb-4">
                  <p className="text-xs text-silver/50 mb-2">
                    上传转账截图 *
                  </p>
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
                  className="w-full py-3 rounded-full font-medium transition-all mb-3
                    bg-lavender text-dark-purple hover:bg-lavender-light disabled:opacity-40"
                >
                  {submitting ? "提交中..." : "已转账，提交审核 →"}
                </button>

                {/* 站外购买入口 */}
                {externalLink?.url && (
                  <>
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-lavender/10" />
                      <span className="text-xs text-silver/30">或</span>
                      <div className="flex-1 h-px bg-lavender/10" />
                    </div>

                    <button
                      onClick={handleExternalPurchase}
                      className="w-full py-3 rounded-full font-medium transition-all
                        border border-lavender/30 text-silver hover:bg-lavender/10
                        flex items-center justify-center gap-2"
                    >
                      🛒 去 {externalLink.label || "店铺"} 购买（立刻发货）
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 mt-2 text-sm text-silver/40 hover:text-silver/60 transition-colors"
                >
                  取消
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
