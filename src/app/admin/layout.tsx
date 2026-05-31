import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 检查是否管理员
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-silver/50">无权限访问管理后台</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      <AdminNav />
      <main className="pt-16 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
