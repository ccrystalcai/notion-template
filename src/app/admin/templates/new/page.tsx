"use client";

import TemplateForm from "@/components/admin/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">新建模板</h1>
      <TemplateForm template={null} />
    </div>
  );
}
