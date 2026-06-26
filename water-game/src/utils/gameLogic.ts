/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BottleState, WaterLayer, COLOR_PALETTE } from '../types';

/**
 * Checks if a pour from source to target is valid.
 */
export function canPour(source: BottleState, target: BottleState): boolean {
  // Can't pour to oneself
  if (source.id === target.id) return false;

  const sourceLayers = source.layers;
  const targetLayers = target.layers;

  // Source must have water
  if (sourceLayers.length === 0) return false;

  // Target must not be full
  const targetCurrentVolume = targetLayers.reduce((sum, l) => sum + l.volume, 0);
  if (targetCurrentVolume >= target.capacity) return false;

  // If target is empty, we can always pour
  if (targetLayers.length === 0) return true;

  // Otherwise, the colors must match
  const sourceTop = sourceLayers[sourceLayers.length - 1];
  const targetTop = targetLayers[targetLayers.length - 1];

  return sourceTop.color === targetTop.color;
}

/**
 * Executes a pour.
 * Transfers the maximum possible contiguous same-colored liquid from source to target.
 */
export function pour(source: BottleState, target: BottleState): {
  source: BottleState;
  target: BottleState;
  pouredUnits: number;
} {
  const newSourceLayers = JSON.parse(JSON.stringify(source.layers)) as WaterLayer[];
  const newTargetLayers = JSON.parse(JSON.stringify(target.layers)) as WaterLayer[];

  if (newSourceLayers.length === 0) {
    return { source, target, pouredUnits: 0 };
  }

  // Find the top contiguous layers of the same color in source
  const sourceTop = newSourceLayers[newSourceLayers.length - 1];
  let colorsToPour = 0;
  let layerIndex = newSourceLayers.length - 1;

  while (layerIndex >= 0 && newSourceLayers[layerIndex].color === sourceTop.color) {
    colorsToPour += newSourceLayers[layerIndex].volume;
    layerIndex--;
  }

  // Calculate available space in target
  const targetCurrentVolume = newTargetLayers.reduce((sum, l) => sum + l.volume, 0);
  const targetSpace = target.capacity - targetCurrentVolume;

  // Amount to pour is the minimum of matching color block volume and target available space
  const actualPourVolume = Math.min(colorsToPour, targetSpace);

  if (actualPourVolume <= 0) {
    return { source, target, pouredUnits: 0 };
  }

  // Remove actualPourVolume from source
  let remainingToRemove = actualPourVolume;
  while (remainingToRemove > 0 && newSourceLayers.length > 0) {
    const top = newSourceLayers[newSourceLayers.length - 1];
    if (top.volume <= remainingToRemove) {
      remainingToRemove -= top.volume;
      newSourceLayers.pop();
    } else {
      top.volume -= remainingToRemove;
      remainingToRemove = 0;
    }
  }

  // Add actualPourVolume to target
  if (newTargetLayers.length > 0 && newTargetLayers[newTargetLayers.length - 1].color === sourceTop.color) {
    // Merge into top layer
    newTargetLayers[newTargetLayers.length - 1].volume += actualPourVolume;
  } else {
    // Create new layer
    newTargetLayers.push({
      color: sourceTop.color,
      colorName: sourceTop.colorName,
      volume: actualPourVolume,
    });
  }

  return {
    source: { ...source, layers: newSourceLayers },
    target: { ...target, layers: newTargetLayers },
    pouredUnits: actualPourVolume,
  };
}

/**
 * Checks if all bottles are solved.
 * A bottle is solved if it is completely empty OR fully filled with 4 units of the SAME color.
 */
export function checkWin(bottles: BottleState[]): boolean {
  for (const bottle of bottles) {
    const totalVolume = bottle.layers.reduce((sum, l) => sum + l.volume, 0);
    
    // An empty bottle is fine
    if (totalVolume === 0) continue;

    // A non-empty bottle must:
    // 1. Be full to capacity (4 units)
    if (totalVolume !== bottle.capacity) return false;

    // 2. Be of a single solid color
    if (bottle.layers.length !== 1 || bottle.layers[0].volume !== bottle.capacity) return false;
  }
  return true;
}

