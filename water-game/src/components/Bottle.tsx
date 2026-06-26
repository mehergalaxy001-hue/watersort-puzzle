/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BottleState } from '../types';

interface BottleProps {
  bottle: BottleState;
  isSelected: boolean;
  isHintSource: boolean;
  isHintTarget: boolean;
  onSelect: (id: number) => void;
  pourAngle: number;    // Animation angle (degrees)
  pourOffset: { x: number; y: number }; // Offset for translation during pour
  isStreamActive?: boolean;
  streamColor?: string;
  // Custom Purchased Style & Skins (Supports 10 styles, 110+ skins)
  vesselStyle?: string; 
  skinGlowColor?: string;
  isCompact?: boolean;
  isDarkTheme?: boolean;
  isGiant?: boolean;
}

export const Bottle: React.FC<BottleProps> = ({
  bottle,
  isSelected,
  isHintSource,
  isHintTarget,
  onSelect,
  pourAngle,
  pourOffset,
  isStreamActive = false,
  streamColor,
  vesselStyle = 'standard',
  skinGlowColor,
  isCompact = false,
  isDarkTheme = false,
  isGiant = false,
}) => {
  const { layers, capacity } = bottle;
  
  // Calculate total volume currently inside the bottle
  const totalVolume = layers.reduce((sum, l) => sum + l.volume, 0);

  // Height configurations (We distribute up to 4 units of liquid beautifully inside the bottle body)
  const UNIT_HEIGHT = 44; // px height scaled appropriately in our 300px coordinate space
  const BOTTOM_PADDING = 20;

  // Build the rendered liquid blocks inside SVG
  let accumulatedHeight = BOTTOM_PADDING;
  const liquidSegments = layers.map((layer, index) => {
    const height = layer.volume * UNIT_HEIGHT;
    const startY = accumulatedHeight;
    accumulatedHeight += height;
    
    return {
      ...layer,
      startY,
      height,
      isTop: index === layers.length - 1,
    };
  });

  const isPouring = pourAngle !== 0 || pourOffset.x !== 0 || pourOffset.y !== 0;

  // Calculate top water surface height inside SVG coordinate space (viewBox height 300)
  const surfaceY = 300 - (totalVolume * UNIT_HEIGHT + BOTTOM_PADDING);

  // Generates different SVG paths for 10 vessel designs / structures
  const getVesselPath = (style: string): string => {
    let resolvedStyle = style;
    if (style.startsWith('vessel_')) {
      const idx = parseInt(style.replace('vessel_', ''), 10);
      const baseStyles = ['flask', 'beaker', 'hex', 'potion', 'square', 'decanter', 'star', 'goblet', 'testtube', 'standard'];
      if (!isNaN(idx)) {
        resolvedStyle = baseStyles[idx % baseStyles.length];
      }
    }

    switch (resolvedStyle) {
      case 'heart':
        // A perfectly symmetrical, smooth heart flask with cylindrical collar
        return "M 38,15 L 62,15 L 62,70 C 72,70 88,80 88,115 C 88,155 78,215 50,288 C 22,215 12,155 12,115 C 12,80 28,70 38,70 Z";
      case 'flask':
        // Erlenmeyer Flask
        return "M 36,15 L 64,15 L 64,80 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 L 36,80 Z";
      case 'beaker':
        // Cylinder/Beaker
        return "M 32,15 L 68,15 L 68,60 L 82,60 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 L 18,60 L 32,60 Z";
      case 'hex':
        // Hexagonalfaceted prism
        return "M 35,15 L 65,15 L 65,55 L 82,90 L 82,240 L 65,290 L 35,290 L 18,240 L 18,90 L 35,55 Z";
      case 'potion':
        // Spherical potion bottle
        return "M 36,15 L 64,15 L 64,85 C 84,100 88,135 88,180 C 88,240 71,290 50,290 C 29,290 12,240 12,180 C 12,135 16,100 36,85 Z";
      case 'square':
        // Perfume/Square Jar
        return "M 35,15 L 65,15 L 65,70 L 82,75 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 L 18,75 L 35,70 Z";
      case 'decanter':
        // Premium decanter shape
        return "M 32,15 Q 50,28 68,15 L 62,80 C 82,95 86,130 86,180 Q 86,280 50,290 Q 14,280 14,180 C 14,130 18,95 38,80 Z";
      case 'star':
        // Wide magical star flask
        return "M 34,15 L 66,15 L 66,70 C 85,90 90,130 84,180 L 84,260 C 84,280 65,290 50,290 C 35,290 16,280 16,260 L 16,180 C 10,130 15,90 34,70 Z";
      case 'goblet':
        // Goblet goblet chalice shape
        return "M 22,15 L 78,15 L 82,110 L 64,170 Q 64,230 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Q 36,230 36,170 L 18,110 Z";
      case 'testtube':
        // Round scientific speciment test tube
        return "M 32,15 L 68,15 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z";
      case 'standard':
      default:
        // Standard Classic vessel shape
        return "M 32,15 L 68,15 L 68,70 C 68,90 85,95 85,120 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 L 15,120 C 15,95 32,90 32,70 Z";
    }
  };

  const bottlePath = getVesselPath(vesselStyle);

  // Custom inline dynamic glow factor if special skin glow color is purchased!
  const customGlowShadow = skinGlowColor 
    ? { filter: `drop-shadow(0 0 10px ${skinGlowColor})` } 
    : undefined;

  return (
    <div
      onClick={() => onSelect(bottle.id)}
      className="relative flex flex-col items-center cursor-pointer select-none group focus:outline-none"
      id={`bottle-item-${bottle.id}`}
      style={{
        transform: isPouring
          ? `translate(${pourOffset.x}px, ${pourOffset.y}px) rotate(${pourAngle}deg)`
          : isSelected
          ? (isCompact ? 'translateY(-16px)' : 'translateY(-28px)')
          : 'translateY(0)',
        transition: 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)',
        zIndex: isSelected || isPouring ? 50 : 10,
      }}
    >
      {/* 2D soft selection glowing backlight shadow with custom skin glow compatibility */}
      {isSelected && (
        <div 
          className="absolute top-[4px] bottom-[-2px] inset-x-0.5 rounded-[36px] blur-lg -z-10 animate-pulse"
          style={{ backgroundColor: skinGlowColor || 'rgba(34, 211, 238, 0.5)' }}
        />
      )}
      {isHintSource && !isSelected && (
        <div className="absolute top-[4px] bottom-[-2px] inset-x-0.5 bg-amber-400/25 rounded-[36px] blur-md -z-10 animate-pulse" />
      )}
      {isHintTarget && (
        <div className="absolute top-[4px] bottom-[-2px] inset-x-0.5 bg-emerald-400/25 rounded-[36px] blur-md -z-10 animate-pulse" />
      )}

      {/* 🌌 Premium Side Glowing Aura Stripes (Flashes when Dark Theme is enabled) */}
      {skinGlowColor && isDarkTheme && (
        <>
          <div 
            className="absolute -left-3 top-[15%] bottom-[15%] w-[3.5px] rounded-full pointer-events-none opacity-85 animate-pulse"
            style={{ 
              backgroundColor: skinGlowColor,
              boxShadow: `0 0 8px ${skinGlowColor}, 0 0 16px ${skinGlowColor}`,
            }}
          />
          <div 
            className="absolute -right-3 top-[15%] bottom-[15%] w-[3.5px] rounded-full pointer-events-none opacity-85 animate-pulse"
            style={{ 
              backgroundColor: skinGlowColor,
              boxShadow: `0 0 8px ${skinGlowColor}, 0 0 16px ${skinGlowColor}`,
            }}
          />
        </>
      )}

      {/* The Vessel - scaled perfectly for small screens */}
      <div 
        className={
          isGiant
            ? "relative w-[85px] h-[255px] min-[360px]:w-[95px] min-[360px]:h-[285px] min-[400px]:w-[105px] min-[400px]:h-[315px] sm:w-[130px] sm:h-[390px] md:w-[150px] md:h-[450px] lg:w-[170px] lg:h-[510px]"
            : isCompact
            ? "relative w-[40px] h-[120px] min-[360px]:w-[44px] min-[360px]:h-[132px] min-[400px]:w-[50px] min-[400px]:h-[150px] sm:w-[60px] sm:h-[180px] md:w-[70px] md:h-[210px] lg:w-[78px] lg:h-[234px]"
            : "relative w-[50px] h-[150px] min-[360px]:w-[56px] min-[360px]:h-[168px] min-[400px]:w-[64px] min-[400px]:h-[192px] sm:w-[76px] sm:h-[228px] md:w-[88px] md:h-[264px] lg:w-[98px] lg:h-[294px]"
        }
        style={customGlowShadow}
      >
        <svg
          viewBox="0 0 100 300"
          className="w-full h-full drop-shadow-[0_12px_16px_rgba(0,0,0,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs block */}
          <defs>
            {/* Liquid solid linear base gradient */}
            {layers.map((l, index) => (
              <linearGradient key={index} id={`liq-${bottle.id}-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={l.color} />
                <stop offset="40%" stopColor={l.color} />
                <stop offset="100%" stopColor={l.color} />
              </linearGradient>
            ))}

            {/* Specular highlighting overlay for glossy 2D bottle */}
            <linearGradient id="glassShinyGloss" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.10" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.0" />
              <stop offset="95%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.45" />
            </linearGradient>

            {/* Double dark gradient reflection inside */}
            <linearGradient id="solidBackShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.0" />
              <stop offset="90%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
            </linearGradient>
          </defs>

          {/* Liquid content clipping mask using our custom 2D narrow-neck bottle shape */}
          <clipPath id={`clip-${bottle.id}`}>
            <path d={bottlePath} />
          </clipPath>

          {/* BACKGROUND: Glass backend highlight to look fully 2D and translucent */}
          <path
            d={bottlePath}
            fill="#1E293B"
            fillOpacity={skinGlowColor ? "0.35" : "0.55"}
          />

          {/* Liquid layers inside the narrow neck flask clipping boundary */}
          <g clipPath={`url(#clip-${bottle.id})`}>
            {liquidSegments.map((segment, index) => {
              const heightY = 300 - (segment.startY + segment.height);

              return (
                <g key={index}>
                  {/* Liquid solid rectangle (broad to fully cover body) */}
                  <rect
                    x="2"
                    y={heightY - 1}
                    width="96"
                    height={segment.height + 3}
                    fill={`url(#liq-${bottle.id}-${index})`}
                  />

                  {/* Gentle shadow divider between colors for incredible physical layering */}
                  <rect
                    x="2"
                    y={heightY + segment.height - 3}
                    width="96"
                    height="6"
                    fill="url(#solidBackShadow)"
                    opacity="0.6"
                  />

                  {/* Mini physical curved bubble line for realistic 2D liquid layer meniscus */}
                  <path
                    d={`M 8,${heightY} Q 50,${heightY + 3} 92,${heightY}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                  />

                  {/* High quality curvy surface top highlights for the topmost layer */}
                  {segment.isTop && (
                    <ellipse
                      cx="50"
                      cy={heightY}
                      rx="35"
                      ry="5"
                      fill="#FFFFFF"
                      opacity="0.35"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Dynamic Pour Stream (cascading matching liquid block flowing from source mouth) */}
          {isStreamActive && streamColor && (
            <rect
              x="46"
              y="-120"
              width="8"
              height={Math.max(0, surfaceY + 120)}
              fill={streamColor}
              opacity="0.95"
              rx="3"
            />
          )}

          {/* If skin glow is active, draw a slightly thicker high-contrast dark contour path behind the neon glow to make it stand out beautifully on any background (especially light/white themes like summer and pastel) */}
          {skinGlowColor && (
            <path
              d={bottlePath}
              fill="none"
              stroke="#0f172a"
              strokeOpacity="0.95"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Thick 2D Glass Outlining Border (Exactly like the cartoon border in Image 2) */}
          <path
            d={bottlePath}
            fill="none"
            stroke={skinGlowColor ? skinGlowColor : (isDarkTheme ? "#FFFFFF" : "#1E293B")}
            strokeOpacity="1"
            strokeWidth={skinGlowColor ? "4.5" : "5.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Subtle inner shiny glass stroke highlight */}
          <path
            d={bottlePath}
            fill="none"
            stroke="#F8FAFC"
            strokeOpacity="0.4"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Specular vector glaze gloss across the vertical axis */}
          <path
            d={bottlePath}
            fill="url(#glassShinyGloss)"
            pointerEvents="none"
          />

          {/* Premium Wooden Cork Stopper at the neck mouth for a gorgeous unique look */}
          <g>
            {/* The Cork Stopper Plug */}
            <path
              d="M 33,2 L 67,2 L 63,16 L 37,16 Z"
              fill="#b45309"
              stroke={skinGlowColor ? skinGlowColor : (isDarkTheme ? "#FFFFFF" : "#1E293B")}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Cork inner woody grain shadow */}
            <path
              d="M 33,2 Q 50,5 67,2 L 63,16 Q 50,13 37,16 Z"
              fill="#78350f"
              opacity="0.3"
            />
            {/* Glass Lip Ring Rim */}
            <rect
              x="26"
              y="12"
              width="48"
              height="8"
              rx="3.5"
              fill={skinGlowColor ? skinGlowColor : "#F8FAFC"}
              stroke={skinGlowColor ? skinGlowColor : (isDarkTheme ? "#FFFFFF" : "#1E293B")}
              strokeWidth="4.5"
            />
          </g>
        </svg>

        {/* Level completed glittering celebration star overlay */}
        {totalVolume === capacity && layers.length === 1 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-neutral-950 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black animate-bounce shadow-[0_4px_12px_rgba(245,158,11,0.5)] border-2 border-white">
            ⭐
          </div>
        )}
      </div>
    </div>
  );
};
