import type { Metadata } from "next";
import { metadata as bos360Metadata } from "./bos360-v3/page";

const homepage = "https://www.camlillico.com/";

export const metadata: Metadata = {
  ...bos360Metadata,
  applicationName: "Cam Lillico Coaching",
  verification: { google: "AgN6ezq7B54hPrq58Yok4Jkdsj4OKOPw1XaST2FsSWk" },
  alternates: { canonical: homepage },
  robots: { index: true, follow: true },
  openGraph: {
    ...bos360Metadata.openGraph,
    url: homepage,
  },
};

export { default } from "./bos360-v3/page";
