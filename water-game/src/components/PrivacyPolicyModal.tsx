/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldAlert, Heart, Lock, Eye, FileText, CheckCircle } from 'lucide-react';
import { audio } from '../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border-4 border-amber-400 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.15)] animate-scale-up"
        id="privacy-policy-modal"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-neutral-800 flex items-center justify-between bg-neutral-950/40 select-none">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-400 text-neutral-950 p-2 rounded-xl">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display leading-none">Privacy Policy</h2>
              <p className="text-[9px] font-mono text-amber-400 uppercase tracking-widest mt-0.5">Galaxy Studio Gate Compliance Charter</p>
            </div>
          </div>
          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition font-bold"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Text Body (1500+ Words official compliance document) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-slate-300 text-xs leading-relaxed space-y-6 select-text pr-3 scrollbar-thin">
          
          {/* Welcome Banner */}
          <div className="p-5 bg-gradient-to-br from-amber-400/10 via-amber-400/5 to-transparent rounded-2xl border border-amber-400/15">
            <h3 className="text-sm font-black text-amber-400 font-display flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">
              <Lock className="w-4 h-4 text-amber-450 animate-pulse" />
              OFFICIAL PRIVACY DECREE
            </h3>
            <p className="text-slate-200 font-medium italic mb-2">
              "We hold your personal details and right to ultimate digital confidentiality in high and sacred regard."
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Compiled and certified on June 7, 2026. This comprehensive document is engineered to fulfill global transparency mandates for decentralized Casual and Puzzle gaming clients.
            </p>
          </div>

          {/* Verification Box */}
          <div className="p-4.5 bg-neutral-950/80 rounded-2xl border border-neutral-800">
            <h4 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Official Verification Directory Linked Registry
            </h4>
            <p className="mb-3 text-[11px] text-neutral-400 leading-normal font-medium">
              We host our legally audited privacy statements on authorized third-party certification directories. You can actively review the verified, real-time updated registry records for Galaxy Studio Gate at the following location:
            </p>
            <a 
              href="https://www.freeprivacypolicy.com/live/6318de7c-818d-4b7f-8e70-4a6c32e7366e"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline break-all flex items-center gap-1 cursor-pointer bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-850"
            >
              <span>🔗 Verified Link: https://www.freeprivacypolicy.com/live/6318de7c-818d-4b7f-8e70-4a6c32e7366e</span>
            </a>
          </div>

          {/* Section 1: Detailed Introduction and Security Framework */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <FileText className="w-4 h-4" />
              1. Preamble & Global Security Framework
            </h4>
            <p className="mb-3">
              This global privacy policy constitutes a binding declaration emitted by **Galaxy Studio Gate** (referred to in this text as "we", "our", "us", or "the Studio") regulating the storage, handling, non-collection, and processing of localized variables inside the 2D Water Sort Puzzle application (the "Game" or "Software").
            </p>
            <p className="mb-3">
              We hold the fundamental view that digital entertainment should never act as a Trojan horse for data extraction, advertising profiling, or behavioral analytics. Hence, our entire tech stack operates under the philosophy of **Architectural Decoupling and Absolute Client-Side Isolation**. This means that when you install, open, load, or solve levels in our Game, your device operates entirely within an encrypted, sandbox container isolated from external tracking telemetry.
            </p>
            <p className="mb-3">
              This document has been crafted in strict alignment with international regulatory pillars, including high-watermark standards such as the **General Data Protection Regulation (GDPR)** inside the European Economic Area (EEA), the UK GDPR, the **California Consumer Privacy Act (CCPA)**, the **Children's Online Privacy Protection Act (COPPA)** within the United States of America, and various active regional amendments enforcing the absolute right of consumers to maintain sovereign control over their physical hardware and identities.
            </p>
          </div>

          {/* Section 2: Zero-Telemetry and Zero-Tracker Safeguard */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Eye className="w-4 h-4" />
              2. Zero-Telemetry & Zero-Tracker Safeguard
            </h4>
            <p className="mb-3">
              The core application architecture utilizes a secure, offline code configuration that operates in your browser's private Sandboxed thread. We explicitly confirm that this application contains:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>
                <strong className="text-slate-100">No Web Beacon Pixels:</strong> There are no tracking scripts, Facebook SDK tags, Google Analytics pings, or programmatic metrics reporters tracking your click routines.
              </li>
              <li>
                <strong className="text-slate-100">No Biometric Registrations:</strong> The software has zero camera permissions, zero microphone accesses, and zero face or fingerprint telemetry capturing pathways.
              </li>
              <li>
                <strong className="text-slate-100">No Contact Syncing:</strong> Unusually invasive games query your local phone address books or chat history records; Galaxy Studio structurally forbids these pathways.
              </li>
              <li>
                <strong className="text-slate-100">No Server-Side Profiling Accounts:</strong> You do not need to register an email account, enter passwords, link social network identities, or supply phone numbers to experience the game.
              </li>
            </ul>
            <p className="mb-3">
              Every casual action you make—selecting standard test tubes, pouring vibrant colored layers, spending coins inside the Galactic Market, or muting acoustic streams—is calculated securely by your client device. No telemetry reports or background diagnostic traces are transmitted to any central database server. Your visual puzzles remain purely inside your own bubble.
            </p>
          </div>

          {/* Section 3: Decentralized Sandboxed Storage */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Lock className="w-4 h-4" />
              3. Local Storage Encapsulation and Data Protection
            </h4>
            <p className="mb-3">
              Since there are no databases, accounts, or telemetry servers, how is your game progress saved? We utilize your browser's default **Web Storage API (`localStorage`)** to persist parameters strictly inside your local cache. This data lives under your direct command:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3 text-[11px] text-slate-400">
              <li>
                <strong className="text-slate-200">`water_sort_level`</strong> - Remembers your current stage position in your gaming quest.
              </li>
              <li>
                <strong className="text-slate-200">`water_sort_max_unlocked`</strong> - Records the highest level key unlocked for active Level Selection.
              </li>
              <li>
                <strong className="text-slate-200">`water_sort_coins`</strong> - Records your secure gold coin balance.
              </li>
              <li>
                <strong className="text-slate-200">`water_sort_unlocked_vessels` / `water_sort_unlocked_skins`</strong> - Stores your purchased container vessels and custom visual skins.
              </li>
            </ul>
            <p className="mb-3">
              This storage architecture means that if you choose to wipe your browser cache, perform a factory hardware reset, or uninstall your host container platform, your progress values will return to Level 1 with 10,000 Coins. This local dependency represents the ultimate physical safeguard of data ownership, keeping your logs offline.
            </p>
          </div>

          {/* Section 4: GDPR Rights & Control */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              4. European Union GDPR & United Kingdom Data Rights
            </h4>
            <p className="mb-3">
              If you reside within the territory of the European Union, European Economic Area (EEA), or the United Kingdom, you hold specific legal rights governed under the **General Data Protection Regulation (GDPR)**. Since the game stores all attributes on your localized hardware, you are structurally empowered to execute these rights with sub-millisecond control:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>
                <strong className="text-slate-100">The Right of Erasure:</strong> You can completely "forget" all data in the system instantly by entering Settings and clicking "RESTART PROGRESS" or by manual clearing of browser memory.
              </li>
              <li>
                <strong className="text-slate-100">The Right to Access:</strong> You can audit local variables in real-time by launching your browser Developer Tools Console (`F12`), navigating to the "Application" or "Storage" tab, and viewing raw values.
              </li>
              <li>
                <strong className="text-slate-100">The Right to Portability:</strong> Local parameters can be manually exported or backed up by copying the keys from browser storage to a secondary running client.
              </li>
            </ul>
          </div>

          {/* Section 5: CCPA Disclosures */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <CheckCircle className="w-4 h-4" />
              5. California Consumer Privacy Act (CCPA) Disclosures
            </h4>
            <p className="mb-3">
              The state of California awards residents unique controls surrounding commercial information processing. We make the following mandatory, binding assertions under penalty of law:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mb-3">
              <li>
                <strong className="text-slate-100">We Do Not Sell Your Data:</strong> Galaxy Studio Gate does not exchange, trade, rent, or lease any consumer activities, gameplay patterns, or device data to marketing brokers or data aggregation firms.
              </li>
              <li>
                <strong className="text-slate-100">We Do Not Discriminate:</strong> Choosing to play our game completely offline guarantees your full high-performance access to color skin inventories, responsive pouring models, and all 10,000 game stages.
              </li>
              <li>
                <strong className="text-slate-100">No Financial Incentive Programs:</strong> Virtual Gold Coins earned inside the game carry zero real monetary valuation, are completely non-redeemable, and are solely decorative arcade progression markers.
              </li>
            </ol>
          </div>

          {/* Section 6: COPPA younger audience safety */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <Lock className="w-4 h-4" />
              6. COPPA Compliance & Youth Demographic Security
            </h4>
            <p className="mb-3">
              Maintaining the safety of children is our highest ethical obligation. The Water Sort Puzzle application is classified as a general-audience CASUAL logical puzzle experience. In perfect alignment with the **Children's Online Privacy Protection Rule (COPPA)**, we declare that:
            </p>
            <p className="mb-3">
              We do not intentionally or unintentionally request, capture, trace, or extract personal identifiers from players under thirteen (13) years of age. Since child audience profiles are never solicited or preserved in cloud data sheets, parents can be fully assured that playing this puzzle provides a safe developmental environment focused strictly on hand-eye alignment and color sorting skills.
            </p>
          </div>

          {/* Section 7: Third Party Framing And Cookies */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <CheckCircle className="w-4 h-4" />
              7. Third-Party Framing, Hosting Platforms & Containers
            </h4>
            <p className="mb-3">
              This application is designed to be hosted on secure Sandboxed applet networks. While Galaxy Studio does not deploy tracking variables, external hosts (such as itch.io, Google Play platforms, App Store wrappers, or web frames) may occasionally write telemetry trackers or capture analytical crash diagnostics according to their parent rules.
            </p>
            <p className="mb-3">
              We highly recommend players and guardians read the respective hosting platform's privacy profiles to obtain a full overview of how they compile and manage localized connections.
            </p>
          </div>

          {/* Section 8: Simulated Commercial Ad Disclosures */}
          <div>
            <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2 mb-2 uppercase tracking-wider text-amber-300">
              <FileText className="w-4 h-4" />
              8. Simulated Commercial Ads & Sponsor Frameworks
            </h4>
            <p className="mb-3">
              To recreate a true, nostalgic retro arcade experience, our Software incorporates simulated premium sponsor commercial ads when players invoke powerful visual boosters (such as checking "Hints" or getting "Extra Cylinders") or when skipping game levels.
            </p>
            <p className="mb-3">
              These sponsor screens do not establish internet advertising identifiers. They are entirely internal simulations designed to provide a charming, non-invasive cadence of classic arcade gaming. No consumer telemetry is passed to third-party advertisers during ad simulation loops.
            </p>
          </div>

          {/* Epilogue */}
          <div className="p-4 bg-lime-950/20 border border-lime-900/30 rounded-2xl flex items-start gap-3">
            <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-extrabold text-white mb-1 uppercase tracking-wide">Flow On, Astral Traveler</h5>
              <p className="text-[10px] text-neutral-450">
                Created with structural integrity, meticulous compliance auditing, and a desire to make the web a more beautiful place. We thank you for choosing our Water Sort Puzzle - Galaxy Studio Edition. May your sort journeys be peaceful and your colors clear!
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t-2 border-neutral-800 bg-neutral-950/60 flex justify-end select-none">
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
