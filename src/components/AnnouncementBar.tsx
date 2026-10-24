"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Sparkles, MessageCircle } from "lucide-react";

export const AnnouncementBar: React.FC = () => {
  const { t, storefrontConfig } = useStore();
  const announcementText = storefrontConfig?.announcementText || t("announcement");

  const marqueeItems = [
    announcementText,
    "📿 AUTHENTIC ITALY MODULAR CHARM BAND · HAND-ASSEMBLED",
    "⚡ VIRAL TIKTOK MINIFIGURES & BLIND BOXES",
    "🎟️ COLLECT POINTS & REDEEM INSTANT 10% VOUCHERS",
    "🇰🇭 EXCHANGE: $1 USD = 4,100 KHR",
    "🚀 EXPRESS DELIVERY IN PHNOM PENH & PROVINCES",
    "📱 TELEGRAM FAST ORDER: @Somphea_reak",
  ];

  return (
    <div className="relative py-2.5 bg-gradient-to-r from-emerald-800 via-green-600 to-teal-800 text-white overflow-hidden select-none border-b border-emerald-500/30 shadow-md">
      <div className="flex w-max animate-marquee gap-8 items-center text-xs font-black font-fredoka tracking-wider uppercase">
        {[...marqueeItems, ...marqueeItems].map((item, idx) => (
          <span key={idx} className="flex items-center gap-3 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-toy-yellow text-sm font-bold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};
