import { createAdminClient } from "@/lib/admin-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });
    }

    // 1. 获取订单信息
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 2. 更新订单状态
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. 如果是会员订单，设置 is_member = true
    const membershipTypes = ["membership", "membership_yearly", "membership_pro", "membership_ultimate"];
    if (membershipTypes.includes(order.type) && order.user_id) {
      const updateData: Record<string, unknown> = { is_member: true };

      // 年度订阅：设置到期时间
      if (order.type === "membership_yearly") {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        updateData.membership_expires_at = expiresAt.toISOString();
      } else {
        // 永久会员：清除到期时间
        updateData.membership_expires_at = null;
      }

      await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("id", order.user_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("确认订单失败:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
