# Notion 模板展示网站 — Claude 工作指引

## 项目概述

这是一个 Notion 模板展示网站，用户可浏览、购买、解锁 Notion 模板。支持画廊/列表双视图、付费解锁、会员订阅。

## 标准文件路径

在开始任何开发工作前，先阅读以下文件：

| 文件 | 路径 | 说明 |
|------|------|------|
| 项目需求 | [docs/requirements.md](docs/requirements.md) | 完整功能需求 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、数据库表、路由、编码约定 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | Midnight Galaxy 主题色彩、字体、动效 |
| 开发路线图 | [docs/roadmap.md](docs/roadmap.md) | 分阶段开发计划 |
| 开发日志 | [devlog/](devlog/) | 每日开发记录 |

## 工作原则

1. **小步快跑**：每个阶段产出可验证成果，不一口气写太多代码
2. **安全第一**：`.env.local` 绝不提交 Git；Supabase service_role key 只用在后端
3. **遵守设计规范**：所有 UI 代码必须匹配 Midnight Galaxy 主题的色彩和动效规范
4. **每日记录**：每次开发完成后更新 `devlog/YYYY-MM-DD.md`
5. **先读文档**：接到新任务时先阅读对应的 docs 文档了解上下文

## 技术要点

- Next.js 16 App Router + TypeScript + Tailwind CSS 4
- Framer Motion 做动效，使用 `motion` 组件和 `AnimatePresence`
- Supabase 做数据库、认证、存储
- 所有组件使用函数式组件 + Hooks
- 样式用 Tailwind 原子类，颜色使用设计规范中定义的自定义色值

## 启动命令

```bash
npm run dev    # 开发服务器 (localhost:3000)
npm run build  # 生产构建
npm run lint   # 代码检查
```
