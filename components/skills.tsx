"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { skillGroups } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";

export default function Skills() {
  const { ref } = useSectionInView("Skills");

  return (
    <section id="skills" ref={ref} className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40">
      <SectionHeading>My skills</SectionHeading>
      <div className="grid gap-6 text-left sm:grid-cols-2">
        {skillGroups.map((g, gi) => (
          <motion.div
            key={g.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0, transition: { delay: 0.05 * gi } }}
            viewport={{ once: true }}
          >
            <h3 className="mb-1 font-semibold">{g.name}</h3>
            <p className="mb-2 text-xs uppercase tracking-wider text-wine-600 dark:text-wine-300">Proof: {g.proof}</p>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((skill) => (
                <li key={skill} className="borderBlack rounded-xl bg-white px-4 py-2 text-gray-800 dark:bg-white/10 dark:text-white/80">
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
