-- ============================================
-- 迁移 #4: 使用说明模块字段
-- ============================================

-- 视频嵌入链接（Bilibili / YouTube embed URL）
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 图文教程步骤 [{title, description, image_url}]
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS tutorial_steps JSONB;

-- 更新示例数据
UPDATE public.templates SET
  video_url = 'https://www.bilibili.com/video/BV1xx411c7mD/',
  tutorial_steps = '[
    {"title": "第 1 步：复制模板到你的 Notion", "description": "点击上方「解锁模板」按钮，进入 Notion 页面后，点击右上角的「Duplicate」按钮即可将模板复制到你的工作空间。", "image_url": null},
    {"title": "第 2 步：设置年度目标", "description": "打开「年度目标」数据库，填写你今年的 3-5 个核心目标，每个目标可设置优先级和截止日期。", "image_url": null},
    {"title": "第 3 步：拆解月度计划", "description": "在「月度计划」视图中，将年度目标拆分为每月可执行的具体任务，系统会自动关联到对应目标。", "image_url": null},
    {"title": "第 4 步：开始每日打卡", "description": "打开「每日打卡」面板，每天花 2 分钟记录习惯完成情况，进度图表会自动更新。", "image_url": null}
  ]'::jsonb
WHERE title = '2026 年度计划模板';

UPDATE public.templates SET
  video_url = 'https://www.bilibili.com/video/BV1GJ411x7h7/',
  tutorial_steps = '[
    {"title": "第 1 步：复制模板", "description": "点击「解锁模板」→ 进入 Notion → Duplicate 到你的工作空间。", "image_url": null},
    {"title": "第 2 步：创建第一个项目", "description": "在项目看板中点击「+ New」创建一个新项目，填写项目名称、负责人、截止日期。", "image_url": null},
    {"title": "第 3 步：添加任务卡片", "description": "在项目下添加任务卡片，设置优先级标签（高/中/低），拖拽调整任务顺序。", "image_url": null},
    {"title": "第 4 步：查看甘特图", "description": "切换到甘特图视图，查看所有项目的时间线分布，及时发现排期冲突。", "image_url": null}
  ]'::jsonb
WHERE title = '项目管理仪表盘';
