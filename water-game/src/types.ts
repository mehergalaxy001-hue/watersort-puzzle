/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WaterLayer {
  color: string;      // Hex value
  colorName: string;  // Human-readable name
  volume: number;     // Number of units (usually 1, up to max capacity)
}

export interface BottleState {
  id: number;
  layers: WaterLayer[]; // Bottom-to-top fluid layers. index 0 is bottom.
  capacity: number;     // Typically 4
  isExtra?: boolean;    // Added via "Add Bottle" button
}

export interface GameState {
  bottles: BottleState[];
  selectedBottleId: number | null;
  history: BottleState[][]; // For Undo functionality
  movesCount: number;
  status: 'playing' | 'won' | 'menu';
  level: number;
  isPouring: boolean; // True during physical animation
  pourSourceId: number | null;
  pourTargetId: number | null;
  addedExtraBottle: boolean; // Limit to one extra bottle per level
}

export interface LevelData {
  levelNumber: number;
  bottles: BottleState[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Exactly 110 beautifully coordinated solid hex and secondary shaded color combinations (100+ Colors!)
export const COLOR_PALETTE = [
  { name: 'Cherry Red', hex: '#E11D48', secondary: '#9F1239' },
  { name: 'Neon Green', hex: '#22C55E', secondary: '#166534' },
  { name: 'Deep Sapphire', hex: '#2563EB', secondary: '#1E40AF' },
  { name: 'Tangerine Orange', hex: '#F97316', secondary: '#C2410C' },
  { name: 'Sunny Yellow', hex: '#FACC15', secondary: '#CA8A04' },
  { name: 'Amethyst Purple', hex: '#9333EA', secondary: '#6B21A8' },
  { name: 'Bubblegum Pink', hex: '#EC4899', secondary: '#9D174D' },
  { name: 'Electric Turquoise', hex: '#06B6D4', secondary: '#0891B2' },
  { name: 'Warm Chocolate', hex: '#78350F', secondary: '#451A03' },
  { name: 'Emerald Teal', hex: '#0D9488', secondary: '#115E59' },
  
  // Crimson & Red Spectrum (11-20)
  { name: 'Ruby Glint', hex: '#DC2626', secondary: '#7F1D1D' },
  { name: 'Rose Petal', hex: '#F43F5E', secondary: '#881337' },
  { name: 'Burgundy Swirl', hex: '#881337', secondary: '#4C0519' },
  { name: 'Cranberry Tart', hex: '#9F1239', secondary: '#5C0620' },
  { name: 'Sunset Crimson', hex: '#BE123C', secondary: '#6F0D22' },
  { name: 'Coral Punch', hex: '#FDA4AF', secondary: '#E11D48' },
  { name: 'Blush Velvet', hex: '#FB7185', secondary: '#9F1239' },
  { name: 'Vermillion Fire', hex: '#EF4444', secondary: '#991B1B' },
  { name: 'Wine Sparkle', hex: '#B91C1C', secondary: '#450A0A' },
  { name: 'Brick Red', hex: '#991B1B', secondary: '#581C1C' },

  // Orange & Gold Spectrum (21-30)
  { name: 'Tiger Lily', hex: '#FB923C', secondary: '#C2410C' },
  { name: 'Pumpkin Pulp', hex: '#EA580C', secondary: '#7C2D12' },
  { name: 'Bronze Gold', hex: '#D97706', secondary: '#78350F' },
  { name: 'Honey Nectar', hex: '#F59E0B', secondary: '#92400E' },
  { name: 'Saffron Glow', hex: '#EAB308', secondary: '#854D0E' },
  { name: 'Amber Glow', hex: '#F59E0B', secondary: '#78350F' },
  { name: 'Mustard Seed', hex: '#CA8A04', secondary: '#713F12' },
  { name: 'Peach Puff', hex: '#FED7AA', secondary: '#EA580C' },
  { name: 'Apricot Tart', hex: '#FFEDD5', secondary: '#D97706' },
  { name: 'Desert Sand', hex: '#FDBA74', secondary: '#C2410C' },

  // Yellow & Lemon Spectrum (31-40)
  { name: 'Lemon Candy', hex: '#FEF08A', secondary: '#A16207' },
  { name: 'Banana Cream', hex: '#FDE047', secondary: '#854D0E' },
  { name: 'Gold Medal', hex: '#CA8A04', secondary: '#451A03' },
  { name: 'Butter Gold', hex: '#EAB308', secondary: '#713F12' },
  { name: 'Sand Castle', hex: '#FEF08A', secondary: '#CA8A04' },
  { name: 'Pineapple Slice', hex: '#FACC15', secondary: '#854D0E' },
  { name: 'Citrum Yellow', hex: '#EAB204', secondary: '#713402' },
  { name: 'Flaxen Gold', hex: '#ECC415', secondary: '#78430A' },
  { name: 'Sunbeam Shimmer', hex: '#FFFE90', secondary: '#CA8A04' },
  { name: 'Dandelion', hex: '#FCE762', secondary: '#B88204' },

  // Green & Teal Spectrum (41-50)
  { name: 'Mint Meadow', hex: '#86EFAC', secondary: '#166534' },
  { name: 'Lime Zest', hex: '#4ADE80', secondary: '#14532D' },
  { name: 'Jade Glass', hex: '#10B981', secondary: '#064E3B' },
  { name: 'Forest Moss', hex: '#047857', secondary: '#022C22' },
  { name: 'Pistachio Cream', hex: '#A7F3D0', secondary: '#047857' },
  { name: 'Spearmint Frost', hex: '#6EE7B7', secondary: '#065F46' },
  { name: 'Sage Green', hex: '#0284C7', secondary: '#0369A1' },
  { name: 'Olive Oil', hex: '#A3E635', secondary: '#3F6212' },
  { name: 'Kermit Green', hex: '#84CC16', secondary: '#4D7C0F' },
  { name: 'Evergreen Forest', hex: '#15803D', secondary: '#14532D' },

  // Cyan & Turquoise Spectrum (51-60)
  { name: 'Ocean Air', hex: '#67E8F9', secondary: '#0E7490' },
  { name: 'Teal Depth', hex: '#06B6D4', secondary: '#155E75' },
  { name: 'Bermuda Shimmer', hex: '#22D3EE', secondary: '#0891B2' },
  { name: 'Deep Aqua', hex: '#0891B2', secondary: '#164E63' },
  { name: 'Iceberg Blue', hex: '#CFFAFE', secondary: '#0891B2' },
  { name: 'Malibu Lagoon', hex: '#22E3EB', secondary: '#0B7F87' },
  { name: 'Seafoam Glass', hex: '#A5F3FC', secondary: '#0D9488' },
  { name: 'Caribbean Coral', hex: '#38BDF8', secondary: '#0369A1' },
  { name: 'Pacific Emerald', hex: '#0F766E', secondary: '#115E59' },
  { name: 'Abyss Teal', hex: '#134E5E', secondary: '#092C3E' },

  // Blue Spectrum (61-70)
  { name: 'Skyway Pastel', hex: '#7DD3FC', secondary: '#0369A1' },
  { name: 'Cornflower Blue', hex: '#38BDF8', secondary: '#075985' },
  { name: 'Electric Cobalt', hex: '#1D4ED8', secondary: '#1E3A8A' },
  { name: 'Midnight Nautical', hex: '#1E3A8A', secondary: '#172554' },
  { name: 'Slate Steel', hex: '#94A3B8', secondary: '#334155' },
  { name: 'Royal Indigo', hex: '#2563EB', secondary: '#1D4ED8' },
  { name: 'Powder Breeze', hex: '#BAE6FD', secondary: '#0284C7' },
  { name: 'Aegean Waves', hex: '#0284C7', secondary: '#1E3A8A' },
  { name: 'Blueberry Jam', hex: '#1D4ED8', secondary: '#0F172A' },
  { name: 'Titanium Blue', hex: '#475569', secondary: '#1E293B' },

  // Purple & Violet Spectrum (71-80)
  { name: 'Lavender Mist', hex: '#E879F9', secondary: '#701A75' },
  { name: 'Grape Crush', hex: '#A21CAF', secondary: '#4A044E' },
  { name: 'Violet Ray', hex: '#9333EA', secondary: '#3B0764' },
  { name: 'Dusk Amethyst', hex: '#6B21A8', secondary: '#3B0764' },
  { name: 'Lilac Bloom', hex: '#F472B6', secondary: '#9D174D' },
  { name: 'Plum Wine', hex: '#7A1CAC', secondary: '#2D033B' },
  { name: 'Orchid Petal', hex: '#D946EF', secondary: '#701A75' },
  { name: 'Nightshade Violet', hex: '#5B21B6', secondary: '#2E1065' },
  { name: 'Eggplant Dark', hex: '#4C1D95', secondary: '#1E1B4B' },
  { name: 'Wisteria Breeze', hex: '#C084FC', secondary: '#6B21A8' },

  // Pink & Rose Spectrum (81-90)
  { name: 'Rose Cotton', hex: '#FDBA74', secondary: '#BE123C' },
  { name: 'Peony Blush', hex: '#F472B6', secondary: '#9D174D' },
  { name: 'Fuchsia Neon', hex: '#EC4899', secondary: '#500724' },
  { name: 'Barbie Pink', hex: '#F43F5E', secondary: '#9F1239' },
  { name: 'Strawberry Float', hex: '#FF85A1', secondary: '#D90429' },
  { name: 'Raspberry Jam', hex: '#BE123C', secondary: '#4C0519' },
  { name: 'Cherry Shake', hex: '#FDA4AF', secondary: '#BE123C' },
  { name: 'Watermelon Glow', hex: '#FF2A6D', secondary: '#9D174D' },
  { name: 'Magenta Ripple', hex: '#D946EF', secondary: '#4A044E' },
  { name: 'Rosewood Clay', hex: '#FDA4AF', secondary: '#4E0E2E' },

  // Brown, Clay & Earth Tones (91-100)
  { name: 'Choco Fudge', hex: '#78350F', secondary: '#1F0B00' },
  { name: 'Cinnamon Bark', hex: '#B45309', secondary: '#451A03' },
  { name: 'Sand Dune', hex: '#F59E0B', secondary: '#451A03' },
  { name: 'Caramel Glaze', hex: '#D97706', secondary: '#451A03' },
  { name: 'Mocha Dream', hex: '#92400E', secondary: '#451A03' },
  { name: 'Mushroom Clay', hex: '#5C4033', secondary: '#2D1B10' },
  { name: 'Chestnut Glow', hex: '#A16207', secondary: '#422006' },
  { name: 'Maple Syrup', hex: '#B45309', secondary: '#451A03' },
  { name: 'Terracotta Soil', hex: '#EA580C', secondary: '#450E03' },
  { name: 'Bronze Velvet', hex: '#78350F', secondary: '#3A1402' },

  // Special Premium & Hybrid Highlights (101-110)
  { name: 'Platinum Shimmer', hex: '#CBD5E1', secondary: '#475569' },
  { name: 'Carbon Black', hex: '#334155', secondary: '#0F172A' },
  { name: 'Gold Dust', hex: '#EAB308', secondary: '#3F2C00' },
  { name: 'Emerald Aura', hex: '#10B981', secondary: '#022C22' },
  { name: 'Cosmic Magenta', hex: '#F472B6', secondary: '#500724' },
  { name: 'Stardust Silver', hex: '#E2E8F0', secondary: '#64748B' },
  { name: 'Alien Slime', hex: '#A3E635', secondary: '#1A2E05' },
  { name: 'Galaxy Obsidian', hex: '#1E293B', secondary: '#020617' },
  { name: 'Supernova Fire', hex: '#F97316', secondary: '#7F1D1D' },
  { name: 'Ethereal Mist', hex: '#CFFAFE', secondary: '#1E3A8A' }
];

export interface ShopItem {
  id: string; // unique item id e.g. vessel_flask or skin_12
  name: string;
  category: 'vessel' | 'skin';
  cost: number;
  unlocked: boolean;
  value: string; // The vessel path id, or skin custom config
}
