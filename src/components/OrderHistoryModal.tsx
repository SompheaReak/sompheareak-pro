"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { CustomerOrder, OrderStatus } from "@/types/store";
import { sounds } from "@/utils/audio";
import {
  X,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Sparkles,
  XCircle,
  ArrowRight,
  Phone,
  User,
  ShoppingBag,
} from "lucide-react";

export const OrderHistoryModal: React.FC = () => {
  const {
    orders,
    customerUser,
    orderHistoryModalOpen,
    setOrderHistoryModalOpen,
    setSelectedReceiptOrder,
    setAccountModalOpen,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!orderHistoryModalOpen) return null;

  // Filter orders based on customerUser profile or search term
  const filteredOrders = orders.filter((ord) => {
    // If search term entered, search across ref, phone, name
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchRef = ord.orderRef.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone.includes(q);
      const matchName = ord.customerName.toLowerCase().includes(q);
      if (!matchRef && !matchPhone && !matchName) return false;
    } else if (customerUser) {
      // If no search term and customer is logged in, show their orders
      const userPhone = customerUser.phone.trim();
      const userName = customerUser.name.toLowerCase().trim();
      const matchesPhone = userPhone && ord.customerPhone.includes(userPhone);
      const matchesName = userName && ord.customerName.toLowerCase().includes(userName);
      if (!matchesPhone && !matchesName) return false;
    }

    // Status filter
    if (statusFilter !== "all" && ord.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case "packaging":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1">
            <Package className="w-3 h-3 text-indigo-600" />
            <span>Packaging</span>
          </span>
        );
      case "shipped":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1">
            <Truck className="w-3 h-3 text-teal-600" />
            <span>Shipped</span>
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/80 text-emerald-950 dark:text-white font-bold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Delivered</span>
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sounds.playPop();
              setOrderHistoryModalOpen(false);
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                Order History & Receipts
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {customerUser
                ? `Showing order history for ${customerUser.name} (${customerUser.phone})`
                : "Search by your Order Reference (e.g. SR-8491) or Phone Number to check receipts."}
            </p>
          </div>

          {/* Search bar & Status filters */}
          <div className="space-y-3 mb-5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Order #REF, Phone, or Customer Name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {["all", "pending", "confirmed", "packaging", "shipped", "delivered", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    sounds.playPop();
                    setStatusFilter(st);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <Receipt className="w-12 h-12 mx-auto text-slate-400" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No orders match your search
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {customerUser
                  ? "You don't have any orders matching this filter. Place your first toy drop order now!"
                  : "Try entering your exact phone number or order reference (e.g. SR-8491), or sign in with your account."}
              </p>
              {!customerUser && (
                <button
                  onClick={() => {
                    sounds.playPop();
                    setAccountModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md mt-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In with Account</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => {
                const itemCount = ord.items.reduce((s, it) => s + it.quantity, 0);

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-emerald-500/50"
                  >
                    {/* Top Order Summary Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">
                            #{ord.orderRef}
                          </span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span>Placed on {new Date(ord.createdAt).toLocaleDateString()}</span> ·{" "}
                          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                          <div className="text-base font-black font-fredoka text-amber-600 dark:text-toy-yellow">
                            ${ord.totalUsd.toFixed(2)} USD
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sounds.playFanfare();
                            setSelectedReceiptOrder(ord);
                          }}
                          className="py-2 px-3.5 rounded-xl font-black text-xs font-fredoka text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Receipt 🧾</span>
                        </button>
                      </div>
                    </div>

                    {/* Products in this Order (Picture beside Description) */}
                    <div className="space-y-2 pt-1">
                      {ord.items.map((item, itIdx) => {
                        const itemImg = item.product
                          ? item.product.image
                          : item.customBracelet?.charms[0]?.charm.image || "/assets/charm_clean.png";
                        const itemPrice = item.product ? item.product.price : item.customBracelet?.unitPrice || 0;
                        const title = item.product
                          ? item.product.name
                          : `Custom Italian Bracelet (${item.customBracelet?.sizeLinks} Links)`;
                        const desc = item.product?.bio
                          ? item.product.bio
                          : item.customBracelet
                          ? `Custom 9mm modular charm bracelet in ${item.customBracelet.finish.toUpperCase()} Inox (${item.customBracelet.charms.length} charms).`
                          : "";

                        return (
                          <div
                            key={itIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3 text-xs shadow-2xs"
                          >
                            {/* Product Picture */}
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center p-1">
                              <Image
                                src={itemImg}
                                alt={title}
                                fill
                                className="object-contain p-0.5"
                                unoptimized={Boolean(itemImg?.startsWith("data:"))}
                              />
                            </div>

                            {/* Description & Details beside Picture */}
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-bold text-slate-900 dark:text-white truncate font-fredoka text-xs sm:text-sm">
                                  {title}
                                </h5>
                                <span className="font-bold text-slate-900 dark:text-white font-mono text-xs flex-shrink-0">
                                  ${(itemPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>

                              {desc && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                                  {desc}
                                </p>
                              )}

                              <div className="text-[10px] text-slate-400 font-medium">
                                Qty: {item.quantity} × ${itemPrice.toFixed(2)} each
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
