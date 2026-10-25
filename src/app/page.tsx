"use client";

import React from "react";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CategoryBentoGrid } from "@/components/CategoryBentoGrid";
import { ProductGrid } from "@/components/ProductGrid";
import { VoucherRewardsHub } from "@/components/VoucherRewardsHub";
import { ConnectedCharmLink } from "@/components/ConnectedCharmLink";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { RewardsModal } from "@/components/RewardsModal";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
import { NotificationToast } from "@/components/NotificationToast";
import { CustomerBar } from "@/components/CustomerBar";
import { CustomerAccountModal } from "@/components/CustomerAccountModal";
import { OrderHistoryModal } from "@/components/OrderHistoryModal";
import { OrderReceiptModal } from "@/components/OrderReceiptModal";
import { AdminLiveStorefrontBar } from "@/components/admin/AdminLiveStorefrontBar";
import { useStore } from "@/context/StoreContext";
import { Sparkles, Trophy, Gift, ArrowRight, ShieldCheck, Heart, Layers, Droplets } from "lucide-react";
import { sounds } from "@/utils/audio";
import styles from "@/styles/ToyEffects.module.css";

export default function HomePage() {
  const { setRewardsModalOpen, charms, t } = useStore();

  const previewCharms = charms && charms.length > 0 ? charms.slice(0, 6) : [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white selection:bg-emerald-600 selection:text-white relative transition-colors duration-200 pb-24 md:pb-28">
      {/* 1. Top Green Moving Marquee Banner */}
      <AnnouncementBar />

      {/* 2. Floating Header Navigation */}
      <Navbar />

      {/* 3. Category Bento Boxes (3 Picture Categories moved to the top) */}
      <CategoryBentoGrid />

      {/* 4. Hero Thumbnail & Interactive Toy Stage (moved to second section) */}
      <HeroSection />

      {/* 5. Main Toy Catalog & Category Arcade */}
      <ProductGrid />

      {/* 5. Separate Italian Modular Charm Bracelet Showcase Section */}
      <section className="py-14 px-4 max-w-7xl mx-auto my-10">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Ambient Lighting & Sheen */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Story & Direct Link */}
            <div className="lg:col-span-7 space-y-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-toy-yellow text-xs font-black uppercase tracking-wider font-fredoka">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dedicated Custom Studio</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-fredoka tracking-tight leading-tight">
                Authentic Italian Modular{" "}
                <span className="bg-gradient-to-r from-toy-yellow via-amber-300 to-emerald-300 bg-clip-text text-transparent">
                  Charm Bracelet
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                Personalize your own waterproof 316L stainless steel bracelet link by link. Choose from Silver, Gold, Rose Gold, and Black Inox finishes with interchangeable spring-hinge charms.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-bold text-slate-200">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>316L Surgical Inox</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Droplets className="w-4 h-4 text-teal-400" />
                  <span>100% Waterproof</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Modular Spring System</span>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Link
                  href="/italy-bracelet"
                  onClick={() => sounds.playFanfare()}
                  className="px-7 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm tracking-wide flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Open Italian Bracelet Studio 🔗</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-xs text-emerald-400 font-bold block sm:inline">
                  From $8.00 base + $1.50/charm
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Ribbon Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold pb-2 border-b border-white/10">
                  <span>Connected Ribbon Preview</span>
                  <span className="text-toy-yellow text-[11px]">✨ Live Inox Links</span>
                </div>

                {/* Connected Charms Preview Ribbon */}
                <div className="flex items-center justify-center overflow-x-auto py-2 scrollbar-none">
                  <div className="flex items-center min-w-max">
                    {previewCharms.map((charm, idx) => (
                      <ConnectedCharmLink
                        key={charm.id || idx}
                        charm={charm}
                        slotIndex={idx}
                        finish="silver"
                        size="preview"
                      />
                    ))}
                    {/* Add blank links to demonstrate modular concept */}
                    {[0, 1].map((bIdx) => (
                      <ConnectedCharmLink
                        key={`blank-${bIdx}`}
                        charm={null}
                        slotIndex={previewCharms.length + bIdx}
                        finish="silver"
                        size="preview"
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center pt-1">
                  <Link
                    href="/italy-bracelet"
                    onClick={() => sounds.playPop()}
                    className="text-xs font-black text-emerald-400 hover:text-emerald-300 underline font-fredoka"
                  >
                    Tap here to assemble custom links in 3D Workshop →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Points-to-Voucher Rewards Exchange Hub */}
      <div id="voucher-hub">
        <VoucherRewardsHub />
      </div>

      {/* 7. VIP Toy Club Rewards Callout Banner */}
      <section className="py-12 px-4 max-w-5xl mx-auto my-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-100 via-green-50 to-teal-100 dark:from-slate-900/95 dark:via-emerald-950/80 dark:to-slate-900/95 border-2 border-emerald-400 dark:border-emerald-500/50 shadow-toy-green-glow text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden transition-colors duration-200">
          {/* Background sparkles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs font-fredoka uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Somphea Reak VIP Club</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-fredoka">
              Earn Rewards & Free Vouchers on Every Drop!
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 max-w-md font-medium">
              Collect 25 points to redeem an instant 10% OFF voucher. Earn points on every confirmed order!
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playFanfare();
              setRewardsModalOpen(true);
            }}
            className="relative z-10 px-7 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm tracking-wide flex items-center gap-2 transition-all hover:scale-105 active:scale-95 flex-shrink-0 hover:from-emerald-400 hover:to-green-500"
          >
            <Gift className="w-4 h-4" />
            <span>Open VIP Club ⭐</span>
          </button>
        </div>
      </section>

      {/* 8. Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <ProductQuickViewModal />
      <CartDrawer />
      <CheckoutModal />
      <RewardsModal />

      {/* Real-time Order Simulation Toast Banner */}
      <NotificationToast />

      {/* Customer Account & Order History Modals */}
      <CustomerAccountModal />
      <OrderHistoryModal />
      <OrderReceiptModal />

      {/* Floating Bottom Customer Bar */}
      <CustomerBar />

      {/* Admin Floating Live Toolbar (active when admin is logged in) */}
      <AdminLiveStorefrontBar />
    </main>
  );
}
