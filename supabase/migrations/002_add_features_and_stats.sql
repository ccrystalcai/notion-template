-- ============================================
-- 迁移 #2: 添加功能点、热度统计字段
-- ============================================

-- 模板功能点描述（列表形式展示）
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}';

-- 浏览次数
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- 复制/解锁次数
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS copy_count INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- 更新示例数据，添加功能点
-- ============================================

UPDATE public.templates SET features = ARRAY['年度/月度/周度三级目标拆解', '习惯打卡追踪面板', '自动进度可视化图表', '多视图切换（日历/看板/列表）'] WHERE title = '2026 年度计划模板';

UPDATE public.templates SET features = ARRAY['项目看板视图', '任务状态自动流转', '团队协作评论功能', '甘特图时间线', '进度百分比自动计算'] WHERE title = '项目管理仪表盘';

UPDATE public.templates SET features = ARRAY['收支分类管理', '月度预算设置', '账单自动汇总', '可视化消费占比图表'] WHERE title = '个人财务追踪器';

UPDATE public.templates SET features = ARRAY['结构化读书笔记模板', '知识卡片自动生成', '标签分类检索', '阅读进度追踪'] WHERE title = '读书笔记系统';

UPDATE public.templates SET features = ARRAY['21天习惯养成计划', '每日打卡提醒', '连续打卡统计', '习惯完成率可视化'] WHERE title = '习惯追踪器';

UPDATE public.templates SET features = ARRAY['内容排期日历视图', '多平台发布管理', '素材库关联', '发布状态追踪'] WHERE title = '内容创作日历';
