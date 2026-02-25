import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import TechStack from "./components/TechStack";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import AnimatedSection from "./components/AnimatedSection";

export default function Home() {
  return (
    <SmoothScroll>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-electricBlue focus:text-navy focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <Navbar />
      <main>
        <Hero />
        <AnimatedSection>
          <About />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <TechStack />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <Projects />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <Experience />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <Contact />
        </AnimatedSection>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
