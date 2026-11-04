"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { projectsData, sideQuests } from "@/lib/data";
import Project from "./project";
import { useSectionInView } from "@/lib/hooks";

export default function Projects() {
  const { ref } = useSectionInView("Projects");

  return (
    <section ref={ref} id="projects" className="scroll-mt-28 mb-28">
      <SectionHeading>My projects</SectionHeading>
      <div>
        {projectsData.map((project) => (
          <Project key={project.id} {...project} />
        ))}
      </div>

      <h3 className="mb-6 mt-20 text-center text-2xl font-medium">Side quests</h3>
      <ul className="mx-auto grid max-w-[42rem] gap-4 sm:grid-cols-2">
        {sideQuests.map((q) => (
          <li key={q.id} className="glass glass-card glass-flat rounded-2xl p-5">
            <h4 className="font-semibold">{q.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-white/70">{q.description}</p>
            {q.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold underline-offset-4 hover:underline">
                {l.label} →
              </a>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
