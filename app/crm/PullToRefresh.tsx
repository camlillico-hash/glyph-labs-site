"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

const MAX_PULL = 88;
const TRIGGER_PULL = 64;

export default function PullToRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const refreshing = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isRefreshing) return;

    const timeout = window.setTimeout(() => {
      refreshing.current = false;
      setIsRefreshing(false);
      setPullDistance(0);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [isRefreshing, pathname]);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (window.innerWidth >= 768 || isRefreshing || window.scrollY > 0) {
        startY.current = null;
        pulling.current = false;
        return;
      }

      startY.current = event.touches[0]?.clientY ?? null;
      pulling.current = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pulling.current || startY.current === null || isRefreshing) return;
      if (window.scrollY > 0) {
        setPullDistance(0);
        return;
      }

      const currentY = event.touches[0]?.clientY ?? startY.current;
      const delta = currentY - startY.current;
      if (delta <= 0) {
        setPullDistance(0);
        return;
      }

      const adjusted = Math.min(MAX_PULL, delta * 0.55);
      setPullDistance(adjusted);

      if (delta > 12) {
        event.preventDefault();
      }
    };

    const finishPull = () => {
      if (!pulling.current) return;
      pulling.current = false;
      startY.current = null;

      if (pullDistance >= TRIGGER_PULL && !refreshing.current) {
        refreshing.current = true;
        setPullDistance(TRIGGER_PULL);
        setIsRefreshing(true);
        router.refresh();
        return;
      }

      setPullDistance(0);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", finishPull);
    window.addEventListener("touchcancel", finishPull);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finishPull);
      window.removeEventListener("touchcancel", finishPull);
    };
  }, [isRefreshing, pullDistance, router]);

  const visible = isRefreshing || pullDistance > 0;
  const progress = Math.min(1, pullDistance / TRIGGER_PULL);
  const label = isRefreshing ? "Refreshing…" : pullDistance >= TRIGGER_PULL ? "Release to refresh" : "Pull to refresh";

  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center md:hidden"
      style={{ transform: `translateY(${visible ? Math.max(8, pullDistance) : -72}px)`, transition: visible ? "none" : "transform 180ms ease-out, opacity 180ms ease-out", opacity: visible ? 1 : 0 }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700/80 bg-neutral-950/95 px-3 py-2 text-xs font-semibold text-slate-200 shadow-lg shadow-black/30">
        <LoaderCircle
          size={14}
          className={isRefreshing ? "animate-spin text-sky-300" : "text-sky-300"}
          style={isRefreshing ? undefined : { transform: `rotate(${progress * 180}deg)` }}
        />
        <span>{label}</span>
      </div>
    </div>
  );
}
