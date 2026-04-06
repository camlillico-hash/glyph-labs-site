import Image from "next/image";

export const metadata = {
  title: "BOS360 | The Architectural Model",
  description: "Interactive BOS360 architectural model page.",
};

export default function BOS360ModelPage() {
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
        }
        .venn-text {
          pointer-events: none;
          z-index: 10;
        }
        .info-panel {
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s ease;
          pointer-events: none;
        }
        .group:hover .info-panel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
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

      <nav className="w-full bg-[#fcf9f8]">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-6 md:px-12">
          <div className="text-2xl font-black tracking-tight">BOS360</div>
          <div className="hidden gap-8 md:flex">
            <a className="border-b-2 border-[#ff6b00] pb-1 font-bold tracking-tight text-[#ff6b00]" href="#strategy">Strategy</a>
            <a className="font-bold tracking-tight text-[#1c1b1b] transition-colors duration-200 hover:text-[#ff6b00]" href="#execution">Execution</a>
            <a className="font-bold tracking-tight text-[#1c1b1b] transition-colors duration-200 hover:text-[#ff6b00]" href="#culture">Culture</a>
          </div>
          <button className="rounded-full bg-[#ff6b00] px-6 py-3 font-bold tracking-tight text-white transition-transform hover:scale-[1.02] md:px-8">
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-8">
        <div className="absolute left-6 top-8 md:left-12 md:top-12">
          <h2 className="text-xl font-black tracking-widest text-[#1c1b1b]">THE MODEL</h2>
        </div>
        <div className="absolute right-6 top-8 md:right-12 md:top-12">
          <h2 className="text-xl font-black tracking-widest text-[#a04100]">100% STRONG</h2>
        </div>

        <div className="venn-container flex items-center justify-center">
          <div className="group">
            <div className="circle-base left-1/2 top-0 -translate-x-1/2 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80">
              <span className="venn-text mb-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Business</span>
            </div>
            <div className="info-panel absolute -top-16 left-1/2 z-50 w-72 -translate-x-1/2 rounded-[1.5rem] border border-[#e2bfb0]/30 bg-white p-8 shadow-2xl">
              <div className="mb-2 font-bold italic tracking-tight text-[#a04100]">Pillar 01</div>
              <h3 className="mb-4 text-2xl font-bold text-[#1c1b1b]">BUSINESS</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#5e5e5e]">The structural foundation of the organization focusing on market positioning and financial health.</p>
              <div className="flex flex-col gap-2 text-xs font-bold text-[#1c1b1b]">
                <div>✓ MARKET ANALYSIS</div>
                <div>✓ REVENUE DESIGN</div>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="circle-base bottom-4 left-4 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80">
              <span className="venn-text mr-24 mt-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Brand</span>
            </div>
            <div className="info-panel absolute -left-48 bottom-0 z-50 w-72 rounded-[1.5rem] border border-[#e2bfb0]/30 bg-white p-8 shadow-2xl">
              <div className="mb-2 font-bold italic tracking-tight text-[#a04100]">Pillar 02</div>
              <h3 className="mb-4 text-2xl font-bold text-[#1c1b1b]">BRAND</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#5e5e5e]">The identity and reputation that creates emotional resonance with the target audience.</p>
              <div className="flex flex-col gap-2 text-xs font-bold text-[#1c1b1b]">
                <div>✓ VISUAL IDENTITY</div>
                <div>✓ MARKET TRUST</div>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="circle-base bottom-4 right-4 bg-[#e5e2e1]/60 hover:bg-[#e5e2e1]/80">
              <span className="venn-text ml-24 mt-32 text-3xl font-black uppercase tracking-tighter text-[#1c1b1b]">Team</span>
            </div>
            <div className="info-panel absolute -right-48 bottom-0 z-50 w-72 rounded-[1.5rem] border border-[#e2bfb0]/30 bg-white p-8 shadow-2xl">
              <div className="mb-2 font-bold italic tracking-tight text-[#a04100]">Pillar 03</div>
              <h3 className="mb-4 text-2xl font-bold text-[#1c1b1b]">TEAM</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#5e5e5e]">The human element that drives progress and embodies the organizational values.</p>
              <div className="flex flex-col gap-2 text-xs font-bold text-[#1c1b1b]">
                <div>✓ TALENT OPS</div>
                <div>✓ SKILL ALIGNMENT</div>
              </div>
            </div>
          </div>

          <div id="strategy" className="group absolute left-1/2 top-1/2 -translate-x-[110px] -translate-y-[80px]">
            <div className="cursor-help rounded-full px-4 py-2 transition-colors hover:bg-[#ff6b00]/10">
              <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Strategy</span>
            </div>
            <div className="info-panel absolute -top-32 left-0 z-50 w-64 rounded-[1.5rem] border border-[#a04100]/20 bg-white p-6 shadow-xl">
              <h4 className="mb-2 text-sm font-black text-[#a04100]">STRATEGY</h4>
              <p className="text-xs italic text-[#5e5e5e]">Connecting Business goals with Brand identity to chart a clear course for market dominance.</p>
            </div>
          </div>

          <div id="execution" className="group absolute left-1/2 top-1/2 translate-x-[10px] -translate-y-[80px]">
            <div className="cursor-help rounded-full px-4 py-2 transition-colors hover:bg-[#ff6b00]/10">
              <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Execution</span>
            </div>
            <div className="info-panel absolute -top-32 right-0 z-50 w-64 rounded-[1.5rem] border border-[#a04100]/20 bg-white p-6 shadow-xl">
              <h4 className="mb-2 text-sm font-black text-[#a04100]">EXECUTION</h4>
              <p className="text-xs italic text-[#5e5e5e]">Bridging Business objectives and Team performance to ensure operational excellence.</p>
            </div>
          </div>

          <div id="culture" className="group absolute bottom-[60px] left-1/2 -translate-x-1/2">
            <div className="cursor-help rounded-full px-4 py-2 transition-colors hover:bg-[#ff6b00]/10">
              <span className="text-xl font-bold italic tracking-tight text-[#a04100]">Culture</span>
            </div>
            <div className="info-panel absolute bottom-12 left-1/2 z-50 w-64 -translate-x-1/2 rounded-[1.5rem] border border-[#a04100]/20 bg-white p-6 text-center shadow-xl">
              <h4 className="mb-2 text-sm font-black uppercase text-[#a04100]">Culture</h4>
              <p className="text-xs italic text-[#5e5e5e]">Harmonizing Brand promise and Team behavior to build an authentic organizational soul.</p>
            </div>
          </div>

          <div className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="flex cursor-pointer items-center justify-center transition-transform hover:scale-110">
              <Image
                src="/bos360-logo.png"
                alt="BOS360 logo"
                width={220}
                height={56}
                className="h-auto w-[220px] drop-shadow-lg md:w-[260px]"
                priority
              />
            </div>
            <div className="info-panel absolute -top-40 left-1/2 z-50 w-80 -translate-x-1/2 rounded-[1.5rem] bg-[#1c1b1b] p-8 text-white shadow-2xl">
              <h4 className="mb-4 text-2xl font-black text-[#ff6b00]">THE CORE</h4>
              <p className="text-sm leading-relaxed text-[#e5e2e1]">BOS360 is the singularity where Business, Brand, and Team achieve 100% synergy. This is the architectural precision of high-performing ecosystems.</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 right-12 hidden items-center gap-4 md:flex">
          <div className="h-[2px] w-12 bg-[#1c1b1b]/10" />
          <div className="text-4xl font-black tracking-tighter text-[#1c1b1b]">BOS360</div>
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
