"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, ShieldCheck, MapPin, Phone, User, MessageCircle, Receipt } from "lucide-react";
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
import confetti from "canvas-confetti";

export const CheckoutModal: React.FC = () => {
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    clearCart,
    currency,
    activeVoucher,
    addPoints,
    saveOrder,
    setSelectedReceiptOrder,
    t,
  } = useStore();

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: "",
    phone: "",
    telegramHandle: "",
    province: "Phnom Penh",
    address: "",
    paymentMethod: "cod",
  });

  const [submittedOrder, setSubmittedOrder] = useState<{
    orderRef: string;
    telegramUrl: string;
    totalUsd: number;
    points: number;
    order: CustomerOrder;
  } | null>(null);

  const subtotalUsd = cart.reduce((sum, item) => {
    if (item.product) {
      const p = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100) 
        : item.product.price;
      return sum + p * item.quantity;
    }
    if (item.customBracelet) {
      return sum + item.customBracelet.unitPrice * item.quantity;
    }
    return sum;
  }, 0);

  const discountUsd = activeVoucher ? subtotalUsd * (activeVoucher.discountPct / 100) : 0;
  const deliveryFeeUsd = subtotalUsd >= 25.0 || subtotalUsd === 0 ? 0.0 : 1.5;
  const totalUsd = Math.max(0, subtotalUsd - discountUsd + deliveryFeeUsd);

  const totalPoints = cart.reduce((sum, item) => {
    if (item.product) return sum + item.product.pt * item.quantity;
    if (item.customBracelet) return sum + item.customBracelet.points * item.quantity;
    return sum;
  }, 0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#10b981", "#fbbf24", "#f43f5e", "#6366f1"],
    });

    // NOTE: VIP Points are NOT awarded immediately upon placing order.
    // They will be awarded once the store confirms the order.

    // Save order so Admin Panel can view, confirm, and fulfill it
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

    // Save orderRef in client storage to auto-credit points when confirmed
    if (typeof window !== "undefined") {
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

  const handleClose = () => {
    sounds.playPop();
    setSubmittedOrder(null);
    setCheckoutModalOpen(false);
  };

  if (!checkoutModalOpen) return null;

  const isPhnomPenh = (prov: string) =>
    prov.toLowerCase().includes("phnom penh") || prov.includes("ភ្នំពេញ");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {!submittedOrder ? (
            /* Checkout Form */
            <div>
              <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-toy-pink font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Fast & Secure Cambodia Checkout</span>
              </div>
              <h2 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">{t("checkoutTitle")}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Verified Telegram order with Cash on Delivery or ABA KHQR Scan.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600 dark:text-toy-cyan" />
                    <span>{t("fullName")} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Chan Dara / Sokha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Contact Phone & Telegram Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-toy-green" />
                      <span>{t("phoneNumber")} *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="012 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-teal-600 dark:text-toy-cyan" />
                      <span>{t("telegramHandle")}</span>
                    </label>
                    <input
                      type="text"
                      value={form.telegramHandle}
                      onChange={(e) => setForm({ ...form, telegramHandle: e.target.value })}
                      placeholder="@username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Province / City */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-toy-pink" />
                    <span>{t("province")}</span>
                  </label>
                  <select
                    value={form.province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      const isPP = isPhnomPenh(newProv);
                      setForm((prev) => ({
                        ...prev,
                        province: newProv,
                        paymentMethod: isPP ? prev.paymentMethod : "khqr",
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    {cambodiaProvinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t("streetAddress")} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="House number, Street, Sangkat, Khan..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t("paymentMethod")}
                    </label>
                    {!isPhnomPenh(form.province) && (
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        🔒 Provinces: ABA KHQR Only
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!isPhnomPenh(form.province)}
                      onClick={() => {
                        if (!isPhnomPenh(form.province)) return;
                        sounds.playPop();
                        setForm({ ...form, paymentMethod: "cod" });
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all relative ${
                        !isPhnomPenh(form.province)
                          ? "opacity-45 cursor-not-allowed bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                          : form.paymentMethod === "cod"
                          ? "bg-amber-100 dark:bg-toy-yellow/20 border-amber-500 dark:border-toy-yellow text-amber-900 dark:text-white shadow-md cursor-pointer"
                          : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-850 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{t("cod")}</span>
                        {!isPhnomPenh(form.province) && <span className="text-[10px]">🔒</span>}
                      </div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        {isPhnomPenh(form.province) ? "Phnom Penh delivery" : "Phnom Penh only"}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setForm({ ...form, paymentMethod: "khqr" });
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        form.paymentMethod === "khqr"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-white shadow-toy-green-glow ring-2 ring-emerald-500/30"
                          : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-850"
                      }`}
                    >
                      <div>{t("khqr")}</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        Online payment (All Cambodia)
                      </div>
                    </button>
                  </div>
                  {!isPhnomPenh(form.province) && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-800/40">
                      <span>ℹ️</span>
                      <span>Delivery to provinces outside Phnom Penh requires ABA KHQR online payment.</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="font-bold text-slate-600 dark:text-slate-300">{t("total")}:</span>
                    <span className="text-2xl font-black text-amber-600 dark:text-toy-yellow font-fredoka">
                      {formatPrice(totalUsd, currency)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                  >
                    <Send className="w-5 h-5" />
                    <span>{t("confirmOrder")}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Order Submitted Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-toy-green/20 text-emerald-600 dark:text-toy-green flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-toy-green/40 shadow-toy-glow">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-xs font-bold text-amber-600 dark:text-toy-yellow uppercase tracking-widest">
                Order Ref: {submittedOrder.orderRef}
              </span>
              <h3 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white mt-1">
                {t("orderSuccessTitle")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                {t("orderSuccessNotice")}
              </p>

              <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-3">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span>Total Amount:</span>
                  <span className="font-bold text-amber-600 dark:text-toy-yellow text-sm font-fredoka">
                    {formatPrice(submittedOrder.totalUsd, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span>VIP Points:</span>
                    <span className="text-[10px] text-slate-400 block font-normal">Credited once order is confirmed</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-toy-green">+{submittedOrder.points} pt</span>
                </div>

                {/* Ordered Items with Picture beside Description */}
                {submittedOrder.order?.items && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ordered Products ({submittedOrder.order.items.length}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {submittedOrder.order.items.map((it, idx) => {
                        const img = it.product
                          ? it.product.image
                          : it.customBracelet?.charms[0]?.charm.image || "/assets/charm_clean.png";
                        const title = it.product
                          ? it.product.name
                          : `Custom Bracelet (${it.customBracelet?.sizeLinks} links)`;
                        const desc = it.product?.bio
                          ? it.product.bio
                          : it.customBracelet
                          ? `Custom 9mm Italian bracelet in ${it.customBracelet.finish.toUpperCase()} Inox.`
                          : "";
                        const price = it.product ? it.product.price : it.customBracelet?.unitPrice || 0;

                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-xs shadow-2xs"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center p-0.5">
                              <Image
                                src={img}
                                alt={title}
                                fill
                                className="object-contain p-0.5"
                                unoptimized={Boolean(img?.startsWith("data:"))}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 dark:text-white truncate font-fredoka text-xs">
                                  {title}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white flex-shrink-0">
                                  ${(price * it.quantity).toFixed(2)}
                                </span>
                              </div>
                              {desc && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {desc}
                                </p>
                              )}
                              <div className="text-[9px] text-slate-400">
                                Qty: {it.quantity} × ${price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: View Receipt & Telegram */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playFanfare();
                    if (submittedOrder.order) {
                      setSelectedReceiptOrder(submittedOrder.order);
                      setCheckoutModalOpen(false);
                    }
                  }}
                  className="w-full py-3 px-5 rounded-2xl font-black text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm font-fredoka text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>View Official Receipt 🧾</span>
                </button>

                {/* Telegram Confirmation Action Button */}
                <a
                  href={submittedOrder.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sounds.playFanfare()}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-[#229ED9] hover:bg-[#1e8bc0] shadow-lg font-fredoka text-base tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{t("forwardTelegram")}</span>
                </a>
              </div>

              <button
                onClick={handleClose}
                className="mt-3 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold"
              >
                Close & Return to Toys
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
