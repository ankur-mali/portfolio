import { useActiveSectionContext } from "@/context/active-section-context";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { SectionName } from "./types";

/**
 * Marks a section as active while it crosses a thin line 40% down the screen.
 * Works for sections of any height (a share-of-section threshold never fires for
 * sections taller than the screen, which is what broke the top bar before).
 */
export function useSectionInView(sectionName: SectionName) {
  const { ref, inView } = useInView({
    rootMargin: "-40% 0px -59% 0px",
    threshold: 0,
  });
  const { setActiveSection, timeOfLastClick } = useActiveSectionContext();

  useEffect(() => {
    // Right after a nav click, let the smooth scroll finish without the pill flickering
    // through every section on the way.
    if (inView && Date.now() - timeOfLastClick > 900) {
      setActiveSection(sectionName);
    }
  }, [inView, setActiveSection, timeOfLastClick, sectionName]);

  return {
    ref,
  };
}
