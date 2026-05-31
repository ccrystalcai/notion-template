import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-lavender/10 bg-midnight/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <span className="text-sm text-silver/60">
              Notion 模板集 © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-silver/50 hover:text-lavender transition-colors"
            >
              首页
            </Link>
            <Link
              href="/pricing"
              className="text-xs text-silver/50 hover:text-lavender transition-colors"
            >
              会员套餐
            </Link>
            <Link
              href="/login"
              className="text-xs text-silver/50 hover:text-lavender transition-colors"
            >
              登录
            </Link>
          </div>
          <p className="text-xs text-silver/40">
            Powered by Next.js · Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
