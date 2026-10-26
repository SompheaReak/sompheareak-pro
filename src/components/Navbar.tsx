"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import {
  ShoppingBag,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Trophy,
  Gift,
  Sparkles,
  Menu,
  X,
  Languages,
  Receipt,
  User,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const {
    currency,
    toggleCurrency,
    language,
    toggleLanguage,
    themeMode,
    toggleTheme,
    soundEnabled,
    toggleSound,
    cartCount,
    setCartDrawerOpen,
    setRewardsModalOpen,
    userPoints,
    customerUser,
    isCustomerLoggedIn,
    setAccountModalOpen,
    setOrderHistoryModalOpen,
    t,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Toys Catalog", href: "/#toy-catalog", icon: "🧸" },
    { label: "Italy Bracelet", href: "/italy-bracelet", icon: "🔗" },
    { label: "Voucher Hub", href: "/#voucher-hub", icon: "🎟️" },
    { label: "Cart & Checkout", href: "/cart", icon: "🛒" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo - Click to Refresh or Return Home */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            sounds.playFanfare();
            if (window.location.pathname === "/" && !window.location.search && !window.location.hash) {
              window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
              window.location.reload();
            } else {
              window.location.href = "/";
            }
          }}
          title="Somphea Reak Home (Click to Return or Refresh)"
          className="flex items-center gap-1.5 sm:gap-3 group select-none min-w-0 cursor-pointer shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-toy-green-glow group-hover:scale-105 active:scale-95 transition-transform duration-300 shrink-0">
            <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative bg-slate-900">
              <Image
                src="/assets/logo.jpg"
                alt="Somphea Reak Logo"
                fill
                className="object-cover group-hover:scale-110 transition-transform"
                priority
              />
            </div>
            {/* Sparkle badge */}
            <span className="absolute -bottom-1 -right-1 text-xs animate-bounce hidden sm:inline">✨</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xs sm:text-2xl font-black font-fredoka tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                SOMPHEA REAK
              </span>
              <span className="px-1 py-0.2 sm:px-2 sm:py-0.5 rounded-md sm:rounded-lg bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0">
                V2
              </span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase line-clamp-1">
              សម្ភារៈ • Toy & Charm Studio
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => sounds.playPop()}
              className="px-4 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all font-fredoka flex items-center gap-1.5"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Right Actions & Toolbars */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* VIP Rewards Club Pill */}
          <button
            onClick={() => {
              sounds.playPop();
              setRewardsModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 dark:bg-gradient-to-r dark:from-toy-yellow/20 dark:to-amber-500/20 border border-amber-500/40 hover:border-amber-500 text-amber-700 dark:text-toy-yellow text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm font-fredoka"
            title="VIP Rewards Club"
          >
            <Trophy className="w-3.5 h-3.5 fill-amber-500 dark:fill-toy-yellow text-amber-500 dark:text-toy-yellow" />
            <span>{userPoints} pt</span>
          </button>

          {/* Light / Dark Mode Toggle (Replaced Dollar to Khmer button) */}
          <button
            onClick={() => {
              sounds.playPop();
              toggleTheme();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-400 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all active:scale-90 shadow-sm shrink-0 cursor-pointer"
            title="Toggle Dark / Light Theme"
            aria-label="Toggle Dark / Light Theme"
          >
            {themeMode === "dark" ? (
              <Moon className="w-4 h-4 text-toy-yellow" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Language Switcher (EN / KM) */}
          <button
            onClick={() => {
              sounds.playPop();
              toggleLanguage();
            }}
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-black text-slate-800 dark:text-slate-200 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
            title="Toggle Language (English / Khmer)"
          >
            <span className="text-sm">{language === "en" ? "🇬🇧" : "🇰🇭"}</span>
            <span className="text-[11px] font-black uppercase">{language}</span>
          </button>

          {/* Sound FX Toggle (🔊 / 🔇) */}
          <button
            onClick={() => {
              sounds.playPop();
              toggleSound();
            }}
            className={`hidden sm:flex w-10 h-10 rounded-xl border items-center justify-center transition-all active:scale-90 shadow-sm cursor-pointer ${
              soundEnabled
                ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-toy-green hover:border-emerald-500"
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
            }`}
            title={soundEnabled ? "Sound Effects Enabled" : "Sound Effects Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Order History & Receipts Button */}
          <button
            onClick={() => {
              sounds.playPop();
              setOrderHistoryModalOpen(true);
            }}
            className="hidden md:flex items-center gap-1.5 h-10 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm font-fredoka cursor-pointer active:scale-95"
            title="Check Order History & Receipts"
          >
            <Receipt className="w-4 h-4 text-emerald-500" />
            <span>History</span>
          </button>

          {/* Customer Account Button */}
          <button
            onClick={() => {
              sounds.playPop();
              setAccountModalOpen(true);
            }}
            className="hidden md:flex items-center gap-1.5 h-10 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm font-fredoka cursor-pointer active:scale-95"
            title="Customer Account & Rewards"
          >
            <div className="relative">
              <User className="w-4 h-4 text-emerald-500" />
              {isCustomerLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </div>
            <span>{isCustomerLoggedIn && customerUser ? customerUser.name.split(" ")[0] : "Account"}</span>
          </button>

          {/* Cart Button with Bouncy Badge */}
          <button
            onClick={() => {
              sounds.playPop();
              setCartDrawerOpen(true);
            }}
            className="relative h-9 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs font-fredoka flex items-center gap-1.5 sm:gap-2 shadow-toy-green-glow border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 select-none shrink-0 cursor-pointer"
            title="Open Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t("cartTitle")}</span>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: [1.3, 1] }}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-toy-yellow text-slate-950 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-md sm:-mr-1"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => {
              sounds.playPop();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer active:scale-90"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  sounds.playPop();
                  setMobileMenuOpen(false);
                }}
                className="block px-4 py-3 rounded-xl text-sm font-black text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-fredoka flex items-center gap-2.5 active:scale-98 transition-all"
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}

            <button
              onClick={() => {
                sounds.playPop();
                setOrderHistoryModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-black text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-fredoka flex items-center gap-2.5 active:scale-98 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>Order History & Receipts</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setAccountModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-black text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-fredoka flex items-center gap-2.5 active:scale-98 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-500" />
              <span>{isCustomerLoggedIn && customerUser ? `My Profile (${customerUser.name})` : "Customer Sign In"}</span>
            </button>

            {/* Quick Theme Toggle in Mobile Menu */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Display Theme:</span>
              <button
                onClick={() => {
                  sounds.playPop();
                  toggleTheme();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 shadow-sm font-fredoka active:scale-95 transition-all cursor-pointer"
              >
                {themeMode === "dark" ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-toy-yellow" />
                    <span>Dark Mode 🌙</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Mode ☀️</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Currency Switch in Mobile Menu */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Currency ($ / ៛):</span>
              <button
                onClick={() => {
                  sounds.playPop();
                  toggleCurrency();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 shadow-sm font-fredoka active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-amber-500 dark:text-toy-yellow font-black">{currency === "USD" ? "$" : "៛"}</span>
                <span>{currency === "USD" ? "USD ($)" : "KHR (៛)"}</span>
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">VIP Points:</span>
              <button
                onClick={() => {
                  sounds.playPop();
                  setRewardsModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 dark:bg-toy-yellow/20 text-amber-700 dark:text-toy-yellow font-black text-xs border border-amber-500/30 dark:border-toy-yellow/30 font-fredoka active:scale-95 transition-all cursor-pointer"
              >
                ⭐ {userPoints} pt (Claim Rewards)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
