import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cam Lillico | Strength Test",
  icons: {
    icon: "/strength-test/icon.png",
    shortcut: "/strength-test/icon.png",
    apple: "/strength-test/icon.png",
  },
};

export default function StrengthTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
