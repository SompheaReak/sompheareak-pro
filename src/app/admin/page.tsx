"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { Product, CustomerOrder, OrderStatus, Voucher, ToyRarity, Charm, CategoryBox, Category } from "@/types/store";
import { formatPrice } from "@/utils/currency";
import { sounds } from "@/utils/audio";
import { ConnectedCharmLink } from "@/components/ConnectedCharmLink";
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Package,
  ShoppingBag,
  DollarSign,
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  ExternalLink,
  SlidersHorizontal,
  Filter,
  Tag,
  Sun,
  Moon,
  MessageCircle,
  Phone,
  MapPin,
  X,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpRight,
  LogOut,
  RefreshCw,
  Bell,
  Database,
  Volume2,
  Send,
  XCircle,
  Receipt,
  Upload,
  Dices,
  Images,
  Check,
} from "lucide-react";
import { OrderReceiptModal } from "@/components/OrderReceiptModal";
import { CustomBraceletStudio } from "@/components/CustomBraceletStudio";
import { ReceiptBraceletBand } from "@/components/ReceiptBraceletBand";
import { getCharmCode, generateUniqueCharmCode } from "@/data/charms";

export interface BulkPhotoItem {
  tempId: string;
  code: string;
  name: string;
  nameKh: string;
  cat: string;
  price: string;
  discount: string;
  stock: string;
  pt: string;
  rarity: ToyRarity;
  image: string;
  fileName: string;
}

const VALID_PASSWORDS = [
  "Sompheareakshop1234",
  "Sompheareak.com-Admin04/10/2026-Ming",
  process.env.NEXT_PUBLIC_ADMIN_PIN,
].filter(Boolean) as string[];

const ADMIN_PASSWORD = "Sompheareakshop1234";