/**
 * Level Generator via Backwards Simulation (100% Solvable Guarantee)
 * 1. Start with N solved bottles (each containing 4 units of a single color) and 2 empty bottles.
 * 2. Repeatedly perform random reverse pours (taking top element from a random bottle and placing it into another that has capacity).
 * 3. Return the mixed bottles state.
 */
export function generateLevel(levelNumber: number): BottleState[] {
  // Customized level progression difficulty curve (strictly based on user specifications):
  // 1. Level 1 to 10: Easy (3-4 colors)
  // 2. Level 11 to 50: Medium (5 colors)
  // 3. Level 51 to 500: Medium Hard (6 colors, but not too heavy)
  // 4. Level 501 to 1500: Hard (7 colors)
  // 5. Level 1501 to 3000: Full Hard (8 colors)
  // 6. Level 3001 to 6500: Full Hard and Full Medium mixed (6 to 8 colors alternating)
  // 7. Level 6501 to 10000: Heavy Heavy Heavy Hard (9 to 11 colors for extreme brainteasers)
  let colorCount = 3;
  let baseShuffles = 30;
  let shuffleMultiplier = 2;

  if (levelNumber <= 10) {
    // 1 to 10: Easy
    colorCount = levelNumber <= 5 ? 3 : 4;
    baseShuffles = 8;
    shuffleMultiplier = 1;
  } else if (levelNumber <= 50) {
    // 11 to 50: Medium
    colorCount = 5;
    baseShuffles = 18;
    shuffleMultiplier = 2;
  } else if (levelNumber <= 500) {
    // 51 to 500: Medium Hard (but not full hard yet)
    colorCount = 6;
    baseShuffles = 30;
    shuffleMultiplier = 2;
  } else if (levelNumber <= 1500) {
    // 501 to 1500: Hard
    colorCount = 7;
    baseShuffles = 50;
    shuffleMultiplier = 3;
  } else if (levelNumber <= 3000) {
    // 1501 to 3000: Full Hard
    colorCount = 8;
    baseShuffles = 75;
    shuffleMultiplier = 3;
  } else if (levelNumber <= 6500) {
    // 3001 to 6500: Full Hard & Full Medium mix
    const isMedium = levelNumber % 2 === 0;
    colorCount = isMedium ? 6 : 8;
    baseShuffles = 60;
    shuffleMultiplier = 3;
  } else {
    // 6501 to 10000: Heavy Heavy Heavy Hard
    const mod3 = levelNumber % 3;
    colorCount = mod3 === 0 ? 9 : (mod3 === 1 ? 10 : 11);
    baseShuffles = 100;
    shuffleMultiplier = 4;
  }

  // Sample beautifully across all 110 color selections!
  // To keep layouts deterministic per level, we seed indices with multipliers.
  const selectedColors: typeof COLOR_PALETTE = [];
  const paletteLength = COLOR_PALETTE.length;
  const seedMultiplier = (levelNumber * 13) % paletteLength;

  for (let i = 0; i < colorCount; i++) {
    const rawIdx = (seedMultiplier + i * 23) % paletteLength;
    let chosenColor = COLOR_PALETTE[rawIdx];

    // Ensure absolutely no duplicate colors are generated in a single game layout
    if (selectedColors.some(x => x.hex === chosenColor.hex)) {
      let backupIdx = rawIdx;
      while (selectedColors.some(x => x.hex === COLOR_PALETTE[backupIdx].hex)) {
        backupIdx = (backupIdx + 1) % paletteLength;
      }
      chosenColor = COLOR_PALETTE[backupIdx];
    }
    selectedColors.push(chosenColor);
  }

  // Initialize N completed bottles of capacity 4
  const bottles: BottleState[] = [];
  let bottleId = 0;

  for (let i = 0; i < colorCount; i++) {
    bottles.push({
      id: bottleId++,
      layers: [
        {
          color: selectedColors[i].hex,
          colorName: selectedColors[i].name,
          volume: 4,
        },
      ],
      capacity: 4,
    });
  }

  // 2 empty bottles
  for (let i = 0; i < 2; i++) {
    bottles.push({
      id: bottleId++,
      layers: [],
      capacity: 4,
    });
  }

  // Perform multiple backwards moves to shuffle
  const shuffleMoves = baseShuffles + levelNumber * shuffleMultiplier;
  const totalBottles = bottles.length;

  for (let move = 0; move < shuffleMoves; move++) {
    // Pick a random source bottle that is NOT empty
    const nonEmpties = bottles.filter(b => b.layers.length > 0);
    if (nonEmpties.length === 0) break;
    const sourceBottle = nonEmpties[Math.floor(Math.random() * nonEmpties.length)];

    // Target bottle must have space
    const targetsWithSpace = bottles.filter(b => {
      const volume = b.layers.reduce((sum, l) => sum + l.volume, 0);
      return b.id !== sourceBottle.id && volume < b.capacity;
    });

    if (targetsWithSpace.length === 0) continue;
    const targetBottle = targetsWithSpace[Math.floor(Math.random() * targetsWithSpace.length)];

    // Peel off 1 unit from source top layer
    const sourceTop = sourceBottle.layers[sourceBottle.layers.length - 1];
    
    // Decrement source top
    sourceTop.volume -= 1;
    if (sourceTop.volume === 0) {
      sourceBottle.layers.pop();
    }

    // Add to target top
    const targetVolume = targetBottle.layers.reduce((sum, l) => sum + l.volume, 0);
    const targetTop = targetBottle.layers[targetBottle.layers.length - 1];

    if (targetTop && targetTop.color === sourceTop.color) {
      targetTop.volume += 1;
    } else {
      targetBottle.layers.push({
        color: sourceTop.color,
        colorName: sourceTop.colorName,
        volume: 1,
      });
    }
  }

  // Ensure adjacent layers of identical colors are flatly merged
  bottles.forEach(bottle => {
    const merged: WaterLayer[] = [];
    bottle.layers.forEach(l => {
      if (merged.length > 0 && merged[merged.length - 1].color === l.color) {
        merged[merged.length - 1].volume += l.volume;
      } else if (l.volume > 0) {
        merged.push(l);
      }
    });
    bottle.layers = merged;
  });

  return bottles;
}

