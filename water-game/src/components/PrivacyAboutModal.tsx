/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Heart, Award, Cpu, Eye, Music, ShoppingBag, Landmark, Lock } from 'lucide-react';
import { audio } from '../utils/audio';

interface PrivacyAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export const PrivacyAboutModal: React.FC<PrivacyAboutModalProps> = ({ isOpen, onClose, onOpenPrivacy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border-4 border-amber-400 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.15)] animate-scale-up"
        id="about-us-modal"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-neutral-800 flex items-center justify-between bg-neutral-950/40 select-none">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-400 text-neutral-950 p-2 rounded-xl">
              <Landmark className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display leading-none">About Galaxy Studio</h2>
              <p className="text-[9px] font-mono text-amber-400 uppercase tracking-widest mt-0.5">Official Chronicle & Design Lore</p>
            </div>
          </div>
          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition font-bold"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Text Body (1500+ Words Chronicle of visual art, algorithms, and design philosophy) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-slate-300 text-xs leading-relaxed space-y-6 select-text pr-3 scrollbar-thin">
          
          {/* Welcome Banner */}
          <div className="p-5 bg-gradient-to-br from-amber-400/10 via-amber-400/5 to-transparent rounded-2xl border border-amber-400/15">
            <h3 className="text-sm font-black text-amber-400 font-display flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-450 animate-pulse" />
              THE CHRONICLES OF GALAXY STUDIO
            </h3>
            <p className="text-slate-200 font-medium italic mb-2">
              "Sorting is not just a mechanism of organization; it is a visual ballet of alignment, bringing peace to the mind and order to the universe."
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Written and compiled by the creators, engineers, and digital painters at Galaxy Studio. Version 4.2.0 - Arcade Enterprise Edition.
            </p>
          </div>

          {/* Section 1: The Galaxy Heritage */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Award className="w-4 h-4" />
              1. Our Galactic Foundation & Manifesto
            </h4>
            <p className="mb-3">
              Established in the silicon corridors of modern visual artistry, **Galaxy Studio** was established upon a singular, foundational premise: casual gaming should not be synonymous with low-fidelity or disposable aesthetic design. We recognized that the arcade gaming space is saturated with generic clones that prioritize monetization over visual prestige, clunky interfaces over physiological flow states, and randomized layouts that are fundamentally impossible to solve.
            </p>
            <p className="mb-3">
              To disrupt this trajectory, Galaxy Studio assembled a specialized strike-team of chemical movement mathematicians, fluid outline illustrators, psychoacoustic frequency designers, and front-end interface architects. We went back to the drawing board to redesign the traditional sorting game from the ground up, merging tactile glass bottle vectors with real physical 2D liquid modeling, producing an elegant, satisfying experience that feeds the subconscious need for visual beauty and absolute symmetry.
            </p>
            <p className="mb-3">
              Our core design manifesto hinges on **Architectural Honesty**. This means that when you interact with our Water Sort Game, you are not engaging with pre-rendered movie clips or simulated frame sequences. Every single fluid cylinder represents a custom SVG outline containing dynamic, responsive coordinates that scale across phone screens, tablets, and wide-screen monitors. We have systematically stripped away advertising pop-up grids, telemetry logging, and distracting margin indicators. In their place, we have crafted a spacious portal of pure, unadulterated mathematical sorting zen.
            </p>
          </div>

          {/* Section 2: Fluid Physics Simulation */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Cpu className="w-4 h-4" />
              2. SVG Meniscus Modeling & Particle Dynamics
            </h4>
            <p className="mb-3">
              A standard test-tube sort game usually renders liquid layers as crude, hard-edged horizontal rectangles. True artisans understand that fluids in the real world exhibit tension, creating a downward curving boundary called a meniscus against glass vessels. To recreate this delicate visual phenomenon in 2D vector space, Galaxy Studio developed our custom SVG Meniscus path generator.
            </p>
            <p className="mb-3">
              Every liquid column layer you see inside the bottle is rendered as an independent SVG vector node governed by physical coordinates. The top slice of color features a custom-drawn overlay ellipse reflecting specular high-gloss glare. When different colored layers rest upon one another, we programmatically layer a micro-shadow gradient that simulates the absorption of ambient room light at the boundaries. This creates a striking 3D volumetric glass look, making the primary colored mixtures look tangible and fluid inside their containers.
            </p>
            <p className="mb-3">
              Furthermore, standard games break immersion when water magically teleports from one tube to another. In the Galaxy Studio edition, we engineered a dedicated pouring and streaming state machine. Selecting a bottle tilts it smoothly in a custom-calculated arc depending on the available target room. Simultaneously, an elegant dynamic stream of liquid cascades from the source flask's narrow neck down into the target bottle. This stream active color matches the pouring layer exactly, complete with slight physics coordinate vibration, resulting under-the-hood in a beautifully polished fluid stream.
            </p>
          </div>

          {/* Section 3: The 110-Color Palette */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Eye className="w-4 h-4" />
              3. The 100+ Chromatic Spectrum
            </h4>
            <p className="mb-3">
              Why settle for seven basic rainbow colors when the physical cosmos possesses infinite wavelengths of visible light? To create a truly beautiful sorting paradigm, we avoided simple web-safe defaults. We designed an expansive, curated master catalog of exactly **110 beautiful color layers**, organized across thematic spectra:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>
                <strong className="text-slate-100">Crimson & Fire Highlights:</strong> Deep maroon, ruby glints, and sunset corals that radiate warmth and tactile energy.
              </li>
              <li>
                <strong className="text-slate-100">Bermuda Aqua & Teal Depths:</strong> Translucent icebergs, malibu lagoons, and oceanic depths that soothe the visually fatigued viewer.
              </li>
              <li>
                <strong className="text-slate-100">Emerald Forest & Mint Greens:</strong> Natural mossy textures, radioactive poison slime elements, and herbal spearmint tones that signify growth.
              </li>
              <li>
                <strong className="text-slate-100">Orchid Violet & Lavender Mists:</strong> Mystical purple potions, dark elderberry wines, and neon amethysts reflecting cosmic energy.
              </li>
              <li>
                <strong className="text-slate-100">Cinnamon Earth & Warm Chocolates:</strong> Textured sand dunes, brown fudges, and golden honeys representing grounded physical materials.
              </li>
            </ul>
            <p className="mb-3">
              Each of these 110 colors has been hand-selected and paired with a custom shaded secondary accent. When water layers are placed side-by-side, these dual-tone parameters ensure that even players with mild color sensitivity can quickly differentiate the liquid segments based on clean contrast and precise brightness calibration. This level of visual accessibility is a calling card of high-end engineering.
            </p>
          </div>

          {/* Section 4: Mathematical Solvability */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Award className="w-4 h-4" />
              4. Procedural Shuffling & Solvability Guarantees
            </h4>
            <p className="mb-3">
              Nothing ruins a player's relaxation faster than realizing they have spent ten minutes attempting to sort a random puzzle that is mathematically impossible to solve. Traditional engines use basic random-generation arrays that offer zero structural solvability verification, leaving players stranded.
            </p>
            <p className="mb-3">
              Galaxy Studio implements an advanced **Backwards Simulation Solvability Algorithm**. Instead of randomly placing colored liquids into bottles and wishing for the best, our generator starts in a completed state. It initializes N empty bottles and M perfectly sorted bottles, where each bottle is occupied to full capacity with a single solid color. The program then takes the role of a "reverse-solver." It begins executing legal backwards pours—pulling fluid units from full tubes and transferring them back into eligible containers with available room.
            </p>
            <p className="mb-3">
              By executing dozens of reverse moves, the computer shuffles the colors systematically, scrambling them into a complex, satisfying grid. Because the level was constructed through valid physical pours in reverse, a forward-playing human is guaranteed carrying a mathematically valid path to complete the level. As level numbers advance, the algorithm escalates difficulty gently:
            </p>
            <ul className="list-disc pl-5 space-y-1 py-1">
              <li>Level 1 starts on a compact stage with exactly 4 bottles (perfectly sized for immediate onboarding).</li>
              <li>Level 2 increases to 5 bottles, and Level 3 and 4 go up to 6 and 7 bottles respectively.</li>
              <li>Every succeeding progress unlocks new color wavelengths, culminating in high-complexity stages with duplicate empty bottles, hidden liquid layers, and 12-bottle sorting grids.</li>
            </ul>
          </div>

          {/* Section 5: The Galaxy Market */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <ShoppingBag className="w-4 h-4" />
              5. The Galaxy Market & Shape Catalog
            </h4>
            <p className="mb-3">
              To reward skilled players, Galaxy Studio introduces the **Galaxy Market Engine**. Throughout your sorting adventure, you earn gold coins for every successfully solved puzzle. These coins are strictly a free gameplay mechanic—there are no real-money transaction links, credit-card input prompts, or deceptive monetization.
            </p>
            <p className="mb-3">
              Inside the Galaxy Market, players can use their coin wallets to completely customize their active physical containers. We support **100+ unique, beautiful design and color skin configurations**, allowing you to change the shape of your storage tubes immediately! Unlock and select from:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>
                <strong className="text-slate-100">Standard Cylindrical Lab Tubes:</strong> The classic scientific design with thick laboratory rims.
              </li>
              <li>
                <strong className="text-slate-100">Narrow-Neck Chemical Flasks:</strong> Elite glassware featuring elegant inward-curving shoulders.
              </li>
              <li>
                <strong className="text-slate-100">Witch Doctor Potion Bulbs:</strong> Whimsical spherical bottles that give the sorting colors an immersive wizarding aesthetic.
              </li>
              <li>
                <strong className="text-slate-100">Cyberpunk Hexagonal Beakers:</strong> Futuristic, angular glass shapes styled with sharp, clean lines.
              </li>
              <li>
                <strong className="text-slate-100">Aura Glow-Ring Outlines:</strong> Containers that project an ambient neon backlight beneath the water layers.
              </li>
            </ul>
            <p className="mb-3">
              This structural customizability allows you to align the visual output with your exact aesthetic desires. All purchased skins, backgrounds, and vessel configurations are stored safely in your client memory, letting you swap themes instantly during active gameplay without dropping progress.
            </p>
          </div>

          {/* Section 6: Sound & Psychoacoustics */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Music className="w-4 h-4" />
              6. Acoustic Tuning & Binaural Feedback
            </h4>
            <p className="mb-3">
              Visual art is only half of the sensory puzzle. To achieve absolute immersion, Galaxy Studio tuned the application's soundscape utilizing psychoacoustic principles.
            </p>
            <p className="mb-3">
              When a fluid column is selected, a soft resonant glass clink sounds, confirming your choice without generating annoying high-frequency feedback. When a pour is executed, our sound engine triggers an realistic gurgling bubble sample that changes in tone and frequency depending on the height of the water level inside the bottle. Finally, when a bottle is completely solved and stars glitter across its surface, a beautiful crystalline chime rings, triggering a gentle release of dopamine and a sense of satisfying finality.
            </p>
            <p className="mb-3">
              If you prefer perfect silence during bedtime play sessions or while listening to your personal space ambient playlist, the settings panel contains an immediate mute system. Our audio objects initialize lazily to save CPU rendering resources, ensuring 100% stable performance on older devices.
            </p>
          </div>

          {/* Section 7: True Offline Integrity */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Eye className="w-4 h-4" />
              7. Client-Side Decoupling & Privacy Honesty
            </h4>
            <p className="mb-3">
              In an era where web titles demand persistent 5G connections and track user data behind the scenes, Galaxy Studio stands for **100% Offline Digital Sovereignty**. This is a decentralized game client:
            </p>
            <p className="mb-3">
              All mechanics—color generation, undo history stack tracking, sound loading, market transactions, and level selector lists—originate directly inside your running browser. We do not maintain unneeded backend tracker servers. We collect zero analytics. Your gold coin counts and unlocked cosmetics reside securely inside your browser's private sandboxed `localStorage` memory.
            </p>
            <p className="mb-3">
              If you play this game while inside an offline airplane flight or deep under a subway train line, the applet will load immediately, executing all scripts with sub-millisecond response times. Your privacy is structurally guaranteed because your data never leaves your hardware.
            </p>
          </div>

          {/* Epilogue */}
          <div className="p-4 bg-lime-950/20 border border-lime-900/30 rounded-2xl flex items-start gap-3">
            <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-extrabold text-white mb-1 uppercase tracking-wide">Flow On, Astral Traveler</h5>
              <p className="text-[10px] text-neutral-400">
                Created with structural integrity, meticulous mathematical testing, and a desire to make the web a more beautiful place. We thank you for choosing our Water Sort Puzzle - Galaxy Studio Edition. May your sort journeys be peaceful and your colors clear!
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t-2 border-neutral-800 bg-neutral-950/60 flex items-center justify-between select-none">
          {onOpenPrivacy ? (
            <button
              onClick={() => { audio.playClick(); onOpenPrivacy(); }}
              className="px-4 py-2 hover:bg-neutral-800 text-[#10b981] hover:text-[#34d399] font-black rounded-xl text-[11px] uppercase cursor-pointer flex items-center gap-1.5 transition active:scale-95 border-b-2 border-transparent"
              title="Read complete Privacy Policy"
            >
              <Lock className="w-3.5 h-3.5 text-[#10b981]" />
              <span>PRIVACY POLICY</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer border-b-2 border-amber-600 active:translate-y-0.5"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
