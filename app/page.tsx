import type { Metadata } from "next";
import { metadata as bos360Metadata } from "./bos360-v3/page";

const homepage = "https://www.camlillico.com/";

export const metadata: Metadata = {
  ...bos360Metadata,
  applicationName: "Cam Lillico Coaching",
  alternates: { canonical: homepage },
  robots: { index: true, follow: true },
  openGraph: {
    ...bos360Metadata.openGraph,
    url: homepage,
  },
};

export { default } from "./bos360-v3/page";
