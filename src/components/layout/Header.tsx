"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{
    email?: string;
    displayName?: string;
  } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // 检查登录状态
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email,
          displayName:
            (user.user_metadata?.display_name as string) ||
            user.email?.split("@")[0] ||
            "",
        });
      }
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-midnight/70 border-b border-lavender/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">✦</span>
            <span className="text-lg font-semibold text-silver group-hover:text-lavender transition-colors">
              Notion 模板集
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-silver/80 hover:text-lavender transition-colors"
            >
              首页
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-silver/80 hover:text-lavender transition-colors"
            >
              会员套餐
            </Link>

            {/* 搜索 */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索模板..."
                  autoFocus
                  className="w-40 lg:w-56 px-3 py-1.5 text-sm rounded-full bg-cosmic/40 border border-lavender/30 text-silver placeholder:text-silver/30 focus:outline-none focus:border-lavender/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="ml-1 p-1 text-silver/40 hover:text-silver/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-silver/60 hover:text-lavender transition-colors"
                aria-label="搜索"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {user ? (
              /* 已登录 */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender/10 border border-lavender/20 text-sm text-silver hover:bg-lavender/20 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-lavender/30 flex items-center justify-center text-xs text-lavender">
                    {user.displayName?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  <span>{user.displayName}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-48 glass rounded-xl overflow-hidden shadow-xl"
                    >
                      <Link
                        href="/account"
                        className="block px-4 py-2.5 text-sm text-silver/80 hover:bg-lavender/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        我的账号
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-silver/80 hover:bg-lavender/10 transition-colors"
                      >
                        退出登录
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* 未登录 */
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-full border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 transition-colors"
              >
                👑 会员入口
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-silver"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18l12-12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-lavender/10 bg-midnight/90 backdrop-blur-md"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              <Link
                href="/"
                className="text-sm text-silver/80 hover:text-lavender transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                首页
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-silver/80 hover:text-lavender transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                会员套餐
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="text-sm text-silver/80 hover:text-lavender transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    我的账号
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-sm text-left text-silver/80 hover:text-lavender transition-colors"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm px-4 py-2 rounded-full border border-amber-400/40 text-amber-300 text-center hover:bg-amber-400/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  👑 会员入口
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
