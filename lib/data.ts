import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { LuGraduationCap } from "react-icons/lu";
import type { StaticImageData } from "next/image";
import fruitdetection from "@/public/fruitdetection.png";
import predictivemaintenance from "@/public/predictivemaintenance.png";
import bookllm from "@/public/bookllm.png";
// Static import: the URL gets a content hash, so replacing the file never shows a cached old photo.
import profilePhoto from "@/public/profile.png";

export { profilePhoto };

export const profile = {
  name: "Ankur Mali",
  role: "AI Engineer Associate",
  company: "MULTIPLAI",
  linkedin: "https://www.linkedin.com/in/ankur-mali-/",
  github: "https://github.com/ankur-mali",
  // Swap for the updated CV (or drop the new file into /public/CV.pdf).
  cv: "/CV.pdf",
} as const;

// Classic view navigation.
export const links = [
  { name: "Home", hash: "#home" },
  { name: "About", hash: "#about" },
  { name: "Journey", hash: "#experience" },
  { name: "Projects", hash: "#projects" },
  { name: "Skills", hash: "#skills" },
  { name: "Contact", hash: "#contact" },
] as const;

export const aboutParagraphs = [
  "I'm an AI Engineer Associate at MULTIPLAI, where I design and build AI solutions for enterprise clients: from the first requirements workshop to the architecture to the service running in production.",
  "Most of my work lives where LLMs meet real software: RAG pipelines, AI agents, workflow automation and the backend APIs that make them reliable. I hold a Master's in Engineering and Sustainable Technology Management from SRH Berlin University of Applied Sciences.",
  "I like practical AI: systems people actually use, that are safe, measurable and maintainable.",
] as const;

export const experiencesData = [
  {
    title: "AI Engineer Associate · MULTIPLAI GmbH",
    location: "Germany · Full-time",
    description:
      "Design and develop AI solutions for enterprise applications, from architecture to deployment. Turn client needs into AI architectures, and build backend services integrating LLMs, RAG pipelines, AI agents and workflow automation.",
    icon: React.createElement(CgWorkAlt),
    date: "Apr 2026 – Present",
  },
  {
    title: "AI Intern · MULTIPLAI GmbH",
    location: "Germany",
    description:
      "Started at MULTIPLAI as an intern on enterprise AI projects, which led into the full-time role.",
    icon: React.createElement(CgWorkAlt),
    date: "Sep 2025 – Mar 2026",
  },
  {
    title: "Master's in Engineering and Sustainable Technology Management",
    location: "SRH Berlin University of Applied Sciences · Berlin, Germany",
    description:
      "Coursework: Machine Learning, Artificial Intelligence, Data Science, AI Development, Deep Learning, Natural Language Processing, Software Development, Statistics and Robotics.",
    icon: React.createElement(LuGraduationCap),
    date: "Oct 2023 – Mar 2026",
  },
  {
    title: "Postgraduate Diploma in Advanced Computing (CDAC)",
    location: "India",
    description:
      "Specialised in software development and led a team project building a full-stack enterprise application.",
    icon: React.createElement(LuGraduationCap),
    date: "2022 – 2023",
  },
  {
    title: "Bachelor's in Mechanical Engineering",
    location: "India",
    description:
      "Engineering fundamentals.",
    icon: React.createElement(LuGraduationCap),
    date: "2017 – 2021",
  },
] as const;

export type Project = {
  id: string;
  title: string;
  description: string;
  chips: string[];
  tags: string[];
  imageUrl?: StaticImageData;
  links: { label: string; href: string }[];
};

