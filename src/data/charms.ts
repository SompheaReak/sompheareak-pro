import { Charm } from "@/types/store";

export const RESERVED_CHARM_CODES = new Set([
  "S",
  "SILVER",
  "G",
  "GOLD",
  "R",
  "ROSE",
  "ROSEGOLD",
  "B",
  "BLACK",
  "SRB",
  "ALL",
  "NONE",
  "NULL",
  "UNDEFINED",
]);

/**
 * Sanitize a proposed charm code into a clean, 2-5 character alphanumeric string.
 */
export function sanitizeCharmCode(code?: string): string {
  if (!code || typeof code !== "string") return "";
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);
}

/**
 * Derives a human-readable, 2-4 letter mnemonic candidate code from a charm name or ID.
 */
function deriveMnemonicCode(name?: string, id?: string): string {
  if (id === "charm-girlfriend-custom") return "GF1";
  if (id === "charm-cat-custom") return "CAT";
  if (id && id.includes("pinkystar-")) {
    const num = parseInt(id.split("pinkystar-")[1] || "0", 10) + 1;
    return `P${num < 10 ? "0" + num : num}`;
  }
  if (id && id.includes("slay-")) {
    const num = parseInt(id.split("slay-")[1] || "0", 10) + 1;
    return `S${num < 10 ? "0" + num : num}`;
  }

  if (!name || typeof name !== "string") return "";
  const cleaned = name.replace(/[^\w\s]/g, "").trim().toUpperCase();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  // Common keywords to clean, short mnemonics
  if (cleaned.includes("DADDY") || cleaned.includes("DAD")) return "DAD";
  if (cleaned.includes("MOMMY") || cleaned.includes("MOM")) return "MOM";
  if (cleaned.includes("WIFE")) return "WIF";
  if (cleaned.includes("HUSBAND")) return "HUB";
  if (cleaned.includes("GIRLFRIEND")) return "GF1";
  if (cleaned.includes("BOYFRIEND")) return "BF1";
  if (cleaned.includes("CAT")) return "CAT";
  if (cleaned.includes("DOG") || cleaned.includes("PUPPY")) return "DOG";
  if (cleaned.includes("SILVER")) return "SLV";
  if (cleaned.includes("GOLD")) return "GLD";
  if (cleaned.includes("HEART")) return "HRT";
  if (cleaned.includes("STAR")) return "STR";
  if (cleaned.includes("CROSS")) return "CRS";
  if (cleaned.includes("ANGEL")) return "ANG";
  if (cleaned.includes("CROWN")) return "CRN";

  // Acronym from multiple words (e.g. "I Love You" -> "ILY")
  if (words.length >= 3) {
    const acronym = words.map((w) => w[0]).join("").slice(0, 4);
    if (acronym.length >= 2) return acronym;
  }

  // First word letters
  const firstWord = words[0];
  if (firstWord.length >= 3) return firstWord.slice(0, 3);
  return firstWord.slice(0, 2);
}

/**
 * Generate a guaranteed unique, non-duplicating short charm code.
 * Ensures the generated code is not already in existingCharms and is not a reserved word.
 */
export function generateUniqueCharmCode(
  charmInput: Partial<Charm> | string,
  existingCharms: Charm[] = []
): string {
  const charm: Partial<Charm> =
    typeof charmInput === "string" ? { name: charmInput } : charmInput || {};
  const currentId = charm.id;

  const usedCodes = new Set<string>();
  existingCharms.forEach((c) => {
    if (c && c.id !== currentId && c.code && typeof c.code === "string") {
      usedCodes.add(c.code.trim().toUpperCase());
    }
  });

  // 1. If an explicit code was provided and is valid & unused
  const proposed = sanitizeCharmCode(charm.code);
  if (
    proposed &&
    proposed.length >= 2 &&
    !RESERVED_CHARM_CODES.has(proposed) &&
    !usedCodes.has(proposed)
  ) {
    return proposed;
  }

  // 1b. If proposed code exists, try appending a numeric suffix (e.g. DAD -> DA1, DA2, or DAD1)
  if (proposed && proposed.length >= 2 && !RESERVED_CHARM_CODES.has(proposed)) {
    const base = proposed.slice(0, 3);
    for (let i = 1; i <= 99; i++) {
      const candidate = `${base}${i < 10 ? "0" + i : i}`;
      if (!usedCodes.has(candidate) && !RESERVED_CHARM_CODES.has(candidate)) {
        return candidate;
      }
    }
  }

  // 2. Try mnemonic derived from name / ID
  const mnemonic = deriveMnemonicCode(charm.name, charm.id);
  if (
    mnemonic &&
    mnemonic.length >= 2 &&
    !RESERVED_CHARM_CODES.has(mnemonic) &&
    !usedCodes.has(mnemonic)
  ) {
    return mnemonic;
  }
  if (mnemonic && mnemonic.length >= 2 && !RESERVED_CHARM_CODES.has(mnemonic)) {
    const base = mnemonic.slice(0, 3);
    for (let i = 1; i <= 99; i++) {
      const candidate = `${base}${i < 10 ? "0" + i : i}`;
      if (!usedCodes.has(candidate) && !RESERVED_CHARM_CODES.has(candidate)) {
        return candidate;
      }
    }
  }

  // 3. Category prefix or standard prefix "C"
  let prefix = "C";
  const cat = (charm.category || "").toLowerCase();
  if (cat === "cute") prefix = "C";
  else if (cat === "emblem") prefix = "E";
  else if (cat === "anime") prefix = "A";
  else if (cat === "stone") prefix = "T";
  else if (cat === "letter") prefix = "L";

  for (let i = 1; i <= 999; i++) {
    const code = `${prefix}${i < 10 ? "0" + i : i}`;
    if (!usedCodes.has(code) && !RESERVED_CHARM_CODES.has(code)) {
      return code;
    }
  }

  // Fallback random
  return `CH${Math.floor(10 + Math.random() * 89)}`;
}

