// 模板数据结构
export interface TemplateLink {
  label: string;
  url: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  tags: string[];
  links: TemplateLink[];
  features: string[];
  price: number;
  is_limited_free: boolean;
  view_count: number;
  copy_count: number;
  video_url: string | null;
  video_url_2: string | null;
  tutorial_steps: TutorialStep[] | null;
  rich_content: RichContentBlock[] | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TutorialStep {
  title: string;
  description: string;
  image_url: string | null;
}

export interface RichContentBlock {
  image_url: string;
  text: string;
}

// 用户资料
export interface Profile {
  id: string;
  email: string | null;
  display_name: string;
  is_admin: boolean;
  is_member: boolean;
  membership_expires_at: string | null;
}

// 订单
export interface Order {
  id: string;
  user_id: string;
  template_id: string | null;
  type: "template" | "membership";
  amount: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
}

// 复制日志
export interface CopyLog {
  id: string;
  user_id: string;
  template_id: string;
  is_member: boolean;
  created_at: string;
  // join fields
  user_email?: string;
  template_title?: string;
}
