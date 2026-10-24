import { NextResponse } from "next/server";
import { getCharms, addCharm, resetCharms, clearCharms } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const charms = await getCharms();
    return NextResponse.json({ success: true, data: charms, count: charms.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch charms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "reset") {
      const reset = await resetCharms();
      return NextResponse.json({ success: true, message: "Charms reset to defaults", data: reset });
    }
    if (body.action === "clear") {
      const cleared = await clearCharms();
      return NextResponse.json({ success: true, message: "Charm inventory cleared", data: cleared });
    }

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Charm name is required" }, { status: 400 });
    }

    const created = await addCharm({
      id: body.id,
      code: body.code,
      name: body.name,
      nameKh: body.nameKh || body.name,
      category: body.category || "emblem",
      price: Number(body.price) || 1.5,
      image: body.image || "/assets/charm_clean.png",
      plateImage: body.plateImage || body.image || "/assets/charm_clean.png",
      isPopular: Boolean(body.isPopular),
      description: body.description || "",
    });

    return NextResponse.json({ success: true, message: "Charm created successfully", data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create charm" }, { status: 500 });
  }
}
