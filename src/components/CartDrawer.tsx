"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, Sparkles, Tag, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import { formatPrice } from "@/utils/currency";
import Image from "next/image";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    currency,
    activeVoucher,
    applyVoucherCode,
    removeVoucher,
    setCheckoutModalOpen,
    t,
  } = useStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");

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
  const freeShippingThreshold = 25.0;
  const deliveryFeeUsd = subtotalUsd >= freeShippingThreshold || subtotalUsd === 0 ? 0.0 : 1.5;
  const totalUsd = Math.max(0, subtotalUsd - discountUsd + deliveryFeeUsd);

  const freeShippingProgress = Math.min(100, (subtotalUsd / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalUsd);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    const ok = applyVoucherCode(voucherInput);
    if (ok) {
      setVoucherInput("");
      setVoucherError("");
    } else {
      sounds.playPop();
      setVoucherError("Invalid code. Try VIP10OFF or WELCOME10!");
    }
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              sounds.playPop();
              setCartDrawerOpen(false);
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col justify-between shadow-2xl transition-colors duration-200"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white">{t("cartTitle")}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playPop();
                    setCartDrawerOpen(false);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Meter */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">
                    {freeShippingProgress >= 100
                      ? t("freeDeliveryEligible")
                      : t("freeDeliveryAway", { amount: formatPrice(remainingForFreeShipping, currency) })}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-500 to-green-600"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="py-20 text-center">
                    <span className="text-5xl block mb-3">🧸</span>
                    <h3 className="text-lg font-black font-fredoka text-slate-800 dark:text-slate-300">{t("cartEmpty")}</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Explore our cool mini figures, blind boxes, or build your custom Italian bracelet!
                    </p>
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setCartDrawerOpen(false);
                      }}
                      className="mt-5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs shadow-toy-green-glow font-fredoka hover:opacity-90"
                    >
                      {t("startShopping")}
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex gap-3 items-center shadow-sm"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {(() => {
                          const itemImg = item.product
                            ? item.product.image
                            : item.customBracelet?.charms[0]?.charm.image || "/assets/charm_clean.png";
                          return (
                            <Image
                              src={itemImg}
                              alt="item"
                              fill
                              className="object-cover"
                              unoptimized={Boolean(itemImg?.startsWith("data:"))}
                            />
                          );
                        })()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white font-fredoka truncate">
                          {item.product
                            ? item.product.name
                            : `Custom Bracelet (${item.customBracelet?.sizeLinks} Links)`}
                        </h4>

                        {item.customBracelet && (
                          <p className="text-[10px] text-rose-600 dark:text-toy-pink font-semibold truncate">
                            {item.customBracelet.finish.toUpperCase()} · {item.customBracelet.charms.length} Charms
                          </p>
                        )}

                        <div className="text-xs font-black text-amber-600 dark:text-toy-yellow mt-1 font-fredoka">
                          {item.product
                            ? formatPrice(
                                (item.product.discount > 0
                                  ? item.product.price * (1 - item.product.discount / 100)
                                  : item.product.price) * item.quantity,
                                currency
                              )
                            : formatPrice((item.customBracelet?.unitPrice || 0) * item.quantity, currency)}
                        </div>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 dark:text-white px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Checkout & Voucher Section */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
                  {/* Voucher Input */}
                  <div className="mb-4">
                    {activeVoucher ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-100 dark:bg-toy-green/10 border border-emerald-300 dark:border-toy-green/30 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-toy-green font-bold">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{activeVoucher.description}</span>
                        </div>
                        <button
                          onClick={removeVoucher}
                          className="text-rose-600 dark:text-toy-pink hover:underline font-bold text-[11px]"
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
                          placeholder="Voucher code (e.g. VIP10OFF)"
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none uppercase"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-xs font-black text-white font-fredoka shadow-sm transition-all"
                        >
                          {t("applyVoucher")}
                        </button>
                      </form>
                    )}
                    {voucherError && <p className="text-[11px] text-rose-600 dark:text-toy-pink mt-1">{voucherError}</p>}
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex justify-between">
                      <span>{t("subtotal")}:</span>
                      <span className="font-bold">{formatPrice(subtotalUsd, currency)}</span>
                    </div>
                    {discountUsd > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
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
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-base font-black text-slate-900 dark:text-white">
                      <span className="font-fredoka">{t("total")}:</span>
                      <span className="text-amber-600 dark:text-toy-yellow font-fredoka text-xl">
                        {formatPrice(totalUsd, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setCartDrawerOpen(false);
                        setCheckoutModalOpen(true);
                      }}
                      className="w-full py-3.5 px-5 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                    >
                      <span>{t("checkoutBtn")}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <a
                      href="/cart"
                      onClick={() => {
                        sounds.playPop();
                        setCartDrawerOpen(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/90 text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-300 dark:border-emerald-600/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Open Full Cart Page (Multi-Item Checkout)</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
