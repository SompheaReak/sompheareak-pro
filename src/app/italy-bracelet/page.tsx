"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { CustomBraceletStudio } from "@/components/CustomBraceletStudio";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { RewardsModal } from "@/components/RewardsModal";
import { NotificationToast } from "@/components/NotificationToast";
import { CustomerAccountModal } from "@/components/CustomerAccountModal";
import { OrderHistoryModal } from "@/components/OrderHistoryModal";
import { OrderReceiptModal } from "@/components/OrderReceiptModal";
import { useStore } from "@/context/StoreContext";
import { sounds } from "@/utils/audio";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Droplets,
  Layers,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Gift,
  Heart,
  ChevronDown,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ItalyBraceletPage() {
  const { t, setRewardsModalOpen } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Can I share my finished bracelet build with a friend?",
      a: "Yes! Once you assemble your bracelet, copy your build code or share link from the studio. Your friend can paste that code into the search bar, click 'Apply Style', and your exact bracelet design will pop up instantly on their screen with identical finish and charms!",
    },
    {
      q: "What is an Italian Modular Charm Bracelet?",
      a: "Unlike traditional dangling charm bracelets, Italian charm bracelets are flat, sleek bands made of individual 9mm rectangular links that interlock side-by-side using spring-loaded internal hinges. They sit flush against your wrist, making them comfortable, snag-free, and stylish.",
    },
    {
      q: "What material is used for the band and charms?",
      a: "Every link and charm is crafted from premium 316L surgical-grade stainless steel (Inox). It is 100% hypoallergenic, waterproof, and tarnish-resistant. You can shower, swim, or exercise without discoloration.",
    },
    {
      q: "Can I rearrange or add more charms later?",
      a: "Yes! That's the beauty of the modular system. Each link hooks into the next with a spring mechanism. You can hook in new charms, swap positions, or add extra blank links anytime.",
    },
    {
      q: "How do I choose the right wrist size?",
      a: "Standard sizes are: 15 links (approx. 14.5–15.5 cm, ideal for kids/slimmer wrists), 17 links (approx. 16.5–17.5 cm, standard unisex fit), and 19 links (approx. 18.5–19.5 cm, relaxed fit). You can also add or remove links anytime to customize fit perfectly.",
    },
    {
      q: "How does delivery work in Cambodia?",
      a: "We hand-assemble each custom bracelet in Phnom Penh. Orders inside Phnom Penh are delivered same-day or next-day. Provincial delivery takes 1–2 days via reliable local express courier. Free delivery on orders over $25!",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white selection:bg-emerald-600 selection:text-white relative transition-colors duration-200 pb-24 md:pb-28">
      {/* 1. Top Green Moving Marquee Banner */}
      <AnnouncementBar />

      {/* 2. Floating Header Navigation */}
      <Navbar />

      {/* 3. Dedicated Hero Section for Italy Bracelet */}
      <section className="relative overflow-hidden pt-6 pb-2 sm:pt-8 sm:pb-4 px-4 max-w-4xl mx-auto text-center">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider font-fredoka shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: "6s" }} />
            <span>AUTHENTIC 9MM ITALIAN MODULAR CHARM SYSTEM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-fredoka tracking-tight">
            DESIGN YOUR{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-toy-yellow dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              ITALIAN CHARM
            </span>{" "}
            BRACELET
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto">
            Assemble your personal story link by link with 316L waterproof surgical stainless steel and interlocking spring notches.
          </p>
        </div>
      </section>

      {/* 4. The Interactive Custom Bracelet Workbench Studio */}
      <CustomBraceletStudio standalone={true} />

      {/* 5. How It Works 3-Step Visual Guide */}
      <section className="py-14 px-4 max-w-6xl mx-auto my-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-fredoka">
            How The Modular System Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-fredoka mt-1">
            Easy As 1, 2, 3
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Every Italian charm link connects through internal spring-loaded slide mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-black font-fredoka text-xl flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white mb-2">
              Select Finish & Band Size
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose from polished Silver Inox, 18K Yellow Gold ion-plate, Rose Gold, or Obsidian Black. Set your length from 15 to 19 links to fit your wrist comfortably.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 font-black font-fredoka text-xl flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white mb-2">
              Snap In Your Favorite Charms
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tap any link slot in the Ribbon Workbench and choose from our curated emblem, cute, anime, and stone charms. Each charm replaces a plain link seamlessly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-black font-fredoka text-xl flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white mb-2">
              Packaged & Delivered to You
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our jewelers in Phnom Penh hand-link each piece to your exact slot sequence. Delivered fast in an eco pouch or optional luxury velvet gift box.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) Accordion */}
      <section className="py-12 px-4 max-w-4xl mx-auto my-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-fredoka uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-fredoka mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => {
                  sounds.playPop();
                  setOpenFaq(openFaq === idx ? null : idx);
                }}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-emerald-500" : "text-slate-400"
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 dark:border-slate-800/80 px-4 sm:px-5 py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Return to Toys Catalog / Shop Other Products CTA Banner */}
      <section className="py-10 px-4 max-w-5xl mx-auto my-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-50 to-green-100 dark:from-slate-900 dark:via-emerald-950/60 dark:to-slate-900 border-2 border-emerald-400/60 dark:border-emerald-500/40 shadow-toy-green-glow flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-fredoka">
              Somphea Reak Toy Collection
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-fredoka">
              Looking for Viral Toys & Minifigures?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-md">
              Explore our full toy catalog with mystery blind boxes, anti-gravity RC racers, and galaxy plushies.
            </p>
          </div>

          <Link
            href="/#toy-catalog"
            onClick={() => sounds.playBounce()}
            className="px-6 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm tracking-wide flex items-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all flex-shrink-0"
          >
            <span>Explore Toy Catalog 🧸</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 8. Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <RewardsModal />
      <NotificationToast />
      <CustomerAccountModal />
      <OrderHistoryModal />
      <OrderReceiptModal />
    </main>
  );
}
