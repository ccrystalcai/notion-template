"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isMidnight = theme === "midnight";

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-colors
        hover:bg-lavender/15"
      aria-label={isMidnight ? "切换到阳光清新主题" : "切换到午夜星系主题"}
      title={isMidnight ? "切换到阳光清新主题" : "切换到午夜星系主题"}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isMidnight ? 0 : 180,
          scale: [1, 0.85, 1],
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="text-lg leading-none"
      >
        {isMidnight ? (
          /* 太阳图标 — 点击切换到阳光主题 */
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* 月亮图标 — 点击切换到午夜主题 */
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-lavender"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}