/**
 * Ensures all charms in an array have unique, non-duplicating codes.
 * Any missing, reserved, or duplicate codes are automatically re-assigned uniquely.
 */
export function ensureUniqueCharmCodes(charms: Charm[]): Charm[] {
  if (!Array.isArray(charms)) return [];
  const assigned: Charm[] = [];
  const usedCodes = new Set<string>();

  charms.forEach((c) => {
    if (!c) return;
    const item: Charm = { ...c };
    let code = sanitizeCharmCode(item.code);

    if (
      !code ||
      code.length < 2 ||
      RESERVED_CHARM_CODES.has(code) ||
      usedCodes.has(code)
    ) {
      code = generateUniqueCharmCode(item, assigned);
    }

    item.code = code;
    usedCodes.add(code);
    assigned.push(item);
  });

  return assigned;
}

/**
 * Return the unique short code for a charm.
 */
export function getCharmCode(c: Charm, catalog?: Charm[]): string {
  if (!c) return "C00";
  if (c.code && typeof c.code === "string" && c.code.trim()) {
    return c.code.trim().toUpperCase();
  }
  return generateUniqueCharmCode(c, catalog || []);
}

export const DEFAULT_STUDIO_CHARMS: Charm[] = [
  // Row 1: 8 Base Link Frames (Silver, Red, Yellow, Cream/Gold, Black, Green, Blue, Pink)
  { id: "base-silver", code: "L01", name: "Silver Link", nameKh: "តំណប្រាក់ Silver", category: "base", price: 0.73, image: "/assets/links_tight/link_plain.webp" },
  { id: "base-red", code: "L02", name: "Red Link", nameKh: "តំណក្រហម Red", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_1.webp" },
  { id: "base-yellow", code: "L03", name: "Yellow Link", nameKh: "តំណលឿង Yellow", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_2.webp" },
  { id: "base-gold", code: "L04", name: "Gold Link", nameKh: "តំណមាស Gold", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_3.webp" },
  { id: "base-black", code: "L05", name: "Black Link", nameKh: "តំណខ្មៅ Black", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_4.webp" },
  { id: "base-green", code: "L06", name: "Green Link", nameKh: "តំណបៃតង Green", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_5.webp" },
  { id: "base-blue", code: "L07", name: "Blue Link", nameKh: "តំណខៀវ Blue", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_6.webp" },
  { id: "base-pink", code: "L08", name: "Pink Link", nameKh: "តំណផ្កាឈូក Pink", category: "base", price: 0.73, image: "/assets/links_tight/link_new_style_7.webp" },

  // Row 2: Pinkystar Series
  { id: "pinkystar-0", code: "P01", name: "Pink Star", nameKh: "ផ្កាយផ្កាឈូក", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_0.webp" },
  { id: "pinkystar-1", code: "P02", name: "Pink Floral", nameKh: "ផ្កាផ្កាឈូក", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_1.webp" },
  { id: "pinkystar-2", code: "P03", name: "Retro Blossom", nameKh: "ផ្ការីក Retro", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_2.webp" },
  { id: "pinkystar-3", code: "P04", name: "Hypnotic Heart", nameKh: "បេះដូងស្នេហ៍", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_3.webp" },
  { id: "pinkystar-4", code: "P05", name: "Sweet Star", nameKh: "ផ្កាយផ្អែមល្ហែម", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_4.webp" },
  { id: "pinkystar-5", code: "P06", name: "Checkered Heart", nameKh: "បេះដូងក្រឡា", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_5.webp" },
  { id: "pinkystar-6", code: "P07", name: "Graffiti Star", nameKh: "ផ្កាយ Graffiti", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_6.webp" },
  { id: "pinkystar-7", code: "P08", name: "Sweet Kitty", nameKh: "កូនឆ្មាផ្អែមល្ហែម", category: "pinky", price: 0.73, image: "/assets/charms_tight/pinkystar_7.webp" },

  // Row 3: Slay Series
  { id: "slay-0", code: "S01", name: "Retro Star", nameKh: "ផ្កាយបុរាណ", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_0.webp" },
  { id: "slay-1", code: "S02", name: "Dark Heart", nameKh: "បេះដូងខ្មៅ", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_1.webp" },
  { id: "slay-2", code: "S03", name: "Wild Floral", nameKh: "ផ្កាព្រៃ", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_2.webp" },
  { id: "slay-3", code: "S04", name: "Life Is Sweet", nameKh: "ជីវិតស្រស់បំព្រង", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_3.webp" },
  { id: "slay-4", code: "S05", name: "Love Music", nameKh: "តន្ត្រីស្នេហ៍", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_4.webp" },
  { id: "slay-5", code: "S06", name: "Lucky Emblem", nameKh: "ផ្លាកសំណាង", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_5.webp" },
  { id: "slay-6", code: "S07", name: "Ocean Waves", nameKh: "រលកសមុទ្រ", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_6.webp" },
  { id: "slay-7", code: "S08", name: "Dumb Days", nameKh: "Dumb Days", category: "slay", price: 0.73, image: "/assets/charms_tight/slay_7.webp" },

  // Row 4: Pet Series
  { id: "dogcat-0", code: "D01", name: "Playful Kitten", nameKh: "កូនឆ្មាកម្សាន្ត", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_0.webp" },
  { id: "dogcat-1", code: "D02", name: "Happy Pup", nameKh: "កូនឆ្កែរីករាយ", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_1.webp" },
  { id: "dogcat-2", code: "D03", name: "Fluffy Dog", nameKh: "ឆ្កែទន់រលោង", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_2.webp" },
  { id: "dogcat-3", code: "D04", name: "Sleepy Cat", nameKh: "ឆ្មាដេកលក់", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_3.webp" },
  { id: "dogcat-4", code: "D05", name: "Brown Puppy", nameKh: "កូនឆ្កែត្នោត", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_4.webp" },
  { id: "dogcat-5", code: "D06", name: "Curious Cat", nameKh: "ឆ្មាឆ្លាត", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_5.webp" },
  { id: "dogcat-6", code: "D07", name: "Best Buddies", nameKh: "មិត្តសម្លាញ់", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_6.webp" },
  { id: "dogcat-7", code: "D08", name: "Love Animals", nameKh: "ស្រឡាញ់សត្វ", category: "pets", price: 0.73, image: "/assets/charms_tight/dog__cat_7.webp" },

  // Row 5: Quartz Series
  { id: "quart-0", code: "Q01", name: "Quartz Star", nameKh: "ត្បូងផ្កាយ Quartz", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_0.webp" },
  { id: "quart-1", code: "Q02", name: "Golden Clover", nameKh: "ផ្កាសំណាងមាស", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_1.webp" },
  { id: "quart-2", code: "Q03", name: "Sapphire Gem", nameKh: "ត្បូងកណ្តៀង Sapphire", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_2.webp" },
  { id: "quart-3", code: "Q04", name: "Diamond Heart", nameKh: "ពេជ្របេះដូង Diamond", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_3.webp" },
  { id: "quart-4", code: "Q05", name: "Emerald Flower", nameKh: "ផ្កាត្បូងមរកត Emerald", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_4.webp" },
  { id: "quart-5", code: "Q06", name: "Ruby Cross", nameKh: "ត្បូងទទឹម Ruby", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_5.webp" },
  { id: "quart-6", code: "Q07", name: "Butterfly Jewel", nameKh: "មេអំបៅត្បូង Butterfly", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_6.webp" },
  { id: "quart-7", code: "Q08", name: "Moonlight Gem", nameKh: "ត្បូងពន្លឺព្រះចន្ទ", category: "gems", price: 0.73, image: "/assets/charms_tight/quart_7.webp" },
];

export const CHARMS: Charm[] = [];