export const projectsData: Project[] = [
  {
    id: "fruit-robot",
    title: "Fruit Detection Robot",
    description:
      "A simulated robot arm in Webots that spots ripe fruit with OpenCV colour segmentation and picks it.",
    chips: ["Computer vision", "Robot simulation"],
    tags: ["Python", "OpenCV", "Webots"],
    imageUrl: fruitdetection,
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ankur-mali/Fruit-Detection-Robot-with-OpenCV-and-Webots",
      },
    ],
  },
  {
    id: "predictive-maintenance",
    title: "Predictive Maintenance Dashboard",
    description:
      "Health monitoring for turbofan jet engines: predicts Remaining Useful Life from NASA CMAPSS sensor data and shows it in an interactive dashboard.",
    chips: ["NASA CMAPSS", "RUL prediction"],
    tags: ["Python", "scikit-learn", "Random Forest", "Streamlit"],
    imageUrl: predictivemaintenance,
    links: [
      { label: "Live demo", href: "https://areoengine.streamlit.app/" },
      {
        label: "GitHub",
        href: "https://github.com/ankur-mali/Predictive-Maintenance-Using-AI-",
      },
    ],
  },
  {
    id: "book-recommender",
    title: "Semantic Book Recommender",
    description:
      "Describe a mood or a plot in plain words and get matching books, using LLM embeddings and semantic search over a book catalogue.",
    chips: ["Semantic search", "Emotion-aware"],
    tags: ["LangChain", "OpenAI", "Hugging Face", "ChromaDB"],
    imageUrl: bookllm,
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ankur-mali/llm-powered-semantic-book-recommender",
      },
    ],
  },
  {
    id: "mental-health-copilot",
    title: "Mental Health Copilot",
    description:
      "A RAG assistant over real Reddit mental-health discussions: FAISS vector search, LLM answers and crisis detection with safe-response guardrails.",
    chips: ["RAG", "Crisis detection", "Responsible AI"],
    tags: ["LLMs", "FAISS", "NLP", "MongoDB", "Reddit API"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ankur-mali/Mental-Health-Copilot-RAG",
      },
    ],
  },
  {
    id: "tax-law-reasoning",
    title: "Tax-Law Reasoning Generator",
    description:
      "Generates synthetic, multi-step tax-law cases with ground-truth reasoning chains to benchmark how well LLMs really reason. Built on the MuSR framework.",
    chips: ["LLM evaluation", "Chain-of-thought"],
    tags: ["Python", "GenAI", "MuSR"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ankur-mali/tax-law-reasoning-generator",
      },
    ],
  },
];

export const sideQuests: Project[] = [
  {
    id: "job-tracker",
    title: "AI Job Application Tracker",
    description:
      "A Gemini-powered agent that reads job emails from Gmail, extracts company, role and status, and keeps a Google Sheet up to date.",
    chips: ["AI agent"],
    tags: ["Gemini", "Gmail IMAP", "Google Sheets"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ankur-mali/AI-Powered-Job-Application-Tracker",
      },
    ],
  },
  {
    id: "ml-handbook",
    title: "AI-ML Mastery Handbook",
    description:
      "A hands-on notebook tour: data visualisation, deep learning, transformer-based NLP, embedding clustering and more.",
    chips: ["Learning notes"],
    tags: ["Jupyter", "Hugging Face", "CNNs"],
    links: [
      { label: "GitHub", href: "https://github.com/ankur-mali/AI-ML-Mastery-Handbook" },
    ],
  },
];

export const skillGroups = [
  {
    name: "LLMs & GenAI",
    proof: "Mental Health Copilot, Book Recommender",
    skills: ["LLMs", "RAG", "AI agents", "LangChain", "OpenAI", "Gemini", "Hugging Face", "Prompt design"],
  },
  {
    name: "Vector search",
    proof: "Book Recommender, Mental Health Copilot",
    skills: ["ChromaDB", "FAISS", "Embeddings"],
  },
  {
    name: "Machine learning",
    proof: "Predictive Maintenance",
    skills: ["scikit-learn", "TensorFlow", "Keras", "Deep learning", "NLP", "Statistics"],
  },
  {
    name: "Data",
    proof: "Predictive Maintenance",
    skills: ["Python", "Pandas", "NumPy", "SQL", "PostgreSQL", "MongoDB"],
  },
  {
    name: "Backend & cloud",
    proof: "Work at MULTIPLAI",
    skills: ["REST APIs", "Flask", "Docker", "Azure", "Google Cloud", "Git"],
  },
  {
    name: "Frontend & apps",
    proof: "This town",
    skills: ["TypeScript", "React", "Next.js", "Tailwind", "Streamlit", "Three.js"],
  },
  {
    name: "Vision & robotics",
    proof: "Fruit Detection Robot",
    skills: ["OpenCV", "Webots"],
  },
] as const;

export const skillsData = skillGroups.flatMap((g) => g.skills);
