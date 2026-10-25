"use client";

import React from "react";
import { Charm } from "@/types/store";
import Image from "next/image";
import { motion } from "framer-motion";

interface ConnectedCharmLinkProps {
  charm: Charm | null;
  slotIndex: number;
  finish: "silver" | "gold" | "rose" | "black";
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  size?: "workbench" | "preview" | "compact" | "fill";
  engravedText?: string | null;
}

export const finishLinkImages: Record<string, string> = {
  silver: "/assets/links_tight/link_plain.webp",
  gold: "/assets/links_tight/link_new_style_2.webp",
  rose: "/assets/links_tight/link_new_style_3.webp",
  black: "/assets/links_tight/link_new_style_4.webp",
  red: "/assets/links_tight/link_new_style_1.webp",
};

export const ConnectedCharmLink: React.FC<ConnectedCharmLinkProps> = ({
  charm,
  slotIndex,
  finish,
  isSelected = false,
  onSelect,
  onRemove,
  size = "workbench",
  engravedText,
}) => {
  // Sizing matching authentic Italian 9mm modular link ratio (~1.14:1)
  const sizeMap = {
    workbench: {
      w: "w-[66px] sm:w-[78px]",
      fontSize: "text-[9px] sm:text-[10px]",
    },
    preview: {
      w: "w-[50px] sm:w-[58px]",
      fontSize: "text-[8px]",
    },
    compact: {
      w: "w-[36px] sm:w-[42px]",
      fontSize: "text-[7px]",
    },
    fill: {
      w: "w-full",
      fontSize: "text-[7px] sm:text-[8px]",
    },
  };

  const currentSize = sizeMap[size];
  const blankImage = finishLinkImages[finish] || finishLinkImages.silver;

  // The uploaded charm image IS ALREADY the charm with no background and metallic borders!
  // Render it directly as a normal element without any template overlays or cavity cropping.
  const charmSrc = charm ? (charm.image || charm.plateImage || blankImage) : blankImage;

  return (
    <motion.div
      layout
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={`group relative ${currentSize.w} aspect-[1.14/1] ${size === "fill" ? "min-w-0" : "flex-shrink-0"} cursor-pointer select-none transition-all duration-150 ${
        isSelected ? "z-30 scale-105" : "z-10"
      }`}
      title={
        charm
          ? `${charm.name} (Click to remove/reorder)`
          : `Slot #${slotIndex + 1}: ${finish.toUpperCase()} Inox modular link`
      }
    >
      {/* Direct Charm Element Display with Soft Interlocking Shadow */}
      <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]">
        <Image
          src={charmSrc}
          alt={charm?.name || "Italian Modular Charm Link"}
          fill
          className="object-contain"
          sizes="120px"
          unoptimized={Boolean(charmSrc?.startsWith("data:"))}
          priority={slotIndex < 8}
        />

        {/* Optional Engraved Text or Slot Number for Blank Links */}
        {!charm && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {engravedText ? (
              <span
                className={`font-serif font-black uppercase tracking-wider text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] ${currentSize.fontSize}`}
              >
                {engravedText}
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold text-slate-500 opacity-40">
                #{slotIndex + 1}
              </span>
            )}
          </div>
        )}

        {/* Selection Glowing Outline */}
        {isSelected && (
          <div className="absolute -inset-0.5 rounded-xl ring-2 ring-emerald-400 ring-offset-1 ring-offset-transparent shadow-[0_0_12px_rgba(16,185,129,0.7)] pointer-events-none z-30" />
        )}
      </div>

      {/* Quick Remove '✕' Button on Hover or Selection */}
      {charm && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md z-40 transition-all ${
            isSelected
              ? "opacity-100 scale-100 ring-2 ring-white"
              : "opacity-0 group-hover:opacity-100 hover:scale-110"
          }`}
          title="Remove charm from band"
          aria-label="Remove charm"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
};
