"use client";

import { useState } from "react";
import { INPUT_CLASS } from "@/lib/styles";

// 问题反馈表单（用于模板详情页底部）
export default function FeedbackForm({
  templateId,
  sessionToken,
}: {
  templateId: string;
  sessionToken: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/templates/${templateId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ message: message.trim() }),
      });
      setSubmitted(true);
      setMessage("");
    } catch {
      // silently fail
    }
    setSending(false);
  };

  if (submitted) {
    return (
      <div className="mt-4 pt-4 border-t border-lavender/10">
        <p className="text-xs text-emerald-400/70 text-center">
          ✅ 反馈已提交，感谢！
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-lavender/10">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full text-xs text-silver/30 hover:text-lavender/60 transition-colors flex items-center justify-center gap-1"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          遇到问题？反馈给我们
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="描述你遇到的问题..."
            rows={3}
            className={INPUT_CLASS + " resize-none"}
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setOpen(false);
                setMessage("");
              }}
              className="px-3 py-1.5 text-xs text-silver/40 hover:text-silver/60 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-lavender/20 text-lavender hover:bg-lavender/30 disabled:opacity-40 transition-colors"
            >
              {sending ? "提交中..." : "提交反馈"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
