"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trash2,
  Zap,
  ShoppingCart,
  Plus,
  Check,
  Search,
  Dices,
  CircleDot,
  X,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Package,
  Share2,
  Copy,
  Code,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Send,
  Shuffle,
  Images,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Charm, CustomBraceletItem } from "@/types/store";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import { formatPrice } from "@/utils/currency";
import { ConnectedCharmLink } from "./ConnectedCharmLink";
import { getCharmCode, DEFAULT_STUDIO_CHARMS } from "@/data/charms";
import {
  generateBraceletCode,
  parseBraceletCode,
  generateBraceletShareUrl,
} from "@/lib/braceletCode";
import Image from "next/image";
import Link from "next/link";

interface AppliedStyleModalData {
  finish: "silver" | "gold" | "rose" | "black";
  charmsCount: number;
  charms: Charm[];
  code: string;
}

interface CustomBraceletStudioProps {
  standalone?: boolean;
  isAdminMode?: boolean;
  onAddAsProduct?: (braceletData: {
    name: string;
    nameKh: string;
    price: number;
    bio: string;
    image: string;
    charms: { slotIndex: number; charm: Charm }[];
    finish: string;
  }) => void;
  onOpenAddCharmModal?: () => void;
  onOpenBulkCharmModal?: () => void;
  onOpenBulkBraceletModal?: () => void;
  onAddToBulkBatch?: (braceletData: {
    name: string;
    nameKh: string;
    price: number;
    bio: string;
    image: string;
    charms: { slotIndex: number; charm: Charm }[];
    finish: "silver" | "gold" | "rose" | "black";
    charmsCount: number;
  }) => void;
  bulkBraceletBatchCount?: number;
}

