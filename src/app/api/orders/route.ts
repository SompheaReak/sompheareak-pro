import { NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";
import { CustomerOrder } from "@/types/store";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, data: orders, count: orders.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone || !body.address) {
      return NextResponse.json({ success: false, error: "Customer name, phone, and address are required" }, { status: 400 });
    }

    const order: CustomerOrder = {
      id: body.id || `ord-${Date.now()}`,
      orderRef: body.orderRef || `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      telegramHandle: body.telegramHandle || "@Somphea_reak",
      province: body.province || "Phnom Penh",
      address: body.address,
      notes: body.notes || "",
      paymentMethod: body.paymentMethod || "cod",
      items: body.items || [],
      subtotalUsd: Number(body.subtotalUsd) || 0,
      discountUsd: Number(body.discountUsd) || 0,
      deliveryFeeUsd: Number(body.deliveryFeeUsd) || 0,
      totalUsd: Number(body.totalUsd) || 0,
      totalKhr: Number(body.totalKhr) || Math.round((Number(body.totalUsd) || 0) * 4100),
      pointsEarned: Number(body.pointsEarned) || 0,
      pointsAwarded: false,
      stockDeducted: false,
      voucherCodeApplied: body.voucherCodeApplied || null,
      status: "pending",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const result = await createOrder(order);

    return NextResponse.json(
      {
        success: true,
        message: "Order placed and confirmation notification generated",
        data: result.order,
        notification: result.notification,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process order" }, { status: 500 });
  }
}
