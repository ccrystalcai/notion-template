// 共享样式常量 — 避免在多个组件中重复定义相同的 Tailwind 类组合

/** 输入框/文本域统一样式 */
export const INPUT_CLASS =
  "w-full px-3 py-2 rounded-xl bg-cosmic/30 border border-lavender/20 text-sm text-silver placeholder:text-silver/20 focus:outline-none focus:border-lavender/50 transition-colors";

/** 玻璃拟态卡片（无 padding，用于需要自定义内边距的场景） */
export const CARD_CLASS =
  "glass rounded-2xl overflow-hidden";

/** 主按钮 */
export const BTN_PRIMARY =
  "bg-lavender text-dark-purple font-medium hover:bg-lavender-light transition-colors disabled:opacity-50";

/** 次按钮 */
export const BTN_SECONDARY =
  "border border-lavender/40 text-silver hover:bg-lavender/10 transition-colors";

/** 幽灵按钮（导航/取消用） */
export const BTN_GHOST =
  "text-silver/50 hover:text-silver transition-colors";
