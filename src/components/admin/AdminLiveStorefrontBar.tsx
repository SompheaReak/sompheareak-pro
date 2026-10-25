"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { Product, ToyRarity } from "@/types/store";
import { sounds } from "@/utils/audio";
import {
  ShieldCheck,
  Edit3,
  Sliders,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layout,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";

const PRESET_TOY_IMAGES = [
  { label: "Cyber Mecha", url: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80" },
  { label: "Pop Bear Mystery", url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80" },
  { label: "Wall Climber RC", url: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80" },
  { label: "Galaxy Plushie", url: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=800&q=80" },
  { label: "Magna-Builder Blocks", url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80" },
  { label: "Crystal DIY Science", url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80" },
];

export const AdminLiveStorefrontBar: React.FC = () => {
  const {
    isAdminLoggedIn,
    isLiveEditMode,
    setLiveEditMode,
    storefrontConfig,
    updateStorefrontConfig,
    editingDirectProduct,
    setEditingDirectProduct,
    updateProduct,
    copyModalOpen,
    setCopyModalOpen,
  } = useStore();

  // Copy modal form state
  const [announcementInput, setAnnouncementInput] = useState(storefrontConfig?.announcementText || "");
  const [badgeInput, setBadgeInput] = useState(storefrontConfig?.heroBadge || "");
  const [prefixInput, setPrefixInput] = useState(storefrontConfig?.heroTitlePrefix || "");
  const [highlightInput, setHighlightInput] = useState(storefrontConfig?.heroTitleHighlight || "");
  const [suffixInput, setSuffixInput] = useState(storefrontConfig?.heroTitleSuffix || "");
  const [subtitleInput, setSubtitleInput] = useState(storefrontConfig?.heroSubtitle || "");

  // Direct product form state
  const [pName, setPName] = useState("");
  const [pNameKh, setPNameKh] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pDiscount, setPDiscount] = useState("");
  const [pStock, setPStock] = useState("");
  const [pPt, setPPt] = useState("");
  const [pImage, setPImage] = useState("");
  const [pBio, setPBio] = useState("");

  // Sync direct product fields when selected
  React.useEffect(() => {
    if (editingDirectProduct) {
      setPName(editingDirectProduct.name);
      setPNameKh(editingDirectProduct.nameKh || editingDirectProduct.name);
      setPPrice(editingDirectProduct.price.toString());
      setPDiscount(editingDirectProduct.discount.toString());
      setPStock(editingDirectProduct.stock.toString());
      setPPt(editingDirectProduct.pt.toString());
      setPImage(editingDirectProduct.image);
      setPBio(editingDirectProduct.bio);
    }
  }, [editingDirectProduct]);

  // Sync copy fields whenever modal opens
  React.useEffect(() => {
    if (copyModalOpen && storefrontConfig) {
      setAnnouncementInput(storefrontConfig.announcementText || "");
      setBadgeInput(storefrontConfig.heroBadge || "");
      setPrefixInput(storefrontConfig.heroTitlePrefix || "");
      setHighlightInput(storefrontConfig.heroTitleHighlight || "");
      setSuffixInput(storefrontConfig.heroTitleSuffix || "");
      setSubtitleInput(storefrontConfig.heroSubtitle || "");
    }
  }, [copyModalOpen, storefrontConfig]);

  // Sync copy fields when modal opens
  const handleOpenCopyModal = () => {
    sounds.playPop();
    setAnnouncementInput(storefrontConfig.announcementText);
    setBadgeInput(storefrontConfig.heroBadge);
    setPrefixInput(storefrontConfig.heroTitlePrefix);
    setHighlightInput(storefrontConfig.heroTitleHighlight);
    setSuffixInput(storefrontConfig.heroTitleSuffix);
    setSubtitleInput(storefrontConfig.heroSubtitle);
    setCopyModalOpen(true);
  };

  const handleSaveCopy = (e: React.FormEvent) => {
    e.preventDefault();
    updateStorefrontConfig({
      announcementText: announcementInput.trim(),
      heroBadge: badgeInput.trim(),
      heroTitlePrefix: prefixInput.trim(),
      heroTitleHighlight: highlightInput.trim(),
      heroTitleSuffix: suffixInput.trim(),
      heroSubtitle: subtitleInput.trim(),
    });
    sounds.playFanfare();
    setCopyModalOpen(false);
  };

  const handleSaveDirectProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDirectProduct) return;

    updateProduct(editingDirectProduct.id, {
      name: pName.trim(),
      nameKh: pNameKh.trim() || pName.trim(),
      price: parseFloat(pPrice) || editingDirectProduct.price,
      discount: parseInt(pDiscount, 10) || 0,
      stock: parseInt(pStock, 10) || 10,
      pt: parseInt(pPt, 10) || 4,
      image: pImage,
      bio: pBio.trim(),
    });

    sounds.playFanfare();
    setEditingDirectProduct(null);
  };

  // Only render if owner is logged in
  if (!isAdminLoggedIn) return null;

  return (
    <>
      {/* Top Banner when Live Edit is Active */}
      {isLiveEditMode && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white text-xs font-black py-2 px-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
              <span>🛠️ STOREFRONT DIRECT EDIT MODE ACTIVE — Click any &apos;✏️ Edit&apos; button on cards or banners to modify live!</span>
            </span>

            <button
              onClick={() => {
                sounds.playPop();
                setLiveEditMode(false);
              }}
              className="text-white hover:text-amber-200 underline text-xs font-bold whitespace-nowrap ml-4"
            >
              Exit Edit Mode
            </button>
          </div>
        </div>
      )}

      {/* Floating Toolbar for Store Owner (placed above CustomerBar with safe area) */}
      <div className="fixed bottom-16 sm:bottom-20 inset-x-0 z-40 flex justify-center pointer-events-none px-2 sm:px-4 pb-[env(safe-area-inset-bottom,0px)]">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/95 border-2 border-emerald-500/80 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 shadow-2xl backdrop-blur-md text-white flex items-center gap-2 sm:gap-3.5 max-w-[95vw] overflow-x-auto scrollbar-none"
        >
          {/* Owner Shield */}
          <div className="flex items-center gap-1.5 text-xs font-black font-fredoka text-emerald-400 border-r border-slate-700 pr-2 sm:pr-3 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Owner Mode</span>
          </div>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => {
              sounds.playPop();
              setLiveEditMode(!isLiveEditMode);
            }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-black font-fredoka flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 ${
              isLiveEditMode
                ? "bg-emerald-500 text-slate-950 shadow-toy-green-glow"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Direct Edit: {isLiveEditMode ? "ON" : "OFF"}</span>
          </button>

          {/* Edit Hero & Banner */}
          <button
            onClick={handleOpenCopyModal}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0"
            title="Edit Storefront Banner & Hero Titles"
          >
            <Layout className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Edit Banner & Hero</span>
          </button>

          {/* Return to Admin Dashboard */}
          <Link
            href="/admin"
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-xs font-fredoka flex items-center gap-1 transition-all shadow-toy-green-glow flex-shrink-0 whitespace-nowrap"
          >
            <span>Admin</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: DIRECT PRODUCT INLINE EDITOR                */}
      {/* ==================================================== */}
      <AnimatePresence>
        {editingDirectProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setEditingDirectProduct(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase mb-1">
                <Edit3 className="w-4 h-4" />
                <span>Live In-Store Direct Editor</span>
              </div>
              <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white mb-4">
                Modify Toy: {editingDirectProduct.name}
              </h2>

              <form onSubmit={handleSaveDirectProduct} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Toy Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Toy Name (Khmer)
                  </label>
                  <input
                    type="text"
                    value={pNameKh}
                    onChange={(e) => setPNameKh(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={pDiscount}
                      onChange={(e) => setPDiscount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      VIP Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={pPt}
                      onChange={(e) => setPPt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none mb-1.5"
                  />
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_TOY_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPImage(img.url)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap border ${
                          pImage === img.url
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={pBio}
                    onChange={(e) => setPBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Toy Live on Storefront</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL 2: DIRECT BANNER & HERO COPY EDITOR            */}
      {/* ==================================================== */}
      <AnimatePresence>
        {copyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setCopyModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase mb-1">
                <Layout className="w-4 h-4" />
                <span>Storefront Direct Text Editor</span>
              </div>
              <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white mb-4">
                Edit Top Announcement & Hero Copy
              </h2>

              <form onSubmit={handleSaveCopy} className="space-y-4">
                {/* Announcement Bar */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Top Announcement Ticker Text
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    placeholder="Announcement message..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Hero Badge */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hero Badge Label
                  </label>
                  <input
                    type="text"
                    value={badgeInput}
                    onChange={(e) => setBadgeInput(e.target.value)}
                    placeholder="e.g. 🔥 TOP DROPS OF 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Hero Title Parts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Title Prefix
                    </label>
                    <input
                      type="text"
                      value={prefixInput}
                      onChange={(e) => setPrefixInput(e.target.value)}
                      placeholder="THE ULTIMATE"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Title Highlight
                    </label>
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      placeholder="TOY & CHARM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Title Suffix
                    </label>
                    <input
                      type="text"
                      value={suffixInput}
                      onChange={(e) => setSuffixInput(e.target.value)}
                      placeholder="UNIVERSE"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Hero Subtitle */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={subtitleInput}
                    onChange={(e) => setSubtitleInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Storefront Live</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
