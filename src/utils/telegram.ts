import { CartItem, Currency } from "@/types/store";
import { formatPrice } from "./currency";

export interface CheckoutFormState {
  fullName: string;
  phone: string;
  telegramHandle: string;
  province: string;
  address: string;
  paymentMethod: "cod" | "khqr";
  voucherCode?: string;
  voucherDiscountUsd?: number;
}

export function generateOrderReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "SR-";
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export function buildTelegramOrderMessage({
  orderRef,
  form,
  cartItems,
  subtotalUsd,
  discountUsd,
  deliveryFeeUsd,
  totalUsd,
  totalPoints,
  currency,
}: {
  orderRef: string;
  form: CheckoutFormState;
  cartItems: CartItem[];
  subtotalUsd: number;
  discountUsd: number;
  deliveryFeeUsd: number;
  totalUsd: number;
  totalPoints: number;
  currency: Currency;
}): string {
  const paymentTitle = form.paymentMethod === "khqr" ? "📲 ABA KHQR (Online Payment)" : "💵 Cash on Delivery (COD)";

  let itemsText = "";
  cartItems.forEach((item, idx) => {
    if (item.product) {
      const price = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100) 
        : item.product.price;
      itemsText += `${idx + 1}. ${item.product.name} (x${item.quantity}) - ${formatPrice(price * item.quantity, currency)}\n`;
    } else if (item.customBracelet) {
      const b = item.customBracelet;
      const charmNames = b.charms.map((c) => c.charm.name).join(", ") || "Plain Links";
      itemsText += `${idx + 1}. Custom Italy Bracelet [${b.finish.toUpperCase()} · ${b.sizeLinks} links] (x${b.quantity})\n`;
      itemsText += `   ↳ Charms: ${charmNames}\n`;
      itemsText += `   ↳ Packaging: ${b.packaging === "premium" ? "Velvet Gift Box" : "Standard Box"}\n`;
      itemsText += `   ↳ Price: ${formatPrice(b.unitPrice * b.quantity, currency)}\n`;
    }
  });

  const totalKhr = Math.round(totalUsd * 4100).toLocaleString();

  const msg = 
`🧸 *SOMPHEA REAK STUDIO V2 • ORDER RECEIPT* 🧾
━━━━━━━━━━━━━━━━━━━━
*Order Ref:* \`${orderRef}\`
*Date:* ${new Date().toLocaleString()}

👤 *CUSTOMER INFORMATION*
• *Name:* ${form.fullName}
• *Phone:* ${form.phone}
• *Telegram:* ${form.telegramHandle.startsWith("@") ? form.telegramHandle : "@" + form.telegramHandle}
• *Location:* ${form.province}
• *Delivery Address:* ${form.address}

📦 *ITEMS ORDERED*
${itemsText}
💰 *PAYMENT & SUMMARY*
• *Payment Method:* ${paymentTitle}
• *Subtotal:* $${subtotalUsd.toFixed(2)}
${discountUsd > 0 ? `• *Discount Voucher:* -$${discountUsd.toFixed(2)}\n` : ""}• *Delivery Fee:* $${deliveryFeeUsd.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━
✨ *TOTAL DUE:* *$${totalUsd.toFixed(2)} USD* (${totalKhr} ៛)
⭐ *VIP Points Pending:* +${totalPoints} pt (credited upon order confirmation)
${form.paymentMethod === "khqr" ? "\n💳 *Online Payment:* Transfer verified via ABA KHQR. Attached payment confirmation below.\n" : ""}
💬 *Store Support:* @Somphea_reak
🙏 Thank you for shopping with Somphea Reak Studio!`;

  return msg;
}

export function getTelegramShareUrl(message: string, username: string = "Somphea_reak"): string {
  return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
}
