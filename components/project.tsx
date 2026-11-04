"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Project as ProjectType } from "@/lib/data";

export default function Project({ title, description, chips, tags, imageUrl, links }: ProjectType) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div ref={ref} style={{ scale: scaleProgess, opacity: opacityProgess }} className="group mb-3 sm:mb-8 last:mb-0">
      <section className="glass glass-card glass-flat relative max-w-[42rem] overflow-hidden rounded-2xl sm:min-h-[21rem] sm:pr-8 sm:group-even:pl-8 dark:text-white">
        <div className={`flex h-full flex-col px-5 pb-7 pt-4 sm:pl-10 sm:pr-2 sm:pt-10 ${imageUrl ? "sm:max-w-[50%] sm:group-even:ml-[18rem]" : ""}`}>
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">{description}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c} className="rounded-full bg-wine-100 px-3 py-1 text-xs font-semibold text-wine-700 dark:bg-wine-400/20 dark:text-wine-200">
                {c}
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex flex-wrap gap-2 sm:mt-auto">
            {tags.map((tag) => (
              <li className="rounded-full bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white dark:text-white/70" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-4 text-sm font-semibold">
            {links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                {l.label} →
              </a>
            ))}
          </div>
        </div>

        {imageUrl && (
          <Image
            src={imageUrl}
            alt={`Screenshot of ${title}`}
            quality={90}
            sizes="452px"
            className="absolute -right-40 top-8 hidden w-[28.25rem] rounded-t-lg shadow-2xl transition group-even:-left-40 group-even:right-[initial] group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-hover:scale-[1.04] group-even:group-hover:translate-x-3 group-even:group-hover:translate-y-3 group-even:group-hover:rotate-2 sm:block"
          />
        )}
      </section>
    </motion.div>
  );
}
