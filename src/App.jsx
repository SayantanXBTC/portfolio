import { useEffect } from "react";
import { AccentProvider } from "./context/AccentContext";
import { LightboxProvider } from "./components/kit/Lightbox";
import SmoothScroll from "./components/effects/SmoothScroll";
import Grain from "./components/effects/Grain";
import ScrollProgress from "./components/layout/ScrollProgress";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroBackground from "./components/hero/HeroBackground";
import Hero from "./components/hero/Hero";
import About from "./components/sections/About";
import Experience from "./components/sections/Experience";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Achievements from "./components/sections/Achievements";
import Education from "./components/sections/Education";
import Certifications from "./components/sections/Certifications";
import Contact from "./components/sections/Contact";
import { deepLink, scrollToId } from "./lib/scroll";

export default function App() {
  // Deep links (/portfolio/#projects): jump once layout has settled.
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    if (!deepLink.id) {
      deepLink.done = true;
      return undefined;
    }
    const t = setTimeout(() => {
      scrollToId(deepLink.id, { immediate: true });
      deepLink.done = true;
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AccentProvider>
      <LightboxProvider>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main")?.focus();
            scrollToId("about", { immediate: true });
          }}
          className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>

        <SmoothScroll />
        <ScrollProgress />
        <Grain />
        <HeroBackground />
        <Navbar />

        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <About />
          <Experience />
          <Skills />
          <Projects />
          <Achievements />
          <Education />
          <Certifications />
          <Contact />
        </main>
        <Footer />
      </LightboxProvider>
    </AccentProvider>
  );
}
