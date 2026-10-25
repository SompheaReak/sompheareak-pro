import { Category } from "@/types/store";

export const CATEGORIES: Category[] = [
  {
    id: "all",
    name: "All Toys",
    kh: "ទាំងអស់",
    en: "All Toys",
    icon: "✨",
    grad: "from-indigo-500 via-purple-500 to-pink-500",
    sort_order: 0,
    description: "Browse the complete Somphea Reak toy universe and custom collections.",
  },
  {
    id: "minifigure",
    name: "Minifigure Arcade",
    kh: "តុក្កតាមីនី Minifigure",
    en: "Minifigure Arcade",
    icon: "🧸",
    grad: "from-cyan-400 to-blue-600",
    sort_order: 1,
    description: "Collectible mini figures, superheroes, anime legends, and building heroes.",
  },
  {
    id: "toy",
    name: "Toy",
    kh: "ប្រដាប់ក្មេងលេង Toy",
    en: "Toy",
    icon: "🪀",
    grad: "from-amber-400 to-orange-600",
    sort_order: 2,
    description: "Exciting toys, speed racers, collectible figures, and play sets.",
  },
  {
    id: "bracelet",
    name: "Braclet for Male&Female",
    kh: "ខ្សែដៃបុរស & នារី Braclet for Male&Female",
    en: "Braclet for Male&Female",
    icon: "📿",
    grad: "from-emerald-400 to-teal-600",
    sort_order: 3,
    description: "Premium stainless steel fashion & couple bracelets for men and women.",
  },
];
