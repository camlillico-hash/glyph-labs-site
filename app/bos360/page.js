import { metadata as v3Metadata } from "../bos360-v3/page";

// The production route shares the approved V3 design, but is indexable.
export const metadata = {
  ...v3Metadata,
  robots: { index: true, follow: true },
};

export { default } from "../bos360-v3/page";
