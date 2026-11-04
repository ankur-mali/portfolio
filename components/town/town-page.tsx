"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { stops } from "@/lib/stops";
import { scrollState, scrollToStop, useTown } from "@/lib/town-store";
import { ambient, mixForProgress } from "@/lib/ambient-audio";
import { StopPanel } from "./panels";
import { MiniMap, TopBar } from "./hud";
import { Loader } from "./loader";

const TownScene = dynamic(() => import("./scene"), { ssr: false });

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Scroll position → float stop index (eased so the camera rests at each stop). */
function useScrollProgress() {
  const setActiveStop = useTown((s) => s.setActiveStop);
  useEffect(() => {
    let tops: number[] = [];
    const measure = () => {
      tops = stops.map((s) => document.getElementById(`stop-${s.id}`)?.offsetTop ?? 0);
    };
    const onScroll = () => {
      const y = window.scrollY;
      let i = 0;
      while (i < tops.length - 1 && tops[i + 1] <= y) i++;
      const next = tops[i + 1];
      const frac = next === undefined ? 0 : (y - tops[i]) / (next - tops[i]);
      scrollState.raw = i + frac;
      // Rest at the stop while its card is read, then travel. The card leaves as the camera
      // starts moving and the next one appears as the camera arrives.
      scrollState.progress = Math.min(stops.length - 1, i + smooth(0.3, 0.85, frac));
      const upcoming = Math.min(stops.length - 1, i + 1);
      if (frac < 0.38) setActiveStop(i);
      else if (frac >= 0.78) setActiveStop(upcoming);
      else setActiveStop(frac < 0.58 ? i : upcoming, true);
      if (useTown.getState().soundOn) ambient?.setMix(mixForProgress(scrollState.progress));
    };
    measure();
    onScroll();
    // Section heights depend on the viewport, so a resize (or phone rotation) would otherwise
    // land on a different stop. Keep the visitor at the same point of the road instead.
    const onResize = () => {
      const raw = scrollState.raw;
      measure();
      const i = Math.min(tops.length - 1, Math.floor(raw));
      const span = (tops[i + 1] ?? tops[i]) - tops[i];
      window.scrollTo({ top: tops[i] + (raw - i) * span, behavior: "auto" });
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [setActiveStop]);
}

function useKeyboardStops() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable]")) return;
      const { activeStop, entered } = useTown.getState();
      if (!entered) return;
      if (e.key === "ArrowRight" || e.key === "j") scrollToStop(Math.min(stops.length - 1, activeStop + 1));
      if (e.key === "ArrowLeft" || e.key === "k") scrollToStop(Math.max(0, activeStop - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function useDeviceFallbacks() {
  const router = useRouter();
  const setQuality = useTown((s) => s.setQuality);
  const setReducedMotion = useTown((s) => s.setReducedMotion);
  useEffect(() => {
    if (!hasWebGL()) {
      router.replace("/classic");
      return;
    }
    const small = window.matchMedia("(max-width: 768px)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    if (small || weak) setQuality("low");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [router, setQuality, setReducedMotion]);
}

function useAmbientSound() {
  const soundOn = useTown((s) => s.soundOn);
  useEffect(() => {
    if (!ambient) return;
    if (soundOn) {
      ambient.start();
      ambient.setMix(mixForProgress(scrollState.progress));
    } else ambient.stop();
  }, [soundOn]);
}

export default function TownPage() {
  const activeStop = useTown((s) => s.activeStop);
  const travelling = useTown((s) => s.travelling);
  const entered = useTown((s) => s.entered);
  useScrollProgress();
  useKeyboardStops();
  useDeviceFallbacks();
  useAmbientSound();

  return (
    <div className="relative">
      <div className="fixed inset-0 z-0">
        <TownScene />
      </div>

      <Loader />
      {entered && (
        <>
          <TopBar />
          <MiniMap />
        </>
      )}

      {/* The cards live in one fixed layer and cross-fade as the camera arrives at each stop.
          Phones: above the mini-map. Desktop: a steady column on the left, same top edge for every stop. */}
      <main className="pointer-events-none fixed inset-x-3 bottom-[5.25rem] top-[5.25rem] z-10 sm:inset-x-8 lg:bottom-28 lg:left-14 lg:right-auto lg:top-28 lg:w-[27rem]" aria-label="Ankur's journey">
        {stops.map((stop, i) => (
          <StopPanel key={stop.id} stop={stop} active={entered && !travelling && activeStop === i} />
        ))}
      </main>

      {/* Invisible scroll track: one section per stop drives the camera. */}
      <div aria-hidden className="pointer-events-none relative z-0">
        {stops.map((stop, i) => (
          <section key={stop.id} id={`stop-${stop.id}`} className={i === stops.length - 1 ? "h-[100svh]" : "h-[120svh]"} />
        ))}
      </div>
    </div>
  );
}
