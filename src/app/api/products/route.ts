import { NextResponse } from "next/server";
import { getProducts, addProduct, bulkAddProducts, resetProducts, wipeAllProducts } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, data: products, count: products.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const wiped = await wipeAllProducts();
    return NextResponse.json({ success: true, message: "All products wiped from database", data: wiped, count: 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to wipe products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "reset" || body.action === "wipe") {
      const wiped = await wipeAllProducts();
      return NextResponse.json({ success: true, message: "All products wiped from database", data: wiped, count: 0 });
    }

    // Support Bulk Product Upload
    if (body.action === "bulk" || Array.isArray(body.products) || Array.isArray(body)) {
      const productList = Array.isArray(body.products) ? body.products : (Array.isArray(body) ? body : []);
      if (productList.length === 0) {
        return NextResponse.json({ success: false, error: "No products provided in bulk payload" }, { status: 400 });
      }
      const updated = await bulkAddProducts(productList, Boolean(body.replaceMode));
      return NextResponse.json({
        success: true,
        message: `Successfully uploaded ${productList.length} products in bulk`,
        data: updated,
        count: updated.length,
      }, { status: 201 });
    }

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }

    const created = await addProduct({
      id: body.id,
      code: body.code,
      name: body.name,
      nameKh: body.nameKh || body.name,
      cat: body.cat || "minifigure",
      price: Number(body.price) || 5.0,
      discount: Number(body.discount) || 0,
      stock: Number(body.stock) || 10,
      pt: Number(body.pt) || 4,
      image: body.image || "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80",
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.image || "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80"],
      bio: body.bio || "Fun toy collectible.",
      bioKh: body.bioKh || "ប្រដាប់ក្មេងលេងគុណភាពខ្ពស់។",
      rarity: body.rarity || "Rare",
      rating: 5.0,
      reviewsCount: 1,
      featured: true,
      isNew: true,
      free_delivery: true,
      ageRecommendation: body.ageRecommendation || "Ages 4+",
      dimensions: body.dimensions || "10cm x 8cm",
    });

    return NextResponse.json({ success: true, message: "Product created successfully", data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
