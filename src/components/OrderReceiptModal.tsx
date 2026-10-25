"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { CustomerOrder, OrderStatus, CartItem, Product, CustomBraceletItem, Charm } from "@/types/store";
import { sounds } from "@/utils/audio";
import { formatPrice } from "@/utils/currency";
import {
  X,
  Printer,
  MessageCircle,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Sparkles,
  XCircle,
  Receipt,
  Tag,
  Edit2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";
import { ReceiptBraceletBand } from "./ReceiptBraceletBand";

export const OrderReceiptModal: React.FC = () => {
  const {
    selectedReceiptOrder,
    setSelectedReceiptOrder,
    currency,
    updateOrder,
    products,
    isAdminLoggedIn,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [customItemName, setCustomItemName] = useState<string>("");
  const [customItemPrice, setCustomItemPrice] = useState<string>("");
  const [addMode, setAddMode] = useState<"catalog" | "custom">("catalog");

  useEffect(() => {
    if (selectedReceiptOrder) {
      setEditedItems(selectedReceiptOrder.items);
      setIsEditing(false);
      setSelectedProductId(products[0]?.id || "");
    }
  }, [selectedReceiptOrder, products]);

  if (!selectedReceiptOrder) return null;

  const order = selectedReceiptOrder;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-400 font-fredoka font-black text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Order Confirmed ✓</span>
          </span>
        );
      case "packaging":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-400 font-fredoka font-black text-xs uppercase tracking-wider">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Packaging Toys 📦</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-400 font-fredoka font-black text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4 text-teal-600" />
            <span>On Delivery Route 🚚</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900/80 text-emerald-950 dark:text-white border border-emerald-500 font-fredoka font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Delivered 🎉</span>
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-400 font-fredoka font-black text-xs uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Order Rejected ✕</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-400 font-fredoka font-black text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Verification ⏳</span>
          </span>
        );
    }
  };

  const handlePrint = () => {
    sounds.playPop();
    window.print();
  };

  const telegramInquiryUrl = `https://t.me/Somphea_reak?text=${encodeURIComponent(
    `Hello Somphea Reak! I have an inquiry about my order #${order.orderRef} (${order.customerName}).`
  )}`;

  // Live calculation based on editedItems
  const currentSubtotal = editedItems.reduce((acc, it) => {
    const p = it.product
      ? it.product.price * (1 - (it.product.discount || 0) / 100)
      : it.customBracelet?.unitPrice || 0;
    return acc + p * it.quantity;
  }, 0);
  const currentTotal = Math.max(0, currentSubtotal - order.discountUsd + order.deliveryFeeUsd);
  const currentTotalKhr = Math.round(currentTotal * 4100);
  const currentPoints = Math.round(currentTotal);

  // Helper to extract or construct full bracelet data for any bracelet in the receipt
  const getBraceletData = (item: CartItem): CustomBraceletItem | null => {
    if (item.customBracelet) return item.customBracelet;
    const isBraceletProd =
      item.product?.cat === "bracelet" ||
      (item.product?.name && item.product.name.toLowerCase().includes("bracelet"));
    if (isBraceletProd && item.product) {
      let finish: "silver" | "gold" | "rose" | "black" = "silver";
      const lower = (item.product.name + " " + item.product.bio).toLowerCase();
      if (lower.includes("gold") && !lower.includes("rose")) finish = "gold";
      else if (lower.includes("rose")) finish = "rose";
      else if (lower.includes("black")) finish = "black";

      return {
        id: item.product.id,
        styleId: item.product.code || item.product.id,
        finish,
        sizeLinks: 16,
        charms: [
          {
            slot: 0,
            charm: {
              id: `prod-${item.product.id}`,
              name: item.product.name,
              nameKh: item.product.nameKh,
              price: item.product.price,
              image: item.product.image,
              category: "bracelet",
            } as Charm,
          },
        ],
        packaging: "premium",
        unitPrice: item.product.price,
        quantity: item.quantity,
        points: item.product.pt,
      };
    }
    return null;
  };

  const customBraceletItems = editedItems
    .map((it) => ({ item: it, bracelet: getBraceletData(it) }))
    .filter((x): x is { item: CartItem; bracelet: CustomBraceletItem } => x.bracelet !== null);

  // Edit Handlers
  const handleItemQtyChange = (idx: number, delta: number) => {
    sounds.playPop();
    setEditedItems((prev) => {
      const copy = [...prev];
      const newQty = copy[idx].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== idx);
      }
      copy[idx] = { ...copy[idx], quantity: newQty };
      return copy;
    });
  };

  const handleRemoveItem = (idx: number) => {
    sounds.playPop();
    setEditedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddCatalogProduct = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    sounds.playCharmSnap();

    setEditedItems((prev) => {
      const existing = prev.find((it) => it.product?.id === prod.id);
      if (existing) {
        return prev.map((it) =>
          it.product?.id === prod.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}`,
          product: prod,
          quantity: 1,
        },
      ];
    });
  };

  const handleAddCustomProduct = () => {
    const priceNum = parseFloat(customItemPrice);
    if (!customItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid product name and price");
      return;
    }
    sounds.playCharmSnap();

    const customProd: Product = {
      id: `custom-item-${Date.now()}`,
      code: `MANUAL-${Math.floor(100 + Math.random() * 900)}`,
      name: customItemName.trim(),
      nameKh: customItemName.trim(),
      cat: "custom",
      price: priceNum,
      discount: 0,
      stock: 10,
      pt: Math.round(priceNum),
      image: "/assets/logo.jpg",
      bio: "Manual item added by Admin",
      bioKh: "ទំនិញបន្ថែមដោយ Admin",
    };

    setEditedItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        product: customProd,
        quantity: 1,
      },
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
  };

  const handleSaveReceipt = () => {
    sounds.playFanfare();
    updateOrder(order.id, {
      items: editedItems,
      subtotalUsd: currentSubtotal,
      totalUsd: currentTotal,
      totalKhr: currentTotalKhr,
      pointsEarned: currentPoints,
    });
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    sounds.playPop();
    setEditedItems(order.items);
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md print:bg-white print:p-0 print:static print:inset-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-4 print:text-black print:dark:text-black print:dark:bg-white"
        >
          {/* Top Actions: Edit Toggle and Close */}
          <div className="absolute top-5 right-5 flex items-center gap-2 print:hidden">
            {!isEditing ? (
              <button
                onClick={() => {
                  sounds.playPop();
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700/60 shadow-sm transition-all"
                title="Edit Receipt items and products"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Receipt</span>
              </button>
            ) : (
              <button
                onClick={handleCancelEditing}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-all"
                title="Cancel receipt changes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={() => {
                sounds.playPop();
                setSelectedReceiptOrder(null);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Receipt Header Banner */}
          <div className="text-center pb-5 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden mx-auto mb-2 bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
              <Image src="/assets/logo.jpg" alt="Logo" fill className="object-cover rounded-2xl" />
            </div>

            <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white uppercase tracking-tight">
              Somphea Reak Studio
            </h2>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              Official Purchase Receipt & Tax Voucher
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Street 2004, Phnom Penh, Cambodia · Telegram: @Somphea_reak
            </p>

            {/* Reference & Status */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="font-mono text-base font-black px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white">
                #{order.orderRef}
              </span>
              {getStatusBadge(order.status)}
              {isEditing && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase font-fredoka animate-pulse">
                  Editing Mode ✏️
                </span>
              )}
            </div>
          </div>

          {/* Customer & Delivery Meta Grid */}
          <div className="grid grid-cols-2 gap-3 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Billed & Shipped To</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                {order.customerName}
              </span>
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-500" />
                <span>{order.customerPhone}</span>
              </span>
              {order.telegramHandle && (
                <span className="text-[#229ED9] flex items-center gap-1 font-semibold mt-0.5">
                  <MessageCircle className="w-3 h-3" />
                  <span>{order.telegramHandle}</span>
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Order Meta</span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span className="truncate">{order.province}</span>
              </span>
              <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400 block mt-0.5">
                Payment: {order.paymentMethod.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Full Delivery Address */}
          {order.address && (
            <div className="py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 my-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Exact Address:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{order.address}</span>
              {order.notes && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 block mt-1 font-semibold">
                  Delivery Note: {order.notes}
                </span>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TOP OF RECEIPT: HERO FULL ASSEMBLED BRACELET SHOWCASE */}
          {/* ==================================================== */}
          {customBraceletItems.length > 0 && (
            <div className="my-4 p-3.5 sm:p-5 rounded-3xl bg-slate-900 border-2 border-emerald-500/60 shadow-xl text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black font-fredoka text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                      <span>Full Assembled Italian Modular Bracelet</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                        16–20 Charms
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Crafted in the exact same style, sequence, and finish ordered by {order.customerName}.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-fredoka">
                  Exact Customer Custom Build 🔗
                </span>
              </div>

              <div className="space-y-4">
                {customBraceletItems.map(({ item, bracelet }, bIdx) => (
                  <ReceiptBraceletBand key={`top-hero-bracelet-${bIdx}`} bracelet={bracelet} />
                ))}
              </div>
            </div>
          )}

          {/* Itemized Products List */}
          <div className="py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Purchased Items ({editedItems.length})
              </span>
              {isEditing && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Adjust Qty or Remove Items Below
                </span>
              )}
            </div>

            <div className="space-y-3">
              {editedItems.map((item, idx) => {
                const braceletData = getBraceletData(item);
                const isCustomBracelet = Boolean(braceletData);
                const title =
                  item.product?.name ||
                  (item.customBracelet
                    ? `Custom Italian Modular Bracelet (${item.customBracelet.sizeLinks || 16} links)`
                    : "Item");
                const code = item.product?.code;
                const price = item.product
                  ? item.product.price * (1 - (item.product.discount || 0) / 100)
                  : item.customBracelet?.unitPrice || 0;
                const totalItem = price * item.quantity;
                const image = item.product?.image || "/assets/charm_clean.png";

                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 transition-all shadow-xs space-y-3"
                  >
                    {isCustomBracelet && braceletData ? (
                      /* CUSTOM BRACELET ITEM CARD: Full bracelet band appears ON TOP across full width, NO side picture */
                      <div className="space-y-3">
                        {/* 1. Full Bracelet Display on Top of Item */}
                        <div className="w-full">
                          <ReceiptBraceletBand bracelet={braceletData} compact={false} />
                        </div>

                        {/* 2. Specs, Title, Quantity and Price underneath */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white font-fredoka text-sm sm:text-base leading-tight">
                                {title}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                {braceletData.finish.toUpperCase()} INOX STEEL
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                                {braceletData.packaging === "premium" ? "Velvet Gift Box 🎁" : "Presentation Packaging 📦"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              Custom 9mm Italian modular charm bracelet in 316L waterproof{" "}
                              <span className="font-bold text-slate-900 dark:text-white uppercase">
                                {braceletData.finish} Inox Steel
                              </span>{" "}
                              with personalized charms assembled in customer sequence.
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="font-bold text-slate-800 dark:text-slate-200">${price.toFixed(2)} each</span>
                              <span>•</span>
                              <span>Quantity: <strong className="text-slate-900 dark:text-white">{item.quantity}</strong></span>
                              <span>•</span>
                              <span className="font-black text-amber-600 dark:text-toy-yellow font-fredoka text-xs">
                                Subtotal: ${totalItem.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity controls if editing */}
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                              <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(idx, -1)}
                                  className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:text-rose-500 transition-colors"
                                >
                                  -
                                </button>
                                <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(idx, 1)}
                                  className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:text-emerald-500 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-fredoka font-black text-base text-slate-900 dark:text-white w-16 text-right">
                                ${totalItem.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                                title="Remove item from receipt"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-right flex-shrink-0 self-end sm:self-center font-fredoka font-black text-base text-slate-900 dark:text-white">
                              <span>${totalItem.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* REGULAR PRODUCT ITEM CARD (Toys, Minifigures): Picture on the Side */
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Side Picture for Non-Bracelet Products */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-xs flex items-center justify-center p-1">
                            <Image
                              src={image}
                              alt={title}
                              fill
                              className="object-contain p-0.5"
                              unoptimized={Boolean(image?.startsWith("data:"))}
                            />
                          </div>

                          {/* Product Details right beside side picture */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white font-fredoka text-sm sm:text-base leading-tight">
                                {title}
                              </span>
                              {code && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                                  {code}
                                </span>
                              )}
                              {item.product?.cat && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                  {item.product.cat}
                                </span>
                              )}
                            </div>

                            {item.product?.bio && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                {item.product.bio}
                              </p>
                            )}
                            {item.product?.bioKh && item.product.bioKh !== item.product.bio && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                                {item.product.bioKh}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <span className="font-bold text-slate-800 dark:text-slate-200">${price.toFixed(2)} each</span>
                              <span>•</span>
                              <span>Quantity: <strong className="text-slate-900 dark:text-white">{item.quantity}</strong></span>
                              <span>•</span>
                              <span className="font-black text-amber-600 dark:text-toy-yellow font-fredoka text-xs">
                                Subtotal: ${totalItem.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity controls if editing */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start pt-1 sm:pt-0">
                            <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, -1)}
                                className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:text-rose-500 transition-colors"
                              >
                                -
                              </button>
                              <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, 1)}
                                className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:text-emerald-500 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-fredoka font-black text-base text-slate-900 dark:text-white w-16 text-right">
                              ${totalItem.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                              title="Remove item from receipt"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-right flex-shrink-0 self-end sm:self-start font-fredoka font-black text-base text-slate-900 dark:text-white pt-1 sm:pt-0">
                            <span>${totalItem.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {editedItems.length === 0 && (
                <div className="py-6 text-center text-xs text-rose-500 font-bold border border-dashed border-rose-300 dark:border-rose-900/60 rounded-2xl">
                  No items in this order. Add items below!
                </div>
              )}
            </div>

            {/* Admin Add Product to Receipt Section (Only visible when editing) */}
            {isEditing && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-fredoka flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product to this Receipt</span>
                  </span>
                  <div className="flex gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAddMode("catalog")}
                      className={`px-2 py-0.5 rounded ${
                        addMode === "catalog"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      From Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode("custom")}
                      className={`px-2 py-0.5 rounded ${
                        addMode === "custom"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Custom Item
                    </button>
                  </div>
                </div>

                {addMode === "catalog" ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code ? `[${p.code}] ` : ""}
                          {p.name} — ${p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCatalogProduct}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Spare Link / Battery)"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="$ Price"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Financial Breakdown Table */}
          <div className="pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-bold">${currentSubtotal.toFixed(2)}</span>
            </div>

            {order.discountUsd > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Voucher Discount {order.voucherCodeApplied ? `(${order.voucherCodeApplied})` : ""}:</span>
                </span>
                <span>-${order.discountUsd.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Delivery Fee:</span>
              <span className="font-bold">
                {order.deliveryFeeUsd === 0 ? "FREE" : `$${order.deliveryFeeUsd.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-800 font-fredoka">
              <span className="text-base font-black text-slate-900 dark:text-white">Total Amount:</span>
              <div className="text-right">
                <span className="text-xl font-black text-amber-600 dark:text-toy-yellow block">
                  ${currentTotal.toFixed(2)} USD
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  ≈ {currentTotalKhr.toLocaleString()} KHR
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
              <span>VIP Loyalty Points Earned:</span>
              <span>+{currentPoints} VIP pt</span>
            </div>
          </div>

          {/* Action Buttons: Save/Cancel when editing, or Telegram/Print when viewing */}
          {isEditing ? (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 print:hidden">
              <button
                type="button"
                onClick={handleSaveReceipt}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs font-fredoka flex items-center justify-center gap-2 shadow-toy-green-glow transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes to Receipt 💾</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEditing}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 print:hidden">
              <a
                href={telegramInquiryUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-black text-xs font-fredoka flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Inquire on Telegram</span>
              </a>

              <button
                onClick={handlePrint}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs font-fredoka flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
