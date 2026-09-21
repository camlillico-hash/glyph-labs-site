import { metadata as previousMetadata } from "../coaching-v2/page";

// Preserve the previous production page without indexing the archived route.
export const metadata = {
  ...previousMetadata,
  title: "Archived BOS360 Coaching Page | Cam Lillico",
  robots: { index: false, follow: false },
};

export { default } from "../coaching-v2/page";
