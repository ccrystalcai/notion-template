"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import TemplateForm from "@/components/admin/TemplateForm";
import type { Template } from "@/types";

export default function EditTemplatePage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setTemplate(data as Template);
      setLoading(false);
    };
    fetch();
  }, [id, supabase]);

  if (loading) {
    return <p className="text-silver/40 text-sm">加载中...</p>;
  }

  if (!template) {
    return <p className="text-silver/40 text-sm">模板未找到</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver mb-8">编辑模板</h1>
      <TemplateForm template={template} />
    </div>
  );
}
