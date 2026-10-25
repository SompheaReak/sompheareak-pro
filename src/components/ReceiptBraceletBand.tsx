"use client";

import React, { useState } from "react";
import { CustomBraceletItem, Charm } from "@/types/store";
import { ConnectedCharmLink } from "./ConnectedCharmLink";
import { Sparkles, Layers, Grid, SlidersHorizontal, Info } from "lucide-react";
import { formatPrice } from "@/utils/currency";

interface ReceiptBraceletBandProps {
  bracelet: CustomBraceletItem;
  compact?: boolean;
}

export const ReceiptBraceletBand: React.FC<ReceiptBraceletBandProps> = ({
  bracelet,
  compact = false,
}) => {
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<"ribbon" | "grid">("ribbon");

  if (!bracelet) {
    return null;
  }

  // Normalise charms list (handles both { slot, charm } and direct charm objects)
  const rawCharms = bracelet.charms || [];
  const normalizedCharms: { slotIndex: number; charm: Charm | null }[] = rawCharms.map((item, idx) => {
    if ("charm" in item && item.charm) {
      return {
        slotIndex: typeof item.slot === "number" ? item.slot : idx,
        charm: item.charm,
      };
    }
    return {
      slotIndex: idx,
      charm: (item as unknown as Charm) || null,
    };
  });

  const finish = bracelet.finish || "silver";
  const finishNames: Record<string, string> = {
    silver: "316L Polished Inox Silver",
    gold: "18K Yellow Gold Ion-Plating",
    rose: "18K Rose Gold Champagne",
    black: "Tactical Matte Obsidian Black",
  };

  const finishDots: Record<string, string> = {
    silver: "bg-slate-300 border-slate-400",
    gold: "bg-amber-400 border-amber-500",
    rose: "bg-rose-300 border-rose-400",
    black: "bg-slate-800 border-slate-700",
  };

  // Full 16-20 charms display: authentic adult wrist band standard
  const targetCount = Math.min(20, Math.max(16, bracelet.sizeLinks || 16, normalizedCharms.length));
  const fullBraceletSlots: { slotIndex: number; charm: Charm | null }[] = [];

  for (let i = 0; i < targetCount; i++) {
    const found = normalizedCharms.find((c) => c.slotIndex === i);
    if (found && found.charm) {
      fullBraceletSlots.push(found);
    } else if (i < normalizedCharms.length && normalizedCharms[i]?.charm) {
      fullBraceletSlots.push({ slotIndex: i, charm: normalizedCharms[i].charm });
    } else {
      // Base stainless steel link in customer's chosen finish
      fullBraceletSlots.push({
        slotIndex: i,
        charm: null,
      });
    }
  }

  const activeCharmsCount = fullBraceletSlots.filter((s) => s.charm !== null).length;
  const currentActiveCharm =
    highlightedSlot !== null ? fullBraceletSlots.find((s) => s.slotIndex === highlightedSlot) : null;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 overflow-hidden shadow-sm my-2 text-slate-900 dark:text-white print:border-slate-400">
      {/* 1. Header Spec Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-black font-fredoka text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Full Assembled Italian Modular Bracelet</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700/50">
                {targetCount} Links ({activeCharmsCount} Charms Attached)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full border ${finishDots[finish] || finishDots.silver}`} />
                <span className="font-semibold">{finishNames[finish] || finish.toUpperCase()}</span>
              </span>
              <span>·</span>
              <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                {bracelet.packaging === "premium" ? "🎁 Luxury Velvet Gift Box" : "📦 Presentation Packaging"}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher: Ribbon track vs Wrapped Grid view */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800/80 p-0.5 rounded-xl print:hidden text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setDisplayMode("ribbon")}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
              displayMode === "ribbon"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Ribbon Track</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode("grid")}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
              displayMode === "grid"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Wrap View (16-20)</span>
          </button>
        </div>
      </div>

      {/* 2. Highlighted Charm Details Banner */}
      {currentActiveCharm && currentActiveCharm.charm && (
        <div className="px-3 py-1.5 bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold">Slot #{currentActiveCharm.slotIndex + 1}:</span>
            <span className="font-black font-fredoka">{currentActiveCharm.charm.name}</span>
            {currentActiveCharm.charm.price && (
              <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                (${currentActiveCharm.charm.price.toFixed(2)})
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono font-bold">
            {finish} Inox Steel Link
          </span>
        </div>
      )}

      {/* 3. Full Connected Bracelet Display (Ribbon or Wrap Grid) */}
      <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-950/80">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="flex items-center gap-1 font-fredoka">
            <Layers className="w-3 h-3 text-emerald-500" />
            <span>Complete {targetCount}-Charm Assembled Modular Bracelet:</span>
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold normal-case print:hidden">
            {displayMode === "ribbon" ? "← Scroll sideways to inspect all links →" : "All links assembled"}
          </span>
        </div>

        {/* Display Mode A: Continuous Horizontal Seamless Ribbon Track */}
        {displayMode === "ribbon" && (
          <div className="w-full overflow-x-auto py-2.5 px-1 scrollbar-thin touch-pan-x [-webkit-overflow-scrolling:touch] print:hidden">
            <div className="flex items-center min-w-max mx-auto py-1">
              {fullBraceletSlots.map(({ slotIndex, charm }, idx) => (
                <div
                  key={`receipt-slot-ribbon-${idx}-${charm?.id || slotIndex}`}
                  className="flex flex-col items-center flex-shrink-0"
                  onMouseEnter={() => setHighlightedSlot(slotIndex)}
                  onMouseLeave={() => setHighlightedSlot(null)}
                >
                  <ConnectedCharmLink
                    charm={charm}
                    slotIndex={slotIndex}
                    finish={finish}
                    isSelected={highlightedSlot === slotIndex}
                    onSelect={() => setHighlightedSlot(highlightedSlot === slotIndex ? null : slotIndex)}
                    size={compact ? "compact" : "preview"}
                  />

                  {/* Slot Number Tag */}
                  <span
                    className={`mt-1 text-[8px] font-mono font-black px-1.5 py-0.5 rounded transition-all ${
                      highlightedSlot === slotIndex
                        ? "bg-emerald-500 text-white scale-110 shadow-xs"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    #{slotIndex + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display Mode B: Wrapped 8-10 Columns Grid View (Used for Wrap mode & Default for Print) */}
        <div
          className={`${
            displayMode === "grid" ? "grid" : "hidden print:grid"
          } grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-1.5 py-2`}
        >
          {fullBraceletSlots.map(({ slotIndex, charm }, idx) => (
            <div
              key={`receipt-slot-grid-${idx}-${charm?.id || slotIndex}`}
              className="flex flex-col items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer"
              onClick={() => setHighlightedSlot(highlightedSlot === slotIndex ? null : slotIndex)}
            >
              <ConnectedCharmLink
                charm={charm}
                slotIndex={slotIndex}
                finish={finish}
                isSelected={highlightedSlot === slotIndex}
                size="compact"
              />
              <span className="mt-0.5 text-[8px] font-mono font-bold text-slate-500 dark:text-slate-400">
                #{slotIndex + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