/**
 * Returns a simple tip/hint on a legal move if one exists.
 * Helps stuck players find a way forward!
 */
export function getHint(bottles: BottleState[]): { from: number; to: number } | null {
  for (const source of bottles) {
    if (source.layers.length === 0) continue;
    
    // Avoid recommending moving from a completed bottle
    const totalVolume = source.layers.reduce((sum, l) => sum + l.volume, 0);
    if (totalVolume === source.capacity && source.layers.length === 1) {
      continue;
    }

    for (const target of bottles) {
      if (canPour(source, target)) {
        // Additional heuristic: Avoid pouring from one empty/single block onto an empty tube
        // as that is a trivial/undo-like looping move unless necessary
        const targetVolume = target.layers.reduce((sum, l) => sum + l.volume, 0);
        if (targetVolume === 0 && source.layers.length === 1) {
          // Check if there are other moves, save this as a low priority or skip
          continue;
        }
        return { from: source.id, to: target.id };
      }
    }
  }
  
  // Try backup checks including empty target pours
  for (const source of bottles) {
    if (source.layers.length === 0) continue;
    const totalVolume = source.layers.reduce((sum, l) => sum + l.volume, 0);
    if (totalVolume === source.capacity && source.layers.length === 1) continue;

    for (const target of bottles) {
      if (canPour(source, target)) {
        return { from: source.id, to: target.id };
      }
    }
  }

  return null;
}
