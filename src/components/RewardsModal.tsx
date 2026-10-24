"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Sparkles, Gift, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";

export const RewardsModal: React.FC = () => {
  const {
    rewardsModalOpen,
    setRewardsModalOpen,
    userPoints,
    redeemVoucherPoints,
    activeVoucher,
    t,
  } = useStore();

  const handleRedeem = () => {
    const success = redeemVoucherPoints();
    if (success) {
      alert("🎉 10% OFF Voucher (VIP10OFF) claimed and applied to your cart!");
    } else {
      sounds.playPop();
      alert("You need at least 25 points to redeem a voucher. Keep exploring cool toys!");
    }
  };

  if (!rewardsModalOpen) return null;

  const pointsToNext = Math.max(0, 25 - userPoints);
  const progressPct = Math.min(100, (userPoints / 25) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-toy-yellow/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white overflow-hidden transition-colors duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sounds.playPop();
              setRewardsModalOpen(false);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-toy-yellow/20 text-amber-600 dark:text-toy-yellow flex items-center justify-center mx-auto mb-3 border border-amber-300 dark:border-toy-yellow/40 shadow-toy-glow">
              <Trophy className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">{t("rewardClub")}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Earn real points on every toy & unlock exclusive discounts!
            </p>
          </div>

          {/* Points Balance Card */}
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-indigo-900/60 dark:to-purple-900/60 border border-amber-200 dark:border-toy-purple/40 text-center relative overflow-hidden shadow-sm">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              {t("pointsBalance")}
            </span>
            <div className="text-4xl font-black text-amber-600 dark:text-toy-yellow font-fredoka my-1 flex items-center justify-center gap-1.5">
              <span>{userPoints}</span>
              <span className="text-lg text-emerald-600 dark:text-toy-cyan font-bold">pt</span>
            </div>

            {/* Progress bar to next voucher */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Voucher Progress (25 pt = 10% OFF)</span>
                <span>{userPoints}/25 pt</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-green-600"
                />
              </div>
            </div>
          </div>

          {/* Redeem Button */}
          <button
            onClick={handleRedeem}
            disabled={userPoints < 25}
            className={`w-full py-4 px-5 rounded-2xl font-black font-fredoka text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              userPoints >= 25
                ? "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 text-white shadow-toy-green-glow border-b-4 border-emerald-950 hover:from-emerald-400 hover:to-green-500 active:scale-95 cursor-pointer"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-750"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{t("redeemVoucher")}</span>
          </button>

          {/* Active Voucher State */}
          {activeVoucher && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Active: {activeVoucher.description}</span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-black">
                READY
              </span>
            </div>
          )}

          {/* How to Earn Points Rules */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">⭐ How to Earn Points:</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-toy-cyan flex-shrink-0" />
                <span>+1 to +5 pt for every Minifigure & Toy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-500 dark:text-toy-pink flex-shrink-0" />
                <span>+6 to +15 pt for Custom Italy Charm Bracelets</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-toy-yellow flex-shrink-0" />
                <span>Earn VIP points automatically with every confirmed order!</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
