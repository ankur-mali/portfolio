"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useTown } from "@/lib/town-store";
import { profilePhoto } from "@/lib/data";
import { stops } from "@/lib/stops";
import { LuVolume2, LuVolumeX } from "react-icons/lu";
import { BsArrowRight } from "react-icons/bs";

const lines = ["Building the town…", "Lighting the chimneys…", "Shovelling the snow…", "Waking up Ember…"];

export function Loader() {
  const ready = useTown((s) => s.ready);
  const entered = useTown((s) => s.entered);
  const enter = useTown((s) => s.enter);
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const [withSound, setWithSound] = useState(false);
  // A slow device should never be stuck here: after 6 s the journey can start anyway.
  const [patience, setPatience] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPatience(true), 6000);
    return () => clearTimeout(t);
  }, []);
  const canStart = ready || patience;

  // Progress climbs on its own to 90 %, and finishes when the scene has rendered.
  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => (canStart ? Math.min(100, p + 12) : Math.min(90, p + Math.max(1.5, (90 - p) * 0.12))));
    }, 50);
    return () => clearInterval(id);
  }, [canStart]);

  // Lock page scroll only while the welcome screen is up. The cleanup also runs when the
  // visitor leaves for the classic view, so that page never inherits the lock.
  useEffect(() => {
    if (entered) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [entered]);

  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [entered]);

  if (gone) return null;
  const done = pct >= 100;
  const line = done ? "Ready when you are." : `${lines[Math.min(lines.length - 1, Math.floor(pct / 26))]} ${Math.round(pct)}%`;

  const litStops = Math.round((pct / 100) * stops.length);

  return (
    <div
      className={clsx(
        "welcome-scrim fixed inset-0 z-50 transition-opacity duration-700",
        entered && "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className={clsx(
          "mx-auto grid h-full max-w-[90rem] grid-rows-[auto_1fr] px-5 pb-8 pt-5 transition-transform duration-700 sm:px-10 sm:pb-12 sm:pt-8 lg:px-16",
          entered && "-translate-y-6",
        )}
      >
        {/* Signature, top left; sound, top right. */}
        <div className="fade-up flex items-center justify-between gap-4" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-3.5 sm:gap-4">
            <Image
              src={profilePhoto}
              alt="Ankur Mali"
              sizes="(min-width: 640px) 80px, 64px"
              priority
              className="h-16 w-16 rounded-full object-cover shadow-[0_10px_24px_-10px_rgba(40,25,10,0.5)] ring-[3px] ring-white/90 sm:h-20 sm:w-20 dark:ring-white/25"
            />
            <div className="leading-tight">
              <p className="font-display text-xl tracking-[-0.015em] text-stone-900 sm:text-2xl dark:text-stone-50">Ankur Mali</p>
              <p className="mt-0.5 whitespace-nowrap text-xs text-stone-600 sm:text-sm dark:text-stone-400">AI Engineer Associate · MULTIPLAI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWithSound((v) => !v)}
            aria-pressed={withSound}
            aria-label={withSound ? "Sound on" : "Sound off"}
            className="glass inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-medium sm:px-4 text-stone-800 transition active:scale-[0.97] active:duration-75 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-wine-500 dark:text-stone-100 dark:hover:bg-white/10"
          >
            {withSound ? <LuVolume2 aria-hidden /> : <LuVolumeX aria-hidden />}
            <span className="max-sm:sr-only">{withSound ? "Sound on" : "Sound off"}</span>
          </button>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          {/* The title card */}
          <div className="max-w-[40rem]">
            <h2
              id="welcome-title"
              className="font-display text-[clamp(3.1rem,7.4vw,6rem)] leading-[0.94] tracking-[-0.035em] text-stone-900 dark:text-stone-50"
            >
              <span className="rise-line">
                <span style={{ animationDelay: "200ms" }}>Walk through</span>
              </span>
              <span className="rise-line">
                <span style={{ animationDelay: "320ms" }}>
                  my <em className="font-display italic text-wine-600 dark:text-wine-300">journey</em>
                </span>
              </span>
            </h2>
            {/* Who Ankur is, in one read: enough even if the visitor never opens the town. */}
            <p
              className="fade-up mt-5 max-w-[38ch] text-lg leading-relaxed text-stone-700 [text-wrap:pretty] dark:text-stone-300"
              style={{ animationDelay: "520ms" }}
            >
              I&apos;m an <strong className="font-semibold text-stone-900 dark:text-white">AI Engineer Associate at MULTIPLAI</strong>,
              designing and shipping LLM, RAG and AI-agent systems for enterprise clients, from architecture to production.
            </p>
            <dl
              className="fade-up mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-stone-600 dark:text-stone-400"
              style={{ animationDelay: "580ms" }}
            >
              {[
                ["Now", "MULTIPLAI, Germany"],
                ["Focus", "LLMs · RAG · AI agents"],
                ["Studied", "Master's, SRH Berlin"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-1.5">
                  <dt className="font-display italic text-wine-600 dark:text-wine-300">{k}</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-200">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="fade-up mt-8 grid max-w-[31rem] grid-cols-2 gap-2.5" style={{ animationDelay: "680ms" }}>
              <button
                type="button"
                autoFocus
                disabled={!done}
                onClick={() => enter(withSound)}
                className="group relative flex min-h-[4.5rem] flex-col items-start justify-center overflow-hidden rounded-2xl bg-wine-600 px-4 text-left text-wine-50 shadow-[0_18px_40px_-16px_rgba(85,33,42,0.7)] transition hover:bg-wine-700 active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 focus-visible:ring-offset-2 disabled:cursor-progress sm:px-5 dark:bg-wine-300 dark:text-wine-900 dark:hover:bg-wine-200"
              >
                {/* while loading, the button itself fills up */}
                {!done && (
                  <span aria-hidden className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-150" style={{ width: `${pct}%` }} />
                )}
                <span className="relative flex items-center gap-2 whitespace-nowrap text-base font-semibold">
                  {done ? "Walk the 3D town" : "Loading…"}
                  <BsArrowRight aria-hidden className="transition group-hover:translate-x-1 max-sm:hidden" />
                </span>
                <span className="relative whitespace-nowrap text-xs tabular-nums opacity-80">
                  {done ? "Full journey · 2 min" : `Building the town ${Math.round(pct)}%`}
                </span>
              </button>
              <Link
                href="/classic"
                className="glass flex min-h-[4.5rem] flex-col items-start justify-center rounded-2xl px-4 text-left text-stone-800 transition hover:bg-white/70 active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 sm:px-5 dark:text-stone-100 dark:hover:bg-white/10"
              >
                <span className="whitespace-nowrap text-base font-semibold">Quick read</span>
                <span className="whitespace-nowrap text-xs text-stone-600 dark:text-stone-400">Simple page · 30 sec</span>
              </Link>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {line}
            </p>
          </div>

          {/* The route: every stop on the road, lighting up as the town loads. */}
          <nav aria-label="Stops on the journey" className="fade-up hidden lg:block" style={{ animationDelay: "760ms" }}>
            <div className="glass rounded-3xl px-6 py-5">
              <p className="font-display text-base italic text-stone-700 dark:text-stone-300">The route</p>
              <ol className="relative mt-3 space-y-[0.55rem]">
                <span aria-hidden className="absolute bottom-1.5 left-[0.3rem] top-1.5 w-px bg-stone-900/15 dark:bg-white/15" />
                {stops.map((s, i) => (
                  <li key={s.id} className="relative flex items-baseline gap-3 pl-0">
                    <span
                      aria-hidden
                      className={clsx(
                        "relative z-10 mt-1 h-[0.6rem] w-[0.6rem] shrink-0 self-start rounded-full ring-[3px] ring-[#f6efe3] transition-colors duration-300 dark:ring-[#1b1d2b]",
                        i < litStops ? "bg-wine-600 dark:bg-wine-300" : "bg-stone-300 dark:bg-stone-600",
                      )}
                    />
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{s.label}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{s.place}</span>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
