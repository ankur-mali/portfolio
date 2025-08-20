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
        I am an <span className="font-medium">Applied AI Specialist</span> who
        architects and builds intelligent systems from{" "}
        <span className="font-medium">prototype to production</span>. My
        expertise lies in translating{" "}
        <span className="font-medium">complex data into actionable insights</span> 
        and scalable software. I have hands-on experience engineering{" "}
        <span className="font-medium">end-to-end ML solutions</span>, including{" "}
        predictive analytics dashboards for industrial data and{" "}
        sophisticated RAG-based chatbots for semantic search.
      </p>

      <p className="mb-3">
        I leverage a powerful stack combining{" "}
        <span className="font-medium">Python's data science ecosystem</span> with
        robust backend frameworks like{" "}
        <span className="font-medium">Spring Boot</span> and modern frontend
        technologies such as <span className="font-medium">React</span> to create
        impactful, data-driven applications. My passion lies in{" "}
        <span className="italic">solving challenging problems</span> at the
        intersection of <span className="font-medium">machine learning</span> and{" "}
        <span className="font-medium">software engineering</span>.
      </p>

      <p>
        I am currently seeking a{" "}
        <span className="font-medium">role or opportunity</span> where I can
        design and implement intelligent solutions that bridge{" "}
        <span className="font-medium">AI research</span> with{" "}
        <span className="font-medium">scalable production systems</span>.
      </p>
    </motion.section>
  );
}
