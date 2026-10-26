"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Box, Star, ShieldCheck, Plus, Minus, Heart, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import { formatPrice } from "@/utils/currency";
import Image from "next/image";

export const ProductQuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    currency,
    language,
    t,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const productImages =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const discountedPrice = product.price * (1 - product.discount / 100);

  const handleClose = () => {
    sounds.playPop();
    setQuickViewProduct(null);
    setQuantity(1);
    setSelectedImageIdx(0);
  };

  const handleAdd = () => {
    addToCart(product, quantity);
    handleClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] flex flex-col md:flex-row gap-6 transition-colors duration-200"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90 cursor-pointer shadow-sm"
            aria-label="Close product view"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image & Badges & Multiple Photos Gallery */}
          <div className="w-full md:w-1/2 flex flex-col gap-2.5 flex-shrink-0">
            {/* Main Active Photo Box */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group">
              <Image
                src={productImages[selectedImageIdx] || product.image}
                alt={`${product.name} photo ${selectedImageIdx + 1}`}
                fill
                className="object-cover transition-all duration-300"
                unoptimized={Boolean(productImages[selectedImageIdx]?.startsWith("data:"))}
              />

              {product.discount > 0 && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md">
                  -{product.discount}% OFF
                </span>
              )}
              {product.rarity && (
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-black">
                  ✨ {product.rarity}
                </span>
              )}

              {/* Multiple Photos Count Indicator */}
              {productImages.length > 1 && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                  <Images className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {selectedImageIdx + 1} / {productImages.length}
                  </span>
                </div>
              )}

              {/* Sideways Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playPop();
                      setSelectedImageIdx((prev) =>
                        prev > 0 ? prev - 1 : productImages.length - 1
                      );
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-90 cursor-pointer"
                    title="Previous photo (Scroll left)"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playPop();
                      setSelectedImageIdx((prev) =>
                        prev < productImages.length - 1 ? prev + 1 : 0
                      );
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-90 cursor-pointer"
                    title="Next photo (Scroll right)"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip: Scroll sideways to view all photos */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setSelectedImageIdx(i);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === selectedImageIdx
                        ? "border-emerald-500 ring-2 ring-emerald-400/50 scale-102"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={Boolean(img?.startsWith("data:"))}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-xs text-amber-500 dark:text-toy-yellow font-bold">
                  <Star className="w-4 h-4 fill-amber-400 dark:fill-toy-yellow" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-slate-500">({product.reviewsCount || 42})</span>
                </div>
                {product.code && (
                  <span className="font-mono text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700/50">
                    CODE: {product.code}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-fredoka leading-tight">
                {language === "km" ? product.nameKh : product.name}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {language === "km" ? product.bioKh : product.bio}
              </p>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-amber-600 dark:text-toy-yellow font-fredoka">
                  {formatPrice(discountedPrice, currency)}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm line-through text-slate-400 font-bold">
                    {formatPrice(product.price, currency)}
                  </span>
                )}
                <span className="ml-auto text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/40">
                  +{product.pt} Points
                </span>
              </div>

              {/* Specs Badge */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Recommended Age</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{product.ageRecommendation || "Ages 5+"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Dimensions</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{product.dimensions || "Standard Size"}</span>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Quantity:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs active:scale-90 transition-all cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[36px] text-center text-sm sm:text-base font-black font-fredoka text-slate-900 dark:text-white px-2">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setQuantity(quantity + 1);
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs active:scale-90 transition-all cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {product.cat === "bracelet" && (
                <a
                  href="#custom-bracelet-studio"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-toy-yellow/10 dark:hover:bg-toy-yellow/20 border border-amber-300 dark:border-toy-yellow/30 text-amber-800 dark:text-toy-yellow font-black text-xs flex items-center justify-center gap-1.5 transition-all font-fredoka shadow-sm"
                >
                  <span>Build Custom Empty Band in Studio 🔗</span>
                </a>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="w-full py-3.5 px-5 rounded-xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t("addToCart")}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
