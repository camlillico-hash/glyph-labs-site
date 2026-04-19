import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Codex",
    template: "%s | Glyph Labs",
  },
  description: "Private Codex workspace for Cam.",
  manifest: "/codex.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Codex",
  },
};

export default function CodexLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-slate-950">{children}</div>;
}
