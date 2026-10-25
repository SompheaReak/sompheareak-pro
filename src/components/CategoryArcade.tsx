"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import { motion } from "framer-motion";

export const CategoryArcade: React.FC = () => {
  const { products, categories, selectedCategory, setSelectedCategory, language, t } = useStore();

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return products.length;
    if (catId === "toy") {
      return products.filter(
        (p) =>
          p.cat === "toy" ||
          p.cat === "toy-universe" ||
          p.cat === "tech-toys" ||
          p.cat === "blind-box" ||
          p.cat === "plushies"
      ).length;
    }
    return products.filter((p) => p.cat === catId).length;
  };

  const displayCategories = categories && categories.length > 0 ? categories : [];

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-fredoka flex items-center gap-2">
          <span>🎮</span>
          <span>{t("categories")}</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          {products.length} toys in universe
        </span>
      </div>

      {/* Chunky Arcade Category Chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none">
        {displayCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playPop();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-sm transition-all whitespace-nowrap border-2 select-none font-fredoka ${
                isSelected
                  ? `bg-gradient-to-r ${cat.grad} text-white border-white/40 shadow-toy-glow scale-102`
                  : "bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 shadow-sm"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{language === "km" ? cat.kh : cat.name}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? "bg-black/30 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
