"use client";

import React from "react";
import { MessageCircle, Heart, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { sounds } from "@/utils/audio";

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white pt-16 pb-12 overflow-hidden transition-colors duration-200">
      {/* Background soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5">
                <Image
                  src="/assets/logo.jpg"
                  alt="Somphea Reak Logo"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="text-xl font-black font-fredoka text-slate-900 dark:text-white">SOMPHEA REAK</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                  V2
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">សម្ភារៈ • Toy Universe</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cambodia&apos;s premier destination for viral collectible toys, points-to-vouchers loyalty rewards, and authentic custom Italian modular charm bracelets.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Telegram Storefront</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black font-fredoka text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <span>🧸</span>
              <span>Toy Arcades</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a href="#toy-catalog" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Minifigure Heroes & Villains
                </a>
              </li>
              <li>
                <a href="#voucher-hub" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Loyalty Points & Voucher Hub 🎟️
                </a>
              </li>
              <li>
                <a href="#toy-catalog" className="hover:text-amber-600 dark:hover:text-toy-yellow transition-colors">
                  Tech Toys & Wall-Climber RC Cars
                </a>
              </li>
              <li>
                <a href="/italy-bracelet" className="hover:text-emerald-600 dark:hover:text-toy-green transition-colors font-bold text-emerald-700 dark:text-emerald-400">
                  Italian Modular Charm Studio 🔗
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care & Telegram */}
          <div>
            <h4 className="text-sm font-black font-fredoka text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <span>📱</span>
              <span>Telegram Ordering</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Have questions or want custom recommendations? Chat with our team anytime!
            </p>
            <a
              href="https://t.me/Somphea_reak"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sounds.playPop()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-black text-xs font-fredoka shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>@Somphea_reak on Telegram</span>
            </a>
          </div>

          {/* Cambodia Delivery & Payments */}
          <div>
            <h4 className="text-sm font-black font-fredoka text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <span>🇰🇭</span>
              <span>Cambodia Delivery</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Same-day delivery in Phnom Penh. Fast delivery to all 24 provinces across Cambodia.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
                💵 Cash on Delivery (COD)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-700 dark:text-toy-cyan shadow-sm">
                📲 ABA KHQR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-700 dark:text-toy-yellow shadow-sm">
                ⭐ VIP Reward Points
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Somphea Reak Studio V2 (សម្ភារៈ). All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Kids & Toy Lovers in Cambodia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