const PRESET_TOY_IMAGES = [
  { label: "Cyber Mecha", url: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80" },
  { label: "Pop Bear Mystery", url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80" },
  { label: "Wall Climber RC", url: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80" },
  { label: "Galaxy Plushie", url: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=800&q=80" },
  { label: "Magna-Builder Blocks", url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80" },
  { label: "Crystal DIY Science", url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80" },
  { label: "Solar System Hologram", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" },
  { label: "Astronaut Minifigure", url: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=800&q=80" },
];

export default function AdminPage() {
  const {
    products,
    addProduct,
    bulkAddProducts,
    updateProduct,
    deleteProduct,
    wipeAllProducts,
    charms,
    addCharm,
    updateCharm,
    deleteCharm,
    clearCharms,
    orders,
    updateOrderStatus,
    deleteOrder,
    saveOrder,
    vouchers,
    addVoucher,
    deleteVoucher,
    categoryBoxes,
    addCategoryBox,
    updateCategoryBox,
    deleteCategoryBox,
    resetCategoryBoxes,
    reorderCategoryBoxes,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetCategories,
    currency,
    themeMode,
    toggleTheme,
    setSelectedReceiptOrder,
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [shakeLogin, setShakeLogin] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "vouchers" | "charms" | "bracelet_studio" | "category_boxes" | "categories"
  >("products");

  // Product Filters / Categories Modal State & Form Fields
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catId, setCatId] = useState<string>("");
  const [catName, setCatName] = useState<string>("");
  const [catNameKh, setCatNameKh] = useState<string>("");
  const [catIcon, setCatIcon] = useState<string>("🏷️");
  const [catGrad, setCatGrad] = useState<string>("from-emerald-500 to-teal-600");
  const [catSortOrder, setCatSortOrder] = useState<number>(0);
  const [catDescription, setCatDescription] = useState<string>("");

  // Category Bento Boxes Modal State & Form Fields
  const [boxModalOpen, setBoxModalOpen] = useState<boolean>(false);
  const [editingBox, setEditingBox] = useState<CategoryBox | null>(null);
  const [bTitle, setBTitle] = useState<string>("");
  const [bTitleKh, setBTitleKh] = useState<string>("");
  const [bSubtitle, setBSubtitle] = useState<string>("");
  const [bImage, setBImage] = useState<string>("/assets/categories/custom-bracelet.jpg");
  const [bActionType, setBActionType] = useState<"link" | "category">("category");
  const [bActionValue, setBActionValue] = useState<string>("minifigure");
  const [bSpan, setBSpan] = useState<"full" | "half">("half");
  const [bBadge, setBBadge] = useState<string>("HOT 🔥");
  const [bActive, setBActive] = useState<boolean>(true);
  const [bOrder, setBOrder] = useState<number>(1);

  // Charm Filters & Modal State
  const [charmSearch, setCharmSearch] = useState<string>("");
  const [charmCatFilter, setCharmCatFilter] = useState<string>("all");
  const [charmModalOpen, setCharmModalOpen] = useState<boolean>(false);
  const [editingCharm, setEditingCharm] = useState<Charm | null>(null);

  // Charm Form Fields - strictly empty defaults so uploaded photo is always used
  const [cCode, setCCode] = useState("");
  const [cName, setCName] = useState("");
  const [cNameKh, setCNameKh] = useState("");
  const [cCat, setCCat] = useState("emblem");
  const [cPrice, setCPrice] = useState("1.50");
  const [cImage, setCImage] = useState("");
  const [cPlateImage, setCPlateImage] = useState("");
  const [cIsPopular, setCIsPopular] = useState<boolean>(true);
  const [cDescription, setCDescription] = useState("");
  const [isGeneratingCutout, setIsGeneratingCutout] = useState<boolean>(false);

  // Product Filters & Modal State
  const [productSearch, setProductSearch] = useState<string>("");
  const [productCatFilter, setProductCatFilter] = useState<string>("all");
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ==========================================
  // BULK UPLOAD STATE & HELPERS
  // ==========================================
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
  const [bulkRawText, setBulkRawText] = useState<string>("");
  const [bulkReplaceMode, setBulkReplaceMode] = useState<boolean>(false);
  const [bulkParsedProducts, setBulkParsedProducts] = useState<
    Array<Partial<Product> & { _valid: boolean; _errors: string[] }>
  >([]);
  const [bulkFileError, setBulkFileError] = useState<string>("");
  const [bulkIsSubmitting, setBulkIsSubmitting] = useState<boolean>(false);

  // Multi-Photo Bulk Upload State (1 Photo = 1 Product)
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [bulkModalTab, setBulkModalTab] = useState<"photos" | "csv">("photos");
  const [bulkPhotoItems, setBulkPhotoItems] = useState<BulkPhotoItem[]>([]);
  const [bulkGlobalCat, setBulkGlobalCat] = useState<string>("minifigure");
  const [bulkGlobalPrice, setBulkGlobalPrice] = useState<string>("9.50");
  const [bulkGlobalStock, setBulkGlobalStock] = useState<string>("20");
  const [bulkIsProcessingImages, setBulkIsProcessingImages] = useState<boolean>(false);

  // Parse CSV line handling quoted commas
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if ((char === "," || char === "\t" || char === ";") && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parseBulkInput = (text: string) => {
    setBulkFileError("");
    const trimmed = text.trim();
    if (!trimmed) {
      setBulkParsedProducts([]);
      return;
    }

    // Try JSON array first
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          const parsed = json.map((item: any, idx: number) => {
            const errors: string[] = [];
            const name = String(item.name || item.title || item.product_name || "").trim();
            if (!name) errors.push("Missing product name");
            const price = Number(item.price || item.cost || item.priceUsd) || 0;
            if (price <= 0) errors.push("Price must be > $0");

            return {
              id: item.id || `toy-${Date.now()}-${idx}`,
              code: String(item.code || item.sku || `SPK-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
              name: name || "Untitled Product",
              nameKh: String(item.nameKh || item.khmerName || name || "ផលិតផល").trim(),
              cat: String(item.cat || item.category || "minifigure").trim(),
              price: price || 5.0,
              discount: Number(item.discount) || 0,
              stock: Number(item.stock || item.quantity) || 10,
              pt: Number(item.pt || item.points) || 4,
              image: String(item.image || item.imageUrl || "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80").trim(),
              images: Array.isArray(item.images) ? item.images : [item.image || "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80"],
              bio: String(item.bio || item.description || "Fun toy collectible.").trim(),
              bioKh: String(item.bioKh || item.descriptionKh || "ប្រដាប់ក្មេងលេងគុណភាពខ្ពស់។").trim(),
              rarity: (item.rarity as ToyRarity) || "Rare",
              dimensions: String(item.dimensions || "10cm x 8cm").trim(),
              _valid: errors.length === 0,
              _errors: errors,
            };
          });
          setBulkParsedProducts(parsed);
          return;
        }
      } catch {
        // Not JSON, continue to CSV
      }
    }

    // Parse CSV / TSV lines
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setBulkParsedProducts([]);
      return;
    }

    const firstLineCells = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const hasHeader = firstLineCells.some((h) => ["name", "title", "code", "sku", "price"].includes(h));

    let headerMap: { [key: string]: number } = {};
    let dataLines = lines;

    if (hasHeader) {
      firstLineCells.forEach((h, idx) => {
        if (h.includes("namekh") || h.includes("khmer")) headerMap["nameKh"] = idx;
        else if (h.includes("name") || h.includes("title")) headerMap["name"] = idx;
        else if (h.includes("code") || h.includes("sku")) headerMap["code"] = idx;
        else if (h.includes("cat")) headerMap["cat"] = idx;
        else if (h.includes("price") || h.includes("cost")) headerMap["price"] = idx;
        else if (h.includes("disc")) headerMap["discount"] = idx;
        else if (h.includes("stock") || h.includes("qty")) headerMap["stock"] = idx;
        else if (h.includes("point") || h.includes("pt")) headerMap["pt"] = idx;
        else if (h.includes("img") || h.includes("image") || h.includes("photo")) headerMap["image"] = idx;
        else if (h.includes("biokh") || h.includes("desckh")) headerMap["bioKh"] = idx;
        else if (h.includes("bio") || h.includes("desc")) headerMap["bio"] = idx;
        else if (h.includes("rarity")) headerMap["rarity"] = idx;
        else if (h.includes("dim")) headerMap["dimensions"] = idx;
      });
      dataLines = lines.slice(1);
    } else {
      headerMap = {
        code: 0,
        name: 1,
        nameKh: 2,
        cat: 3,
        price: 4,
        discount: 5,
        stock: 6,
        pt: 7,
        image: 8,
        bio: 9,
        bioKh: 10,
      };
    }

    const parsed = dataLines.map((line, idx) => {
      const cells = parseCsvLine(line);
      const getVal = (field: string) => {
        const cIdx = headerMap[field];
        return cIdx !== undefined && cells[cIdx] !== undefined ? cells[cIdx] : "";
      };

      const name = getVal("name").trim();
      const priceStr = getVal("price").replace(/[^0-9.]/g, "");
      const price = parseFloat(priceStr) || 0;
      const errors: string[] = [];
      if (!name) errors.push("Missing product name");
      if (price <= 0) errors.push("Invalid price");

      const code = getVal("code").trim() || `SPK-${Math.floor(1000 + Math.random() * 9000)}`;
      const nameKh = getVal("nameKh").trim() || name || "ផលិតផល";
      const cat = getVal("cat").trim() || "minifigure";
      const discount = parseInt(getVal("discount"), 10) || 0;
      const stock = parseInt(getVal("stock"), 10) || 15;
      const pt = parseInt(getVal("pt"), 10) || 4;
      const image = getVal("image").trim() || "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80";
      const bio = getVal("bio").trim() || "Fun collectible toy.";
      const bioKh = getVal("bioKh").trim() || "ប្រដាប់ក្មេងលេងគុណភាពខ្ពស់។";
      const rarity = (getVal("rarity").trim() as ToyRarity) || "Rare";
      const dimensions = getVal("dimensions").trim() || "10cm x 8cm";

      return {
        id: `toy-${Date.now()}-${idx}`,
        code,
        name: name || "Untitled Product",
        nameKh,
        cat,
        price: price || 5.0,
        discount,
        stock,
        pt,
        image,
        images: [image],
        bio,
        bioKh,
        rarity,
        dimensions,
        _valid: errors.length === 0,
        _errors: errors,
      };
    });

    setBulkParsedProducts(parsed);
  };

  const handleOpenBulkUpload = () => {
    sounds.playPop();
    setBulkFileError("");
    setBulkModalTab("photos");
    setBulkModalOpen(true);
  };

  // Direct trigger device file selector for bulk photos (1 Photo = 1 Product)
  const handleTriggerBulkPhotoUpload = () => {
    try {
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = "";
        bulkFileInputRef.current.click();
      } else {
        setBulkModalTab("photos");
        setBulkModalOpen(true);
      }
    } catch {
      setBulkModalTab("photos");
      setBulkModalOpen(true);
    }
    sounds.playPop();
  };

  const handleOpenBulkPhotoUpload = () => {
    sounds.playPop();
    if (bulkPhotoItems.length > 0) {
      setBulkFileError("");
      setBulkModalTab("photos");
      setBulkModalOpen(true);
    } else {
      handleTriggerBulkPhotoUpload();
    }
  };

  // Convert raw image filename like 'goku_super_saiyan.png' to 'Goku Super Saiyan'
  const formatFilenameToName = (filename: string): string => {
    const withoutExt = filename.replace(/\.[^/.]+$/, "");
    const withSpaces = withoutExt.replace(/[_\-+]+/g, " ");
    const cleaned = withSpaces.replace(/^(img|dsc|photo|pic|image|screenshot)\s*/i, "");
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "New Product";
    const titled = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim();
    return titled || "New Product";
  };

  // Handle multi-image file selection (each photo = 1 new product)
  const handleBulkPhotosSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBulkIsProcessingImages(true);
    sounds.playPop();
    showToast(`📸 Loading & optimizing ${files.length} photo(s)...`);

    try {
      const newItems: BulkPhotoItem[] = [];
      const defaultCat = bulkGlobalCat || categories.find((c) => c.id !== "all")?.id || "minifigure";
      const defaultPrice = bulkGlobalPrice || "9.50";
      const defaultStock = bulkGlobalStock || "20";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const resized = await resizeImageFile(file, 640, 0.75);
        if (!resized) continue;

        const cleanName = formatFilenameToName(file.name);
        const randomCode = `SPK-${Math.floor(1000 + Math.random() * 9000)}`;

        newItems.push({
          tempId: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          code: randomCode,
          name: cleanName,
          nameKh: cleanName,
          cat: defaultCat,
          price: defaultPrice,
          discount: "0",
          stock: defaultStock,
          pt: "5",
          rarity: "Rare",
          image: resized,
          fileName: file.name,
        });
      }

      if (newItems.length === 0) {
        alert("Could not load photos. Please make sure you select valid image files.");
        return;
      }

      setBulkPhotoItems((prev) => [...prev, ...newItems]);
      setBulkModalTab("photos");
      setBulkModalOpen(true);
      sounds.playChime();
      showToast(`🎉 Loaded ${newItems.length} products! Ready to review and publish.`);
    } catch (err: any) {
      alert("Failed to process images: " + (err?.message || "Error"));
    } finally {
      setBulkIsProcessingImages(false);
      if (e.target) e.target.value = "";
    }
  };

  // Replace photo for a single item in the bulk batch
  const handleReplaceSinglePhoto = async (index: number, file: File) => {
    const resized = await resizeImageFile(file, 640, 0.75);
    if (!resized) return;
    setBulkPhotoItems((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], image: resized };
      }
      return copy;
    });
    sounds.playChime();
    showToast("Updated photo!");
  };

  // Batch apply category to all items
  const handleApplyCatToAll = () => {
    if (!bulkGlobalCat) return;
    sounds.playPop();
    setBulkPhotoItems((prev) => prev.map((item) => ({ ...item, cat: bulkGlobalCat })));
    showToast(`Applied "${bulkGlobalCat}" category to all ${bulkPhotoItems.length} products!`);
  };

  // Batch apply price to all items
  const handleApplyPriceToAll = () => {
    const num = parseFloat(bulkGlobalPrice);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid price (e.g. 9.50)");
      return;
    }
    sounds.playPop();
    setBulkPhotoItems((prev) => prev.map((item) => ({ ...item, price: bulkGlobalPrice })));
    showToast(`Applied $${num.toFixed(2)} price to all ${bulkPhotoItems.length} products!`);
  };

  // Batch apply stock to all items
  const handleApplyStockToAll = () => {
    const num = parseInt(bulkGlobalStock, 10);
    if (isNaN(num) || num < 0) {
      alert("Please enter a valid stock quantity (e.g. 20)");
      return;
    }
    sounds.playPop();
    setBulkPhotoItems((prev) => prev.map((item) => ({ ...item, stock: bulkGlobalStock })));
    showToast(`Applied stock ${num} to all ${bulkPhotoItems.length} products!`);
  };

  // Update single field on a bulk photo item
  const updateBulkPhotoItem = (index: number, updates: Partial<BulkPhotoItem>) => {
    setBulkPhotoItems((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...updates };
      }
      return copy;
    });
  };

  // Remove one item from the batch
  const removeBulkPhotoItem = (index: number) => {
    sounds.playPop();
    setBulkPhotoItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Save all bulk photo products into database
  const handleSaveAllBulkPhotos = async () => {
    if (bulkPhotoItems.length === 0) {
      alert("No photos added. Please select photos first.");
      return;
    }

    const emptyNameIndex = bulkPhotoItems.findIndex((item) => !item.name.trim());
    if (emptyNameIndex !== -1) {
      alert(`Product #${emptyNameIndex + 1} is missing a name. Please enter a name for all products.`);
      return;
    }

    setBulkIsSubmitting(true);
    try {
      sounds.playChime();
      const productsToCreate = bulkPhotoItems.map((item) => ({
        code: item.code.trim() || `SPK-${Math.floor(1000 + Math.random() * 9000)}`,
        name: item.name.trim(),
        nameKh: item.nameKh.trim() || item.name.trim(),
        cat: item.cat || "minifigure",
        price: parseFloat(item.price) || 5.0,
        discount: parseInt(item.discount, 10) || 0,
        stock: parseInt(item.stock, 10) || 10,
        pt: parseInt(item.pt, 10) || 5,
        image: item.image,
        images: [item.image],
        bio: "Fun & collectible toy crafted with high durable kid-safe ABS material.",
        bioKh: "តុក្កតាប្រដាប់ក្មេងលេងគុណភាពខ្ពស់ សុវត្ថិភាពសម្រាប់កុមារ។",
        rarity: item.rarity || "Rare",
        rating: 5.0,
        reviewsCount: 1,
        featured: true,
        isNew: true,
        free_delivery: true,
        ageRecommendation: "Ages 4+",
        dimensions: "10cm x 8cm",
      }));

      await bulkAddProducts(productsToCreate, false);
      sounds.playFanfare();
      showToast(`🎉 Added ${productsToCreate.length} new products to storefront!`);
      setBulkPhotoItems([]);
      setBulkModalOpen(false);
    } catch (err: any) {
      alert("Failed to save products: " + (err?.message || "Unknown error"));
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  const handleDownloadCsvTemplate = () => {
    sounds.playPop();
    const csvContent =
      "Code,Name,NameKh,Category,Price,Discount,Stock,Points,Image,Bio,BioKh,Rarity,Dimensions\n" +
      'SPK-1001,Iron Man Cyber Mecha,តុក្កតាមេកាអាយរ៉ុនមែន,minifigure,9.50,0,25,5,https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80,Cyber superhero action figure,តុក្កតាមេកាវីរបុរស,Rare,10cm x 8cm\n' +
      'SPK-1002,Wall Climber Laser Car,ឡានឡាស៊ែរឡើងជញ្ជាំង,toy-universe,14.50,10,15,8,https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80,Zero gravity wall climbing racer,ឡានបញ្ជាឡើងជញ្ជាំង,Legendary,15cm x 8cm\n' +
      'SPK-1003,Pop Bear Blind Box,ប្រអប់អាថ៌កំបាំង Pop Bear,blind-box,7.00,0,30,4,https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80,Mystery collector series bear,តុក្កតាប្រអប់អាថ៌កំបាំង,Super Rare,8cm x 5cm\n' +
      'SPK-1004,Braclet for Male&Female,ខ្សែដៃបុរស & នារី Braclet for Male&Female,bracelet,12.00,0,25,6,/assets/categories/bracelet-unisex.jpg,Authentic 316L modular stainless steel bracelet,ខ្សែដៃបុរសនារីប្រណិត,Limited Edition,17 links';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sompheareak_bulk_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Template CSV downloaded!");
  };

  const handleLoadSampleBatch = () => {
    sounds.playPop();
    const sample =
      "Code,Name,NameKh,Category,Price,Discount,Stock,Points,Image,Bio,BioKh,Rarity,Dimensions\n" +
      'SPK-3001,Cyber Mecha Warrior,តុក្កតាមេកាអាយរ៉ុនមែន,minifigure,9.50,0,25,5,https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80,Cyber superhero action figure,តុក្កតាមេកាវីរបុរស,Rare,10cm x 8cm\n' +
      'SPK-3002,Wall Climber Laser Car,ឡានឡាស៊ែរឡើងជញ្ជាំង,toy-universe,14.50,10,15,8,https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80,Zero gravity wall climbing racer,ឡានបញ្ជាឡើងជញ្ជាំង,Legendary,15cm x 8cm\n' +
      'SPK-3003,Pop Bear Blind Box,ប្រអប់អាថ៌កំបាំង Pop Bear,blind-box,7.00,0,30,4,https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80,Mystery collector series bear,តុក្កតាប្រអប់អាថ៌កំបាំង,Super Rare,8cm x 5cm\n' +
      'SPK-3004,Galaxy Plushie Star,តុក្កតាសំឡីកាឡាក់ស៊ី,plushies,8.50,0,20,5,https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=800&q=80,Ultra soft plush companion,តុក្កតាសំឡីទន់ៗ,Common,20cm\n' +
      'SPK-3005,Braclet for Male&Female,ខ្សែដៃបុរស & នារី Braclet for Male&Female,bracelet,12.00,0,25,6,/assets/categories/bracelet-unisex.jpg,Authentic 316L modular stainless steel bracelet,ខ្សែដៃបុរសនារីប្រណិត,Limited Edition,17 links';

    setBulkRawText(sample);
    parseBulkInput(sample);
    showToast("Loaded 5 sample products into preview!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playPop();
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setBulkRawText(content);
        parseBulkInput(content);
        showToast(`Loaded ${file.name}! Check preview below.`);
      }
    };
    reader.onerror = () => {
      setBulkFileError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkUpload = async () => {
    const valid = bulkParsedProducts.filter((p) => p._valid);
    if (valid.length === 0) {
      alert("No valid products to import. Please check for errors in the preview table.");
      return;
    }

    setBulkIsSubmitting(true);
    try {
      sounds.playChime();
      await bulkAddProducts(valid as Product[], bulkReplaceMode);
      sounds.playFanfare();
      showToast(`🎉 Successfully imported ${valid.length} products to store!`);
      setBulkModalOpen(false);
      setBulkRawText("");
      setBulkParsedProducts([]);
    } catch (err: any) {
      alert("Bulk upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  // Product Form Fields
  const [pCode, setPCode] = useState("");
  const [pName, setPName] = useState("");
  const [pNameKh, setPNameKh] = useState("");

  const handleGenerateProductCode = () => {
    sounds.playPop();
    const newCode = `SPK-${Math.floor(1000 + Math.random() * 9000)}`;
    setPCode(newCode);
    return newCode;
  };

  const handleStudioAddAsProduct = (data: {
    name: string;
    nameKh: string;
    price: number;
    bio: string;
    image: string;
    charms: { slotIndex: number; charm: Charm }[];
    finish: string;
  }) => {
    sounds.playFanfare();
    setEditingProduct(null);
    setPName(data.name);
    setPNameKh(data.nameKh);
    setPPrice(data.price.toFixed(2));
    setPDiscount("0");
    setPStock("15");
    setPPt("5");
    setPImage(data.image);
    setPImages([data.image]);
    setPBio(data.bio);
    setPBioKh(`ខ្សែដៃម៉ូឌុលអ៊ីតាលី Inox 316L (${data.finish.toUpperCase()}) ជាមួយ ${data.charms.length} ផ្លាកម៉ូឌុល`);
    setPRarity("Rare");
    setPCat("bracelet");
    const freshCode = `SPK-${Math.floor(1000 + Math.random() * 9000)}`;
    setPCode(freshCode);
    setProductModalOpen(true);
    showToast(`Assembled ${data.charms.length} charms! Review details and save as product.`);
  };
  const [pCat, setPCat] = useState("minifigure");
  const [pPrice, setPPrice] = useState("9.50");
  const [pDiscount, setPDiscount] = useState("0");
  const [pStock, setPStock] = useState("20");
  const [pPt, setPPt] = useState("5");
  const [pImage, setPImage] = useState("");
  const [pImages, setPImages] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>("");
  const [pBio, setPBio] = useState("");
  const [pBioKh, setPBioKh] = useState("");
  const [pRarity, setPRarity] = useState<ToyRarity>("Rare");

  // Orders Filter State
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Voucher Form State
  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false);
  const [vCode, setVCode] = useState("");
  const [vDiscountPct, setVDiscountPct] = useState("15");
  const [vPointsCost, setVPointsCost] = useState("35");
  const [vMinSpend, setVMinSpend] = useState("0");
  const [vDescription, setVDescription] = useState("");
  const [vDescriptionKh, setVDescriptionKh] = useState("");
  const [vBadge, setVBadge] = useState("HOT PROMO");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("somphea_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD || VALID_PASSWORDS.includes(passwordInput.trim())) {
      sounds.playFanfare();
      sessionStorage.setItem("somphea_admin_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      sounds.playPop();
      setAuthError("Incorrect password. Access denied.");
      setShakeLogin(true);
      setTimeout(() => setShakeLogin(false), 500);
    }
  };

  const handleLogout = () => {
    sounds.playPop();
    sessionStorage.removeItem("somphea_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // Category Management Handlers
  const handleOpenAddCategory = () => {
    sounds.playPop();
    setEditingCategory(null);
    setCatId("");
    setCatName("");
    setCatNameKh("");
    setCatIcon("🏷️");
    setCatGrad("from-emerald-500 to-teal-600");
    setCatSortOrder(categories.length);
    setCatDescription("");
    setFilterModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    sounds.playPop();
    setEditingCategory(cat);
    setCatId(cat.id);
    setCatName(cat.name);
    setCatNameKh(cat.kh || cat.name);
    setCatIcon(cat.icon || "🏷️");
    setCatGrad(cat.grad || "from-emerald-500 to-teal-600");
    setCatSortOrder(cat.sort_order || 0);
    setCatDescription(cat.description || "");
    setFilterModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert("Please enter a filter name.");
      return;
    }
    const slug = catId.trim()
      ? catId.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : catName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        kh: catNameKh.trim() || catName.trim(),
        en: catName.trim(),
        icon: catIcon.trim() || "🏷️",
        grad: catGrad,
        sort_order: catSortOrder,
        description: catDescription.trim(),
      });
      sounds.playChime();
      showToast(`Filter "${catName}" updated!`);
    } else {
      addCategory({
        id: slug,
        name: catName.trim(),
        kh: catNameKh.trim() || catName.trim(),
        en: catName.trim(),
        icon: catIcon.trim() || "🏷️",
        grad: catGrad,
        sort_order: catSortOrder,
        description: catDescription.trim(),
      });
      sounds.playFanfare();
      showToast(`Added new filter "${catName}"!`);
    }
    setFilterModalOpen(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    if (cat.id === "all") {
      alert("The 'All' filter cannot be deleted.");
      return;
    }
    if (confirm(`Are you sure you want to delete filter "${cat.name}"? Products in this filter will remain in the database.`)) {
      deleteCategory(cat.id);
      sounds.playPop();
      showToast(`Deleted filter "${cat.name}"`);
    }
  };

  const handleResetCategories = () => {
    if (confirm("Reset all filters back to factory default? Any custom filters will be removed.")) {
      resetCategories();
      sounds.playPop();
      showToast("Reset all filters to default!");
    }
  };

  // Open Modal for New Product
  const handleOpenAddProduct = () => {
    sounds.playPop();
    setEditingProduct(null);
    setPCode(`SPK-${Math.floor(1000 + Math.random() * 9000)}`);
    setPName("");
    setPNameKh("");
    setPCat((categories.find((c) => c.id !== "all")?.id) || "minifigure");
    setPPrice("9.50");
    setPDiscount("0");
    setPStock("25");
    setPPt("5");
    setPImage("");
    setPImages([]);
    setNewPhotoUrl("");
    setPBio("Fun & collectible toy crafted with high durable kid-safe ABS material.");
    setPBioKh("តុក្កតាប្រដាប់ក្មេងលេងគុណភាពខ្ពស់ សុវត្ថិភាពសម្រាប់កុមារ។");
    setPRarity("Rare");
    setProductModalOpen(true);
  };

  // Open Modal for Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    sounds.playPop();
    setEditingProduct(prod);
    setPCode(prod.code || `SPK-${Math.floor(1000 + Math.random() * 9000)}`);
    setPName(prod.name);
    setPNameKh(prod.nameKh || prod.name);
    setPCat(prod.cat);
    setPPrice(prod.price.toString());
    setPDiscount(prod.discount.toString());
    setPStock(prod.stock.toString());
    setPPt(prod.pt.toString());
    setPImage(prod.image);
    setPImages(prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []));
    setNewPhotoUrl("");
    setPBio(prod.bio);
    setPBioKh(prod.bioKh || prod.bio);
    setPRarity(prod.rarity || "Rare");
    setProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      alert("Please enter a toy name.");
      return;
    }

    const priceNum = parseFloat(pPrice) || 5.0;
    const discountNum = parseInt(pDiscount, 10) || 0;
    const stockNum = parseInt(pStock, 10) || 10;
    const ptNum = parseInt(pPt, 10) || 4;
    const finalCode = pCode.trim() || `SPK-${Math.floor(1000 + Math.random() * 9000)}`;
    const validImages = pImages.filter(Boolean);
    const finalImages = validImages.length > 0 ? validImages : (pImage.trim() ? [pImage.trim()] : ["/assets/categories/toy.jpg"]);
    const primaryImage = finalImages[0] || "/assets/categories/toy.jpg";

    if (editingProduct) {
      // Update existing
      updateProduct(editingProduct.id, {
        code: finalCode,
        name: pName.trim(),
        nameKh: pNameKh.trim() || pName.trim(),
        cat: pCat,
        price: priceNum,
        discount: discountNum,
        stock: stockNum,
        pt: ptNum,
        image: primaryImage,
        images: finalImages,
        bio: pBio.trim(),
        bioKh: pBioKh.trim() || pBio.trim(),
        rarity: pRarity,
      });
      sounds.playChime();
      showToast(`Updated "${pName}" (${finalCode}) with ${finalImages.length} photo(s)!`);
    } else {
      // Add new
      addProduct({
        code: finalCode,
        name: pName.trim(),
        nameKh: pNameKh.trim() || pName.trim(),
        cat: pCat,
        price: priceNum,
        discount: discountNum,
        stock: stockNum,
        pt: ptNum,
        image: primaryImage,
        images: finalImages,
        bio: pBio.trim(),
        bioKh: pBioKh.trim() || pBio.trim(),
        rarity: pRarity,
        rating: 5.0,
        reviewsCount: 1,
        featured: true,
        isNew: true,
        free_delivery: true,
        ageRecommendation: "Ages 4+",
        dimensions: "10cm x 8cm",
      });
      sounds.playFanfare();
      showToast(`Added new toy "${pName}" with ${finalImages.length} photo(s)!`);
    }

    setProductModalOpen(false);
  };

  // Save Voucher
  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim()) return;

    const newV: Voucher = {
      code: vCode.trim().toUpperCase(),
      discountPct: parseInt(vDiscountPct, 10) || 10,
      discountType: "percentage",
      pointsCost: parseInt(vPointsCost, 10) || 25,
      minSpend: parseFloat(vMinSpend) || 0,
      description: vDescription.trim() || `${vDiscountPct}% OFF Special Voucher`,
      descriptionKh: vDescriptionKh.trim() || `ប័ណ្ណបញ្ចុះតម្លៃ ${vDiscountPct}%`,
      badge: vBadge.trim().toUpperCase(),
      colorGrad: "from-emerald-500 to-teal-700",
    };

    addVoucher(newV);
    sounds.playFanfare();
    showToast(`Voucher "${newV.code}" created!`);
    setVoucherModalOpen(false);
    setVCode("");
    setVDescription("");
    setVDescriptionKh("");
  };



  // Metrics Calculation
  const totalRevenueUsd = orders.reduce((sum, o) => sum + (o.totalUsd || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const inStockProductsCount = products.filter((p) => p.stock > 0).length;
  const totalPointsCirculation = orders.reduce((sum, o) => sum + (o.pointsEarned || 0), 0);
  // Low Stock Items (< 5 units)
  const lowStockProducts = products.filter((p) => typeof p.stock === "number" && p.stock < 5);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.nameKh && p.nameKh.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q));
    const matchesCat =
      productCatFilter === "all" ||
      p.cat === productCatFilter ||
      (productCatFilter === "toy" &&
        (p.cat === "toy-universe" ||
          p.cat === "tech-toys" ||
          p.cat === "blind-box" ||
          p.cat === "plushies"));
    return matchesSearch && matchesCat;
  });

  // Filtered Charms (Italy Modular Bracelet)
  const filteredCharms = (charms || []).filter((c) => {
    const q = charmSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.nameKh && c.nameKh.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      getCharmCode(c).toLowerCase().includes(q);
    const matchesCat = charmCatFilter === "all" || c.category === charmCatFilter;
    return matchesSearch && matchesCat;
  });

  // Helper to downscale uploaded images to prevent exceeding localStorage / payload quota
  const resizeImageFile = (file: File, maxDim = 640, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith("image/")) {
        resolve("");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          resolve("");
          return;
        }
        const img = new window.Image();
        img.onload = () => {
          try {
            const nw = img.naturalWidth || img.width || 640;
            const nh = img.naturalHeight || img.height || 640;

            let w = nw;
            let h = nh;
            if (w > h) {
              if (w > maxDim) {
                h = Math.max(1, Math.round((h * maxDim) / w));
                w = maxDim;
              }
            } else {
              if (h > maxDim) {
                w = Math.max(1, Math.round((w * maxDim) / h));
                h = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, w);
            canvas.height = Math.max(1, h);
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(dataUrl.length < 500000 ? dataUrl : "");
              return;
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, w, h);
            const isPng = file.type === "image/png";
            const resized = isPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality);
            resolve(resized || dataUrl);
          } catch {
            resolve(dataUrl.length < 500000 ? dataUrl : "");
          }
        };
        img.onerror = () => {
          resolve(dataUrl.length < 500000 ? dataUrl : "");
        };
        img.src = dataUrl;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // Process uploaded charm image (auto-trims transparent empty borders & downscales to 240px for crisp, compact modular links)
  const processCharmImage = (imageUrl: string) => {
    if (!imageUrl) return;
    setIsGeneratingCutout(true);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        const canvas = document.createElement("canvas");
        canvas.width = naturalW;
        canvas.height = naturalH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setCImage(imageUrl);
          setCPlateImage(imageUrl);
          setIsGeneratingCutout(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, naturalW, naturalH);
        const { data, width, height } = imgData;

        let minX = width, minY = height, maxX = 0, maxY = 0;
        let hasTransparent = false;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha < 240) hasTransparent = true;
            if (alpha > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // Determine source bounding box (crop tightly if transparent borders exist)
        let sourceX = 0;
        let sourceY = 0;
        let sourceW = naturalW;
        let sourceH = naturalH;

        if (hasTransparent && maxX > minX && maxY > minY) {
          const trimW = maxX - minX + 1;
          const trimH = maxY - minY + 1;
          if (trimW < width * 0.98 || trimH < height * 0.98) {
            sourceX = minX;
            sourceY = minY;
            sourceW = trimW;
            sourceH = trimH;
          }
        }

        // Downscale to max 240px dimension for ultra crisp Retina display while keeping size tiny (~15-25KB)
        const MAX_CHARM_DIM = 240;
        let destW = sourceW;
        let destH = sourceH;
        if (destW > MAX_CHARM_DIM || destH > MAX_CHARM_DIM) {
          if (destW > destH) {
            destH = Math.max(1, Math.round((destH * MAX_CHARM_DIM) / destW));
            destW = MAX_CHARM_DIM;
          } else {
            destW = Math.max(1, Math.round((destW * MAX_CHARM_DIM) / destH));
            destH = MAX_CHARM_DIM;
          }
        }

        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = destW;
        finalCanvas.height = destH;
        const finalCtx = finalCanvas.getContext("2d");
        if (finalCtx) {
          finalCtx.imageSmoothingEnabled = true;
          finalCtx.imageSmoothingQuality = "high";
          finalCtx.drawImage(canvas, sourceX, sourceY, sourceW, sourceH, 0, 0, destW, destH);
          const optimizedUrl = finalCanvas.toDataURL("image/png");
          setCImage(optimizedUrl);
          setCPlateImage(optimizedUrl);
          setIsGeneratingCutout(false);
          return;
        }

        setCImage(imageUrl);
        setCPlateImage(imageUrl);
        setIsGeneratingCutout(false);
      } catch {
        setCImage(imageUrl);
        setCPlateImage(imageUrl);
        setIsGeneratingCutout(false);
      }
    };
    img.onerror = () => {
      setCImage(imageUrl);
      setCPlateImage(imageUrl);
      setIsGeneratingCutout(false);
    };
    img.src = imageUrl;
  };

  const handleImageUploaded = (dataUrl: string) => {
    processCharmImage(dataUrl);
  };

  // Open Add Charm Modal
  const handleOpenAddCharm = () => {
    sounds.playPop();
    setEditingCharm(null);
    const autoCode = generateUniqueCharmCode({ category: "emblem" }, charms || []);
    setCCode(autoCode);
    setCName("");
    setCNameKh("");
    setCCat("emblem");
    setCPrice("1.50");
    setCImage("");
    setCPlateImage("");
    setCIsPopular(true);
    setCDescription("Modular 9mm Italian charm link in 316L waterproof inox steel.");
    setCharmModalOpen(true);
  };

  // Open Edit Charm Modal
  const handleOpenEditCharm = (charm: Charm) => {
    sounds.playPop();
    setEditingCharm(charm);
    setCCode(charm.code || getCharmCode(charm, charms || []));
    setCName(charm.name);
    setCNameKh(charm.nameKh || charm.name);
    setCCat(charm.category);
    setCPrice(charm.price.toString());
    const existingImg = charm.image || "";
    const existingPlate = charm.plateImage || existingImg;
    setCImage(existingImg);
    setCPlateImage(existingPlate);
    setCIsPopular(Boolean(charm.isPopular));
    setCDescription(charm.description || "");
    setCharmModalOpen(true);
  };

  // Save Charm
  const handleSaveCharm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) {
      alert("Please enter a charm name.");
      return;
    }
    if (!cImage.trim()) {
      alert("Please upload a charm photo from your device or enter an image URL.");
      return;
    }

    const priceNum = parseFloat(cPrice) || 1.5;
    const finalImage = cImage.trim();
    const finalPlate = (cPlateImage || cImage).trim();
    const finalCode = generateUniqueCharmCode(
      {
        id: editingCharm?.id,
        name: cName.trim(),
        category: cCat,
        code: cCode.trim(),
      },
      charms || []
    );

    if (editingCharm) {
      updateCharm(editingCharm.id, {
        code: finalCode,
        name: cName.trim(),
        nameKh: cNameKh.trim() || cName.trim(),
        category: cCat,
        price: priceNum,
        image: finalImage,
        plateImage: finalPlate,
        isPopular: cIsPopular,
        description: cDescription.trim(),
      });
      sounds.playChime();
      showToast(`Updated charm #${finalCode} "${cName}"!`);
    } else {
      addCharm({
        code: finalCode,
        name: cName.trim(),
        nameKh: cNameKh.trim() || cName.trim(),
        category: cCat,
        price: priceNum,
        image: finalImage,
        plateImage: finalPlate,
        isPopular: cIsPopular,
        description: cDescription.trim(),
      });
      sounds.playFanfare();
      showToast(`Added new charm #${finalCode} "${cName}" to Italian Bracelet workshop!`);
    }

    setCharmModalOpen(false);
  };

  const handleDeleteCharm = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete charm "${name}"?`)) {
      sounds.playPop();
      deleteCharm(id);
      showToast(`Deleted charm "${name}"`);
    }
  };

  // ==========================================
  // CATEGORY BENTO BOXES HANDLERS
  // ==========================================
  const handleOpenAddBox = () => {
    sounds.playPop();
    setEditingBox(null);
    setBTitle("");
    setBTitleKh("");
    setBSubtitle("");
    setBImage("/assets/categories/custom-bracelet.jpg");
    setBActionType("category");
    setBActionValue("minifigure");
    setBSpan("half");
    setBBadge("HOT 🔥");
    setBActive(true);
    setBOrder((categoryBoxes?.length || 0) + 1);
    setBoxModalOpen(true);
  };

  const handleOpenEditBox = (box: CategoryBox) => {
    sounds.playPop();
    setEditingBox(box);
    setBTitle(box.title);
    setBTitleKh(box.titleKh || "");
    setBSubtitle(box.subtitle || "");
    setBImage(box.image);
    setBActionType(box.actionType);
    setBActionValue(box.actionValue);
    setBSpan(box.span);
    setBBadge(box.badge || "");
    setBActive(box.active);
    setBOrder(box.order);
    setBoxModalOpen(true);
  };

  const handleSaveBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) {
      alert("Please enter a category box title.");
      return;
    }
    if (!bImage.trim()) {
      alert("Please select or upload a category box image.");
      return;
    }

    if (editingBox) {
      updateCategoryBox(editingBox.id, {
        title: bTitle.trim(),
        titleKh: bTitleKh.trim(),
        subtitle: bSubtitle.trim(),
        image: bImage.trim(),
        actionType: bActionType,
        actionValue: bActionValue.trim(),
        span: bSpan,
        badge: bBadge.trim(),
        active: bActive,
        order: bOrder,
      });
      sounds.playChime();
      showToast(`Updated Category Box "${bTitle.trim()}"`);
    } else {
      addCategoryBox({
        title: bTitle.trim(),
        titleKh: bTitleKh.trim(),
        subtitle: bSubtitle.trim(),
        image: bImage.trim(),
        actionType: bActionType,
        actionValue: bActionValue.trim(),
        span: bSpan,
        badge: bBadge.trim(),
        active: bActive,
        order: bOrder,
      });
      sounds.playFanfare();
      showToast(`Added new Category Box "${bTitle.trim()}"`);
    }
    setBoxModalOpen(false);
  };

  const handleDeleteCategoryBox = (box: CategoryBox) => {
    if (confirm(`Are you sure you want to delete Category Box "${box.title}"?`)) {
      sounds.playPop();
      deleteCategoryBox(box.id);
      showToast(`Deleted Category Box "${box.title}"`);
    }
  };

  const handleMoveBox = (box: CategoryBox, direction: "up" | "down") => {
    const list = [...(categoryBoxes || [])].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((b) => b.id === box.id);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const prev = list[idx - 1];
      const tempOrder = prev.order;
      prev.order = box.order;
      box.order = tempOrder === box.order ? box.order - 1 : tempOrder;
      reorderCategoryBoxes(list);
      sounds.playPop();
      showToast(`Moved "${box.title}" up`);
    } else if (direction === "down" && idx < list.length - 1) {
      const next = list[idx + 1];
      const tempOrder = next.order;
      next.order = box.order;
      box.order = tempOrder === box.order ? box.order + 1 : tempOrder;
      reorderCategoryBoxes(list);
      sounds.playPop();
      showToast(`Moved "${box.title}" down`);
    }
  };

  const handleResetBoxes = () => {
    if (
      confirm(
        "Reset all Category Bento Boxes back to the default reference design? Any custom boxes will be restored to original 3 boxes (CUSTOMIZE ITALY CHARM, MINIFIGURE, TOY)."
      )
    ) {
      sounds.playFanfare();
      resetCategoryBoxes();
      showToast("Reset Category Boxes to default!");
    }
  };

  const handleBoxImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setBImage(result);
        sounds.playPop();
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderRef.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch) ||
      o.telegramHandle.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // 1. PASSWORD GATE IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white transition-colors duration-200">
        <motion.div
          animate={shakeLogin ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-emerald-500/40 rounded-3xl p-8 shadow-2xl text-slate-900 dark:text-white relative overflow-hidden transition-colors"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-toy-green-glow">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
              Somphea Reak Owner Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Administrative Gateway &middot; Enter authorized passcode to manage toys, pricing, and live customer orders.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Owner Passcode</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter store password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 outline-none pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all mt-2"
              >
                <Unlock className="w-5 h-5" />
                <span>Unlock Control Center</span>
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Somphea Reak Architecture v2.0 Secured</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // 2. MAIN ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-8 py-2.5 sm:py-3.5 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0">
                <Image src="/assets/logo.jpg" alt="Logo" fill className="object-cover rounded-xl" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-base sm:text-lg font-fredoka text-slate-900 dark:text-white">
                    SOMPHEA REAK
                  </span>
                  <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Live Storefront Sync</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto max-w-full pb-1 scrollbar-none w-full sm:w-auto justify-start sm:justify-end">

            {/* View Storefront Link (Clean Customer Front) */}
            <Link
              href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "/"}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-toy-green-glow"
              title="Open live customer storefront in new tab"
            >
              <span>View Storefront 🛍️</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* View Dedicated Italy Bracelet Studio */}
            <Link
              href={process.env.NEXT_PUBLIC_STOREFRONT_URL ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/italy-bracelet` : "/italy-bracelet"}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm border border-slate-300 dark:border-slate-700"
              title="Open Italy Modular Charm Bracelet Studio"
            >
              <span>Bracelet Studio 🔗</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                sounds.playPop();
                toggleTheme();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
              title="Toggle Light / Dark mode"
            >
              {themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-rose-300 dark:border-rose-800/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Hidden master input for bulk photo upload (1 Photo = 1 Product) */}
        <input
          ref={bulkFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleBulkPhotosSelected}
          className="fixed -top-[1000px] -left-[1000px] opacity-0 pointer-events-none w-1 h-1"
          tabIndex={-1}
          aria-hidden="true"
        />
        {/* Quick Analytics Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Revenue */}
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block leading-tight truncate">Total Volume</span>
              <span className="text-lg sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white truncate block">
                {formatPrice(totalRevenueUsd, currency)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                ≈ {Math.round(totalRevenueUsd * 4100).toLocaleString()} KHR
              </span>
            </div>
          </div>

          {/* Orders */}
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block leading-tight truncate">Total Orders</span>
              <span className="text-lg sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white truncate block">
                {orders.length}
              </span>
              {pendingOrdersCount > 0 ? (
                <span className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 font-bold block truncate">
                  {pendingOrdersCount} pending!
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 block truncate">All caught up</span>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block leading-tight truncate">Active Catalog</span>
              <span className="text-lg sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white truncate block">
                {products.length}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">{inStockProductsCount} in stock</span>
            </div>
          </div>

          {/* Points */}
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block leading-tight truncate">Loyalty Points</span>
              <span className="text-lg sm:text-2xl font-black font-fredoka text-amber-600 dark:text-amber-400 truncate block">
                {totalPointsCirculation} pt
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Issued on orders</span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* LOW STOCK INVENTORY ALERT BOX (STOCK < 5 UNITS)      */}
        {/* ==================================================== */}
        {lowStockProducts.length > 0 ? (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/30 border-2 border-rose-500/50 dark:border-rose-500/40 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base font-fredoka text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    <span>⚠️ Low Stock Alert (Products With Stock &lt; 5)</span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/90 text-rose-900 dark:text-rose-200 font-black border border-rose-300 dark:border-rose-700">
                      {lowStockProducts.length} Items Need Restocking
                    </span>
                  </h3>
                  <p className="text-xs text-rose-700/90 dark:text-rose-300/80">
                    The following product{lowStockProducts.length > 1 ? "s have" : " has"} lower stock than 5 units. Restock below to avoid stockouts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2.5 py-1 rounded-xl border border-rose-300 dark:border-rose-800">
                  Critical Threshold: &lt; 5 Units
                </span>
              </div>
            </div>

            {/* Low Stock Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {lowStockProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                return (
                  <div
                    key={`low-stock-${prod.id}`}
                    className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800/80 shadow-xs flex flex-col justify-between gap-2 sm:gap-3 hover:border-rose-500 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <Image
                          src={prod.image || "/assets/logo.jpg"}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          unoptimized={Boolean(prod.image?.startsWith("data:"))}
                        />
                      </div>
                      <div className="min-w-0 flex-1 w-full">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate font-fredoka">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[9px] sm:text-[10px]">
                          {prod.code && (
                            <span className="font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded truncate">
                              {prod.code}
                            </span>
                          )}
                          <span className="text-slate-400 capitalize truncate">{prod.cat}</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full ${
                              isOutOfStock
                                ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            }`}
                          >
                            <span>{isOutOfStock ? "❌ Out of Stock" : `⚠️ ${prod.stock} left`}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Restock Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                      <span className="text-[10px] text-slate-400 font-bold">Quick Restock:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playChime();
                            updateProduct(prod.id, { stock: prod.stock + 5 });
                            showToast(`Restocked +5 units to "${prod.name}" (Now: ${prod.stock + 5})`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-black text-[10px] font-fredoka transition-all active:scale-95 border border-emerald-300 dark:border-emerald-800"
                          title="Add 5 units to stock"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playChime();
                            updateProduct(prod.id, { stock: prod.stock + 10 });
                            showToast(`Restocked +10 units to "${prod.name}" (Now: ${prod.stock + 10})`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] font-fredoka transition-all active:scale-95 shadow-xs"
                          title="Add 10 units to stock"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
                          title="Edit Product Details & Stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete low-stock product "${prod.name}" from the store?`)) {
                              sounds.playPop();
                              deleteProduct(prod.id);
                              showToast(`Deleted ${prod.name} from store.`);
                            }
                          }}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-300 transition-all border border-rose-200 dark:border-rose-800/60"
                          title="Delete Product from Store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Inventory Healthy: All {products.length} products have sufficient stock (&ge; 5 units).</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">Optimal Stock Levels</span>
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-2 scrollbar-none -mx-2 px-2 touch-pan-x flex-nowrap">
            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("products");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "products"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("orders");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "orders"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("bracelet_studio");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "bracelet_studio"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Bracelet Studio 🔗</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("charms");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "charms"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-toy-yellow" />
              <span>Charms ({charms ? charms.length : 0})</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("vouchers");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "vouchers"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Vouchers ({vouchers.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("category_boxes");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "category_boxes"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Images className="w-4 h-4 text-emerald-400" />
              <span>Bento Boxes ({categoryBoxes ? categoryBoxes.length : 0})</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab("categories");
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black font-fredoka text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === "categories"
                  ? "bg-emerald-600 text-white shadow-toy-green-glow"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Categories ({categories ? categories.length : 0})</span>
            </button>
          </div>

          {activeTab === "products" && (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Choice 1: Bulk Photo Upload (1 Photo = 1 Product) */}
              <button
                type="button"
                onClick={handleTriggerBulkPhotoUpload}
                className="py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black font-fredoka text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 hover:scale-102 active:scale-95 transition-all cursor-pointer ring-2 ring-indigo-400/50"
                title="Select 10+ photos from your device to upload 10+ different products with batch editing"
              >
                <Images className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Bulk Upload (10+ Photos) 📸</span>
              </button>

              {bulkPhotoItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setBulkModalTab("photos");
                    setBulkModalOpen(true);
                  }}
                  className="py-2.5 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-fredoka text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all animate-bounce"
                  title="You have unsaved bulk products. Click to review and publish!"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Resume Batch ({bulkPhotoItems.length})</span>
                </button>
              )}

              {/* Choice 2: Add Single Toy (One by One) */}
              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 text-white font-black font-fredoka text-xs sm:text-sm shadow-toy-green-glow flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                title="Upload one product at a time with optional multi-photo gallery"
              >
                <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span>Add 1 by 1</span>
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTab("bracelet_studio");
                }}
                className="py-2 px-3 sm:px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black font-fredoka text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                title="Open Custom Bracelet Studio to assemble & add bracelets"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate">Assemble Bracelet 🔗</span>
              </button>

              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to permanently WIPE ALL PRODUCTS from the database? Leave nothing behind (0 products).")) {
                      sounds.playPop();
                      wipeAllProducts();
                      showToast("All products wiped from database. Catalog is now empty.");
                    }
                  }}
                  className="py-2 px-3 sm:px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-200 dark:border-rose-800/50"
                  title="Wipe all products from database (Leave nothing behind)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="truncate">Wipe All</span>
                </button>
              )}
            </div>
          )}

          {activeTab === "bracelet_studio" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenAddCharm}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Charm Photo 📸</span>
              </button>
            </div>
          )}

          {activeTab === "charms" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Clear all charms from inventory?")) {
                    sounds.playPop();
                    clearCharms();
                    showToast("Charm inventory cleared.");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-rose-200 dark:border-rose-800/50"
                title="Clear charm inventory"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Charms</span>
              </button>

              <button
                onClick={handleOpenAddCharm}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 text-white font-black font-fredoka text-xs sm:text-sm shadow-toy-green-glow flex items-center gap-2 hover:scale-102 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Charm Photo 📸</span>
              </button>
            </div>
          )}

          {activeTab === "category_boxes" && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleResetBoxes}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 active:scale-95 shrink-0"
                title="Reset to default 3 reference boxes"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Reset Default Bento</span>
                <span className="sm:hidden">Reset</span>
              </button>

              <button
                onClick={handleOpenAddBox}
                className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 text-white font-black font-fredoka text-xs sm:text-sm shadow-toy-green-glow flex items-center gap-2 hover:scale-102 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add Category Box 🍱</span>
              </button>
            </div>
          )}

          {activeTab === "vouchers" && (
            <button
              onClick={() => {
                sounds.playPop();
                setVoucherModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 text-white font-black font-fredoka text-xs sm:text-sm shadow-toy-green-glow flex items-center gap-2 hover:scale-102 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Voucher</span>
            </button>
          )}

          {activeTab === "categories" && (
            <div className="flex gap-2">
              <button
                onClick={handleResetCategories}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700"
                title="Restore default category filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
              <button
                onClick={handleOpenAddCategory}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 text-white font-black font-fredoka text-xs sm:text-sm shadow-toy-green-glow flex items-center gap-2 hover:scale-102 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* TAB 1: PRODUCT CATALOG MANAGEMENT                    */}
        {/* ==================================================== */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search toys by name or ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sounds.playPop();
                      setProductCatFilter(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      productCatFilter === cat.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid: 2 columns on mobile phone, 2 on tablet, 3-4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredProducts.map((prod) => {
                const discountedPrice = prod.discount > 0 ? prod.price * (1 - prod.discount / 100) : prod.price;

                return (
                  <div
                    key={prod.id}
                    className={`p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-sm ${
                      prod.stock < 5
                        ? "border-amber-400 dark:border-amber-700/80 ring-2 ring-amber-400/20 shadow-amber-500/5"
                        : "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-2 sm:mb-3">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          unoptimized={Boolean(prod.image?.startsWith("data:"))}
                        />
                        {prod.discount > 0 && (
                          <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-rose-500 text-white text-[9px] sm:text-[10px] font-black uppercase">
                            -{prod.discount}%
                          </span>
                        )}
                        {prod.images && prod.images.length > 1 && (
                          <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-black/75 backdrop-blur-sm text-white text-[8px] sm:text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <Images className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-emerald-400" />
                            <span>{prod.images.length}</span>
                          </span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-black/75 backdrop-blur-sm text-amber-300 text-[8px] sm:text-[10px] font-bold">
                          +{prod.pt} pt
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                            {prod.cat}
                          </span>
                          {prod.code && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[8px] sm:text-[10px] border border-emerald-300 dark:border-emerald-700/50 truncate">
                              {prod.code}
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-xs sm:text-sm font-fredoka text-slate-900 dark:text-white line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                          {prod.nameKh || prod.bio}
                        </p>

                        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 pt-0.5 sm:pt-1">
                          <span className="text-sm sm:text-base font-black text-amber-600 dark:text-toy-yellow font-fredoka">
                            {formatPrice(discountedPrice, currency)}
                          </span>
                          {prod.discount > 0 && (
                            <span className="text-[10px] sm:text-xs line-through text-slate-400">
                              {formatPrice(prod.price, currency)}
                            </span>
                          )}
                          <span
                            className={`ml-auto text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md ${
                              prod.stock === 0
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                : prod.stock < 5
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse"
                                : "text-slate-500 font-bold"
                            }`}
                          >
                            {prod.stock === 0 ? "Out" : prod.stock < 5 ? `⚠️ ${prod.stock}` : `Stock: ${prod.stock}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="flex-1 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete "${prod.name}" (${prod.code || prod.id}) from the store?`)) {
                            sounds.playPop();
                            deleteProduct(prod.id);
                            showToast(`Deleted "${prod.name}" from store.`);
                          }
                        }}
                        className="h-9 sm:h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-200 dark:border-rose-900/40 active:scale-95 cursor-pointer"
                        title="Delete product from store"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 px-4 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mb-3">
                    <Images className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No products found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                    Upload your products using Bulk Upload (select 10+ photos from your device) or add them one by one.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerBulkPhotoUpload}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black font-fredoka text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <Images className="w-4 h-4 text-amber-300" />
                      <span>Bulk Upload (10+ Photos) 📸</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add 1 by 1</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CUSTOMER ORDERS MANAGEMENT                    */}
        {/* ==================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ref, customer, phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                {["all", "pending", "confirmed", "packaging", "shipped", "delivered", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      sounds.playPop();
                      setOrderStatusFilter(st);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                      orderStatusFilter === st
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-4xl block mb-2">📦</span>
                <h3 className="text-base font-black font-fredoka text-slate-700 dark:text-slate-300">
                  No orders found
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Orders submitted through the storefront or cart checkout will automatically arrive here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const statusColors: Record<OrderStatus, string> = {
                    pending: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50",
                    confirmed: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/50",
                    packaging: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/50",
                    shipped: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/50",
                    delivered: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/50",
                    rejected: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/50",
                    cancelled: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/50",
                  };

                  // Telegram redirect link generator
                  const tlgUsername = ord.telegramHandle ? ord.telegramHandle.replace("@", "").trim() : "";
                  const cleanPhone = ord.customerPhone ? ord.customerPhone.replace(/[^0-9]/g, "") : "";
                  const tlgUrl = tlgUsername
                    ? `https://t.me/${tlgUsername}`
                    : cleanPhone
                    ? `https://t.me/+${cleanPhone.startsWith("855") ? cleanPhone : "855" + cleanPhone.replace(/^0/, "")}`
                    : null;

                  return (
                    <div
                      key={ord.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      {/* Top Bar: Order Ref, Time, Telegram Direct Chat, Status Actions, Receipt, Delete */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-sm font-black text-emerald-700 dark:text-toy-cyan bg-emerald-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-slate-800">
                            {ord.orderRef}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(ord.createdAt).toLocaleDateString()} at{" "}
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {/* Current Status Badge */}
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${statusColors[ord.status] || "bg-slate-100 text-slate-700"}`}>
                            {ord.status}
                          </span>
                        </div>

                        {/* Action Buttons: 1-Click Telegram Chat, Confirm / Reject Action Buttons, Receipt, Delete */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* 1-Click Telegram Redirect Button */}
                          {tlgUrl && (
                            <a
                              href={tlgUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => sounds.playPop()}
                              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                              title="Directly message customer on Telegram"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Telegram</span>
                            </a>
                          )}

                          {/* Direct Confirm or Reject Buttons for Pending */}
                          {ord.status === "pending" && (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  sounds.playChime();
                                  updateOrderStatus(ord.id, "confirmed");
                                  showToast(`Order ${ord.orderRef} CONFIRMED! Notification sent.`);
                                }}
                                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>✓ Confirm</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Reject order ${ord.orderRef}? Customer will see rejected status.`)) {
                                    sounds.playPop();
                                    updateOrderStatus(ord.id, "rejected");
                                    showToast(`Order ${ord.orderRef} REJECTED.`);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>✕ Reject</span>
                              </button>
                            </div>
                          )}

                          {ord.status === "confirmed" && (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  sounds.playPop();
                                  updateOrderStatus(ord.id, "packaging");
                                  showToast(`Order ${ord.orderRef} moved to PACKAGING.`);
                                }}
                                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                              >
                                <Package className="w-4 h-4" />
                                <span>Pack</span>
                              </button>
                              <button
                                onClick={() => {
                                  updateOrderStatus(ord.id, "rejected");
                                  showToast(`Order ${ord.orderRef} marked as Rejected.`);
                                }}
                                className="h-9 sm:h-10 px-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {ord.status === "packaging" && (
                            <button
                              onClick={() => {
                                sounds.playChime();
                                updateOrderStatus(ord.id, "shipped");
                                showToast(`Order ${ord.orderRef} moved to SHIPPED 🚚.`);
                              }}
                              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                              <Truck className="w-4 h-4" />
                              <span>Ship</span>
                            </button>
                          )}

                          {ord.status === "shipped" && (
                            <button
                              onClick={() => {
                                sounds.playFanfare();
                                updateOrderStatus(ord.id, "delivered");
                                showToast(`Order ${ord.orderRef} marked as DELIVERED 🎉!`);
                              }}
                              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Deliver</span>
                            </button>
                          )}

                          {(ord.status === "rejected" || ord.status === "cancelled") && (
                            <button
                              onClick={() => {
                                sounds.playChime();
                                updateOrderStatus(ord.id, "confirmed");
                                showToast(`Order ${ord.orderRef} re-opened and Confirmed.`);
                              }}
                              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Re-Confirm</span>
                            </button>
                          )}

                          {/* View / Print Receipt Button */}
                          <button
                            onClick={() => {
                              sounds.playPop();
                              setSelectedReceiptOrder(ord);
                            }}
                            className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                            title="View Printable Receipt"
                          >
                            <Receipt className="w-4 h-4 text-emerald-600 dark:text-toy-cyan" />
                            <span>Receipt</span>
                          </button>

                          {/* Delete Order (Isolated & Protected Touch Target) */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete order ${ord.orderRef}?`)) {
                                sounds.playPop();
                                deleteOrder(ord.id);
                                showToast(`Deleted order ${ord.orderRef}`);
                              }
                            }}
                            className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-500 hover:text-rose-600 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 ml-auto sm:ml-0"
                            title="Delete order"
                            aria-label="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Customer Info & Shipping Address */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Customer */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{ord.customerName}</div>
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{ord.customerPhone}</span>
                          </a>
                          {ord.telegramHandle && (
                            <a
                              href={`https://t.me/${ord.telegramHandle.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#229ED9] font-bold flex items-center gap-1 hover:underline"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>{ord.telegramHandle} (Open Chat)</span>
                            </a>
                          )}
                        </div>

                        {/* Delivery Location */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Destination</span>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{ord.province}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {ord.address}
                          </p>
                          {ord.notes && (
                            <p className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                              Note: {ord.notes}
                            </p>
                          )}
                        </div>

                        {/* Payment & Totals */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment & Total</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-black text-[10px] uppercase">
                              {ord.paymentMethod.toUpperCase()}
                            </span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                              +{ord.pointsEarned} pt
                            </span>
                          </div>
                          <div className="text-lg font-black text-amber-600 dark:text-toy-yellow font-fredoka pt-1">
                            {formatPrice(ord.totalUsd, currency)}{" "}
                            <span className="text-xs text-slate-400 font-medium font-sans">
                              ({ord.totalKhr.toLocaleString()} KHR)
                            </span>
                          </div>
                          {ord.voucherCodeApplied && (
                            <span className="text-[10px] text-teal-600 font-bold block">
                              Voucher: {ord.voucherCodeApplied}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-500 block mb-2">
                          Items in Order ({ord.items.length}):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {ord.items.map((item, idx) => {
                            const itemImg = item.product
                              ? item.product.image
                              : item.customBracelet?.charms[0]?.charm.image || "/assets/charm_clean.png";
                            const itemPrice = item.product ? item.product.price : item.customBracelet?.unitPrice || 0;
                            const itemTotal = itemPrice * item.quantity;
                            const itemCode = item.product?.code;

                            return (
                              <div
                                key={idx}
                                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 text-xs shadow-xs"
                              >
                                {/* Prominent Product Picture */}
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center p-1 shadow-xs">
                                  <Image
                                    src={itemImg}
                                    alt="Product Picture"
                                    fill
                                    className="object-contain p-0.5"
                                    unoptimized={Boolean(itemImg?.startsWith("data:"))}
                                  />
                                </div>

                                {/* Product Description & Details beside the Picture */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h5 className="font-bold text-slate-900 dark:text-white truncate font-fredoka text-sm">
                                      {item.product
                                        ? item.product.name
                                        : `Custom Italian Bracelet (${item.customBracelet?.sizeLinks} Links)`}
                                    </h5>
                                    {itemCode && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                                        {itemCode}
                                      </span>
                                    )}
                                  </div>

                                  {/* Product Description */}
                                  {item.product?.bio ? (
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                      {item.product.bio}
                                    </p>
                                  ) : item.customBracelet ? (
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                      Custom Italian modular bracelet in {item.customBracelet.finish.toUpperCase()} Inox · {item.customBracelet.charms.length} charms installed.
                                    </p>
                                  ) : null}

                                  <div className="text-slate-500 text-[11px] flex items-center justify-between pt-0.5">
                                    <span>
                                      Qty: <strong className="text-slate-800 dark:text-slate-200">{item.quantity}</strong> × ${itemPrice.toFixed(2)}
                                    </span>
                                    <span className="font-black text-amber-600 dark:text-toy-yellow font-fredoka text-xs">
                                      {formatPrice(itemTotal, currency)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Custom Italian Charm Bracelet Assembled Band Preview (Instant check for Admin) */}
                        {ord.items.some((it) => it.customBracelet) && (
                          <div className="mt-3 space-y-2">
                            {ord.items
                              .filter((it) => it.customBracelet)
                              .map((it, cIdx) => (
                                <ReceiptBraceletBand
                                  key={`admin-ord-band-${ord.id}-${cIdx}`}
                                  bracelet={it.customBracelet!}
                                  compact={true}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: VOUCHER MANAGEMENT                            */}
        {/* ==================================================== */}
        {activeTab === "vouchers" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((vouch) => (
                <div
                  key={vouch.code}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                        {vouch.badge || "PROMO"}
                      </span>
                      <span className="text-xs font-black text-amber-600 dark:text-toy-yellow font-fredoka">
                        {vouch.pointsCost} pt
                      </span>
                    </div>

                    <div className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                      {vouch.discountType === "fixed"
                        ? `$${vouch.fixedDiscountUsd?.toFixed(2)} OFF`
                        : `${vouch.discountPct}% OFF`}
                    </div>

                    <div className="font-mono text-xs font-black text-emerald-700 dark:text-toy-cyan bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      {vouch.code}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {vouch.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Min spend: ${vouch.minSpend}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete voucher ${vouch.code}?`)) {
                          sounds.playPop();
                          deleteVoucher(vouch.code);
                          showToast(`Deleted voucher ${vouch.code}`);
                        }
                      }}
                      className="h-8 sm:h-9 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* ==================================================== */}
        {/* TAB 5: ITALY MODULAR CHARMS MANAGEMENT               */}
        {/* ==================================================== */}
        {activeTab === "charms" && (
          <div className="space-y-6">
            {/* Charms Summary & Filters Card */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={charmSearch}
                  onChange={(e) => setCharmSearch(e.target.value)}
                  placeholder="Search charms by name or category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["all", "emblem", "cute", "stone", "anime", "letter"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sounds.playPop();
                      setCharmCatFilter(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap border ${
                      charmCatFilter === cat
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-toy-green-glow"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Charms Cards Grid (Multiplatform Responsive) */}
            {filteredCharms.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-3">
                <Sparkles className="w-12 h-12 mx-auto text-emerald-500 dark:text-emerald-400" />
                <h4 className="font-black text-base font-fredoka text-slate-800 dark:text-slate-200">
                  {charms.length === 0 ? "Charm Inventory is Empty" : "No charms match your search"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {charms.length === 0
                    ? "Your charm inventory is ready! Click 'Upload Charm Photo' below to add charm photos directly from your device."
                    : "Try clearing the search filter or click 'Add New Charm' to create one."}
                </p>
                <button
                  onClick={handleOpenAddCharm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black font-fredoka text-xs shadow-md hover:from-emerald-400 hover:to-green-500 transition-all active:scale-95 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{charms.length === 0 ? "Upload & Add First Charm 📸" : "Add First Charm"}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredCharms.map((charm) => (
                  <div
                    key={charm.id}
                    className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-black dark:bg-black border border-zinc-800 shadow-md hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
                  >
                    {/* Top Row: Category badge, Charm Code & popularity */}
                    <div className="flex items-center justify-between text-xs mb-2 sm:mb-3 gap-1">
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider border border-zinc-700 truncate">
                          {charm.category}
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-mono font-black text-[8px] sm:text-[10px] border border-emerald-700/60 truncate">
                          #{getCharmCode(charm)}
                        </span>
                      </div>
                      {charm.isPopular && (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 text-[8px] sm:text-[10px] font-black border border-amber-700/60 flex items-center gap-1 flex-shrink-0">
                          <span>⭐</span>
                          <span className="hidden sm:inline">Popular</span>
                        </span>
                      )}
                    </div>

                    {/* Center Preview: Side-by-Side Face Photo & Bracelet Link Inlay */}
                    <div className="flex items-center justify-around py-2 sm:py-3 px-1 sm:px-2 bg-zinc-950/80 rounded-xl sm:rounded-2xl border border-zinc-800 my-1.5 sm:my-2">
                      {/* Left: Charm Face (Uploaded Photo) */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-9 h-8 sm:w-12 sm:h-10 rounded-lg overflow-hidden border border-zinc-700 bg-black shadow-xs mb-1">
                          <Image
                            src={charm.image || "/assets/charm_clean.png"}
                            alt={charm.name}
                            fill
                            className="object-contain p-0.5"
                            unoptimized={Boolean(charm.image?.startsWith("data:"))}
                          />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                          Face
                        </span>
                      </div>

                      <div className="h-6 sm:h-8 w-px bg-zinc-800" />

                      {/* Right: Bracelet Link Inlay (Cut-Out) */}
                      <div className="flex flex-col items-center">
                        <ConnectedCharmLink
                          charm={charm}
                          slotIndex={0}
                          finish="silver"
                          size="compact"
                        />
                        <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-tight mt-0.5 sm:mt-1">
                          Link
                        </span>
                      </div>
                    </div>

                    {/* Charm Info */}
                    <div className="space-y-0.5 sm:space-y-1 my-1 sm:my-2">
                      <h4 className="font-black text-xs sm:text-sm font-fredoka text-white line-clamp-1">
                        {charm.name}
                      </h4>
                      {charm.nameKh && (
                        <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-1">
                          {charm.nameKh}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                        <span className="text-sm sm:text-base font-black font-fredoka text-amber-400">
                          {formatPrice(charm.price, currency)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate max-w-[80px]">
                          {charm.id.slice(0, 10)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditCharm(charm)}
                        className="flex-1 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCharm(charm.id, charm.name)}
                        className="h-9 sm:h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-200 dark:border-rose-900/40 active:scale-95 cursor-pointer"
                        title="Delete charm from store"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: CUSTOMIZE CHARM BRACELET STUDIO & WORKSHOP    */}
        {/* ==================================================== */}
        {activeTab === "bracelet_studio" && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 font-black text-xs font-fredoka uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Bracelet Workshop</span>
                </div>
                <h3 className="text-xl font-black font-fredoka text-slate-900 dark:text-white">
                  Customize Italian Charm Bracelet & Add to Catalog
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mt-1 leading-relaxed">
                  Assemble charms onto the modular stainless steel band (minimum 16 charms, no upper limit). When satisfied, click &apos;Add As Product to Shop Catalog&apos; to instantly publish this customized bracelet for customer purchase!
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleOpenAddCharm}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Charm Photo 📸</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playPop();
                    setActiveTab("charms");
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Manage Charms ({charms ? charms.length : 0})</span>
                </button>
              </div>
            </div>

            {/* Embedded Custom Bracelet Studio with Admin Mode ON */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-4 shadow-sm">
              <CustomBraceletStudio
                standalone={false}
                isAdminMode={true}
                onAddAsProduct={handleStudioAddAsProduct}
                onOpenAddCharmModal={handleOpenAddCharm}
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: CATEGORY BENTO BOXES MANAGEMENT              */}
        {/* ==================================================== */}
        {activeTab === "category_boxes" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Header Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="min-w-0 w-full md:w-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 font-black text-xs font-fredoka uppercase tracking-wider mb-2">
                  <Images className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Frontpage Showcase Bento Grid</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-fredoka text-slate-900 dark:text-white">
                  Category Boxes & Showcase Cards
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mt-1 leading-relaxed">
                  Design and manage the hero category cards seen on the customer homepage (e.g. Customize Italy Charm, Minifigures, Toys). Change pictures, edit titles, switch between Full Width Banner and Half Width Card, link to custom pages or categories, and add or remove boxes anytime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={handleResetBoxes}
                  className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  title="Restore original 3 default boxes"
                >
                  <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Reset Default 3 Boxes</span>
                </button>
                <button
                  onClick={handleOpenAddBox}
                  className="px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black font-fredoka text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add New Category Box 🍱</span>
                </button>
              </div>
            </div>

            {/* LIVE BENTO GRID VISUAL PREVIEW */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <h4 className="font-black font-fredoka text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white truncate">
                    Live Customer Frontpage Preview
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold sm:hidden">
                    Tap to edit ✎
                  </span>
                  <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                    {categoryBoxes?.filter((b) => b.active).length || 0} active cards on customer front
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5 max-w-4xl mx-auto">
                  {(categoryBoxes || []).map((box, idx) => {
                    const isFull = box.span === "full";
                    return (
                      <div
                        key={box.id}
                        onClick={() => handleOpenEditBox(box)}
                        className={`group relative overflow-hidden rounded-[18px] sm:rounded-[28px] border-2 ${
                          box.active
                            ? "border-emerald-500/60 dark:border-emerald-500/40"
                            : "border-dashed border-slate-400 opacity-60"
                        } bg-slate-900 shadow-lg cursor-pointer transition-all active:scale-[0.98] ${
                          isFull
                            ? "col-span-2 aspect-[21/9] sm:aspect-[2.4/1] min-h-[140px] sm:min-h-[170px]"
                            : "col-span-1 aspect-[3/4] sm:aspect-[1/1] md:aspect-[4/5] min-h-[170px] sm:min-h-0"
                        }`}
                      >
                        {/* Background Image */}
                        <div className="absolute inset-0 w-full h-full bg-slate-950">
                          <Image
                            src={box.image}
                            alt={box.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized={box.image.startsWith("data:")}
                          />
                        </div>

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />

                        {/* Top Action Overlay inside Card */}
                        <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 z-30 flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                            {box.badge && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-400/40 text-[8px] sm:text-[9px] font-black uppercase truncate max-w-[70px] sm:max-w-none">
                                {box.badge}
                              </span>
                            )}
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/70 text-slate-300 text-[8px] sm:text-[9px] font-bold shrink-0">
                              {box.span === "full" ? "2-Col" : "1-Col"}
                            </span>
                            {!box.active && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-600 text-white text-[8px] sm:text-[9px] font-black shrink-0">
                                OFF
                              </span>
                            )}
                          </div>

                          {/* Quick Admin Actions on Preview */}
                          {/* Mobile: compact edit pill */}
                          <div className="sm:hidden flex items-center bg-black/75 backdrop-blur-md p-1 rounded-lg border border-white/20 shrink-0">
                            <span className="p-0.5 text-white group-hover:text-amber-400">
                              <Edit2 className="w-3 h-3 text-amber-300" />
                            </span>
                          </div>

                          {/* Desktop: Full toolbar */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="hidden sm:flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/20 shrink-0"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBox(box, "up");
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded text-white hover:text-emerald-400 disabled:opacity-30"
                              title="Move card left / up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBox(box, "down");
                              }}
                              disabled={idx === (categoryBoxes?.length || 0) - 1}
                              className="p-1 rounded text-white hover:text-emerald-400 disabled:opacity-30"
                              title="Move card right / down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditBox(box);
                              }}
                              className="p-1 rounded text-white hover:text-amber-400"
                              title="Edit picture & details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategoryBox(box);
                              }}
                              className="p-1 rounded text-white hover:text-rose-400"
                              title="Delete box"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Text */}
                        <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-5 z-20 flex flex-col justify-end">
                          {box.titleKh && (
                            <span className="text-[9px] sm:text-xs font-bold text-emerald-300 drop-shadow line-clamp-1">
                              {box.titleKh}
                            </span>
                          )}
                          <h3
                            className={`font-black uppercase tracking-tight text-white drop-shadow-lg font-fredoka leading-tight line-clamp-2 ${
                              isFull ? "text-base sm:text-2xl" : "text-xs sm:text-lg"
                            }`}
                          >
                            {box.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] text-slate-300">
                            <span className="bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50 truncate max-w-full">
                              {box.actionType === "link" ? `🔗 URL: ${box.actionValue}` : `🏷️ Cat: ${box.actionValue}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOXES MANAGEMENT LIST & ACTIONS */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black font-fredoka text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                  <span>List of All Category Boxes</span>
                  <span className="text-xs text-slate-500 font-bold">({categoryBoxes?.length || 0})</span>
                </h4>

                <button
                  onClick={handleOpenAddBox}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-fredoka text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Box</span>
                </button>
              </div>

              <div className="space-y-3">
                {(categoryBoxes || []).map((box, idx) => (
                  <div
                    key={box.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-all hover:border-emerald-500/50"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      {/* Image Thumbnail */}
                      <div className="relative w-14 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-700 shrink-0">
                        <Image
                          src={box.image}
                          alt={box.title}
                          fill
                          className="object-cover"
                          unoptimized={box.image.startsWith("data:")}
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h5 className="font-black font-fredoka text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-full">
                            {box.title}
                          </h5>
                          {box.titleKh && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                              ({box.titleKh})
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase shrink-0 ${
                              box.span === "full"
                                ? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                                : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                            }`}
                          >
                            {box.span === "full" ? "Full Width (2 Cols)" : "Half Width (1 Col)"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase shrink-0 ${
                              box.active
                                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {box.active ? "Active" : "Hidden"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="truncate max-w-full">
                            Action:{" "}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {box.actionType === "link" ? `Navigate to ${box.actionValue}` : `Filter ${box.actionValue}`}
                            </strong>
                          </span>
                          {box.badge && <span>Badge: <strong className="text-amber-500">{box.badge}</strong></span>}
                          <span>Sort Order: #{box.order}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-2.5 sm:pt-0 border-t border-slate-200/70 dark:border-slate-800 sm:border-t-0 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveBox(box, "up")}
                          disabled={idx === 0}
                          className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                          title="Move Up"
                          aria-label="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBox(box, "down")}
                          disabled={idx === (categoryBoxes?.length || 0) - 1}
                          className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                          title="Move Down"
                          aria-label="Move Down"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBox(box)}
                          className="h-9 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-fredoka flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Edit Box</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryBox(box)}
                          className="w-9 h-9 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                          title="Delete Box"
                          aria-label="Delete Box"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: PRODUCT CATEGORIES & FILTERS MANAGEMENT       */}
        {/* ==================================================== */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 font-black text-xs font-fredoka uppercase tracking-wider mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Storefront Product Filters</span>
                </div>
                <h3 className="text-xl font-black font-fredoka text-slate-900 dark:text-white">
                  Product Filter Categories ({categories.length})
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mt-1 leading-relaxed">
                  Add, edit, and organize filters used on the storefront catalog and product creation form. Any filter added here appears in the customer Category Arcade, Product Grid filters, and Admin Product dropdowns.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleResetCategories}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
                  title="Restore default categories"
                >
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>Reset Default Filters</span>
                </button>
                <button
                  onClick={handleOpenAddCategory}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black font-fredoka text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Filter / Category 🏷️</span>
                </button>
              </div>
            </div>

            {/* List of Category Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => {
                const productCount = products.filter((p) => (cat.id === "all" ? true : p.cat === cat.id)).length;
                const isMasterAll = cat.id === "all";

                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-emerald-500/60"
                  >
                    <div>
                      {/* Top Bar: Icon, Pill & Product Count */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {cat.icon || "🏷️"}
                          </span>
                          <div>
                            <h4 className="font-black text-base font-fredoka text-slate-900 dark:text-white leading-tight">
                              {cat.name}
                            </h4>
                            {cat.kh && cat.kh !== cat.name && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                {cat.kh}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold whitespace-nowrap">
                          {productCount} {productCount === 1 ? "toy" : "toys"}
                        </span>
                      </div>

                      {/* Slug ID Badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold">
                          ID: {cat.id}
                        </span>
                        {/* Gradient Preview pill */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-white font-bold text-[10px] bg-gradient-to-r ${
                            cat.grad || "from-emerald-500 to-teal-600"
                          }`}
                        >
                          Storefront Style
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {cat.description || "No description provided."}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono font-medium">
                        Order #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="h-9 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-fredoka flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {!isMasterAll && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="w-9 h-9 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            title="Delete Filter"
                            aria-label="Delete Filter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL: BULK UPLOAD PRODUCTS                          */}
      {/* ==================================================== */}
      <AnimatePresence>
        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 dark:border-indigo-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[92vh] flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
            >
              <button
                onClick={() => setBulkModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Images className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                    Bulk Product Upload 📦
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload multiple products at once. Select multiple photos to create multiple products, or import via spreadsheet.
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setBulkModalTab("photos")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-fredoka flex items-center gap-2 transition-all cursor-pointer ${
                    bulkModalTab === "photos"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Images className="w-4 h-4" />
                  <span>Bulk Photos (1 Photo = 1 Product)</span>
                  {bulkPhotoItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-[10px] font-mono font-bold">
                      {bulkPhotoItems.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setBulkModalTab("csv")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-fredoka flex items-center gap-2 transition-all cursor-pointer ${
                    bulkModalTab === "csv"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Spreadsheet (CSV / JSON)</span>
                </button>
              </div>

              {/* TAB 1: MULTI-PHOTO UPLOAD (1 Photo = 1 Product) */}
              {bulkModalTab === "photos" && (
                <div className="flex-1 flex flex-col min-h-0">
                  {bulkPhotoItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 rounded-3xl border-2 border-dashed border-indigo-400/60 dark:border-indigo-600/40 bg-indigo-50/40 dark:bg-indigo-950/20 text-center my-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                        <Images className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black font-fredoka text-slate-900 dark:text-white mb-2">
                        Select 10+ Photos from Device (Each Photo = 1 Product)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                        Pick multiple photos from your computer or phone. Each photo automatically creates a separate product where you can edit its name, category, price, and stock before saving all at once!
                      </p>

                      <button
                        type="button"
                        onClick={handleTriggerBulkPhotoUpload}
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black font-fredoka text-sm shadow-xl hover:scale-102 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Select Multiple Photos (e.g. 10 photos)</span>
                      </button>
                      {bulkIsProcessingImages && (
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Optimizing and loading photos...</span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-3">
                        Tip: Hold Shift or Ctrl/Cmd to select 10, 20 or more pictures at once from your gallery.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Batch Apply Actions Toolbar */}
                      <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 mb-3 flex flex-col gap-2.5 flex-shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black font-fredoka text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                              Batch Actions ({bulkPhotoItems.length} Products):
                            </span>
                            <span className="text-[11px] text-slate-500 hidden sm:inline">
                              Apply common settings to all products with 1 click:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleTriggerBulkPhotoUpload}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-black font-fredoka text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add More Photos</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Clear all draft products in this batch?")) {
                                  setBulkPhotoItems([]);
                                  sounds.playPop();
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Global Category */}
                          <div className="flex gap-1.5 items-center bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <select
                              value={bulkGlobalCat}
                              onChange={(e) => setBulkGlobalCat(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-transparent border-0 outline-none text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                            >
                              {categories.filter(c => c.id !== "all").map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleApplyCatToAll}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black font-fredoka whitespace-nowrap active:scale-95 cursor-pointer"
                            >
                              Apply Cat
                            </button>
                          </div>

                          {/* Global Price */}
                          <div className="flex gap-1.5 items-center bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <span className="text-xs font-bold text-slate-400 pl-1.5">$</span>
                            <input
                              type="number"
                              step="0.1"
                              value={bulkGlobalPrice}
                              onChange={(e) => setBulkGlobalPrice(e.target.value)}
                              placeholder="Price for all"
                              className="w-full px-1 py-1 text-xs bg-transparent border-0 outline-none text-slate-800 dark:text-slate-200 font-bold"
                            />
                            <button
                              type="button"
                              onClick={handleApplyPriceToAll}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black font-fredoka whitespace-nowrap active:scale-95 cursor-pointer"
                            >
                              Apply Price
                            </button>
                          </div>

                          {/* Global Stock */}
                          <div className="flex gap-1.5 items-center bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <span className="text-xs font-bold text-slate-400 pl-1.5">Qty</span>
                            <input
                              type="number"
                              min="0"
                              value={bulkGlobalStock}
                              onChange={(e) => setBulkGlobalStock(e.target.value)}
                              placeholder="Stock for all"
                              className="w-full px-1 py-1 text-xs bg-transparent border-0 outline-none text-slate-800 dark:text-slate-200 font-bold"
                            />
                            <button
                              type="button"
                              onClick={handleApplyStockToAll}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black font-fredoka whitespace-nowrap active:scale-95 cursor-pointer"
                            >
                              Apply Stock
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product Batch Cards List */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
                        {bulkPhotoItems.map((item, idx) => (
                          <div
                            key={item.tempId}
                            className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                          >
                            {/* Photo Thumbnail */}
                            <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex-shrink-0 shadow-sm">
                              <Image
                                src={item.image}
                                alt={item.name || "Product"}
                                fill
                                className="object-cover"
                                unoptimized={Boolean(item.image?.startsWith("data:"))}
                              />
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold">
                                #{idx + 1}
                              </span>
                              <label
                                title="Click to replace photo for this product"
                                className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 hover:bg-black text-white text-[9px] font-bold cursor-pointer flex items-center gap-0.5 shadow-md active:scale-95 transition-all"
                              >
                                <Upload className="w-2.5 h-2.5 text-amber-300" />
                                <span>Edit</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      await handleReplaceSinglePhoto(idx, file);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Editable Fields */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 w-full min-w-0">
                              {/* SKU Code */}
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                  SKU Code
                                </label>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={item.code}
                                    onChange={(e) => updateBulkPhotoItem(idx, { code: e.target.value.toUpperCase() })}
                                    className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>

                              {/* Name EN */}
                              <div className="sm:col-span-4">
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                  Toy Name (English) *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={item.name}
                                  onChange={(e) => updateBulkPhotoItem(idx, { name: e.target.value })}
                                  placeholder="e.g. Cyber Mecha Titan"
                                  className={`w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 ${
                                    !item.name.trim() ? "border-rose-400 dark:border-rose-600 bg-rose-50/50" : "border-slate-200 dark:border-slate-800"
                                  }`}
                                />
                              </div>

                              {/* Category */}
                              <div className="sm:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                  Category *
                                </label>
                                <select
                                  value={item.cat}
                                  onChange={(e) => updateBulkPhotoItem(idx, { cat: e.target.value })}
                                  className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
                                >
                                  {categories.filter(c => c.id !== "all").map(c => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Price */}
                              <div className="sm:col-span-1.5">
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                  Price ($)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={item.price}
                                  onChange={(e) => updateBulkPhotoItem(idx, { price: e.target.value })}
                                  className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-indigo-500"
                                />
                              </div>

                              {/* Stock */}
                              <div className="sm:col-span-1.5">
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                  Stock
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.stock}
                                  onChange={(e) => updateBulkPhotoItem(idx, { stock: e.target.value })}
                                  className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removeBulkPhotoItem(idx)}
                              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors flex-shrink-0 self-end sm:self-center cursor-pointer"
                              title="Remove this product from batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Action Footer for Multi-Photo */}
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>
                            <strong>{bulkPhotoItems.filter(p => p.name.trim()).length}</strong> of <strong>{bulkPhotoItems.length}</strong> products ready to publish
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setBulkModalOpen(false)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveAllBulkPhotos}
                            disabled={bulkIsSubmitting || bulkPhotoItems.length === 0 || bulkPhotoItems.some(p => !p.name.trim())}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-white font-black font-fredoka text-xs sm:text-sm shadow-toy-green-glow flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>
                              {bulkIsSubmitting ? "Publishing..." : `Save & Publish All ${bulkPhotoItems.length} Products 🚀`}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SPREADSHEET (CSV / JSON) */}
              {bulkModalTab === "csv" && (
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                  {/* Action Toolbar: Template Download & Preset Samples & File Picker */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 my-2 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleDownloadCsvTemplate}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/80 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>📥 Download CSV Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLoadSampleBatch}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/80 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>✨ Load 5 Sample Products</span>
                      </button>

                      <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black font-fredoka flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload .CSV / .JSON</span>
                        <input
                          type="file"
                          accept=".csv,.txt,.tsv,.json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Import Mode Toggle */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">Mode:</span>
                      <button
                        type="button"
                        onClick={() => setBulkReplaceMode(!bulkReplaceMode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black font-fredoka transition-all border ${
                          bulkReplaceMode
                            ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                            : "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                        }`}
                      >
                        {bulkReplaceMode ? "⚠️ Overwrite Catalog" : "➕ Append / Update"}
                      </button>
                    </div>
                  </div>

                  {/* Text / Data Input Area */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Paste CSV Data or JSON Array:
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Comma, tab, or semicolon delimited
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={bulkRawText}
                      onChange={(e) => {
                        setBulkRawText(e.target.value);
                        parseBulkInput(e.target.value);
                      }}
                      placeholder="Code,Name,NameKh,Category,Price,Discount,Stock,Points,Image,Bio,BioKh..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-base sm:text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 outline-none resize-y"
                    />
                  </div>

                  {bulkFileError && (
                    <div className="mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      {bulkFileError}
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs sm:text-sm font-fredoka text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Parsed Preview</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-black border border-blue-300 dark:border-blue-800">
                          {bulkParsedProducts.length} items detected
                        </span>
                        {bulkParsedProducts.filter((p) => p._valid).length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-black border border-emerald-300 dark:border-emerald-800">
                            {bulkParsedProducts.filter((p) => p._valid).length} valid
                          </span>
                        )}
                      </h3>
                      {bulkParsedProducts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setBulkRawText("");
                            setBulkParsedProducts([]);
                          }}
                          className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          Clear Data
                        </button>
                      )}
                    </div>

                    {bulkParsedProducts.length === 0 ? (
                      <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                        Paste CSV or JSON, or click &quot;Load 5 Sample Products&quot; above to preview items before importing.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 divide-y divide-slate-200 dark:divide-slate-800">
                        {bulkParsedProducts.map((p, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs ${
                              p._valid ? "" : "bg-rose-50/60 dark:bg-rose-950/30"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-mono text-[10px] text-slate-400 w-5 flex-shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex-shrink-0">
                                {p.image ? (
                                  <Image
                                    src={p.image}
                                    alt={p.name || "Product"}
                                    fill
                                    className="object-cover"
                                    unoptimized={Boolean(p.image?.startsWith("data:"))}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-slate-900 dark:text-white truncate font-fredoka">
                                    {p.name || "Untitled"}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {p.code}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                    ${p.price?.toFixed(2)}
                                  </span>
                                  <span>• {p.cat}</span>
                                  <span>• Stock: {p.stock}</span>
                                  <span>• +{p.pt} pt</span>
                                  {p.discount ? <span className="text-rose-500 font-bold">• {p.discount}% OFF</span> : null}
                                </div>
                                {p._errors && p._errors.length > 0 && (
                                  <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                                    ⚠️ {p._errors.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {p._valid ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[9px] border border-emerald-300 dark:border-emerald-800">
                                  ✓ Ready
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[9px] border border-rose-300 dark:border-rose-800">
                                  Invalid
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  sounds.playPop();
                                  setBulkParsedProducts((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                                title="Remove this item from batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CSV Submit Action */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 text-center sm:text-left">
                      {bulkParsedProducts.filter((p) => p._valid).length > 0
                        ? `Ready to import ${bulkParsedProducts.filter((p) => p._valid).length} verified products into database.`
                        : "Add or paste products above to proceed."}
                    </p>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setBulkModalOpen(false)}
                        className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteBulkUpload}
                        disabled={bulkIsSubmitting || bulkParsedProducts.filter((p) => p._valid).length === 0}
                        className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black font-fredoka text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {bulkIsSubmitting
                            ? "Importing..."
                            : `Import ${bulkParsedProducts.filter((p) => p._valid).length} Products`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                            */}
      {/* ==================================================== */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
            >
              <button
                onClick={() => setProductModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white mb-1">
                {editingProduct ? `Edit Toy: ${editingProduct.name}` : "Add New Toy to Storefront"}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Fill in toy details. Updates will immediately reflect on the live customer website.
              </p>

              {!editingProduct && (
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-5">
                  <div className="flex-1 py-2 px-3 rounded-xl text-xs font-black font-fredoka flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                    <span>One by One (Single Toy)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductModalOpen(false);
                      handleOpenBulkPhotoUpload();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black font-fredoka flex items-center justify-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <Images className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Bulk Upload (10+ Photos) 📸</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Product Code / SKU with Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Product Code (SKU) *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateProductCode}
                      className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-fredoka"
                    >
                      <Dices className="w-3 h-3" />
                      <span>Generate Code 🎲</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={pCode}
                      onChange={(e) => setPCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SPK-1001"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateProductCode}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
                      title="Generate new random product code"
                    >
                      <Dices className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>

                {/* Name EN & KH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Toy Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Cyber Mech Titan"
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
                      placeholder="ឈ្មោះប្រដាប់ក្មេងលេង"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Category & Rarity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Category / Filter *
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenAddCategory}
                        className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-fredoka"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Filter</span>
                      </button>
                    </div>
                    <select
                      value={pCat}
                      onChange={(e) => setPCat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                    >
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name} {c.kh && c.kh !== c.name ? `(${c.kh})` : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Rarity Badge
                    </label>
                    <select
                      value={pRarity}
                      onChange={(e) => setPRarity(e.target.value as ToyRarity)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Super Rare">Super Rare</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Limited Edition">Limited Edition</option>
                    </select>
                  </div>
                </div>

                {/* Price, Discount, Stock, Points */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      VIP Points (pt)
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

                {/* Multiple Photos / Product Gallery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Images className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Product Photos & Gallery</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                        {pImages.length} {pImages.length === 1 ? "photo" : "photos"}
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Customers can scroll sideways left/right
                    </span>
                  </div>

                  {/* Multi-File Device Upload Button */}
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition-all hover:bg-emerald-100/50">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload Multiple Photos from Device (select 1 or more)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        const resizedUrls = await Promise.all(
                          files.map((file) => resizeImageFile(file, 800, 0.82))
                        );
                        const valid = resizedUrls.filter(Boolean);
                        const updated = [...pImages, ...valid];
                        setPImages(updated);
                        if (updated.length > 0) {
                          setPImage(updated[0]);
                        }
                        sounds.playChime();
                        showToast(`Uploaded & optimized ${valid.length} photo(s)!`);
                      }}
                    />
                  </label>

                  {/* Add Image via URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newPhotoUrl.trim()) {
                            const updated = [...pImages, newPhotoUrl.trim()];
                            setPImages(updated);
                            if (updated.length === 1) setPImage(newPhotoUrl.trim());
                            setNewPhotoUrl("");
                            sounds.playChime();
                            showToast("Added photo from URL");
                          }
                        }
                      }}
                      placeholder="Or paste photo URL (https://...) and press Add"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPhotoUrl.trim()) {
                          const updated = [...pImages, newPhotoUrl.trim()];
                          setPImages(updated);
                          if (updated.length === 1) setPImage(newPhotoUrl.trim());
                          setNewPhotoUrl("");
                          sounds.playChime();
                          showToast("Added photo from URL");
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all whitespace-nowrap shadow-sm"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Photo Gallery Preview Strip */}
                  {pImages.length === 0 && (
                    <div className="py-4 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-400">
                        No photos added yet. Upload from device or enter photo URL above.
                      </p>
                    </div>
                  )}

                  {pImages.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          Gallery Order (Photo #1 is the storefront cover):
                        </span>
                        {pImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Keep only the cover photo and remove other gallery photos?")) {
                                setPImages([pImages[0]]);
                                sounds.playPop();
                              }
                            }}
                            className="text-[10px] text-rose-500 hover:underline"
                          >
                            Keep Only Cover
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                        {pImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`relative group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-900 transition-all ${
                              idx === 0
                                ? "border-emerald-500 ring-2 ring-emerald-500/30"
                                : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
                            }`}
                          >
                            <Image
                              src={imgUrl}
                              alt={`Photo ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized={Boolean(imgUrl?.startsWith("data:"))}
                            />
                            {/* Order badge */}
                            <span
                              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black leading-none ${
                                idx === 0
                                  ? "bg-emerald-600 text-white"
                                  : "bg-black/75 text-white backdrop-blur-xs"
                              }`}
                            >
                              {idx === 0 ? "Cover" : `#${idx + 1}`}
                            </span>

                            {/* Action buttons overlay on hover */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [imgUrl, ...pImages.filter((_, i) => i !== idx)];
                                    setPImages(next);
                                    setPImage(imgUrl);
                                    sounds.playPop();
                                    showToast(`Set photo #${idx + 1} as cover!`);
                                  }}
                                  className="w-full py-0.5 px-1 rounded bg-emerald-500 text-white text-[9px] font-black hover:bg-emerald-600"
                                  title="Make this the main cover image"
                                >
                                  ★ Set Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const next = pImages.filter((_, i) => i !== idx);
                                  setPImages(next);
                                  if (next.length > 0) {
                                    setPImage(next[0]);
                                  } else {
                                    setPImage("");
                                  }
                                  sounds.playPop();
                                  showToast("Photo removed");
                                }}
                                className="w-full py-0.5 px-1 rounded bg-rose-600 text-white text-[9px] font-bold hover:bg-rose-700"
                                title="Remove photo"
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Presets */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Quick demo presets (click to add to gallery):
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {PRESET_TOY_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!pImages.includes(img.url)) {
                              const updated = [...pImages, img.url];
                              setPImages(updated);
                              if (updated.length === 1) setPImage(img.url);
                              sounds.playPop();
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${
                            pImages.includes(img.url)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                          }`}
                        >
                          + {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={pBio}
                    onChange={(e) => setPBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Save CTA & Delete Option */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete "${editingProduct.name}" (${editingProduct.code || editingProduct.id}) from the store?`)) {
                          sounds.playPop();
                          deleteProduct(editingProduct.id);
                          setProductModalOpen(false);
                          showToast(`Deleted "${editingProduct.name}" from store.`);
                        }
                      }}
                      className="py-3 px-4 rounded-2xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/70 border border-rose-300 dark:border-rose-800/60 font-fredoka text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Delete Product</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingProduct ? "Save Changes to Store" : "Add Toy to Storefront"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL: ADD VOUCHER                                   */}
      {/* ==================================================== */}
      <AnimatePresence>
        {voucherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
            >
              <button
                onClick={() => setVoucherModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white mb-1">
                Create Loyalty Voucher
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Customers can exchange their earned points for this voucher on the storefront.
              </p>

              <form onSubmit={handleSaveVoucher} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Promo Code (Uppercase) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TOY25OFF"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={vDiscountPct}
                      onChange={(e) => setVDiscountPct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Points Cost (pt)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={vPointsCost}
                      onChange={(e) => setVPointsCost(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Voucher Description (English)
                  </label>
                  <input
                    type="text"
                    value={vDescription}
                    onChange={(e) => setVDescription(e.target.value)}
                    placeholder="e.g. 15% OFF Any Order"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Deploy Voucher to Store</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT ITALY CHARM                        */}
      {/* ==================================================== */}
      <AnimatePresence>
        {charmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
            >
              <button
                onClick={() => setCharmModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white mb-1">
                {editingCharm ? "Edit Italy Charm" : "Add New Italy Charm"}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                This charm will instantly be available for customers in the Italy Charm Bracelet Studio.
              </p>

              <form onSubmit={handleSaveCharm} className="space-y-4">
                {/* Live Charm Element Preview */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Live Charm Element Preview:</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {cImage ? "✓ Ready for Workshop & Store" : "Waiting for charm photo"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {/* 1. Single Charm Element */}
                    <div className="flex flex-col items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Single Charm Element
                      </span>
                      <div className="flex items-center justify-center my-auto p-2">
                        {cImage ? (
                          <div className="relative w-20 aspect-[1.14/1] rounded-sm overflow-hidden flex items-center justify-center">
                            <Image
                              src={cImage}
                              alt="Charm Element"
                              fill
                              className="object-contain"
                              unoptimized={cImage.startsWith("data:")}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-14 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <Upload className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1.5">
                        Direct Charm (No Template Fitting)
                      </span>
                    </div>

                    {/* 2. Connected Bracelet Band Preview (3 charms connected) */}
                    <div className="flex flex-col items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                        Bracelet Link Preview (Connected)
                      </span>
                      <div className="flex items-center justify-center my-auto p-2">
                        {cImage ? (
                          <div className="flex items-center -space-x-1 sm:-space-x-1.5">
                            {[0, 1, 2].map((idx) => (
                              <ConnectedCharmLink
                                key={idx}
                                charm={{
                                  id: "temp-" + idx,
                                  name: cName || "Preview",
                                  nameKh: cNameKh || "Charm",
                                  category: cCat,
                                  price: parseFloat(cPrice) || 1.5,
                                  image: cImage,
                                }}
                                slotIndex={idx}
                                finish="silver"
                                size="workbench"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-28 h-14 rounded-xl border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center bg-emerald-500/5 text-emerald-600 text-[9px] font-bold">
                            <span>Upload to preview band</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold">
                        Seamless Interlocking
                      </span>
                    </div>
                  </div>
                </div>

                {/* Short Charm Code (SKU) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>Charm Code (Short Share Code)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                        Guaranteed Unique
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        const nextCode = generateUniqueCharmCode(
                          { id: editingCharm?.id, name: cName, category: cCat },
                          charms || []
                        );
                        setCCode(nextCode);
                      }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡ Auto-Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    placeholder="Auto unique code (e.g. C01, DAD, GF1)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:border-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Customers use this code to share bracelets (e.g. C01, GF1, DAD). Ensured non-duplicating.
                  </span>
                </div>

                {/* Name EN */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Charm Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="e.g. Neon Cyber Waves"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Name KH */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Charm Name (Khmer)
                  </label>
                  <input
                    type="text"
                    value={cNameKh}
                    onChange={(e) => setCNameKh(e.target.value)}
                    placeholder="e.g. ផ្លាកម៉ូឌុល Cyber Waves"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Category *
                    </label>
                    <select
                      value={cCat}
                      onChange={(e) => setCCat(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none capitalize cursor-pointer"
                    >
                      <option value="emblem">Emblem</option>
                      <option value="cute">Cute & Mascot</option>
                      <option value="stone">Stone & Sparkle</option>
                      <option value="anime">Anime & Pixel</option>
                      <option value="letter">Letter & Symbol</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      required
                      value={cPrice}
                      onChange={(e) => setCPrice(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Upload Charm Photo (Transparent Charm Element) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Charm Photo (Transparent Element) *
                    </label>
                    {isGeneratingCutout ? (
                      <span className="text-[10px] text-emerald-600 animate-pulse font-bold">
                        Trimming borders...
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Direct normal element</span>
                    )}
                  </div>

                  {/* Device File Upload Button */}
                  <label className="flex flex-col items-center justify-center gap-1.5 w-full py-4 px-4 rounded-2xl border-2 border-dashed border-emerald-500/60 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition-all hover:bg-emerald-100/50 text-center mb-2">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="font-fredoka text-sm">Choose Charm Photo from Device</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      PNG, WEBP, or JPG. Already in a charm shape on transparent background.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const resized = await resizeImageFile(file, 480, 0.95);
                          if (resized) {
                            handleImageUploaded(resized);
                          }
                        }
                      }}
                    />
                  </label>

                  {/* Image URL fallback */}
                  <input
                    type="text"
                    required
                    value={cImage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCImage(val);
                      if (val.trim()) {
                        processCharmImage(val.trim());
                      }
                    }}
                    placeholder="Or paste external image URL..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>

                {/* Popular Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={cIsPopular}
                    onChange={(e) => setCIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Mark as Popular / Featured Charm (⭐ Badge)
                  </label>
                </div>

                {/* Save CTA & Delete Option */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {editingCharm && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete charm "${editingCharm.name}" from the store?`)) {
                          sounds.playPop();
                          deleteCharm(editingCharm.id);
                          setCharmModalOpen(false);
                          showToast(`Deleted charm "${editingCharm.name}" from store.`);
                        }
                      }}
                      className="py-3 px-4 rounded-2xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/70 border border-rose-300 dark:border-rose-800/60 font-fredoka text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Delete Charm</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingCharm ? "Save Charm Changes" : "Add Charm to Workshop"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT CATEGORY BENTO BOX                 */}
      {/* ==================================================== */}
      <AnimatePresence>
        {boxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg my-auto bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[92dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
            >
              <button
                onClick={() => setBoxModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-95 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-10 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                  {editingBox ? `Edit Box: ${editingBox.title}` : "Add Category Box 🍱"}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  This box appears on the customer home page matching your reference bento design.
                </p>
              </div>

              <form onSubmit={handleSaveBox} className="space-y-3.5 sm:space-y-4">
                {/* Live Card Preview */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Real-Time Visual Card Preview:</span>
                  </span>

                  <div
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md ${
                      bSpan === "full"
                        ? "w-full aspect-[2.2/1] sm:aspect-[21/9] min-h-[140px] sm:min-h-[160px]"
                        : "w-44 sm:w-56 mx-auto aspect-[4/5]"
                    }`}
                  >
                    {bImage ? (
                      <Image
                        src={bImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized={bImage.startsWith("data:")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        Select or upload image below
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />

                    <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
                      {bBadge ? (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 text-emerald-400 text-[8px] sm:text-[9px] font-black uppercase border border-emerald-400/40">
                          {bBadge}
                        </span>
                      ) : <span />}
                      <div className="w-6 h-6 rounded-full bg-black/55 text-white flex items-center justify-center border border-white/20">
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 z-20">
                      {bTitleKh && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 block line-clamp-1">
                          {bTitleKh}
                        </span>
                      )}
                      <h4 className="font-black text-white uppercase text-xs sm:text-base font-fredoka leading-tight drop-shadow line-clamp-2">
                        {bTitle || "CATEGORY TITLE"}
                      </h4>
                      {bSubtitle && (
                        <p className="text-[9px] sm:text-[10px] text-slate-300 line-clamp-1">{bSubtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title (English) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    placeholder="e.g. CUSTOMIZE ITALY CHARM, MINIFIGURE, TOY"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Title (Khmer) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Title (Khmer)
                  </label>
                  <input
                    type="text"
                    value={bTitleKh}
                    onChange={(e) => setBTitleKh(e.target.value)}
                    placeholder="e.g. រចនាខ្សែដៃអ៊ីតាលី, តុក្កតាមីនី, ប្រដាប់ក្មេងលេង"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Subtitle / Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={bSubtitle}
                    onChange={(e) => setBSubtitle(e.target.value)}
                    placeholder="e.g. 316L Stainless Steel · Live Interactive Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Layout Span (Full Width 2 cols vs Half Width 1 col) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Layout Width (Card Span) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBSpan("full")}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                        bSpan === "full"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-xs font-black">Full Width (2 Columns)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Wide banner (like CUSTOMIZE ITALY CHARM)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBSpan("half")}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                        bSpan === "half"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-xs font-black">Half Width (1 Column)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Side-by-side card (like MINIFIGURE & TOY)
                      </div>
                    </button>
                  </div>
                </div>

                {/* Image Selection & Device Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Background Picture *
                  </label>

                  {/* Presets */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setBImage("/assets/categories/custom-bracelet.jpg")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        bImage === "/assets/categories/custom-bracelet.jpg"
                          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs block truncate">📿 Bracelet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBImage("/assets/categories/minifigure.jpg")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        bImage === "/assets/categories/minifigure.jpg"
                          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs block truncate">🧸 Minifigure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBImage("/assets/categories/toy.jpg")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        bImage === "/assets/categories/toy.jpg"
                          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs block truncate">🏎️ Toys & RC</span>
                    </button>
                  </div>

                  {/* Upload from Device Button */}
                  <div className="flex gap-2 items-center mb-2">
                    <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98">
                      <Upload className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">Upload Picture from Device 📸</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBoxImageUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Custom URL Input */}
                  <input
                    type="text"
                    required
                    value={bImage}
                    onChange={(e) => setBImage(e.target.value)}
                    placeholder="or paste custom image URL / data URI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Click Action: Link vs Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Action on Click *
                    </label>
                    <select
                      value={bActionType}
                      onChange={(e) => {
                        const val = e.target.value as "link" | "category";
                        setBActionType(val);
                        if (val === "link" && !bActionValue.startsWith("/")) {
                          setBActionValue("/italy-bracelet");
                        } else if (val === "category" && bActionValue.startsWith("/")) {
                          setBActionValue("minifigure");
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="category">Filter Store Category</option>
                      <option value="link">Open Page Link / Studio</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {bActionType === "link" ? "Page Link URL" : "Store Category ID"}
                    </label>
                    {bActionType === "link" ? (
                      <input
                        type="text"
                        value={bActionValue}
                        onChange={(e) => setBActionValue(e.target.value)}
                        placeholder="e.g. /italy-bracelet"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    ) : (
                      <select
                        value={bActionValue}
                        onChange={(e) => setBActionValue(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="minifigure">Minifigure Arcade</option>
                        <option value="toy-universe">Tech Toys & RC</option>
                        <option value="blind-box">Mystery Blind Box</option>
                        <option value="bracelet">Italy Modular Charm</option>
                        <option value="plushies">Galaxy Plushies</option>
                        <option value="all">All Toys</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Badge Tag & Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Badge Pill (Optional)
                    </label>
                    <input
                      type="text"
                      value={bBadge}
                      onChange={(e) => setBBadge(e.target.value)}
                      placeholder="e.g. HOT 🔥, STUDIO 🔗, VIRAL"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Sort Order #
                    </label>
                    <input
                      type="number"
                      value={bOrder}
                      onChange={(e) => setBOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="bActive"
                    checked={bActive}
                    onChange={(e) => setBActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="bActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Show this box live on customer home page
                  </label>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                  {editingBox && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteCategoryBox(editingBox);
                        setBoxModalOpen(false);
                      }}
                      className="py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/70 border border-rose-300 dark:border-rose-800/60 font-fredoka text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Delete Box</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-xs sm:text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{editingBox ? "Save Box Changes" : "Create Category Box 🍱"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT FILTER CATEGORY            */}
      {/* ==================================================== */}
      <AnimatePresence>
        {filterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[90dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
            >
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-black font-fredoka text-slate-900 dark:text-white mb-1">
                {editingCategory ? `Edit Filter: ${editingCategory.name}` : "Add New Product Filter / Category 🏷️"}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Configure this category for customers to filter products and for admin product creation.
              </p>

              {/* Live Preview pill */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Storefront Arcade Pill Preview:</span>
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-sm text-white shadow-toy-glow bg-gradient-to-r ${catGrad} border border-white/30 font-fredoka`}
                  >
                    <span className="text-lg">{catIcon || "🏷️"}</span>
                    <span>{catName || "Sample Filter"}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-black/30 text-white">
                      5
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                {/* Filter Name (EN & KH) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Filter Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!editingCategory && !catId) {
                          setCatId(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                        }
                      }}
                      placeholder="e.g. Keychains"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Filter Name (Khmer)
                    </label>
                    <input
                      type="text"
                      value={catNameKh}
                      onChange={(e) => setCatNameKh(e.target.value)}
                      placeholder="e.g. បន្តោងសោរ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Filter Slug ID */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Filter Slug ID * (URL & database key)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingCategory?.id === "all"}
                    value={catId}
                    onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                    placeholder="e.g. keychains"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Lowercase letters, numbers and hyphens only (e.g. anime-figures, rc-cars)
                  </p>
                </div>

                {/* Icon / Emoji Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Icon / Emoji
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={catIcon}
                      onChange={(e) => setCatIcon(e.target.value)}
                      placeholder="🏷️"
                      className="w-20 text-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-base text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                    <div className="flex-1 flex gap-1.5 overflow-x-auto p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 scrollbar-none items-center">
                      {["🧸", "🤖", "🚗", "🧩", "🪀", "📿", "🎁", "✨", "🔥", "💎", "👑", "🦄", "🎮", "🛹", "🚀", "🐱", "🌸", "⚡", "🥋", "🏆"].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setCatIcon(em)}
                          className={`p-1.5 text-base rounded-lg transition-all ${catIcon === em ? "bg-emerald-600 text-white scale-110" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gradient Style Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Color Gradient Badge
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Emerald & Teal", grad: "from-emerald-400 to-teal-600" },
                      { label: "Cyan & Blue", grad: "from-cyan-400 to-blue-600" },
                      { label: "Amber & Orange", grad: "from-amber-400 to-orange-600" },
                      { label: "Pink & Rose", grad: "from-pink-500 to-rose-600" },
                      { label: "Purple & Indigo", grad: "from-purple-400 to-indigo-600" },
                      { label: "Indigo & Pink", grad: "from-indigo-500 via-purple-500 to-pink-500" },
                    ].map((g) => (
                      <button
                        key={g.grad}
                        type="button"
                        onClick={() => setCatGrad(g.grad)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          catGrad === g.grad
                            ? "border-emerald-500 ring-2 ring-emerald-500/30"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {g.label}
                        </span>
                        <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${g.grad}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    placeholder="Short description of this category for customer exploration..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  {editingCategory && editingCategory.id !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteCategory(editingCategory);
                        setFilterModalOpen(false);
                      }}
                      className="py-3 px-4 rounded-2xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/60 font-fredoka text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 shadow-toy-green-glow border-b-4 border-emerald-950 font-fredoka text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingCategory ? "Save Filter Changes" : "Create Filter 🏷️"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable / Beautiful Order Receipt Modal */}
      <OrderReceiptModal />
    </div>
  );
}
