import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import corpcommentImg from "@/public/corpcomment.png";
import rmtdevImg from "@/public/rmtdev.png";
import wordanalyticsImg from "@/public/wordanalytics.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Master's in Engineering Technology & Sustainable Technology Management",
    location: "Germany",
    description:
      "Currently pursuing my master's with a focus on AI, data analytics, and software development. Gaining advanced skills in modern technologies.",
    icon: React.createElement(LuGraduationCap),
    date: "2023 - Present",
  },
  {
    title: "Postgraduate Diploma in Advanced Computing (CDAC)",
    location: "India",
    description:
      "Completed CDAC with specialization in software development. Led a team project focused on full-stack enterprise application development.",
    icon: React.createElement(LuGraduationCap),
    date: "2022 - 2023",
  },
  {
    title: "Bachelor's in Mechanical Engineering",
    location: "India",
    description:
      "Earned my degree while developing a strong interest in automation and AI. Participated in projects integrating mechanical design with software.",
    icon: React.createElement(LuGraduationCap),
    date: "2017 - 2021",
  },
] as const;


export const projectsData = [
  {
    title: "CorpComment",
    description:
      "I worked as a full-stack developer on this startup project for 2 years. Users can give public feedback to companies.",
    tags: ["React", "Next.js", "MongoDB", "Tailwind", "Prisma"],
    imageUrl: corpcommentImg,
  },
  {
    title: "rmtDev",
    description:
      "Job board for remote developer jobs. I was the front-end developer. It has features like filtering, sorting and pagination.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind", "Redux"],
    imageUrl: rmtdevImg,
  },
  {
    title: "Word Analytics",
    description:
      "A public web app for quick analytics on text. It shows word count, character count and social media post limits.",
    tags: ["React", "Next.js", "SQL", "Tailwind", "Framer"],
    imageUrl: wordanalyticsImg,
  },
] as const;

export const skillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind",
  "Git",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Express",
  "Python",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "TensorFlow",
  "Keras",
  "OpenCV",
  "Streamlit",
  "Flask",
  "Azure",
  "Microsoft .NET",
  "Spring Boot",
  "Docker",
  "REST API",
  "Microservices",
  "JPA",
  "JWT",
  "Framer Motion"
] as const;

