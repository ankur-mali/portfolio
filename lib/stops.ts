import { projectsData, sideQuests, type Project } from "./data";

/** The robot guide's name, shown in speech bubbles. */
export const GUIDE_NAME = "Ember";

// One entry per stop on the journey road. Order = scroll order = career story.
export type Stop = {
  id: string;
  /** What's at this stop (shown in the mini-map and the stop list). */
  label: string;
  /** The building it lives in. */
  place: string;
  /** Small line above the title, usually the years. */
  kicker: string;
  title: string;
  /** What the robot guide says when you arrive. */
  robot: string;
  body?: string;
  bullets?: string[];
  project?: Project;
  /** Education stop: earlier qualifications, listed small for the record. */
  earlier?: { when: string; title: string }[];
  kind: "hero" | "origins" | "project" | "skills" | "work" | "contact";
};

const project = (id: string) => {
  const p = projectsData.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown project ${id}`);
  return p;
};

export const stops: Stop[] = [
  {
    id: "home",
    label: "Intro",
    place: "Home",
    kicker: "",
    title: "Hi, I'm Ankur.",
    robot: "Hi! I'm Ember, Ankur's guide. Scroll and I'll show you around town.",
    kind: "hero",
  },
  {
    id: "origins",
    label: "Education",
    place: "SRH Berlin",
    kicker: "Education · Oct 2023 – Mar 2026",
    title: "Master's at SRH Berlin",
    robot: "Welcome to SRH Berlin, where machine learning, NLP and deep learning turned into a Master's.",
    body: "Master's in Engineering and Sustainable Technology Management, SRH Berlin University of Applied Sciences.",
    bullets: ["Machine Learning", "Deep Learning", "Artificial Intelligence", "NLP", "AI Development", "Data Science", "Statistics", "Software Development", "Robotics"],
    // Kept for the record, shown small under the Master's.
    earlier: [
      { when: "2022 – 2023", title: "PG Diploma in Advanced Computing (CDAC), India" },
      { when: "2017 – 2021", title: "Bachelor of Engineering, India" },
    ],
    kind: "origins",
  },
  {
    id: "orchard",
    label: "Fruit Robot",
    place: "Orchard",
    kicker: "Project · Computer vision",
    title: "Fruit Detection Robot",
    robot: "My cousin works here! Ankur taught it to pick only the ripe fruit.",
    project: project("fruit-robot"),
    kind: "project",
  },
  {
    id: "hangar",
    label: "Predictive Maintenance",
    place: "Hangar",
    kicker: "Project · Predictive maintenance",
    title: "Predictive Maintenance Dashboard",
    robot: "A jet engine that tells you when it's tired, before anything breaks.",
    project: project("predictive-maintenance"),
    kind: "project",
  },
  {
    id: "library",
    label: "Book Recommender",
    place: "Library",
    kicker: "Project · Semantic search",
    title: "Semantic Book Recommender",
    robot: "Tell the library how you feel and the right books float down to you.",
    project: project("book-recommender"),
    kind: "project",
  },
  {
    id: "lighthouse",
    label: "Mental Health Copilot",
    place: "Lighthouse",
    kicker: "Project · RAG",
    title: "Mental Health Copilot",
    robot: "A lighthouse for hard days: careful answers, and a guard for crisis signals.",
    project: project("mental-health-copilot"),
    kind: "project",
  },
  {
    id: "townhall",
    label: "Tax-Law Reasoning",
    place: "Town hall",
    kicker: "Project · LLM evaluation",
    title: "Tax-Law Reasoning Generator",
    robot: "In this court, the LLMs are on trial. Can they reason step by step?",
    project: project("tax-law-reasoning"),
    kind: "project",
  },
  {
    id: "windmill",
    label: "Skills & Side Quests",
    place: "Windmill",
    kicker: "Skills",
    title: "Skills & side quests",
    robot: "Every sail turns a different skill. The market next door has the side quests.",
    kind: "skills",
  },
  {
    id: "multiplai",
    label: "MULTIPLAI",
    place: "Guildhall",
    kicker: "Sep 2025 – today · You are here",
    title: "AI Engineer Associate at MULTIPLAI",
    robot: "And here we are, the biggest hall in town. This is where Ankur works now.",
    body: "Started as an intern in September 2025 and went full-time in April 2026.",
    bullets: [
      "End-to-end AI solutions for enterprise applications, from architecture to deployment",
      "Turning client needs into AI architectures and technology choices",
      "Backend services with LLMs, RAG pipelines, AI agents and workflow automation",
      "Secure, production-ready AI features with cross-functional teams",
    ],
    kind: "work",
  },
  {
    id: "contact",
    label: "Contact",
    place: "Post office",
    kicker: "The town post office",
    title: "Want to get in touch?",
    robot: "The road keeps going. Drop a letter in the mailbox and say hi!",
    kind: "contact",
  },
];

export const LANTERN_COUNT = stops.length - 1; // one per stop, the road's end has the mailbox instead
export const MULTIPLAI_STOP = stops.findIndex((s) => s.id === "multiplai");
export const sideQuestProjects = sideQuests;
export const CONTACT_STOP = stops.length - 1;
export const FIRST_PROJECT_STOP = stops.findIndex((s) => s.kind === "project");
