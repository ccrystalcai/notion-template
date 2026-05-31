"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const wechatRef = useRef<HTMLInputElement>(null);
  const alipayRef = useRef<HTMLInputElement>(null);

  const [wechatQr, setWechatQr] = useState("");
  const [alipayQr, setAlipayQr] = useState("");
  const [uploadingWechat, setUploadingWechat] = useState(false);
  const [uploadingAlipay, setUploadingAlipay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.wechat_qr) setWechatQr(data.wechat_qr);
        if (data.alipay_qr) setAlipayQr(data.alipay_qr);
      })
      .catch(() => {});
  }, []);

  // 上传图片到 Supabase Storage
  const uploadImage = async (
    file: File,
    type: "wechat" | "alipay",
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void
  ) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `qr-${type}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("上传失败: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
    if (data?.publicUrl) {
      setUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wechat_qr: wechatQr, alipay_qr: alipayQr }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl bg-cosmic/30 border border-lavender/20 text-sm text-silver placeholder:text-silver/20 focus:outline-none focus:border-lavender/50 transition-colors";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">站点设置</h1>

      <div className="glass rounded-2xl p-6 space-y-6 max-w-xl">
        {/* 微信收款码 */}
        <div>
          <label className="block text-sm text-silver/70 mb-2">
            💚 微信收款码
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              {wechatQr ? (
                <img
                  src={wechatQr}
                  alt="微信收款码"
                  className="w-40 h-40 object-contain rounded-xl border border-lavender/10 mb-3"
                />
              ) : (
                <div className="w-40 h-40 rounded-xl bg-cosmic/30 border border-lavender/10 flex items-center justify-center mb-3">
                  <span className="text-xs text-silver/30">未上传</span>
                </div>
              )}
              <input
                ref={wechatRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, "wechat", setUploadingWechat, setWechatQr);
                }}
              />
              <button
                onClick={() => wechatRef.current?.click()}
                disabled={uploadingWechat}
                className="px-4 py-2 rounded-full text-xs border border-lavender/30 text-silver/60 hover:bg-lavender/10 transition-colors disabled:opacity-50"
              >
                {uploadingWechat ? "上传中..." : wechatQr ? "重新上传" : "上传图片"}
              </button>
            </div>
          </div>
          <input
            className={inputClass + " mt-3"}
            value={wechatQr}
            onChange={(e) => setWechatQr(e.target.value)}
            placeholder="或直接粘贴图片 URL"
          />
        </div>

        {/* 支付宝收款码 */}
        <div>
          <label className="block text-sm text-silver/70 mb-2">
            💙 支付宝收款码
          </label>
          <div>
            {alipayQr ? (
              <img
                src={alipayQr}
                alt="支付宝收款码"
                className="w-40 h-40 object-contain rounded-xl border border-lavender/10 mb-3"
              />
            ) : (
              <div className="w-40 h-40 rounded-xl bg-cosmic/30 border border-lavender/10 flex items-center justify-center mb-3">
                <span className="text-xs text-silver/30">未上传</span>
              </div>
            )}
            <input
              ref={alipayRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "alipay", setUploadingAlipay, setAlipayQr);
              }}
            />
            <button
              onClick={() => alipayRef.current?.click()}
              disabled={uploadingAlipay}
              className="px-4 py-2 rounded-full text-xs border border-lavender/30 text-silver/60 hover:bg-lavender/10 transition-colors disabled:opacity-50"
            >
              {uploadingAlipay ? "上传中..." : alipayQr ? "重新上传" : "上传图片"}
            </button>
          </div>
          <input
            className={inputClass + " mt-3"}
            value={alipayQr}
            onChange={(e) => setAlipayQr(e.target.value)}
            placeholder="或直接粘贴图片 URL"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-full text-sm bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : saved ? "✅ 已保存" : "保存设置"}
        </button>
      </div>
    </div>
  );
}
