import { Component, Suspense, lazy, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { skillGroups } from "../../data/portfolio";
import { useAccent } from "../../context/AccentContext";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";

const NetworkScene = lazy(() => import("../effects/NetworkScene"));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Skills() {
  const [active, setActive] = useState(0);
  const sceneRef = useRef(null);
  const visible = useInView(sceneRef, { margin: "200px 0px 200px 0px" });
  const reduce = useReducedMotion();
  const { accent } = useAccent();
  const group = skillGroups[active];
  const small = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative z-10 overflow-x-clip bg-ink py-28 md:py-44">
      <div className="container-x">
        <SectionHeader index="04" label="Skills" lines={["The", "toolkit."]} watermark="SYSTEMS" align="right" />
        <h2 id="skills-title" className="sr-only">
          Skills
        </h2>

        <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* 3D topology sits quietly behind the detail panel */}
          <div
            ref={sceneRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-[-10%] hidden w-[62%] opacity-60 lg:block"
          >
            {!reduce && visible && (
              <SceneBoundary>
                <Suspense fallback={null}>
                  <NetworkScene color={accent.bright} active={visible} count={small ? 70 : 120} />
                </Suspense>
              </SceneBoundary>
            )}
          </div>

          <ul className="relative z-10 border-t border-white/10 lg:col-span-6" aria-label="Skill categories">
            {skillGroups.map((g, i) => {
              const on = i === active;
              return (
                <Reveal as="li" key={g.title} from="left" distance={0.8} delay={i * 0.08} className="border-b border-white/10">
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-controls="skill-panel"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="group relative flex w-full items-baseline gap-5 py-5 text-left md:gap-8 md:py-7"
                  >
                    <span className={`label w-7 shrink-0 transition-colors duration-500 ${on ? "text-accent-strong" : "text-dim"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`display text-[clamp(1.6rem,3.6vw,3.4rem)] transition-all duration-700 ease-cine ${
                        on ? "translate-x-3 text-paper" : "text-paper/40 group-hover:text-paper/70"
                      }`}
                    >
                      {g.title}
                    </span>
                    <span className="label ml-auto hidden text-dim sm:block">{g.items.length}</span>
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-px left-0 h-px bg-accent-strong transition-all duration-[900ms] ease-cine ${
                        on ? "w-full" : "w-0"
                      }`}
                    />
                  </button>

                  {/* On small screens the detail opens inline under the row */}
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        key="inline"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="flex flex-wrap gap-2 pb-6 pl-12">
                          {g.items.map((t) => (
                            <span key={t} className="rounded-full border border-white/12 px-4 py-2 text-sm text-paper/90">
                              {t}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              );
            })}
          </ul>

          <div
            id="skill-panel"
            aria-live="polite"
            className="relative z-10 hidden lg:col-span-5 lg:col-start-8 lg:block"
          >
            <div className="sticky top-32">
              <p className="label mb-6 text-accent-strong">{group.title}</p>
              <AnimatePresence mode="wait">
                <motion.ul
                  key={group.title}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{ show: { transition: { staggerChildren: 0.07 } }, exit: { transition: { staggerChildren: 0.03 } } }}
                  className="border-t border-white/10"
                >
                  {group.items.map((item) => (
                    <motion.li
                      key={item}
                      variants={{
                        hidden: { opacity: 0, x: 70 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
                        exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
                      }}
                      className="display border-b border-white/10 py-4 text-[clamp(1.6rem,2.8vw,2.8rem)] text-paper transition-colors duration-500 hover:text-accent-strong"
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
