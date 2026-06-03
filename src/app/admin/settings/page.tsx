"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { INPUT_CLASS } from "@/lib/styles";

type QrSlot = {
  key: string;
  tier: string;
  method: "wechat" | "alipay";
  label: string;
  icon: string;
};

const QR_SLOTS: QrSlot[] = [
  { key: "qr_wechat_yearly", tier: "年度订阅 ¥99", method: "wechat", label: "微信收款码", icon: "💚" },
  { key: "qr_alipay_yearly", tier: "年度订阅 ¥99", method: "alipay", label: "支付宝收款码", icon: "💙" },
  { key: "qr_wechat_pro", tier: "进阶会员 ¥168", method: "wechat", label: "微信收款码", icon: "💚" },
  { key: "qr_alipay_pro", tier: "进阶会员 ¥168", method: "alipay", label: "支付宝收款码", icon: "💙" },
  { key: "qr_wechat_ultimate", tier: "尊享会员 ¥399", method: "wechat", label: "微信收款码", icon: "💚" },
  { key: "qr_alipay_ultimate", tier: "尊享会员 ¥399", method: "alipay", label: "支付宝收款码", icon: "💙" },
];

export default function AdminSettingsPage() {
  const supabase = createClient();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 加载已有设置
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setQrMap(data))
      .catch(() => {});
  }, []);

  // 上传图片
  const uploadImage = async (file: File, slot: QrSlot) => {
    setUploading(slot.key);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${slot.key}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("上传失败: " + error.message);
      setUploading(null);
      return;
    }

    const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
    if (data?.publicUrl) {
      setQrMap((prev) => ({ ...prev, [slot.key]: data.publicUrl }));
    }
    setUploading(null);
  };

  // 保存所有设置
  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(qrMap),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">站点设置</h1>

      <div className="space-y-8 max-w-2xl">
        {(["yearly", "pro", "ultimate"] as const).map((tier) => {
          const tierName =
            tier === "yearly" ? "年度订阅 ¥99" : tier === "pro" ? "进阶会员 ¥168" : "尊享会员 ¥399";
          const tierIcon = tier === "yearly" ? "📅" : tier === "pro" ? "⚡" : "💎";
          const borderColor =
            tier === "yearly"
              ? "border-sky-400/20"
              : tier === "pro"
                ? "border-lavender/30"
                : "border-amber-400/20";

          return (
            <div key={tier} className={`glass rounded-2xl p-6 border ${borderColor}`}>
              <h2 className="text-lg font-semibold text-silver mb-5 flex items-center gap-2">
                <span>{tierIcon}</span>
                {tierName}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(["wechat", "alipay"] as const).map((method) => {
                  const slot = QR_SLOTS.find(
                    (s) => s.key === `qr_${method}_${tier}`
                  )!;
                  const url = qrMap[slot.key] || "";
                  const isUploading = uploading === slot.key;

                  return (
                    <div key={slot.key}>
                      <label className="block text-sm text-silver/60 mb-2">
                        {slot.icon} {slot.label}
                      </label>

                      {/* 预览 */}
                      {url ? (
                        <img
                          src={url}
                          alt={slot.label}
                          className="w-36 h-36 object-contain rounded-xl border border-lavender/10 mb-3"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-xl bg-cosmic/30 border border-lavender/10 flex items-center justify-center mb-3">
                          <span className="text-xs text-silver/30">未上传</span>
                        </div>
                      )}

                      {/* 上传按钮 */}
                      <input
                        ref={(el) => {
                          fileRefs.current[slot.key] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file, slot);
                        }}
                      />
                      <button
                        onClick={() => fileRefs.current[slot.key]?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 rounded-full text-xs border border-lavender/30 text-silver/60 hover:bg-lavender/10 transition-colors disabled:opacity-50 mb-2"
                      >
                        {isUploading ? "上传中..." : url ? "重新上传" : "上传图片"}
                      </button>

                      {/* URL 输入 */}
                      <input
                        className={INPUT_CLASS}
                        value={url}
                        onChange={(e) =>
                          setQrMap((prev) => ({ ...prev, [slot.key]: e.target.value }))
                        }
                        placeholder="或直接粘贴图片 URL"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 保存 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors disabled:opacity-50"
          >
            {saving ? "保存中..." : saved ? "✅ 已保存" : "保存设置"}
          </button>
        </div>
      </div>
    </div>
  );
}
