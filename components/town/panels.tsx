"use client";

import Image from "next/image";
import React, { useState } from "react";
import clsx from "clsx";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { LuSearch, LuArrowUp } from "react-icons/lu";
import { profile, profilePhoto, skillGroups, type Project } from "@/lib/data";
import { FIRST_PROJECT_STOP, LANTERN_COUNT, sideQuestProjects, type Stop } from "@/lib/stops";
import { scrollToStop, useTown } from "@/lib/town-store";
import ContactForm from "@/components/contact-form";
import { GuideLine } from "./guide-avatar";

// Card = header (title) + body (scrolls only if it truly overflows) + footer (actions, always visible).
const card =
  "glass glass-card glass-fade flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-[1.6rem] text-stone-800 dark:text-stone-200";
const pad = "px-5 sm:px-7";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-wine-600 dark:text-wine-300">{children}</p>
  );
}

function Title({ children, as: As = "h2" }: { children: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <As className="font-display text-[1.65rem] leading-[1.08] tracking-[-0.02em] text-stone-900 [text-wrap:balance] sm:text-[2rem] dark:text-stone-50">
      {children}
    </As>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((c) => (
        <li key={c} className="rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-700 dark:bg-wine-400/20 dark:text-wine-200">
          {c}
        </li>
      ))}
    </ul>
  );
}

function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="rounded-md border border-stone-900/10 px-2 py-0.5 text-[0.7rem] uppercase tracking-wider text-stone-600 dark:border-white/15 dark:text-stone-400">
          {t}
        </li>
      ))}
    </ul>
  );
}

// 44px minimum height: comfortable on touch screens.
const btn =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf6ec] dark:focus-visible:ring-offset-[#17171f]";
export const btnDark = `${btn} bg-wine-600 text-wine-50 shadow-sm hover:bg-wine-700 dark:bg-wine-300 dark:text-wine-900 dark:hover:bg-wine-200`;
export const btnLight = `${btn} border border-stone-900/15 bg-white/70 text-stone-800 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-stone-100 dark:hover:bg-white/10`;
const iconBtn =
  "grid h-11 w-11 place-items-center rounded-full border border-stone-900/15 bg-white/70 text-lg text-stone-700 transition active:scale-[0.97] active:duration-75 hover:bg-white hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-wine-500 dark:border-white/15 dark:bg-white/5 dark:text-stone-300 dark:hover:text-white";

function PeekButton() {
  const peek = useTown((s) => s.peek);
  const togglePeek = useTown((s) => s.togglePeek);
  return (
    <button type="button" onClick={togglePeek} aria-pressed={peek} className={btnLight}>
      <LuSearch /> {peek ? "Put it back" : "Peek inside"}
    </button>
  );
}

// ---------------------------------------------------------------- bodies + footers

function ProjectBody({ project }: { project: Project }) {
  return (
    <>
      <p className="leading-relaxed text-stone-700 dark:text-stone-300">{project.description}</p>
      <Chips items={project.chips} />
      <div className="max-sm:hidden">
        <Tags items={project.tags} />
      </div>
      {project.imageUrl && (
        <Image
          src={project.imageUrl}
          alt={`Screenshot of ${project.title}`}
          // Screenshots are a bonus: hidden on phones and short laptop screens so the card stays compact.
          className="mt-4 hidden aspect-[16/8] w-full rounded-xl object-cover object-top shadow-md lg:block [@media(max-height:820px)]:hidden"
          sizes="420px"
        />
      )}
    </>
  );
}

function ProjectActions({ project }: { project: Project }) {
  return (
    <>
      {project.links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={l.label === "GitHub" ? btnLight : btnDark}>
          {l.label === "GitHub" && <FaGithub />} {l.label}
        </a>
      ))}
      <PeekButton />
    </>
  );
}

function Hero() {
  return (
    <>
      <p className="leading-relaxed text-stone-700 sm:text-lg dark:text-stone-300">
        <strong className="font-semibold text-stone-900 dark:text-white">AI Engineer Associate</strong> at{" "}
        <strong className="font-semibold text-stone-900 dark:text-white">MULTIPLAI</strong>. I build LLM, RAG and agent systems
        that actually make it to production.
      </p>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
        Scroll to walk the road: every building on it is a chapter of my journey.
      </p>
    </>
  );
}

