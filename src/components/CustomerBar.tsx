"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import { motion } from "framer-motion";
import {
  Home,
  Receipt,
  User,
  ShoppingBag,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const CustomerBar: React.FC = () => {
  const {
    cartCount,
    setCartDrawerOpen,
    customerUser,
    isCustomerLoggedIn,
    setAccountModalOpen,
    setOrderHistoryModalOpen,
    orders,
  } = useStore();

  const [isRotating, setIsRotating] = useState(false);

  // Calculate order count for user (0 if not logged in)
  const userOrdersCount = customerUser
    ? orders.filter(
        (o) =>
          (customerUser.phone && o.customerPhone === customerUser.phone) ||
          (customerUser.name && o.customerName.toLowerCase().includes(customerUser.name.toLowerCase()))
      ).length
    : 0;

  const handleLogoClick = () => {
    sounds.playFanfare();
    setIsRotating(true);
    setTimeout(() => {
      // Refresh and bring customer back to homepage
      if (window.location.pathname === "/" && !window.location.search && !window.location.hash) {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        window.location.reload();
      } else {
        window.location.href = "/";
      }
    }, 350);
  };

  const handleHome = () => {
    sounds.playBounce();
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 pb-[env(safe-area-inset-bottom,0px)] inset-x-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500/50 rounded-full px-4 py-2 shadow-2xl flex items-center justify-between text-slate-700 dark:text-slate-300 select-none"
      >
        {/* 1. Home Button */}
        <button
          onClick={handleHome}
          className="min-w-[54px] flex flex-col items-center justify-center gap-0.5 hover:text-emerald-500 transition-colors py-1.5 px-2 group active:scale-90 cursor-pointer"
          title="Return to Home"
          aria-label="Home"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 group-hover:text-emerald-500" />
          <span className="text-[10px] font-black font-fredoka uppercase tracking-wider">Home</span>
        </button>

        {/* 2. Order History & Receipts Button */}
        <button
          onClick={() => {
            sounds.playPop();
            setOrderHistoryModalOpen(true);
          }}
          className="relative min-w-[54px] flex flex-col items-center justify-center gap-0.5 hover:text-emerald-500 transition-colors py-1.5 px-2 group active:scale-90 cursor-pointer"
          title="Check Order History & Receipts"
          aria-label="Order History"
        >
          <Receipt className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 group-hover:text-emerald-500" />
          <span className="text-[10px] font-black font-fredoka uppercase tracking-wider">History</span>
          {userOrdersCount > 0 && (
            <span className="absolute -top-0.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white font-black text-[9px] flex items-center justify-center shadow">
              {userOrdersCount > 9 ? "9+" : userOrdersCount}
            </span>
          )}
        </button>

        {/* 3. Center Logo (Click to Refresh the page & Return Home!) */}
        <button
          onClick={handleLogoClick}
          className="relative -top-5 sm:-top-6 flex flex-col items-center group focus:outline-none cursor-pointer"
          title="Click Logo to Return Home and Refresh"
          aria-label="Refresh and return to home"
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-600 shadow-toy-green-glow border-2 border-white dark:border-slate-900 group-hover:scale-110 active:scale-95 transition-all cursor-pointer relative overflow-hidden ${
              isRotating ? "animate-spin" : ""
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-950 shadow-inner">
              <Image
                src="/assets/logo.jpg"
                alt="Somphea Reak Mascot Logo"
                fill
                sizes="(max-width: 640px) 56px, 64px"
                className="object-cover"
                priority
              />
            </div>
            {/* Spinning refresh hint badge on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            </div>
          </div>
          <span className="text-[10px] font-black font-fredoka uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mt-0.5 whitespace-nowrap bg-emerald-50 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-400/60 dark:border-emerald-700/60 shadow-sm flex items-center gap-1">
            Home 🔄
          </span>
        </button>

        {/* 4. Customer Account / Profile Button */}
        <button
          onClick={() => {
            sounds.playPop();
            setAccountModalOpen(true);
          }}
          className="relative min-w-[54px] flex flex-col items-center justify-center gap-0.5 hover:text-emerald-500 transition-colors py-1.5 px-2 group active:scale-90 cursor-pointer"
          title="Customer Profile & Login"
          aria-label="Account"
        >
          <div className="relative">
            <User className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 group-hover:text-emerald-500" />
            {isCustomerLoggedIn && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>
          <span className="text-[10px] font-black font-fredoka uppercase tracking-wider truncate max-w-[50px]">
            {isCustomerLoggedIn && customerUser ? customerUser.name.split(" ")[0] : "Account"}
          </span>
        </button>

        {/* 5. Cart Button with Bouncy Badge */}
        <button
          onClick={() => {
            sounds.playPop();
            setCartDrawerOpen(true);
          }}
          className="relative min-w-[54px] flex flex-col items-center justify-center gap-0.5 hover:text-emerald-500 transition-colors py-1.5 px-2 group active:scale-90 cursor-pointer"
          title="Open Cart"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 group-hover:text-emerald-500" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-4 h-4 rounded-full bg-toy-pink text-white font-black text-[9px] flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black font-fredoka uppercase tracking-wider">Cart</span>
        </button>
      </motion.div>
    </div>
  );
};
