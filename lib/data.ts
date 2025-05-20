import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import fruitdetection from "@/public/fruitdetection.png";
import predictivemaintenance from "@/public/predictivemaintenance.png";
import VCA from "@/public/VCA.png";
import heimAtlas from "@/public/HeimAtlas.png";
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
   title: "HeimAtlas",
   description:
    "A modern property listing platform where users can explore, add, and manage rental listings with real-time map integration.",
   tags: ["Next.js", "Supabase", "Tailwind CSS", "Authentication"],
   imageUrl: heimAtlas, // Replace with your actual image import
   link: "https://heimatlas.lovable.app/", // Replace with your deployed site link
  },
  {
    title: "Predictive Maintenance Dashboard",
    description:
      "AeroEngine health monitoring using Streamlit and AI, built with CMAPSS dataset for RUL prediction.",
    tags: ["Python", "Streamlit", "AI", "Random Forest", "CMAPSS"],
    imageUrl: predictivemaintenance,
    link: "https://areoengine.streamlit.app/",
  },
  {
    title: "Fruit Detection Robot",
    description:
      "Webots-based robot with OpenCV to detect and pick fruits using color segmentation and simulation.",
    tags: ["Python", "OpenCV", "Webots", "Simulation", "Computer Vision"],
    imageUrl: fruitdetection,
    link: "https://github.com/ankur-mali/Fruit-Detection-Robot-with-OpenCV-and-Webots",
  },
  {
    title: "Vehicle Configurator Website",
    description:
      "B2B car leasing portal using Jakarta EE, .NET, React & Spring Boot with Microservices and Docker.",
    tags: ["Spring Boot", "React", "Node.js", "Docker", "MySQL"],
    imageUrl: VCA,
    link: "https://github.com/ankur-mali/PG-DAC",
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

