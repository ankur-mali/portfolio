import React from "react";

type SectionHeadingProps = {
  children: React.ReactNode;
};

/** Large headings tighten their tracking and leading; weight carries the hierarchy. */
export default function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="mb-8 text-center text-3xl font-semibold leading-tight tracking-[-0.02em] [text-wrap:balance] sm:text-[2.25rem]">
      {children}
    </h2>
  );
}
