"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        After completing a postgraduate diploma in{" "}
        <span className="font-medium">Advanced Computing</span>, I am pursuing a
        master's degree in{" "}
        <span className="font-medium">
          Engineering Technology and Sustainable Technology Management
        </span> in Germany, where I explored{" "}
        <span className="font-medium">AI, data analytics, and full-stack software development</span>.
        <span className="italic"> My favorite part of software development</span> is building
        intelligent systems that solve real-world problems. I <span className="underline">enjoy</span> combining
        clean architecture with smart algorithms. My core stack is{" "}
        <span className="font-medium">
          React, Next.js, .NET, Spring Boot, and SQL
        </span>. I also have experience with{" "}
        <span className="font-medium">Docker, REST APIs, and Microservices</span>,
        and I’m passionate about integrating{" "}
        <span className="font-medium">AI/ML</span> into scalable solutions. I’m currently
        seeking a <span className="font-medium">working student or full-time position</span> in
        software development or applied AI.
      </p>

      <p>
        <span className="italic">When I'm not coding</span>, I enjoy exploring the
        <span className="font-medium"> mountains</span>, traveling around Europe, and
        learning new technologies in cloud platforms like{" "}
        <span className="font-medium">Microsoft Azure and Google Cloud</span>. I am also
        fascinated by topics like{" "}
        <span className="font-medium">Industry 4.0, robotics, and digital twins</span>,
        and often work on side projects involving AI-driven solutions.
      </p>
    </motion.section>
  );
}