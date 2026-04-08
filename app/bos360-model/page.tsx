"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Main component with metadata
export default function BOS360ModelPage() {
  useEffect(() => {
    document.title = "BOS360 | The Architectural Model";
  }, []);

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] antialiased" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <style>{`
        .venn-container {
          position: relative;
          width: min(600px, 90vw);
          height: min(600px, 90vw);
        }
        .circle-base {
          position: absolute;
          width: min(380px, 58vw);
          height: min(380px, 58vw);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          mix-blend-mode: multiply;
          cursor: pointer;
        }
        @media (hover: hover) {
          .circle-base:hover {
            transform: scale(1.02);
            box-shadow: 0 0 40px rgba(160, 65, 0, 0.15);
          }
        }
        .circle-base:active {
          transform: scale(0.98);
        }
        .venn-text {
          pointer-events: none;
          z-index: 10;
        }
        .center-overlap-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 8;
          pointer-events: none;
          filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.22));
        }
        @media (max-width: 900px) {
          .venn-container {
            width: 100%;
            max-width: 420px;
            height: 420px;
          }
          .circle-base {
            width: 250px;
            height: 250px;
          }
        }
        @media (max-width: 640px) {
          .mobile-stack {
            position: static !important;
            transform: none !important;
          }
        }
      `}</style>

      <nav className="sticky top-0 z-40 w-full border-b border-black/5 bg-[#fcf9f8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-6 md:px-12">
          <div className="text-2xl font-black tracking-tight">BOS360</div>
          <div className="hidden gap-8 md:flex">
            <a className="font-bold tracking-tight text-[#1c1b1b] transition-colors duration-200 hover:text-[#ff6b00]" href="#model-v1">Version 1</a>
            <a className="font-bold tracking-tight text-[#1c1b1b] transition-colors duration-200 hover:text-[#ff6b00]" href="#model-v2">Version 2</a>
          </div>
          <button className="rounded-full bg-[#ff6b00] px-6 py-3 font-bold tracking-tight text-white transition-transform hover:scale-[1.02] md:px-8">
            Get Started
          </button>
        </div>
      </nav>

      <main>
        <div id="model-v1">
          <InteractiveBOS360Model />
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a04100]/30 to-transparent" />
          <div className="absolute inset-x-0 -top-4 flex justify-center">
            <div className="bg-[#fcf9f8] px-4 text-xs font-bold uppercase tracking-[0.35em] text-[#a04100]">Version 2</div>
          </div>
          <BOS360ModelVersion title="THE MODEL" badge="100% STRONG" versionLabel="Version 2" centerTreatment="none" />
        </div>
      </main>

      <footer className="w-full border-t border-black/5 bg-[#fcf9f8]">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-12">
          <div className="text-lg font-bold">BOS360</div>
          <div className="my-0 text-sm text-[#5e5e5e]">© 2024 BOS360. Architectural Precision.</div>
          <div className="flex gap-6 md:gap-8">
            <a className="text-sm text-[#5e5e5e] hover:text-[#ff6b00]" href="#">Privacy Policy</a>
            <a className="text-sm text-[#5e5e5e] hover:text-[#ff6b00]" href="#">Terms of Service</a>
            <a className="text-sm text-[#5e5e5e] hover:text-[#ff6b00]" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

type PillarData = {
  id: string;
  name: string;
  description: string;
  tools: string[];
  position: "top" | "bottom-left" | "bottom-right";
};

type ForceData = {
  id: string;
  name: string;
  description: string;
  tools: string[];
  fromPillars: [string, string];
};

const pillars: PillarData[] = [
  {
    id: "business",
    name: "Business",
    description: "The structural foundation of the organization focusing on market positioning and financial health. The ability to generate cash, create value, grow and be profitable.",
    tools: ["Market Analysis", "Revenue Design", "Financial Planning", "Growth Strategy"],
    position: "top",
  },
  {
    id: "brand",
    name: "Brand",
    description: "The identity and reputation that creates emotional resonance with the target audience. Company identity, reputation, and customer expectations.",
    tools: ["Visual Identity", "Market Trust", "Brand Strategy", "Customer Experience"],
    position: "bottom-left",
  },
  {
    id: "team",
    name: "Team",
    description: "The human element that drives progress and embodies the organizational values. Competent, dependable, happy, high-performing people.",
    tools: ["Talent Ops", "Skill Alignment", "Culture Building", "Performance Management"],
    position: "bottom-right",
  },
];

const forces: ForceData[] = [
  {
    id: "strategy",
    name: "Strategy",
    description: "Connecting Business goals with Brand identity to chart a clear course for market dominance. Unique Vision, where you're going and how to get there - the guiding force.",
    tools: ["Vision Setting", "Market Positioning", "Brand Strategy", "Goal Alignment"],
    fromPillars: ["brand", "business"],
  },
  {
    id: "execution",
    name: "Execution",
    description: "Bridging Business objectives and Team performance to ensure operational excellence. Focus, discipline, accountability - the driving force.",
    tools: ["Project Management", "Performance Tracking", "Accountability Systems", "Process Optimization"],
    fromPillars: ["business", "team"],
  },
  {
    id: "culture",
    name: "Culture",
    description: "Harmonizing Brand promise and Team behavior to build an authentic organizational soul. Unique vibe that attracts right people - the energizing force.",
    tools: ["Values Alignment", "Employee Engagement", "Brand Ambassador Program", "Workplace Culture"],
    fromPillars: ["brand", "team"],
  },
];

type ModelVersionProps = {
  title: string;
  badge: string;
  versionLabel: string;
  centerTreatment: "svg-overlap" | "none";
};

function CenterOverlapSVG() {
  return (
    <svg
      aria-hidden="true"
      className="center-overlap-svg"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <mask id="bos360-center-mask">
          <rect width="600" height="600" fill="black" />
          <circle cx="300" cy="190" r="190" fill="white" />
          <circle cx="194" cy="396" r="190" fill="white" />
          <circle cx="406" cy="396" r="190" fill="white" />
        </mask>
      </defs>
      <rect width="600" height="600" fill="#1c1b1b" mask="url(#bos360-center-mask)" />
    </svg>
  );
}

function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  tools,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  tools: string[];
  type: "pillar" | "force";
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ animation: "fadeIn 0.3s ease" }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
        style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="relative p-6 md:p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f3f1] text-[#1c1b1b] transition-colors hover:bg-[#e5e2e1] md:right-8 md:top-8"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#a04100]">
            {type === "pillar" ? "Pillar" : "Bonding Force"}
          </div>
          <h3 className="mb-4 text-3xl font-black tracking-tight text-[#1c1b1b] md:text-4xl">
            {title.toUpperCase()}
          </h3>
          <p className="mb-6 text-base leading-relaxed text-[#5e5e5e] md:text-lg">
            {description}
          </p>
          <div className="border-t border-black/5 pt-6">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1c1b1b]">
              Key Tools & Disciplines
            </h4>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, index) => (
                <span
                  key={index}
                  className="rounded-full bg-[#f5f3f1] px-4 py-2 text-sm font-medium text-[#1c1b1b]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(100%);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

function InteractiveBOS360Model() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const activePillar = pillars.find((p) => p.id === activeItem);
  const activeForce = forces.find((f) => f.id === activeItem);

  const handleItemClick = (id: string) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const closeBottomSheet = () => setActiveItem(null);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden border-b border-black/5 p-6 md:p-8">
      <div className="absolute left-6 top-8 md:left-12 md:top-12">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#a04100]">Version 1</div>
        <h2 className="text-xl font-black tracking-widest text-[#1c1b1b]">THE MODEL</h2>
      </div>
      <div className="absolute right-6 top-8 text-right md:right-12 md:top-12">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#1c1b1b]/45">BOS360</div>
        <h2 className="text-xl font-black tracking-widest text-[#a04100]">100% STRONG</h2>
      </div>

      <div className="venn-container flex items-center justify-center">
        {/* Business Pillar */}
        <button
          onClick={() => handleItemClick("business")}
          className="circle-base group left-1/2 top-0 -translate-x-1/2 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80"
          aria-label="Click to learn more about Business"
        >
          <span className="venn-text mb-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Business</span>
        </button>

        {/* Brand Pillar */}
        <button
          onClick={() => handleItemClick("brand")}
          className="circle-base group bottom-4 left-4 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80"
          aria-label="Click to learn more about Brand"
        >
          <span className="venn-text mr-24 mt-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Brand</span>
        </button>

        {/* Team Pillar */}
        <button
          onClick={() => handleItemClick("team")}
          className="circle-base group bottom-4 right-4 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80"
          aria-label="Click to learn more about Team"
        >
          <span className="venn-text ml-24 mt-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Team</span>
        </button>

        <CenterOverlapSVG />

        {/* Strategy Force (intersection of Brand + Business) */}
        <button
          onClick={() => handleItemClick("strategy")}
          className="group absolute left-1/2 top-1/2 -translate-x-[110px] -translate-y-[80px]"
          aria-label="Click to learn more about Strategy"
        >
          <div className="cursor-pointer rounded-full px-4 py-2 transition-all hover:scale-105 hover:bg-[#ff6b00]/10">
            <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Strategy</span>
          </div>
        </button>

        {/* Execution Force (intersection of Business + Team) */}
        <button
          onClick={() => handleItemClick("execution")}
          className="group absolute left-1/2 top-1/2 translate-x-[10px] -translate-y-[80px]"
          aria-label="Click to learn more about Execution"
        >
          <div className="cursor-pointer rounded-full px-4 py-2 transition-all hover:scale-105 hover:bg-[#ff6b00]/10">
            <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Execution</span>
          </div>
        </button>

        {/* Culture Force (intersection of Brand + Team) */}
        <button
          onClick={() => handleItemClick("culture")}
          className="group absolute bottom-[60px] left-1/2 -translate-x-1/2"
          aria-label="Click to learn more about Culture"
        >
          <div className="cursor-pointer rounded-full px-4 py-2 transition-all hover:scale-105 hover:bg-[#ff6b00]/10">
            <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Culture</span>
          </div>
        </button>

        {/* BOS360 Core Logo */}
        <div className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex cursor-pointer items-center justify-center transition-transform hover:scale-105">
            <Image
              src="/bos360-logo.png"
              alt="BOS360 logo"
              width={220}
              height={56}
              className="h-auto w-[100px] md:w-[128px]"
              priority
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 hidden items-center gap-4 md:flex">
        <div className="h-[2px] w-12 bg-[#1c1b1b]/10" />
        <div className="text-4xl font-black tracking-tighter text-[#1c1b1b]">BOS360</div>
      </div>

      {/* Bottom Sheet for Pillars */}
      {activePillar && (
        <BottomSheet
          isOpen={true}
          onClose={closeBottomSheet}
          title={activePillar.name}
          description={activePillar.description}
          tools={activePillar.tools}
          type="pillar"
        />
      )}

      {/* Bottom Sheet for Forces */}
      {activeForce && (
        <BottomSheet
          isOpen={true}
          onClose={closeBottomSheet}
          title={activeForce.name}
          description={activeForce.description}
          tools={activeForce.tools}
          type="force"
        />
      )}
    </section>
  );
}

function BOS360ModelVersion({ title, badge, versionLabel, centerTreatment }: ModelVersionProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden border-b border-black/5 p-6 md:p-8">
      <div className="absolute left-6 top-8 md:left-12 md:top-12">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#a04100]">{versionLabel}</div>
        <h2 className="text-xl font-black tracking-widest text-[#1c1b1b]">{title}</h2>
      </div>
      <div className="absolute right-6 top-8 text-right md:right-12 md:top-12">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#1c1b1b]/45">BOS360</div>
        <h2 className="text-xl font-black tracking-widest text-[#a04100]">{badge}</h2>
      </div>

      <div className="venn-container flex items-center justify-center">
        <div className="group">
          <div className="circle-base left-1/2 top-0 -translate-x-1/2 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80">
            <span className="venn-text mb-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Business</span>
          </div>
        </div>

        <div className="group">
          <div className="circle-base bottom-4 left-4 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80">
            <span className="venn-text mr-24 mt-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Brand</span>
          </div>
        </div>

        <div className="group">
          <div className="circle-base bottom-4 right-4 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80">
            <span className="venn-text ml-24 mt-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Team</span>
          </div>
        </div>

        {centerTreatment === "svg-overlap" ? <CenterOverlapSVG /> : null}

        <div className="group absolute left-1/2 top-1/2 -translate-x-[110px] -translate-y-[80px]">
          <div className="cursor-help rounded-full px-4 py-2 transition-colors hover:bg-[#ff6b00]/10">
            <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Strategy</span>
          </div>
        </div>

        <div className="group absolute left-1/2 top-1/2 translate-x-[10px] -translate-y-[80px]">
          <div className="cursor-help rounded-full px-4 py-2 transition-colors hover:bg-[#ff6b00]/10">
            <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Execution</span>
          </div>
        </div>

        <div className="group absolute bottom-[60px] left-1/2 -translate-x-1/2">
          <div className="cursor-help rounded-full px-4 py-2 transition-colors hover:bg-[#ff6b00]/10">
            <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Culture</span>
          </div>
        </div>

        <div className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex cursor-pointer items-center justify-center transition-transform hover:scale-105">
            <Image
              src="/bos360-logo.png"
              alt="BOS360 logo"
              width={220}
              height={56}
              className="h-auto w-[100px] md:w-[128px]"
              priority
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 hidden items-center gap-4 md:flex">
        <div className="h-[2px] w-12 bg-[#1c1b1b]/10" />
        <div className="text-4xl font-black tracking-tighter text-[#1c1b1b]">BOS360</div>
      </div>
    </section>
  );
}