function HeroActions() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnDark} onClick={() => scrollToStop(1)}>
          Start the journey <BsArrowRight />
        </button>
        <button type="button" className={btnLight} onClick={() => scrollToStop(FIRST_PROJECT_STOP)}>
          Skip to the projects ↓
        </button>
      </div>
      <div className="flex items-center gap-2">
        <a href={profile.cv} download className={btnLight}>
          <HiDownload /> Download CV
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={iconBtn}>
          <BsLinkedin />
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className={iconBtn}>
          <FaGithub />
        </a>
      </div>
    </div>
  );
}

/** Education: the Master's leads; earlier qualifications sit small underneath for the record. */
function Origins({ stop }: { stop: Stop }) {
  return (
    <>
      <p className="leading-relaxed text-stone-700 dark:text-stone-300">{stop.body}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {stop.bullets?.map((b) => (
          <li key={b} className="rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-700 dark:bg-wine-400/20 dark:text-wine-200">
            {b}
          </li>
        ))}
      </ul>
      {stop.earlier && (
        <div className="mt-5 border-t border-stone-900/10 pt-3 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600 dark:text-stone-400">Earlier</p>
          <ul className="mt-1.5 space-y-1 text-sm text-stone-600 dark:text-stone-400">
            {stop.earlier.map((e) => (
              <li key={e.title} className="flex gap-3">
                <span className="w-24 shrink-0 tabular-nums">{e.when}</span>
                <span>{e.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function SkillsAndQuests({ tab }: { tab: "skills" | "quests" }) {
  if (tab === "skills")
    return (
      <ul className="divide-y divide-stone-900/10 dark:divide-white/10">
        {skillGroups.map((g) => (
          <li key={g.name} className="py-2.5 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">{g.name}</span>
              <span className="text-xs text-wine-600 dark:text-wine-300">Proof: {g.proof}</span>
            </div>
            <p className="mt-0.5 text-[0.85rem] text-stone-600 dark:text-stone-400">{g.skills.join(" · ")}</p>
          </li>
        ))}
      </ul>
    );
  return (
    <ul className="space-y-4">
      {sideQuestProjects.map((q) => (
        <li key={q.id}>
          <p className="font-semibold text-stone-900 dark:text-stone-50">{q.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{q.description}</p>
          {q.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-wine-700 underline-offset-4 hover:underline dark:text-wine-300"
            >
              <FaGithub /> {l.label}
            </a>
          ))}
        </li>
      ))}
    </ul>
  );
}

function Tabs({ tab, setTab }: { tab: "skills" | "quests"; setTab: (t: "skills" | "quests") => void }) {
  const opts: { id: "skills" | "quests"; label: string }[] = [
    { id: "skills", label: "Skills" },
    { id: "quests", label: "Side quests" },
  ];
  return (
    <div role="tablist" aria-label="Skills or side quests" className="mt-4 inline-flex rounded-full bg-stone-900/5 p-1 dark:bg-white/10">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={tab === o.id}
          onClick={() => setTab(o.id)}
          className={clsx(
            "min-h-9 rounded-full px-4 text-sm font-semibold transition active:scale-[0.97] active:duration-75",
            tab === o.id
              ? "bg-white text-wine-700 shadow-sm dark:bg-stone-800 dark:text-wine-200"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Work({ stop }: { stop: Stop }) {
  return (
    <>
      <p className="leading-relaxed text-stone-700 dark:text-stone-300">{stop.body}</p>
      <ol className="mt-4 flex items-center gap-2 text-xs font-semibold">
        <li className="rounded-full bg-stone-200 px-3 py-1 text-stone-700 dark:bg-white/10 dark:text-stone-300">Intern · Sep 2025</li>
        <li aria-hidden className="text-stone-400">→</li>
        <li className="rounded-full bg-wine-100 px-3 py-1 text-wine-700 dark:bg-wine-400/20 dark:text-wine-200">Full-time · Apr 2026</li>
      </ol>
      <ul className="mt-4 space-y-2 text-[0.92rem] leading-snug text-stone-700 dark:text-stone-300">
        {stop.bullets?.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-wine-600 dark:bg-wine-300" />
            {b}
          </li>
        ))}
      </ul>
    </>
  );
}

function CampfireNote() {
  const lit = useTown((s) => s.visited.slice(0, LANTERN_COUNT).filter(Boolean).length);
  return (
    <span className="text-sm text-stone-600 dark:text-stone-400">
      {lit === LANTERN_COUNT ? "All lanterns lit: the campfire is burning!" : `Lanterns lit ${lit}/${LANTERN_COUNT}. Light them all to start the campfire.`}
    </span>
  );
}

function ContactActions() {
  return (
    <>
      <a href={profile.cv} download className={btnLight}>
        <HiDownload /> CV
      </a>
      <a href={profile.linkedin} target="_blank" rel="noreferrer" className={btnLight}>
        <BsLinkedin /> LinkedIn
      </a>
      <button type="button" onClick={() => scrollToStop(0)} className={btnLight}>
        <LuArrowUp /> Back to the start
      </button>
    </>
  );
}

// ---------------------------------------------------------------- the card

export function StopPanel({ stop, active }: { stop: Stop; active: boolean }) {
  const [tab, setTab] = useState<"skills" | "quests">("skills");
  const titleId = `title-${stop.id}`;

  let body: React.ReactNode = null;
  let actions: React.ReactNode = null;
  switch (stop.kind) {
    case "hero":
      body = <Hero />;
      actions = <HeroActions />;
      break;
    case "origins":
      body = <Origins stop={stop} />;
      actions = <PeekButton />;
      break;
    case "project":
      body = stop.project && <ProjectBody project={stop.project} />;
      actions = stop.project && <ProjectActions project={stop.project} />;
      break;
    case "skills":
      body = <SkillsAndQuests tab={tab} />;
      actions = <PeekButton />;
      break;
    case "work":
      body = <Work stop={stop} />;
      actions = (
        <>
          <PeekButton />
          <CampfireNote />
        </>
      );
      break;
    case "contact":
      body = (
        <>
          <p className="mb-4 leading-relaxed text-stone-700 dark:text-stone-300">Write here and drop it in the mailbox.</p>
          <ContactForm variant="letter" />
        </>
      );
      actions = <ContactActions />;
      break;
  }

  return (
    <div
      // Inactive cards are hidden from pointer, keyboard and screen readers (they stay in the DOM for SEO).
      inert={!active}
      aria-hidden={!active}
      className={clsx(
        "absolute inset-x-0 bottom-0 flex max-h-full flex-col transition-[opacity,transform] duration-500 ease-out max-lg:max-h-[min(100%,58svh)] sm:mx-auto sm:max-w-[30rem] lg:bottom-auto lg:top-0 lg:mx-0 lg:max-w-none",
        active ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <GuideLine text={stop.robot} />
      {/* Short screens (landscape phones, small windows): the whole card scrolls as one piece
          instead of squeezing the text between a fixed title and fixed buttons. */}
      <article className={clsx(card, "[@media(max-height:640px)]:overflow-y-auto")} aria-labelledby={titleId}>
        <header className={clsx(pad, "shrink-0 pb-3 pt-5 sm:pt-6")}>
          {stop.kind === "hero" ? (
            <div id={titleId} className="flex items-center gap-4">
              <Image
                src={profilePhoto}
                alt="Ankur Mali"
                sizes="80px"
                priority
                className="h-14 w-14 shrink-0 rounded-full border-[3px] border-white object-cover object-[50%_28%] shadow-md sm:h-[4.5rem] sm:w-[4.5rem]"
              />
              <Title as="h1">Hi, I&apos;m Ankur.</Title>
            </div>
          ) : (
            <>
              <Kicker>{stop.kicker}</Kicker>
              <div id={titleId}>
                <Title>{stop.title}</Title>
              </div>
              {stop.kind === "skills" && <Tabs tab={tab} setTab={setTab} />}
            </>
          )}
        </header>
        {/* Scrolls only when the content is genuinely taller than the space; never traps the page scroll. */}
        <div className={clsx(pad, "min-h-0 flex-1 overflow-y-auto overscroll-auto pb-2 [@media(max-height:640px)]:flex-none [@media(max-height:640px)]:overflow-visible")}>{body}</div>
        {actions && (
          <footer
            className={clsx(
              pad,
              "flex shrink-0 flex-wrap items-center gap-2 border-t border-stone-900/[0.06] py-4 dark:border-white/[0.06]",
              // Phones: on the contact stop the letter gets the room; CV and Contact are in the top bar.
              stop.kind === "contact" && "max-sm:hidden",
            )}
          >
            {actions}
          </footer>
        )}
      </article>
    </div>
  );
}
