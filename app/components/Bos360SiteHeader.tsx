import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Sparkles } from "lucide-react";

const BOOKING_URL = "https://calendar.app.google/M4pokXD8CBpc1c4U6";
const BLOG_URL = "/coaching/blog";
const COACHING_URL = "/bos360";
const STRENGTH_TEST_URL = "/strength-test";

type CurrentPage = "coaching" | "blog" | "strength-test";

export default function Bos360SiteHeader({ current }: { current: CurrentPage }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={COACHING_URL} className="inline-flex min-w-0 items-center gap-3">
            <Image
              src="/bos360-logo-white-bg.png"
              alt="BOS360"
              width={108}
              height={44}
              className="h-10 w-auto object-contain"
            />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
                Cam Lillico
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {current === "coaching" ? (
            <span
              aria-current="page"
              className="inline-flex items-center rounded-lg bg-[#ed7d31]/10 px-3 py-1.5 text-slate-100"
            >
              Coaching
            </span>
          ) : (
            <Link
              href={COACHING_URL}
              className="inline-flex items-center rounded-lg px-3 py-1.5 transition hover:bg-neutral-900 hover:text-slate-100"
            >
              Coaching
            </Link>
          )}

          {current === "blog" ? (
            <span
              aria-current="page"
              className="inline-flex items-center rounded-lg bg-[#ed7d31]/10 px-3 py-1.5 text-slate-100"
            >
              Blog
            </span>
          ) : (
            <Link
              href={BLOG_URL}
              className="inline-flex items-center rounded-lg px-3 py-1.5 transition hover:bg-neutral-900 hover:text-slate-100"
            >
              Blog
            </Link>
          )}

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-4 py-2 text-slate-950 transition hover:opacity-90"
          >
            <CalendarDays size={15} />
            Intro Call
          </a>

          {current === "strength-test" ? (
            <span
              aria-current="page"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-cyan-200"
            >
              <Sparkles size={15} />
              Strength Test
            </span>
          ) : (
            <Link
              href={STRENGTH_TEST_URL}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-cyan-200 transition hover:bg-cyan-500/15"
            >
              <Sparkles size={15} />
              Strength Test
            </Link>
          )}
        </nav>
      </div>

      <div className="border-t border-neutral-800 px-6 py-3 md:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 text-xs font-semibold text-slate-200">
          {current === "coaching" ? (
            <span
              aria-current="page"
              className="whitespace-nowrap rounded-lg bg-[#ed7d31]/10 px-2.5 py-1.5 text-slate-100"
            >
              Coaching
            </span>
          ) : (
            <Link
              href={COACHING_URL}
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 transition hover:bg-neutral-900"
            >
              Coaching
            </Link>
          )}

          {current === "blog" ? (
            <span
              aria-current="page"
              className="whitespace-nowrap rounded-lg bg-[#ed7d31]/10 px-2.5 py-1.5 text-slate-100"
            >
              Blog
            </span>
          ) : (
            <Link
              href={BLOG_URL}
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 transition hover:bg-neutral-900"
            >
              Blog
            </Link>
          )}

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-2.5 py-1.5 text-slate-950 whitespace-nowrap"
          >
            <CalendarDays size={13} />
            Intro Call
          </a>

          {current === "strength-test" ? (
            <span
              aria-current="page"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-1.5 text-cyan-200"
            >
              <Sparkles size={13} />
              Strength Test
            </span>
          ) : (
            <Link
              href={STRENGTH_TEST_URL}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-2.5 py-1.5 text-cyan-200 transition hover:bg-cyan-500/15 whitespace-nowrap"
            >
              <Sparkles size={13} />
              Strength Test
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
