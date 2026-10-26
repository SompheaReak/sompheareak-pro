"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { ConnectedCharmLink } from "@/components/ConnectedCharmLink";
import { NotificationToast } from "@/components/NotificationToast";
import { CustomerBar } from "@/components/CustomerBar";
import { CustomerAccountModal } from "@/components/CustomerAccountModal";
import { OrderHistoryModal } from "@/components/OrderHistoryModal";
import { OrderReceiptModal } from "@/components/OrderReceiptModal";
import { useStore } from "@/context/StoreContext";
import { CustomerOrder } from "@/types/store";
import { sounds } from "@/utils/audio";
import { formatPrice } from "@/utils/currency";
import {
  CheckoutFormState,
  generateOrderReference,
  buildTelegramOrderMessage,
  getTelegramShareUrl,
} from "@/utils/telegram";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  Send,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    currency,
    activeVoucher,
    applyVoucherCode,
    removeVoucher,
    addPoints,
    saveOrder,
    language,
    t,
    customerUser,
    setSelectedReceiptOrder,
  } = useStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: "",
    phone: "",
    telegramHandle: "",
    province: "Phnom Penh",
    address: "",
    paymentMethod: "cod",
  });

  // Auto-fill checkout fields if customer is logged in
  useEffect(() => {
    if (customerUser) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || customerUser.name,
        phone: prev.phone || customerUser.phone,
        telegramHandle: prev.telegramHandle || customerUser.telegramHandle || "",
        address: prev.address || customerUser.address || "",
        province: prev.province || customerUser.province || "Phnom Penh",
      }));
    }
  }, [customerUser]);

  const [submittedOrder, setSubmittedOrder] = useState<{
    orderRef: string;
    telegramUrl: string;
    totalUsd: number;
    points: number;
    order: CustomerOrder;
  } | null>(null);

  // Subtotal calculation across all multiple items
  const subtotalUsd = cart.reduce((sum, item) => {
    if (item.product) {
      const p =
        item.product.discount > 0
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
      return sum + p * item.quantity;
    }
    if (item.customBracelet) {
      return sum + item.customBracelet.unitPrice * item.quantity;
    }
    return sum;
  }, 0);

  // Voucher discount calculation (fixed or percentage)
  let discountUsd = 0;
  if (activeVoucher) {
    if (activeVoucher.discountType === "fixed" && activeVoucher.fixedDiscountUsd) {
      discountUsd = Math.min(subtotalUsd, activeVoucher.fixedDiscountUsd);
    } else {
      discountUsd = subtotalUsd * (activeVoucher.discountPct / 100);
    }
  }

  const freeShippingThreshold = 25.0;
  const deliveryFeeUsd = subtotalUsd >= freeShippingThreshold || subtotalUsd === 0 ? 0.0 : 1.5;
  const totalUsd = Math.max(0, subtotalUsd - discountUsd + deliveryFeeUsd);

  const totalPoints = cart.reduce((sum, item) => {
    if (item.product) return sum + item.product.pt * item.quantity;
    if (item.customBracelet) return sum + item.customBracelet.points * item.quantity;
    return sum;
  }, 0);

  const freeShippingProgress = Math.min(100, (subtotalUsd / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalUsd);

  const cambodiaProvinces = [
    "Phnom Penh (រាជធានីភ្នំពេញ)",
    "Kandal (កណ្តាល)",
    "Siem Reap (សៀមរាប)",
    "Battambang (បាត់ដំបង)",
    "Preah Sihanouk / Kampong Som (ព្រះសីហនុ)",
    "Kampot (កំពត)",
    "Kampong Cham (កំពង់ចាម)",
    "Takeo (តាកែវ)",
    "Prey Veng (ព្រៃវែង)",
    "Svay Rieng (ស្វាយរៀង)",
    "Other Province (ខេត្តផ្សេងៗ)",
  ];

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    const ok = applyVoucherCode(voucherInput);
    if (ok) {
      setVoucherInput("");
      setVoucherError("");
    } else {
      sounds.playPop();
      setVoucherError("Invalid voucher code. Try TOY15, VIP10OFF, or SUPER15!");
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!form.fullName || !form.phone || !form.address) {
      alert("Please fill in recipient name, phone, and delivery address.");
      return;
    }

    const orderRef = generateOrderReference();
    const telegramMsg = buildTelegramOrderMessage({
      orderRef,
      form,
      cartItems: cart,
      subtotalUsd,
      discountUsd,
      deliveryFeeUsd,
      totalUsd,
      totalPoints,
      currency,
    });

    const shareUrl = getTelegramShareUrl(telegramMsg, "Somphea_reak");

    sounds.playFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#10b981", "#fbbf24", "#f43f5e", "#6366f1"],
    });

    // NOTE: VIP Points are NOT awarded immediately upon placing order.
    // They will be awarded once the store confirms the order.

    // Construct and save order for owner admin panel management
    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderRef,
      customerName: form.fullName,
      customerPhone: form.phone,
      telegramHandle: form.telegramHandle,
      province: form.province,
      address: form.address,
      paymentMethod: form.paymentMethod,
      items: [...cart],
      subtotalUsd,
      discountUsd,
      deliveryFeeUsd,
      totalUsd,
      totalKhr: Math.round(totalUsd * 4100),
      pointsEarned: totalPoints,
      voucherCodeApplied: activeVoucher?.code || null,
      status: "pending",
      pointsAwarded: false,
      stockDeducted: false,
      createdAt: new Date().toISOString(),
    };

    saveOrder(newOrder);

    // Only save orderRef on device if customer is signed in and opted to remember
    if (customerUser && customerUser.rememberMe && typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("somphea_my_order_refs") || "[]");
        localStorage.setItem("somphea_my_order_refs", JSON.stringify([...stored, orderRef]));
      } catch {}
    }

    setSubmittedOrder({
      orderRef,
      telegramUrl: shareUrl,
      totalUsd,
      points: totalPoints,
      order: newOrder,
    });
    clearCart();

    // Auto-redirect to Telegram @Somphea_reak with pre-filled order details
    if (typeof window !== "undefined") {
      try {
        window.open(shareUrl, "_blank");
      } catch {
        window.location.href = shareUrl;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white selection:bg-emerald-600 selection:text-white flex flex-col justify-between transition-colors duration-200 pb-24 md:pb-28">
      <div>
        <AnnouncementBar />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Header & Back Link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link
                href="/#toy-catalog"
                onClick={() => sounds.playPop()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-toy-cyan hover:underline mb-2"
              >
                <span>{t("continueShopping")}</span>
              </Link>
              <h1 className="text-3xl sm:text-4xl font-black font-fredoka text-slate-900 dark:text-white">
                {t("cartPageTitle")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("cartPageSubtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-amber-600 dark:text-toy-yellow font-fredoka shadow-sm">
                {t("itemsInCart", { n: cart.reduce((s, i) => s + i.quantity, 0) })}
              </span>
            </div>
          </div>

          {!submittedOrder ? (
            cart.length === 0 ? (
              /* Empty Cart State */
              <div className="py-20 px-4 text-center rounded-3xl bg-white dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-800 max-w-2xl mx-auto my-6 shadow-sm">
                <span className="text-6xl block mb-4">🧸</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-fredoka mb-2">
                  {t("cartEmpty")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                  {t("emptyCartNotice")}
                </p>
                <Link
                  href="/#toy-catalog"
                  onClick={() => sounds.playBounce()}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 text-white font-black font-fredoka text-sm shadow-toy-green-glow hover:scale-105 active:scale-95 transition-all border border-emerald-300/30"
                >
                  <span>{t("startShopping")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* Multi-Item Cart & Checkout Grid */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (7 cols): Items List */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Free Delivery Meter */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Truck className="w-4 h-4 text-emerald-600 dark:text-toy-cyan" />
                        <span>
                          {freeShippingProgress >= 100
                            ? t("freeDeliveryEligible")
                            : t("freeDeliveryAway", {
                                amount: formatPrice(remainingForFreeShipping, currency),
                              })}
                        </span>
                      </span>
                      <span className="text-emerald-600 dark:text-toy-green font-black">{Math.round(freeShippingProgress)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${freeShippingProgress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-500 to-green-600"
                      />
                    </div>
                  </div>

                  {/* Products Card List */}
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const itemPrice = item.product
                        ? (item.product.discount > 0
                            ? item.product.price * (1 - item.product.discount / 100)
                            : item.product.price)
                        : item.customBracelet?.unitPrice || 0;

                      const lineTotal = itemPrice * item.quantity;
                      const linePoints = item.product
                        ? item.product.pt * item.quantity
                        : (item.customBracelet?.points || 6) * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Thumbnail */}
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                {(() => {
                                  const itemImg = item.product
                                    ? item.product.image
                                    : item.customBracelet?.charms[0]?.charm.image || "/assets/charm_clean.png";
                                  return (
                                    <Image
                                      src={itemImg}
                                      alt="item thumbnail"
                                      fill
                                      className="object-cover"
                                      unoptimized={Boolean(itemImg?.startsWith("data:"))}
                                    />
                                  );
                                })()}
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-fredoka truncate">
                                  {item.product
                                    ? language === "km"
                                      ? item.product.nameKh
                                      : item.product.name
                                    : `Custom Italy Modular Bracelet`}
                                </h3>
                              </div>

                              {item.customBracelet ? (
                                <div className="mt-1">
                                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-toy-pink font-bold">
                                    <span className="uppercase">
                                      {item.customBracelet.finish} INOX
                                    </span>
                                    <span>•</span>
                                    <span>{item.customBracelet.sizeLinks} Links</span>
                                    <span>•</span>
                                    <span>{item.customBracelet.charms.length} Charms Attached</span>
                                  </div>

                                  {/* Connected Miniature Ribbon Preview */}
                                  <div className="flex items-center overflow-x-auto py-1 mt-1 max-w-[280px] scrollbar-none">
                                    <div className="flex items-center min-w-max">
                                      {item.customBracelet.charms.map((c, cIdx) => (
                                        <ConnectedCharmLink
                                          key={cIdx}
                                          charm={c.charm}
                                          slotIndex={cIdx}
                                          finish={item.customBracelet?.finish || "silver"}
                                          size="compact"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {item.product?.bio}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-3">
                                <span className="text-base font-black text-amber-600 dark:text-toy-yellow font-fredoka">
                                  {formatPrice(lineTotal, currency)}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700 dark:text-toy-green bg-emerald-100 dark:bg-toy-green/10 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-toy-green/20">
                                  +{linePoints} VIP pt
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white px-1">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column (5 cols): Checkout Form & Order Summary */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Order Summary Box */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-fredoka flex items-center justify-between">
                      <span>{t("orderSummary")}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        +{totalPoints} VIP Points
                      </span>
                    </h3>

                    {/* Voucher Input */}
                    <div>
                      {activeVoucher ? (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold">
                            <Tag className="w-4 h-4" />
                            <span>
                              {language === "km"
                                ? activeVoucher.descriptionKh
                                : activeVoucher.description}
                            </span>
                          </div>
                          <button
                            onClick={removeVoucher}
                            className="text-rose-600 dark:text-toy-pink hover:underline font-bold text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyVoucher} className="flex gap-2">
                          <input
                            type="text"
                            value={voucherInput}
                            onChange={(e) => setVoucherInput(e.target.value)}
                            placeholder="Enter Voucher Code (e.g. TOY15)"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none uppercase"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-xs font-black text-white font-fredoka shadow-sm transition-all"
                          >
                            {t("applyVoucher")}
                          </button>
                        </form>
                      )}
                      {voucherError && (
                        <p className="text-[11px] text-rose-600 dark:text-toy-pink mt-1">{voucherError}</p>
                      )}
                    </div>

                    {/* Cost Calculation */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span>{t("subtotal")}:</span>
                        <span className="font-bold">{formatPrice(subtotalUsd, currency)}</span>
                      </div>
                      {discountUsd > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-toy-green font-bold">
                          <span>Voucher Discount:</span>
                          <span>-{formatPrice(discountUsd, currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{t("deliveryFee")}:</span>
                        <span className="font-bold">
                          {deliveryFeeUsd === 0 ? "FREE" : formatPrice(deliveryFeeUsd, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-base font-black text-slate-900 dark:text-white">
                        <span className="font-fredoka">{t("total")}:</span>
                        <span className="text-amber-600 dark:text-toy-yellow font-fredoka text-2xl">
                          {formatPrice(totalUsd, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Item Direct Telegram Checkout Form */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-toy-cyan font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t("checkoutTitle")}</span>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600 dark:text-toy-cyan" />
                          <span>{t("fullName")} *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder="e.g. Chan Dara / Sokha"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-toy-green" />
                            <span>{t("phoneNumber")} *</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="012 345 678"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-teal-600 dark:text-toy-cyan" />
                            <span>{t("telegramHandle")}</span>
                          </label>
                          <input
                            type="text"
                            value={form.telegramHandle}
                            onChange={(e) => setForm({ ...form, telegramHandle: e.target.value })}
                            placeholder="@username"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-toy-pink" />
                          <span>{t("province")}</span>
                        </label>
                        <select
                          value={form.province}
                          onChange={(e) => {
                            const newProv = e.target.value;
                            const isPP = newProv.toLowerCase().includes("phnom penh") || newProv.includes("ភ្នំពេញ");
                            setForm((prev) => ({
                              ...prev,
                              province: newProv,
                              paymentMethod: isPP ? prev.paymentMethod : "khqr",
                            }));
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                        >
                          {cambodiaProvinces.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {t("streetAddress")} *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Street, Sangkat, Khan, Landmark..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                        />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {t("paymentMethod")}
                          </label>
                          {!(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ")) && (
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                              🔒 Provinces: ABA KHQR Only
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={!(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ"))}
                            onClick={() => {
                              if (!(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ"))) return;
                              sounds.playPop();
                              setForm({ ...form, paymentMethod: "cod" });
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all relative ${
                              !(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ"))
                                ? "opacity-45 cursor-not-allowed bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                                : form.paymentMethod === "cod"
                                ? "bg-amber-100 dark:bg-toy-yellow/20 border-amber-500 dark:border-toy-yellow text-amber-900 dark:text-white shadow-sm cursor-pointer"
                                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{t("cod")}</span>
                              {!(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ")) && <span className="text-[10px]">🔒</span>}
                            </div>
                            <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                              {(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ")) ? "Phnom Penh delivery" : "Phnom Penh only"}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setForm({ ...form, paymentMethod: "khqr" });
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              form.paymentMethod === "khqr"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-white shadow-sm ring-2 ring-emerald-500/30"
                                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <div>{t("khqr")}</div>
                            <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                              Online payment (All Cambodia)
                            </div>
                          </button>
                        </div>
                        {!(form.province.toLowerCase().includes("phnom penh") || form.province.includes("ភ្នំពេញ")) && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1.5 flex items-center gap-1">
                            <span>ℹ️</span>
                            <span>Orders to provinces outside Phnom Penh require ABA KHQR online payment.</span>
                          </p>
                        )}
                      </div>

                      {/* Place Multi-Item Order Button */}
                      <button
                        type="submit"
                        className="w-full mt-3 py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                      >
                        <Send className="w-5 h-5" />
                        <span>Confirm & Check Out All Items 🧾</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Order Submitted Success View */
            <div className="text-center py-12 max-w-lg mx-auto bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-toy-green/20 text-emerald-600 dark:text-toy-green flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-toy-green/40 shadow-toy-glow">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <span className="text-xs font-bold text-amber-600 dark:text-toy-yellow uppercase tracking-widest">
                Order Ref: {submittedOrder.orderRef}
              </span>
              <h2 className="text-3xl font-black font-fredoka text-slate-900 dark:text-white mt-1">
                {t("orderSuccessTitle")}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                {t("orderSuccessNotice")}
              </p>

              <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Amount:</span>
                  <span className="font-bold text-amber-600 dark:text-toy-yellow text-sm">
                    {formatPrice(submittedOrder.totalUsd, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <div>
                    <span>VIP Points:</span>
                    <span className="text-[10px] text-slate-400 block font-normal">Credited once order is confirmed</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-toy-green">+{submittedOrder.points} pt</span>
                </div>
              </div>

              <a
                href={submittedOrder.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playFanfare()}
                className="w-full py-4 px-6 rounded-2xl font-black text-white bg-[#229ED9] hover:bg-[#1e8bc0] shadow-lg font-fredoka text-base tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{t("forwardTelegram")}</span>
              </a>

              {/* View / Print Instant Receipt Button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setSelectedReceiptOrder(submittedOrder.order);
                }}
                className="w-full mt-3 py-3.5 px-6 rounded-2xl font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 border border-emerald-400 font-fredoka text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>View / Print Official Receipt 🧾</span>
              </button>

              <Link
                href="/#toy-catalog"
                onClick={() => sounds.playPop()}
                className="inline-block mt-4 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold"
              >
                Return to Toys Catalog
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
      <NotificationToast />

      {/* Customer Modals & Navigation Bar */}
      <CustomerAccountModal />
      <OrderHistoryModal />
      <OrderReceiptModal />

      {/* Floating Bottom Customer Bar */}
      <CustomerBar />
    </div>
  );
}
