"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegister) {
        // 注册新用户
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
          },
        });

        if (error) throw error;
        setMessage({
          type: "success",
          text: "注册成功！请检查邮箱确认链接（或直接登录）。",
        });
        setIsRegister(false);
      } else {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setMessage({
        type: "error",
        text: error?.message || "操作失败，请重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight px-4">
      {/* 星光背景 */}
      <div className="absolute inset-0 bg-stars pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <span className="text-3xl">✦</span>
        </Link>

        <div className="glass p-8 rounded-2xl">
          <div className="text-center mb-2">
            <span className="text-3xl">👑</span>
          </div>
          <h1 className="text-xl font-semibold text-silver text-center mb-2">
            {isRegister ? "成为会员" : "会员登录"}
          </h1>
          <p className="text-sm text-silver/50 text-center mb-2">
            {isRegister
              ? "注册会员，解锁全部 50+ 精选模板"
              : "登录你的会员账号"}
          </p>
          <div className="flex items-center justify-center gap-3 mb-8 text-xs text-silver/40">
            <span>✨ 全部模板免费解锁</span>
            <span>📥 一键获取</span>
            <span>🔓 永久有效</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm text-silver/70 mb-1.5">
                  昵称
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cosmic/30 border border-lavender/20 text-silver placeholder:text-silver/30 focus:outline-none focus:border-lavender/50 transition-colors"
                  placeholder="你的昵称（选填）"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-silver/70 mb-1.5">
                邮箱
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cosmic/30 border border-lavender/20 text-silver placeholder:text-silver/30 focus:outline-none focus:border-lavender/50 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-silver/70 mb-1.5">
                密码
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cosmic/30 border border-lavender/20 text-silver placeholder:text-silver/30 focus:outline-none focus:border-lavender/50 transition-colors"
                placeholder="至少 6 位密码"
              />
            </div>

            {message && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-400/10 text-red-400 border border-red-400/20"
                    : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "处理中..."
                : isRegister
                  ? "注册"
                  : "登录"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage(null);
              }}
              className="text-sm text-lavender/70 hover:text-lavender transition-colors"
            >
              {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-silver/30 mt-6">
          登录即表示同意我们的服务条款和隐私政策
        </p>
      </motion.div>
    </div>
  );
}