export const CustomBraceletStudio: React.FC<CustomBraceletStudioProps> = ({
  standalone = false,
  isAdminMode = false,
  onAddAsProduct,
  onOpenAddCharmModal,
  onOpenBulkCharmModal,
  onOpenBulkBraceletModal,
  onAddToBulkBatch,
  bulkBraceletBatchCount = 0,
}) => {
  const { addCustomBraceletToCart, currency, t, language, charms, deleteCharm } = useStore();

  const MIN_CHARMS = 16;

  const [finish, setFinish] = useState<"silver" | "gold" | "rose" | "black">("silver");
  // The preview starts completely EMPTY; only has elements when customer clicks charms
  const [slots, setSlots] = useState<Charm[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [packaging, setPackaging] = useState<"basic" | "premium">("basic");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [charmSearch, setCharmSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"ribbon" | "wrist">("ribbon");
  const [charmSize, setCharmSize] = useState<"large" | "compact">("large");
  const [isViewBarMinimized, setIsViewBarMinimized] = useState<boolean>(false);
  const ribbonScrollRef = useRef<HTMLDivElement>(null);
  const prevSlotsCountRef = useRef(slots.length);

  // Shareable Friend Bracelet Code System & Search Bar
  const [friendCodeInput, setFriendCodeInput] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [codeModalOpen, setCodeModalOpen] = useState<boolean>(false);
  const [codeInputValue, setCodeInputValue] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [styleLoadFeedback, setStyleLoadFeedback] = useState<string | null>(null);
  const [appliedModalData, setAppliedModalData] = useState<AppliedStyleModalData | null>(null);

  const premiumBoxPrice = 0.5;

  // Real-time live detection for friend code input
  const liveParsedPreview = useMemo(() => {
    const trimmed = friendCodeInput.trim();
    if (trimmed.length < 2) return null;
    return parseBraceletCode(trimmed, charms || []);
  }, [friendCodeInput, charms]);

  // Current build code for sharing
  const currentBuildCode = useMemo(() => {
    return generateBraceletCode(finish, slots);
  }, [finish, slots]);

  // Detect if user pasted a full bracelet code into bottom charm search bar
  const detectedStyle = useMemo(() => {
    const q = charmSearch.trim();
    if (q.length >= 6 && (q.toUpperCase().startsWith("SRB-") || q.includes(":"))) {
      return parseBraceletCode(q, charms || []);
    }
    return null;
  }, [charmSearch, charms]);

  // Auto-load style code if passed in URL query param (?code= or ?style=)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code") || urlParams.get("style");
      if (codeParam) {
        const parsed = parseBraceletCode(codeParam, charms || []);
        if (parsed) {
          setFinish(parsed.finish);
          setSlots(parsed.charms);
          setSelectedSlotIndex(null);
          setFriendCodeInput(codeParam);
          sounds.playFanfare();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.5 },
          });
          setStyleLoadFeedback(
            `Loaded shared bracelet style with ${parsed.charms.length} links in ${parsed.finish.toUpperCase()}! 🎉`
          );
          setAppliedModalData({
            finish: parsed.finish,
            charmsCount: parsed.charms.length,
            charms: parsed.charms,
            code: codeParam,
          });
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, [charms]);

  // Auto-scroll ribbon horizontally to the newly added charm so customer always sees design evolve
  useEffect(() => {
    if (slots.length > prevSlotsCountRef.current && ribbonScrollRef.current) {
      setTimeout(() => {
        if (ribbonScrollRef.current) {
          ribbonScrollRef.current.scrollTo({
            left: ribbonScrollRef.current.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 50);
    }
    prevSlotsCountRef.current = slots.length;
  }, [slots.length]);

  // Paste code directly from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setFriendCodeInput(text.trim());
          setInputError(null);
          const parsed = parseBraceletCode(text.trim(), charms || []);
          if (parsed) {
            sounds.playPop();
          }
        }
      }
    } catch (err) {
      // Fallback gracefully
    }
  };

  // Copy shareable bracelet style code
  const handleCopyBraceletCode = () => {
    const code = currentBuildCode;
    if (!code) return;
    sounds.playFanfare();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(true);
    setStyleLoadFeedback(`Copied code: ${code} — Share with your friend! 🎁`);
    setTimeout(() => {
      setCopiedCode(false);
      setStyleLoadFeedback(null);
    }, 4500);
  };

  // Copy shareable direct web link
  const handleCopyShareLink = () => {
    const code = currentBuildCode;
    if (!code) return;
    const url = generateBraceletShareUrl(code);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    sounds.playFanfare();
    setCopiedLink(true);
    setStyleLoadFeedback(`Share link copied: ${url} — Send to your friend! 🔗`);
    setTimeout(() => {
      setCopiedLink(false);
      setStyleLoadFeedback(null);
    }, 4500);
  };

  // Apply parsed bracelet style to studio and trigger popup modal
  const handleApplyStyle = (parsed: {
    finish: "silver" | "gold" | "rose" | "black";
    charms: Charm[];
  }) => {
    sounds.playFanfare();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 },
      colors: ["#10b981", "#fbbf24", "#38bdf8", "#ec4899", "#34d399"],
    });

    setFinish(parsed.finish);
    setSlots(parsed.charms);
    setSelectedSlotIndex(null);
    setCharmSearch("");
    setCodeModalOpen(false);
    setCodeInputValue("");
    setInputError(null);

    const fullCode = generateBraceletCode(parsed.finish, parsed.charms);
    setFriendCodeInput(fullCode);

    setAppliedModalData({
      finish: parsed.finish,
      charmsCount: parsed.charms.length,
      charms: parsed.charms,
      code: fullCode,
    });

    setStyleLoadFeedback(
      `Loaded exact design: ${parsed.charms.length} links in ${parsed.finish.toUpperCase()}! 🎉`
    );
    setTimeout(() => setStyleLoadFeedback(null), 5000);

    setTimeout(() => {
      const elem = document.getElementById("bracelet-view-box");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 250);
  };

  // Handle "Apply Style" button click from the main search bar
  const handleApplyFriendCode = () => {
    const query = friendCodeInput.trim();
    if (!query) {
      setInputError("Please enter or paste your friend's bracelet code first!");
      sounds.playPop();
      return;
    }

    const parsed = parseBraceletCode(query, charms || []);
    if (!parsed) {
      setInputError(
        "Invalid bracelet code. Please verify the code (e.g. SRB-S:GF1-P01-P02...) or paste the full share link."
      );
      sounds.playPop();
      return;
    }

    setInputError(null);
    handleApplyStyle(parsed);
  };

  // Add charm to ribbon track (appends with no limit)
  const handleAddCharm = (charm: Charm) => {
    sounds.playCharmSnap();
    setSlots((prev) => {
      if (selectedSlotIndex !== null && selectedSlotIndex < prev.length) {
        const copy = [...prev];
        copy[selectedSlotIndex] = charm;
        setSelectedSlotIndex(null);
        return copy;
      }
      return [...prev, charm];
    });
  };

  // Remove charm from specific slot
  const handleRemoveSlot = (slotIdx: number) => {
    sounds.playPop();
    setSlots((prev) => prev.filter((_, i) => i !== slotIdx));
    if (selectedSlotIndex === slotIdx) {
      setSelectedSlotIndex(null);
    }
  };

  // Clear all charms back to completely empty
  const handleClearAll = () => {
    sounds.playPop();
    setSlots([]);
    setSelectedSlotIndex(null);
  };

  const allDisplayCharms = useMemo(() => {
    return charms && charms.length > 0 ? charms : [];
  }, [charms]);

  // Randomize with surprise mix of charms (auto-fills to minimum 16 charms)
  const handleRandomize = () => {
    sounds.playFanfare();
    const available = allDisplayCharms;
    if (available.length === 0) return;

    const count = 16;
    const newSlots = Array(count)
      .fill(null)
      .map(() => {
        return available[Math.floor(Math.random() * available.length)];
      });
    setSlots(newSlots);
    setSelectedSlotIndex(null);
  };

  const activeCharmsCount = slots.length;
  const isMinimumReached = activeCharmsCount >= MIN_CHARMS;
  const charmsNeededForMin = Math.max(0, MIN_CHARMS - activeCharmsCount);
  const progressPercent = Math.min(100, (activeCharmsCount / MIN_CHARMS) * 100);

  // Dynamic price calculation: sum of all attached charms
  const totalCharmsPrice = slots.reduce((acc, c) => acc + (c?.price || 0.73), 0);
  const totalPriceUsd = totalCharmsPrice + (packaging === "premium" ? premiumBoxPrice : 0);
  const rewardPoints = Math.max(10, Math.round(totalPriceUsd * 1.5));

  // Estimated wrist circumference based on attached 9mm links
  const estimatedWristCm = activeCharmsCount > 0 ? (activeCharmsCount * 0.95 + 1.2).toFixed(1) : "0";

  // Extract unique categories from actual charms list
  const allCategories = useMemo(() => {
    const list = charms && charms.length > 0 ? charms : [];
    const set = new Set(list.map((c) => c.category || "emblem"));
    return ["all", ...Array.from(set)];
  }, [charms]);

  // Filtered charms based on category, name, or short code
  const filteredCharms = useMemo(() => {
    const list = allDisplayCharms;
    const q = charmSearch.trim().toLowerCase();

    // If search is a full bracelet code, don't filter out charms
    if (q.startsWith("srb-") || q.includes(":")) {
      return list;
    }

    return list.filter((c) => {
      const matchCat = selectedCategory === "all" || c.category === selectedCategory;
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nameKh && c.nameKh.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        getCharmCode(c, allDisplayCharms).toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allDisplayCharms, selectedCategory, charmSearch]);

  const handleAddToCart = () => {
    if (!isMinimumReached) {
      sounds.playPop();
      alert(
        language === "km"
          ? `សូមជ្រើសរើសយ៉ាងហោចណាស់ ${MIN_CHARMS} គ្រាប់ដើម្បីបញ្ជាទិញ! (បច្ចុប្បន្ន: ${activeCharmsCount}/${MIN_CHARMS})`
          : `Please attach at least ${MIN_CHARMS} charms to assemble your Italian modular bracelet! (Current: ${activeCharmsCount}/${MIN_CHARMS})`
      );
      return;
    }

    const charmsAttached: { slot: number; charm: Charm }[] = slots.map((c, idx) => ({
      slot: idx,
      charm: c,
    }));

    const customItem: CustomBraceletItem = {
      id: `custom-bracelet-${Date.now()}`,
      styleId: `italian-band-${finish}-${activeCharmsCount}`,
      finish,
      sizeLinks: activeCharmsCount,
      charms: charmsAttached,
      packaging,
      unitPrice: totalPriceUsd,
      quantity: 1,
      points: rewardPoints,
    };

    addCustomBraceletToCart(customItem);
  };

  return (
    <section id="custom-bracelet-studio" className="py-4 sm:py-8 px-3 sm:px-6 max-w-5xl mx-auto pb-32">
      {/* ==================================================== */}
      {/* TOP WORKBENCH CARD (STICKY TOP FOR EASY ASSEMBLY)   */}
      {/* ==================================================== */}
      <div className="sticky top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg space-y-3 transition-all">
        {/* Row 1: Charms Count, Total Price & Clear Button */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5 sm:pb-3">
          {/* Charms Count */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold font-fredoka text-slate-800 dark:text-slate-200">
            <span>{language === "km" ? "ចំនួនស្រទាប់" : "Charms"} :</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">{activeCharmsCount}</span>
            <span className="text-slate-400">/</span>
            <span>{MIN_CHARMS}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
              ({isMinimumReached ? (language === "km" ? "គ្រប់ចំនួន" : "Ready") : (language === "km" ? `ខ្វះ ${charmsNeededForMin}` : `Need ${charmsNeededForMin}`)})
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Total Price */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold font-fredoka text-slate-800 dark:text-slate-200">
              <span>{language === "km" ? "តម្លៃ" : "Price"} :</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {formatPrice(totalPriceUsd, currency)}
              </span>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-fredoka text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear all charms"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === "km" ? "ជម្រះ" : "Clear"}</span>
            </button>
          </div>
        </div>

        {/* Extended View Box with Integrated Minimum Progress Bar */}
        <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 min-h-[155px] sm:min-h-[210px] flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden transition-all">
          {/* Main Ribbon / Canvas Area */}
          <div className="flex-1 flex items-center justify-center w-full py-2.5 sm:py-5">
            {activeCharmsCount === 0 ? (
              <div className="flex flex-col items-center justify-center text-center space-y-1.5 select-none py-1">
                <Layers className="w-8 h-8 sm:w-9 sm:h-9 text-slate-400 animate-pulse" />
                <span className="text-xs sm:text-base font-black font-fredoka text-slate-700 dark:text-slate-300">
                  {language === "km" ? "ចាប់ផ្តើមរៀបចំ" : "Start Assembling"}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">
                  {language === "km" ? "(ចុចលើត្បូងខាងក្រោមដើម្បីបន្ថែម)" : "(Tap charms below to connect)"}
                </span>
              </div>
            ) : (
              <div
                ref={ribbonScrollRef}
                className="w-full flex items-center overflow-x-auto py-1.5 sm:py-2 px-1 scrollbar-thin touch-pan-x [-webkit-overflow-scrolling:touch]"
              >
                <div className="flex items-center min-w-max mx-auto py-1 gap-1">
                  {slots.map((charm, idx) => (
                    <ConnectedCharmLink
                      key={`slot-${idx}-${charm.id}`}
                      charm={charm}
                      slotIndex={idx}
                      finish={finish}
                      isSelected={selectedSlotIndex === idx}
                      onSelect={() => {
                        sounds.playPop();
                        setSelectedSlotIndex(selectedSlotIndex === idx ? null : idx);
                      }}
                      onRemove={() => handleRemoveSlot(idx)}
                      size="workbench"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Integrated Minimum Progress Bar inside View Box */}
          <div className="w-full pt-2.5 sm:pt-3 mt-auto border-t border-slate-200/80 dark:border-slate-800/80 space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-fredoka">
                <span>{language === "km" ? "អប្បបរមា ១៦ គ្រាប់ (16 Charms Minimum)" : "16 Charms Minimum"}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isMinimumReached ? (language === "km" ? "គ្រប់ចំនួន" : "Ready") : (language === "km" ? `ខ្វះ ${charmsNeededForMin}` : `Need ${charmsNeededForMin} more`)})
                </span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                {activeCharmsCount} / {MIN_CHARMS}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isMinimumReached ? "bg-emerald-500 shadow-sm" : "bg-emerald-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Code Share & Import controls */}
        <div className="space-y-2 pt-0.5 sm:pt-1">
          {/* Row 4a: Current Code Read-only Display + COPY */}
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-1.5 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold text-slate-700 dark:text-slate-200 truncate select-all border border-slate-200 dark:border-slate-700 text-center">
              {currentBuildCode || "XXXX - XXXX"}
            </div>
            <button
              type="button"
              onClick={handleCopyBraceletCode}
              className="px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black font-fredoka flex items-center justify-center gap-1.5 active:scale-95 transition-all flex-shrink-0 cursor-pointer shadow-sm"
              title="Copy code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? "COPIED" : "COPY"}</span>
            </button>
          </div>

          {/* Row 4b: Import Code Input + ដាក់កូដ */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={friendCodeInput}
              onChange={(e) => {
                setFriendCodeInput(e.target.value);
                setInputError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyFriendCode();
                }
              }}
              placeholder={language === "km" ? "ដាក់លេខកូដដើម្បីទាញយក . . ." : "Enter code to import . . ."}
              className="flex-1 px-3 py-1.5 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="button"
              onClick={handleApplyFriendCode}
              disabled={!friendCodeInput.trim()}
              className="px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-black font-fredoka flex items-center justify-center gap-1.5 active:scale-95 transition-all flex-shrink-0 cursor-pointer shadow-sm"
            >
              <span>{language === "km" ? "ដាក់កូដ" : "Import"}</span>
            </button>
          </div>

          {/* Input Error Feedback */}
          {inputError && (
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 shadow-xs">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
              <span>{inputError}</span>
            </div>
          )}

          {/* Subtitle */}
          <p className="text-[10px] sm:text-[11px] text-center text-slate-400 dark:text-slate-500 pt-0.5 hidden sm:block">
            {language === "km"
              ? "(ប្រព័ន្ធនឹងទាញយកខ្សែកដៃដែលបានរក្សាទុក... អាចចែករំលែកទៅមិត្តភក្តិបាន)"
              : "(Import saved bracelet style... or share code with friends)"}
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ALL CHARMS GRID                                      */}
      {/* ==================================================== */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black font-fredoka text-slate-900 dark:text-white flex items-center gap-2">
            <span>{language === "km" ? "✨ ត្បូងទាំងអស់" : "✨ All Charms"}</span>
          </h3>
          {isAdminMode && (
            <div className="flex items-center gap-2 flex-wrap">
              {onOpenBulkBraceletModal && (
                <button
                  type="button"
                  onClick={onOpenBulkBraceletModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-rose-500 text-white font-black font-fredoka text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Upload 10+ bracelet photos or manage batch at once"
                >
                  <Package className="w-3.5 h-3.5 text-amber-200" />
                  <span>Bulk Upload Bracelets (10+) 🔗</span>
                </button>
              )}
              {onOpenBulkCharmModal && (
                <button
                  type="button"
                  onClick={onOpenBulkCharmModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black font-fredoka text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Upload 10+ charm photos at once"
                >
                  <Images className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bulk Upload Charms (10+) 📸</span>
                </button>
              )}
              {onOpenAddCharmModal && (
                <button
                  type="button"
                  onClick={onOpenAddCharmModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Charm</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 8-col grid on mobile and desktop (8 by 8 layout) or empty state */}
        {allDisplayCharms.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-2">
            <span className="text-3xl block">✨</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {language === "km" ? "មិនទាន់មានត្បូងនៅក្នុងស្តុកនៅឡើយទេ" : "No charms in inventory yet"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isAdminMode
                ? "Click 'Upload Charm' above to add your first authentic charm link to the catalog."
                : (language === "km" ? "សូមរង់ចាំការទម្លាក់ត្បូងថ្មីៗក្នុងពេលឆាប់ៗនេះ!" : "New charm drops coming soon! Stay tuned.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1 xs:gap-1.5 sm:gap-2.5 md:gap-3">
            {allDisplayCharms.map((charm) => (
              <div
                key={charm.id}
                onClick={() => handleAddCharm(charm)}
                className="group relative rounded-lg sm:rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 hover:border-emerald-500 dark:hover:border-emerald-400 p-1 sm:p-2 sm:p-2.5 flex flex-col items-center justify-between cursor-pointer active:scale-90 transition-all shadow-xs hover:shadow-md select-none touch-manipulation"
                title={`${language === "km" ? charm.nameKh : charm.name} - ${formatPrice(charm.price || 0.73, currency)}`}
              >
                {/* Admin Delete Charm Button */}
                {isAdminMode && !charm.id.startsWith("base-") && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete charm "${charm.name}"?`)) {
                        sounds.playPop();
                        deleteCharm(charm.id);
                        setSlots((prev) => prev.filter((c) => c.id !== charm.id));
                      }
                    }}
                    className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 z-20 p-0.5 sm:p-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    title={`Delete ${charm.name}`}
                  >
                    <Trash2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  </button>
                )}

                <div className="relative w-7 h-7 xs:w-8 xs:h-8 sm:w-14 sm:h-14 md:w-16 md:h-16 my-0.5 sm:my-1 flex items-center justify-center">
                  <Image
                    src={charm.image || "/assets/charm_clean.png"}
                    alt={charm.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-150 filter drop-shadow-xs"
                    unoptimized={Boolean(charm.image?.startsWith("data:"))}
                    sizes="(max-width: 640px) 12.5vw, 120px"
                  />
                </div>

                <div className="w-full text-center mt-0.5 sm:mt-1 pt-0.5 sm:pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="block font-black font-fredoka text-[7.5px] xs:text-[8.5px] sm:text-xs text-emerald-600 dark:text-emerald-400 leading-none">
                    {formatPrice(charm.price || 0.73, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* FIXED BOTTOM ACTION BAR                              */}
      {/* ==================================================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 py-2.5 px-3 sm:px-6 shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Telegram button */}
          <a
            href="https://t.me/Somphea_reak"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm active:scale-95 transition-transform"
            title="Telegram Support"
          >
            <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
          </a>

          {/* Shuffle / Randomize button */}
          <button
            type="button"
            onClick={handleRandomize}
            className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 border border-slate-300 dark:border-slate-700 shadow-sm active:scale-95 transition-transform cursor-pointer"
            title="Randomize Mix (16 Charms)"
          >
            <Shuffle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Admin Queue to Multi Bulk Batch */}
          {isAdminMode && onAddToBulkBatch && (
            <button
              type="button"
              onClick={() => {
                if (slots.length === 0) {
                  alert("Please add at least 1 charm to queue this bracelet to batch!");
                  return;
                }
                onAddToBulkBatch({
                  name: `Italian Bracelet (${finish.toUpperCase()} · ${activeCharmsCount} Charms)`,
                  nameKh: `ខ្សែដៃអ៊ីតាលី (${finish.toUpperCase()} · ${activeCharmsCount} ផ្លាក)`,
                  price: totalPriceUsd,
                  bio: `Hand-crafted Italian Modular Bracelet (${finish.toUpperCase()} finish) with ${activeCharmsCount} charms.`,
                  image: slots[0]?.plateImage || slots[0]?.image || "/assets/links_tight/link_plain.webp",
                  charms: slots.map((c, idx) => ({ slotIndex: idx, charm: c })),
                  finish,
                  charmsCount: activeCharmsCount,
                });
              }}
              className="px-3.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black font-fredoka text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
              title="Queue this designed bracelet to multi bulk upload batch"
            >
              <Package className="w-4 h-4 text-amber-300" />
              <span>+ Queue to Batch {bulkBraceletBatchCount > 0 ? `(${bulkBraceletBatchCount})` : ""}</span>
            </button>
          )}

          {/* Wide CTA button */}
          <button
            type="button"
            onClick={() => {
              if (isAdminMode && onAddAsProduct) {
                onAddAsProduct({
                  name: `Custom Italian Charm Bracelet (${finish.toUpperCase()} · ${activeCharmsCount} Charms)`,
                  nameKh: `ខ្សែដៃម៉ូឌុលអ៊ីតាលី (${finish.toUpperCase()} · ${activeCharmsCount} ផ្លាក)`,
                  price: totalPriceUsd,
                  bio: `Hand-crafted 316L Stainless Steel Italian Modular Bracelet (${finish.toUpperCase()} finish) featuring ${activeCharmsCount} connected charms.`,
                  image: slots[0]?.plateImage || slots[0]?.image || "/assets/links_tight/link_plain.webp",
                  charms: slots.map((c, idx) => ({ slotIndex: idx, charm: c })),
                  finish,
                });
              } else {
                handleAddToCart();
              }
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black font-fredoka text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {isAdminMode ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish As Single Product</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{language === "km" ? "បញ្ជាទិញឥឡូវនេះ" : "Order Now"}</span>
              </>
            )}
            {activeCharmsCount > 0 && (
              <span className="text-xs opacity-90 font-mono">({formatPrice(totalPriceUsd, currency)})</span>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL: PASTE FRIEND'S BRACELET CODE                  */}
      {/* ==================================================== */}
      <AnimatePresence>
        {codeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-fredoka text-slate-900 dark:text-white">
                    Load Friend's Bracelet Design
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste your friend's style code below to assemble their exact bracelet!
                  </p>
                </div>
              </div>

              {/* Textarea for code */}
              <div className="space-y-3 my-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Paste Bracelet Code:
                  </label>
                  <textarea
                    rows={3}
                    value={codeInputValue}
                    onChange={(e) => setCodeInputValue(e.target.value)}
                    placeholder="e.g. SRB-S:GF1-P01-P02-CAT-P04-S01..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Live parsed preview */}
                {(() => {
                  const parsed = parseBraceletCode(codeInputValue, charms || []);
                  if (!codeInputValue.trim()) return null;
                  if (!parsed) {
                    return (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-medium">
                        ⚠️ Please check your code. Valid formats: <code>SRB-S:GF1-P01...</code> or charm codes separated by hyphens.
                      </div>
                    );
                  }
                  return (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 dark:border-emerald-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        <span>✨ Detected: {parsed.charms.length} Charms</span>
                        <span className="uppercase px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900">
                          Finish: {parsed.finish}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto scrollbar-thin">
                        {parsed.charms.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"
                          >
                            #{c.code || getCharmCode(c, charms)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Apply Button */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseBraceletCode(codeInputValue, charms || []);
                      if (parsed) {
                        handleApplyStyle(parsed);
                      } else {
                        alert("Invalid code. Please check that the code contains valid charm codes.");
                      }
                    }}
                    disabled={!parseBraceletCode(codeInputValue, charms || [])}
                    className="flex-1 py-3 px-4 rounded-xl font-black text-white font-fredoka text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Apply This Exact Style to Bracelet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.readText().then((clip) => {
                          setCodeInputValue(clip);
                        }).catch(() => {});
                      }
                    }}
                    className="px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                    title="Paste from clipboard"
                  >
                    Paste
                  </button>
                </div>

                {/* Section to copy current design code */}
                {activeCharmsCount > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Your Current Design Code:
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {activeCharmsCount} Charms Attached
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="flex-1 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate select-all">
                        {generateBraceletCode(finish, slots)}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBraceletCode}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* POP-UP MODAL: FRIEND'S FINISHED STYLE APPLIED        */}
      {/* ==================================================== */}
      <AnimatePresence>
        {appliedModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto space-y-4"
            >
              <button
                type="button"
                onClick={() => setAppliedModalData(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Celebration Header */}
              <div className="text-center space-y-1.5 pt-2">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-toy-green-glow">
                  <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-fredoka">
                  ✨ Style Successfully Applied!
                </span>
                <h3 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                  Friend&apos;s Bracelet Style Is Live!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your friend&apos;s custom modular build has been loaded onto your workbench with exact link placement!
                </p>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Band Finish</span>
                  <span className="text-sm font-black font-fredoka text-emerald-600 dark:text-emerald-400 capitalize">
                    {appliedModalData.finish} Inox Steel
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Modular Links</span>
                  <span className="text-sm font-black font-fredoka text-amber-600 dark:text-toy-yellow">
                    {appliedModalData.charmsCount} Charms Connected
                  </span>
                </div>
              </div>

              {/* Mini Preview Ribbon of Applied Links */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  Loaded Links Sequence ({appliedModalData.charms.length}):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 px-2 scrollbar-thin bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {appliedModalData.charms.map((c, idx) => (
                    <div
                      key={`applied-mini-${idx}`}
                      className="w-11 sm:w-12 aspect-[540/900] rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-1 flex-shrink-0 shadow-xs"
                      title={`${c.name} (#${c.code || getCharmCode(c, charms)})`}
                    >
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                        <Image
                          src={c.image || "/assets/charm_clean.png"}
                          alt={c.name}
                          fill
                          className="object-contain"
                          unoptimized={Boolean(c.image?.startsWith("data:"))}
                        />
                      </div>
                      <span className="text-[8px] font-mono font-black text-emerald-700 dark:text-emerald-400 mt-0.5 truncate max-w-full">
                        #{c.code || getCharmCode(c, charms)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAppliedModalData(null);
                    const elem = document.getElementById("bracelet-view-box");
                    if (elem) {
                      elem.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-white font-fredoka text-xs bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-400 hover:to-green-500 shadow-toy-green-glow border-b-4 border-emerald-950 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Bracelet on Workbench 💫</span>
                </button>

                {appliedModalData.charmsCount >= MIN_CHARMS && !isAdminMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedModalData(null);
                      handleAddToCart();
                    }}
                    className="py-3 px-4 rounded-xl font-black text-slate-800 dark:text-white font-fredoka text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-500" />
                    <span>Add to Cart 🛒</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
