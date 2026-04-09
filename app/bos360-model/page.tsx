const BOS360_MODEL_HTML = String.raw`<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>BOS360 | The Architectural Model</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-secondary-fixed": "#1b1b1b",
                        "error-container": "#ffdad6",
                        "surface-tint": "#a04100",
                        "surface-bright": "#fcf9f8",
                        "primary-container": "#ff6b00",
                        "on-tertiary": "#ffffff",
                        "on-primary": "#ffffff",
                        "primary": "#a04100",
                        "on-surface": "#1c1b1b",
                        "on-background": "#1c1b1b",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#9ccaff",
                        "on-primary-container": "#572000",
                        "inverse-surface": "#313030",
                        "on-tertiary-fixed": "#001d35",
                        "inverse-on-surface": "#f3f0ef",
                        "on-error-container": "#93000a",
                        "surface-container": "#f0eded",
                        "inverse-primary": "#ffb693",
                        "on-secondary-fixed-variant": "#474747",
                        "on-primary-fixed-variant": "#7a3000",
                        "secondary": "#5e5e5e",
                        "outline-variant": "#e2bfb0",
                        "tertiary-container": "#059eff",
                        "on-error": "#ffffff",
                        "outline": "#8e7164",
                        "surface-dim": "#dcd9d9",
                        "on-secondary-container": "#646464",
                        "on-secondary": "#ffffff",
                        "primary-fixed": "#ffdbcc",
                        "secondary-fixed": "#e2e2e2",
                        "tertiary": "#0062a1",
                        "tertiary-fixed": "#d0e4ff",
                        "surface-container-high": "#eae7e7",
                        "surface-container-lowest": "#ffffff",
                        "on-tertiary-fixed-variant": "#00497b",
                        "surface-container-low": "#f6f3f2",
                        "surface": "#fcf9f8",
                        "on-tertiary-container": "#003357",
                        "secondary-container": "#e2e2e2",
                        "background": "#fcf9f8",
                        "surface-variant": "#e5e2e1",
                        "on-surface-variant": "#5a4136",
                        "surface-container-highest": "#e5e2e1",
                        "primary-fixed-dim": "#ffb693",
                        "on-primary-fixed": "#351000",
                        "secondary-fixed-dim": "#c6c6c6"
                    },
                    "borderRadius": {
                        "DEFAULT": "1rem",
                        "lg": "2rem",
                        "xl": "3rem",
                        "full": "9999px"
                    },
                    "fontFamily": {
                        "headline": ["Manrope"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    }
                },
            },
        }
    </script>
<style>
        .venn-container {
            position: relative;
            width: 600px;
            height: 600px;
        }
        .circle-base {
            position: absolute;
            width: 380px;
            height: 380px;
            border-radius: 50%;
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
    </style>
</head>
<body class="bg-background font-body text-on-surface antialiased">
<!-- TopNavBar -->
<nav class="w-full rounded-none bg-[#fcf9f8] dark:bg-[#1c1b1b] no-border-tonal-shift-bg-[#fcf9f8] flat-no-shadows">
<div class="flex justify-between items-center px-12 py-6 max-w-screen-2xl mx-auto">
<div class="text-2xl font-black text-[#1c1b1b] dark:text-[#fcf9f8] font-manrope tracking-tight">BOS360</div>
<div class="hidden md:flex gap-8">
<a class="text-[#ff6b00] border-b-2 border-[#ff6b00] pb-1 font-manrope font-bold tracking-tight" href="#">Strategy</a>
<a class="text-[#1c1b1b] dark:text-[#fcf9f8] font-manrope font-bold tracking-tight hover:text-[#ff6b00] transition-colors duration-200" href="#">Execution</a>
<a class="text-[#1c1b1b] dark:text-[#fcf9f8] font-manrope font-bold tracking-tight hover:text-[#ff6b00] transition-colors duration-200" href="#">Culture</a>
</div>
<button class="bg-[#ff6b00] text-white px-8 py-3 rounded-full font-manrope font-bold tracking-tight scale-102-on-hover hover:scale-[1.02] transition-transform">Get Started</button>
</div>
</nav>
<main class="min-h-screen relative flex items-center justify-center p-8 overflow-hidden">
<!-- Structural Labeling -->
<div class="absolute top-12 left-12">
<h2 class="text-on-surface font-black text-xl tracking-widest">THE MODEL</h2>
</div>
<div class="absolute top-12 right-12">
<h2 class="text-primary font-black text-xl tracking-widest">100% STRONG</h2>
</div>
<!-- The Synergy Model: Venn Diagram -->
<div class="venn-container flex items-center justify-center">
<!-- BUSINESS Circle (Top) -->
<div class="group">
<div class="circle-base top-0 left-1/2 -translate-x-1/2 bg-surface-variant/40 hover:bg-surface-variant/60">
<span class="venn-text text-on-surface font-black text-3xl mb-32 tracking-tighter uppercase">Business</span>
</div>
<!-- Popup -->
<div class="info-panel absolute -top-16 left-1/2 -translate-x-1/2 bg-surface-container-lowest p-8 rounded-xl shadow-2xl border border-outline-variant/10 w-72 z-50">
<div class="text-primary font-bold italic mb-2 tracking-tight">Pillar 01</div>
<h3 class="text-on-surface font-bold text-2xl mb-4">BUSINESS</h3>
<p class="text-secondary text-sm leading-relaxed mb-4">The structural foundation of the organization focusing on market positioning and financial health.</p>
<div class="flex flex-col gap-2">
<div class="flex items-center gap-2 text-on-surface font-bold text-xs"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> MARKET ANALYSIS</div>
<div class="flex items-center gap-2 text-on-surface font-bold text-xs"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> REVENUE DESIGN</div>
</div>
</div>
</div>
<!-- BRAND Circle (Bottom Left) -->
<div class="group">
<div class="circle-base bottom-4 left-4 bg-surface-variant/40 hover:bg-surface-variant/60">
<span class="venn-text text-on-surface font-black text-3xl mr-24 mt-32 tracking-tighter uppercase">Brand</span>
</div>
<!-- Popup -->
<div class="info-panel absolute bottom-0 -left-48 bg-surface-container-lowest p-8 rounded-xl shadow-2xl border border-outline-variant/10 w-72 z-50">
<div class="text-primary font-bold italic mb-2 tracking-tight">Pillar 02</div>
<h3 class="text-on-surface font-bold text-2xl mb-4">BRAND</h3>
<p class="text-secondary text-sm leading-relaxed mb-4">The identity and reputation that creates emotional resonance with the target audience.</p>
<div class="flex flex-col gap-2">
<div class="flex items-center gap-2 text-on-surface font-bold text-xs"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> VISUAL IDENTITY</div>
<div class="flex items-center gap-2 text-on-surface font-bold text-xs"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> MARKET TRUST</div>
</div>
</div>
</div>
<!-- TEAM Circle (Bottom Right) -->
<div class="group">
<div class="circle-base bottom-4 right-4 bg-surface-variant/40 hover:bg-surface-variant/60">
<span class="venn-text text-on-surface font-black text-3xl ml-24 mt-32 tracking-tighter uppercase">Team</span>
</div>
<!-- Popup -->
<div class="info-panel absolute bottom-0 -right-48 bg-surface-container-lowest p-8 rounded-xl shadow-2xl border border-outline-variant/10 w-72 z-50">
<div class="text-primary font-bold italic mb-2 tracking-tight">Pillar 03</div>
<h3 class="text-on-surface font-bold text-2xl mb-4">TEAM</h3>
<p class="text-secondary text-sm leading-relaxed mb-4">The human element that drives progress and embodies the organizational values.</p>
<div class="flex flex-col gap-2">
<div class="flex items-center gap-2 text-on-surface font-bold text-xs"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> TALENT OPS</div>
<div class="flex items-center gap-2 text-on-surface font-bold text-xs"><span class="material-symbols-outlined text-primary text-sm">check_circle</span> SKILL ALIGNMENT</div>
</div>
</div>
</div>
<!-- INTERSECTIONS -->
<!-- STRATEGY (Business & Brand) -->
<div class="group absolute top-1/2 left-1/2 -translate-x-[110px] -translate-y-[80px]">
<div class="px-4 py-2 hover:bg-primary-container/10 rounded-full transition-colors cursor-help">
<span class="text-primary font-bold italic text-xl tracking-tight">Strategy</span>
</div>
<div class="info-panel absolute -top-32 left-0 bg-surface-container-lowest p-6 rounded-xl shadow-xl border border-primary/20 w-64 z-50">
<h4 class="text-primary font-black text-sm mb-2">STRATEGY</h4>
<p class="text-xs text-secondary italic">Connecting Business goals with Brand identity to chart a clear course for market dominance.</p>
</div>
</div>
<!-- EXECUTION (Business & Team) -->
<div class="group absolute top-1/2 left-1/2 translate-x-[10px] -translate-y-[80px]">
<div class="px-4 py-2 hover:bg-primary-container/10 rounded-full transition-colors cursor-help">
<span class="text-primary font-bold italic text-xl tracking-tight">Execution</span>
</div>
<div class="info-panel absolute -top-32 right-0 bg-surface-container-lowest p-6 rounded-xl shadow-xl border border-primary/20 w-64 z-50">
<h4 class="text-primary font-black text-sm mb-2">EXECUTION</h4>
<p class="text-xs text-secondary italic">Bridging Business objectives and Team performance to ensure operational excellence.</p>
</div>
</div>
<!-- CULTURE (Brand & Team) -->
<div class="group absolute bottom-[60px] left-1/2 -translate-x-1/2">
<div class="px-4 py-2 hover:bg-primary-container/10 rounded-full transition-colors cursor-help">
<span class="text-primary font-bold italic text-xl tracking-tight">Culture</span>
</div>
<div class="info-panel absolute bottom-12 left-1/2 -translate-x-1/2 bg-surface-container-lowest p-6 rounded-xl shadow-xl border border-primary/20 w-64 z-50 text-center">
<h4 class="text-primary font-black text-sm mb-2 uppercase">Culture</h4>
<p class="text-xs text-secondary italic">Harmonizing Brand promise and Team behavior to build an authentic organizational soul.</p>
</div>
</div>
<!-- CENTRAL BOS360 -->
<div class="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
<div class="w-32 h-32 bg-primary-container flex items-center justify-center rounded-full shadow-lg scale-100 hover:scale-110 transition-transform cursor-pointer">
<span class="text-white font-black text-xl">BOS360</span>
</div>
<div class="info-panel absolute -top-40 left-1/2 -translate-x-1/2 bg-on-surface p-8 rounded-xl shadow-2xl w-80 z-50 text-white">
<h4 class="text-primary-container font-black text-2xl mb-4">THE CORE</h4>
<p class="text-surface-variant text-sm leading-relaxed">BOS360 is the singularity where Business, Brand, and Team achieve 100% synergy. This is the architectural precision of high-performing ecosystems.</p>
</div>
</div>
</div>
<!-- Right Bottom Logo Branding -->
<div class="absolute bottom-12 right-12 flex items-center gap-4">
<div class="h-[2px] w-12 bg-on-surface/10"></div>
<div class="text-4xl font-black text-on-surface tracking-tighter">BOS360</div>
</div>
</main>
<!-- Footer -->
<footer class="bg-[#fcf9f8] dark:bg-[#1c1b1b] w-full border-t border-black/5 subtle-tonal-layering">
<div class="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full max-w-screen-2xl mx-auto">
<div class="text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] font-manrope">BOS360</div>
<div class="text-[#5e5e5e] font-manrope text-sm my-4 md:my-0">
                © 2024 BOS360. Architectural Precision.
            </div>
<div class="flex gap-8">
<a class="text-[#5e5e5e] font-manrope text-sm hover:text-[#ff6b00]" href="#">Privacy Policy</a>
<a class="text-[#5e5e5e] font-manrope text-sm hover:text-[#ff6b00]" href="#">Terms of Service</a>
<a class="text-[#5e5e5e] font-manrope text-sm hover:text-[#ff6b00]" href="#">Contact</a>
</div>
</div>
</footer>
</body></html>`;

export default function BOS360ModelPage() {
  return (
    <iframe
      title="BOS360 | The Architectural Model"
      srcDoc={BOS360_MODEL_HTML}
      className="h-screen w-full border-0"
      sandbox="allow-same-origin allow-scripts"
    />
  );
}
