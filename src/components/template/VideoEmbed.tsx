"use client";

// 视频嵌入组件 — 支持 B站 / YouTube 嵌入，其他链接显示跳转按钮
export default function VideoEmbed({ url }: { url: string }) {
  if (url.includes("bilibili")) {
    return (
      <iframe
        src={url
          .replace("https://www.bilibili.com/video/", "https://player.bilibili.com/player.html?bvid=")
          .replace(/\/$/, "")}
        className="w-full h-full"
        allowFullScreen
        title="B站视频"
      />
    );
  }
  if (url.includes("youtube") || url.includes("youtu.be")) {
    return (
      <iframe
        src={url
          .replace("watch?v=", "embed/")
          .replace("youtu.be/", "youtube.com/embed/")}
        className="w-full h-full"
        allowFullScreen
        title="YouTube视频"
      />
    );
  }
  // 其他链接（小红书等）— 不支持嵌入，提供跳转
  return (
    <div className="w-full h-full flex items-center justify-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lavender hover:text-lavender-light transition-colors flex items-center gap-2"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        点击播放视频
      </a>
    </div>
  );
}
