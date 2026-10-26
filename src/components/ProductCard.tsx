"use client";

import React, { useState } from "react";
import { Product } from "@/types/store";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import { formatPrice, formatDiscountPrice } from "@/utils/currency";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Box, Sparkles, Star, ChevronLeft, ChevronRight, Images } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    setQuickViewProduct,
    currency,
    language,
    t,
  } = useStore();
  const prices = formatDiscountPrice(product.price, product.discount, currency);

  const productImages =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    setActiveImageIdx((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  const rarityColors = {
    Common: "bg-slate-700/80 text-slate-200 border-slate-600",
    Rare: "bg-blue-600/90 text-blue-100 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
    "Super Rare": "bg-purple-600/90 text-purple-100 border-purple-400 shadow-toy-glow",
    Legendary: "bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]",
    "Limited Edition": "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
  };

  const rarityHoverBorders = {
    Common: "hover:border-slate-300 dark:hover:border-slate-700",
    Rare: "hover:border-cyan-400 dark:hover:border-toy-cyan hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    "Super Rare": "hover:border-purple-400 dark:hover:border-toy-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]",
    Legendary: "hover:border-amber-400 dark:hover:border-toy-yellow hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]",
    "Limited Edition": "hover:border-rose-400 dark:hover:border-toy-pink hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`group relative bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-toy-card transition-all flex flex-col justify-between overflow-hidden ${
        product.rarity ? rarityHoverBorders[product.rarity] : "hover:border-emerald-500"
      }`}
    >
      {/* Top Badges (Responsive for 2-column mobile layout) */}
      <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 flex flex-col gap-1 pointer-events-none">
        {product.discount > 0 && (
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-toy-pink text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wider shadow-md">
            -{product.discount}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow animate-pulse">
            ⚡ VIRAL
          </span>
        )}
        {product.rarity && (
          <span
            className={`px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${
              rarityColors[product.rarity] || "bg-slate-800 text-slate-200"
            }`}
          >
            {product.rarity}
          </span>
        )}
      </div>

      {/* Product Image Thumbnail with Left/Right Sideway Gallery Navigation */}
      <div
        onClick={() => {
          sounds.playPop();
          setQuickViewProduct(product);
        }}
        className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950/50 cursor-pointer mb-2 sm:mb-3 border border-slate-200/60 dark:border-transparent group/img select-none"
      >
        <Image
          src={productImages[activeImageIdx] || product.image}
          alt={`${product.name} photo ${activeImageIdx + 1}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-all duration-300 ease-out"
          unoptimized={Boolean(productImages[activeImageIdx]?.startsWith("data:"))}
        />

        {/* Multiple Photos Count Badge */}
        {productImages.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
            <Images className="w-3 h-3 text-emerald-400" />
            <span>
              {activeImageIdx + 1}/{productImages.length}
            </span>
          </div>
        )}

        {/* Left / Right Navigation Buttons (Side-way scroll) - Enhanced Fitts's Law Touch Targets */}
        {productImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white shadow-md flex items-center justify-center opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition-opacity border border-slate-200 dark:border-slate-700 active:scale-90"
              title="Previous photo"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white shadow-md flex items-center justify-center opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition-opacity border border-slate-200 dark:border-slate-700 active:scale-90"
              title="Next photo"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dot Pagination indicators with generous tap target padding */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-xs">
              {productImages.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop();
                    setActiveImageIdx(dotIdx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    dotIdx === activeImageIdx
                      ? "bg-white w-4 scale-105"
                      : "bg-white/50 hover:bg-white/80 w-2"
                  }`}
                  title={`View photo ${dotIdx + 1}`}
                  aria-label={`View photo ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-lg">
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
            <span>{t("quickView")}</span>
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating & Points Tag & Product Code */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 dark:text-toy-yellow font-bold">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 dark:fill-toy-yellow" />
                <span>{product.rating || 4.9}</span>
              </div>
              {product.code && (
                <span className="font-mono text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {product.code}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/40">
              +{product.pt} pt
            </span>
          </div>

          <h3
            onClick={() => {
              sounds.playPop();
              setQuickViewProduct(product);
            }}
            className="text-xs sm:text-base font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-fredoka line-clamp-1 cursor-pointer"
          >
            {language === "km" ? product.nameKh : product.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
            {language === "km" ? product.bioKh : product.bio}
          </p>
        </div>

        {/* Pricing & Add to Cart (Fit perfectly on 2-col mobile) */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 sm:gap-2">
          <div className="min-w-0">
            <div className="text-sm sm:text-lg font-black text-amber-600 dark:text-toy-yellow font-fredoka leading-none truncate">
              {prices.discounted}
            </div>
            {product.discount > 0 && (
              <div className="text-[9px] sm:text-[11px] line-through text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                {prices.original}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Add to Cart button - Optimized Fitts's Law Target Size */}
            <button
              onClick={() => addToCart(product, 1)}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all shadow-toy-green-glow border-b-2 border-emerald-900 flex items-center justify-center gap-1.5 font-fredoka text-xs sm:text-xs select-none cursor-pointer"
              title={t("addToCart")}
              aria-label={t("addToCart")}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">{t("addToCart")}</span>
              <span className="sm:hidden">+Cart</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
