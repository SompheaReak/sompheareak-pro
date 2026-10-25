"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import {
  User,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  LogOut,
  X,
  Sparkles,
  Trophy,
  History,
  ShieldCheck,
  BookmarkCheck,
} from "lucide-react";

export const CustomerAccountModal: React.FC = () => {
  const {
    customerUser,
    isCustomerLoggedIn,
    loginCustomer,
    logoutCustomer,
    accountModalOpen,
    setAccountModalOpen,
    setOrderHistoryModalOpen,
    userPoints,
    orders,
  } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [province, setProvince] = useState("Phnom Penh");
  const [address, setAddress] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  // Sync fields when customerUser is present
  useEffect(() => {
    if (customerUser) {
      setName(customerUser.name || "");
      setPhone(customerUser.phone || "");
      setTelegramHandle(customerUser.telegramHandle || "");
      setProvince(customerUser.province || "Phnom Penh");
      setAddress(customerUser.address || "");
      setRememberMe(customerUser.rememberMe ?? true);
    }
  }, [customerUser]);

  if (!accountModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      sounds.playPop();
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      sounds.playPop();
      return;
    }

    setError("");
    loginCustomer({
      name: name.trim(),
      phone: phone.trim(),
      telegramHandle: telegramHandle.trim(),
      province,
      address: address.trim(),
      rememberMe,
    });
    setAccountModalOpen(false);
  };

  // Find user's orders count
  const userOrdersCount = customerUser
    ? orders.filter(
        (o) =>
          (customerUser.phone && o.customerPhone === customerUser.phone) ||
          (customerUser.name && o.customerName.toLowerCase().includes(customerUser.name.toLowerCase()))
      ).length
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sounds.playPop();
              setAccountModalOpen(false);
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>

          {isCustomerLoggedIn && customerUser ? (
            /* Logged In Customer Profile View */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-toy-green-glow flex items-center justify-center text-white font-fredoka font-black text-2xl">
                  {customerUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black font-fredoka text-slate-900 dark:text-white">
                      {customerUser.name}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    VIP Member · Auto-Remembered
                  </p>
                </div>
              </div>

              {/* Points & Stats Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-toy-yellow">
                    <Trophy className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>VIP Rewards</span>
                  </div>
                  <div className="text-2xl font-black font-fredoka text-amber-600 dark:text-toy-yellow mt-1">
                    {userPoints} pt
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400">Ready to redeem</span>
                </div>

                <div
                  onClick={() => {
                    sounds.playPop();
                    setAccountModalOpen(false);
                    setOrderHistoryModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 cursor-pointer hover:scale-102 transition-transform"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <History className="w-4 h-4" />
                    <span>My Orders</span>
                  </div>
                  <div className="text-2xl font-black font-fredoka text-emerald-600 dark:text-emerald-400 mt-1">
                    {userOrdersCount}
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 underline">
                    Check Receipts →
                  </span>
                </div>
              </div>

              {/* Customer Saved Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Phone:</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{customerUser.phone}</span>
                </div>

                {customerUser.telegramHandle && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-[#229ED9]" />
                      <span>Telegram:</span>
                    </span>
                    <a
                      href={`https://t.me/${customerUser.telegramHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#229ED9] hover:underline"
                    >
                      {customerUser.telegramHandle}
                    </a>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delivery:</span>
                  </span>
                  <span className="font-bold text-right text-slate-800 dark:text-slate-200">
                    {customerUser.address ? `${customerUser.address}, ${customerUser.province}` : customerUser.province}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    sounds.playPop();
                    setAccountModalOpen(false);
                    setOrderHistoryModalOpen(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow font-fredoka text-sm flex items-center justify-center gap-2 hover:scale-102 active:scale-95 transition-all"
                >
                  <History className="w-4 h-4" />
                  <span>Check Order History & Receipts</span>
                </button>

                <button
                  onClick={() => {
                    logoutCustomer();
                    sounds.playPop();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login / Register View */
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-fredoka">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Somphea Reak Customer Portal</span>
                </div>
                <h3 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                  Customer Sign In
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Track your orders in real-time, view easy receipts, and collect VIP reward points on every toy drop!
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sokha Mean"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number (Cellcard / Smart / Metfone) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="012 345 678"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Telegram Username (Optional)
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#229ED9]" />
                    <input
                      type="text"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      placeholder="@username (for 1-click order updates & delivery support)"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Delivery Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Phnom Penh">Phnom Penh (Express Delivery)</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Kandal">Kandal</option>
                    <option value="Kampong Cham">Kampong Cham</option>
                    <option value="Preah Sihanouk">Preah Sihanouk</option>
                    <option value="Other Province">Other Province</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Address / Sangkat (Optional)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, House No, Sangkat..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Remember Me Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Remember my info on this device</span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign In & Save Profile</span>
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
