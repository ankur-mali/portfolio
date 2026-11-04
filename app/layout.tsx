import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces } from "next/font/google";
import ThemeContextProvider from "@/context/theme-context";
import { Toaster } from "react-hot-toast";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["SOFT", "opsz"], style: ["normal", "italic"] });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-hand" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ankurmali.com"),
  title: "Ankur Mali · AI Engineer Associate",
  description:
    "Ankur Mali is an AI Engineer Associate at MULTIPLAI, building LLM, RAG and AI agent systems for enterprise. Walk through his journey in a cozy 3D town.",
  openGraph: {
    title: "Ankur Mali · AI Engineer Associate",
    description: "LLMs, RAG pipelines and AI agents, from prototype to production. Explore the 3D portfolio town.",
    url: "https://www.ankurmali.com",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ece0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1222" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint (avoids a light flash at night). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-[#f3ece0] font-sans text-stone-900 antialiased dark:bg-[#0e1222] dark:text-stone-100">
        <ThemeContextProvider>
          {children}
          <Toaster position="top-center" />
        </ThemeContextProvider>
      </body>
    </html>
  );
}
