"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { profile, profilePhoto } from "@/lib/data";

export default function Intro() {
  const { ref } = useSectionInView("Home");
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="mb-28 max-w-[50rem] text-center sm:mb-0 scroll-mt-[100rem]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          >
            <Image
              src={profilePhoto}
              alt="Ankur Mali"
              sizes="96px"
              quality="95"
              priority={true}
              className="h-24 w-24 rounded-full object-cover border-[0.35rem] border-white shadow-xl"
            />
          </motion.div>

          <motion.span
            className="absolute bottom-0 right-0 text-4xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 125,
              delay: 0.1,
              duration: 0.7,
            }}
          >
            👋
          </motion.span>
        </div>
      </div>

      <motion.h1
        className="mb-10 mt-4 px-4 text-2xl font-medium leading-[1.4] tracking-[-0.015em] [text-wrap:balance] sm:text-4xl sm:leading-[1.3] sm:tracking-[-0.02em]"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="font-bold">Hello, I&apos;m Ankur.</span> I&apos;m an{" "}
        <span className="font-bold">AI Engineer Associate</span> at{" "}
        <span className="font-bold">MULTIPLAI</span>, building{" "}
        <span className="underline decoration-wine-400 underline-offset-4">LLM, RAG and AI agent systems</span> that make it to{" "}
        <span className="italic">production</span>.
      </motion.h1>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-2 px-4 text-base font-medium"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
        }}
      >
        <Link
          href="#contact"
          className="group flex min-h-12 items-center gap-2 rounded-full bg-wine-600 px-6 text-wine-50 shadow-lg shadow-wine-900/20 outline-none transition hover:scale-[1.03] hover:bg-wine-700 active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 focus-visible:ring-offset-2"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          Contact me here{" "}
          <BsArrowRight className="opacity-70 group-hover:translate-x-1 transition" />
        </Link>

        <a
          className="group glass glass-flat flex min-h-12 items-center gap-2 rounded-full px-6 outline-none transition hover:scale-[1.03] active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500"
          href="/"
        >
          Walk the 3D town{" "}
          <BsArrowRight className="opacity-60 transition group-hover:translate-x-1" />
        </a>

        {profile.cv && (
          <a
            className="group glass glass-flat flex min-h-12 items-center gap-2 rounded-full px-6 outline-none transition hover:scale-[1.03] active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500"
            href={profile.cv}
            download
          >
            Download CV{" "}
            <HiDownload className="opacity-60 group-hover:translate-y-1 transition" />
          </a>
        )}

        <a
          aria-label="LinkedIn"
          rel="noreferrer"
          className="glass glass-flat grid h-12 w-12 place-items-center rounded-full text-gray-700 transition hover:scale-[1.06] hover:text-gray-950 active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 dark:text-white/70"
          href={profile.linkedin}
          target="_blank"
        >
          <BsLinkedin />
        </a>

        <a
          aria-label="GitHub"
          rel="noreferrer"
          className="glass glass-flat grid h-12 w-12 place-items-center rounded-full text-[1.35rem] text-gray-700 transition hover:scale-[1.06] hover:text-gray-950 active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 dark:text-white/70"
          href={profile.github}
          target="_blank"
        >
          <FaGithubSquare />
        </a>
      </motion.div>

    </section>
  );
}
