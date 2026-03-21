import type { Metadata } from "next";
import CrmShell from "./CrmShell";

export const metadata: Metadata = {
  title: {
    default: "CRM",
    template: "%s | Glyph Labs",
  },
};

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}
