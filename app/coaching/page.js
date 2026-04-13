import { redirect } from "next/navigation";

export const metadata = {
  title: "Cam Lillico | BOS360",
  robots: { index: false, follow: false },
};

export default function CoachingRedirectPage() {
  redirect("/bos360");
}
