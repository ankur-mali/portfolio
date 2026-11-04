import type { Metadata } from "next";
import About from "@/components/about";
import Contact from "@/components/contact";
import Experience from "@/components/experience";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import SectionDivider from "@/components/section-divider";
import Skills from "@/components/skills";
import ThemeSwitch from "@/components/theme-switch";
import TownLink from "@/components/town-link";
import ActiveSectionContextProvider from "@/context/active-section-context";

export const metadata: Metadata = {
  title: "Ankur Mali · AI Engineer Associate (classic view)",
};

export default function ClassicPage() {
  return (
    <ActiveSectionContextProvider>
      <div className="classic-page classic-glow relative overflow-x-clip bg-gray-50 pt-28 text-gray-950 sm:pt-36 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90">
        <Header />
        <main className="relative flex flex-col items-center px-4 pb-16">
          <Intro />
          <SectionDivider />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
        <ThemeSwitch />
        <TownLink />
      </div>
    </ActiveSectionContextProvider>
  );
}
