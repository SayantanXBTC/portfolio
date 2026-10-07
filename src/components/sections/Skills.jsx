import { Component, Suspense, lazy, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { foundations, workingStyle } from "../../data/portfolio";
import { useAccent } from "../../context/AccentContext";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Stagger, Item } from "../kit/Stagger";

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

/**
 * Foundations: what I work in -> how systems hold together -> what I explore.
 * Everything is visible at once; hovering only shifts emphasis (and turns the
 * network toward the column being read).
 */
export default function Skills() {
  const [focus, setFocus] = useState(null);
  const sceneRef = useRef(null);
  const listRef = useRef(null);
  const visible = useInView(sceneRef, { margin: "200px 0px 200px 0px" });
  const listSeen = useInView(listRef, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const { accent } = useAccent();
  const turn = focus === null ? 0 : focus - 1;

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      {/* the visualization: secondary, behind, desktop only */}
      <div
        ref={sceneRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-[6%] hidden h-[70%] w-[60%] opacity-50 lg:block"
      >
        {!reduce && visible && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <NetworkScene color={accent.bright} active={visible} turn={turn} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>

      <div className="container-x relative">
        <SectionHeader id="skills" label="Skills" note="Foundations — know · build · explore" />

        <div ref={listRef} className="grid gap-16 md:grid-cols-3 md:gap-10" onPointerLeave={() => setFocus(null)}>
          {foundations.map((col, i) => {
            const dimmed = focus !== null && focus !== i;
            return (
              <motion.div
                key={col.key}
                onPointerEnter={() => setFocus(i)}
                onFocus={() => setFocus(i)}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: listSeen || reduce ? (dimmed ? 0.32 : 1) : 0 }}
                transition={{ duration: listSeen && focus === null ? 1.4 : 0.6, delay: listSeen && focus === null ? i * 0.2 : 0, ease: EASE }}
                className="border-t border-white/[0.08] pt-8"
              >
                <p className="label flex items-center justify-between">
                  <span className={focus === i ? "text-accent-strong" : "text-paper"}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-dim">{col.items.length} entries</span>
                </p>
                <h3 className="display mt-8 text-[clamp(2rem,3.4vw,3.4rem)]">{col.title}</h3>
                <p className="label mt-3 text-dim">{col.line}</p>
                <Stagger as="ul" className="mt-10 space-y-2.5" gap={0.06} delay={0.3 + i * 0.15}>
                  {col.items.map((item) => (
                    <Item
                      as="li"
                      key={item}
                      className="editorial text-[clamp(1.15rem,1.55vw,1.5rem)] text-paper/85 transition-colors duration-300 hover:text-paper"
                    >
                      {item}
                    </Item>
                  ))}
                </Stagger>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-24 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-white/[0.08] pt-6 text-sm text-mute md:mt-32">
          <span className="label text-dim">Working style</span>
          {workingStyle.map((w, i) => (
            <span key={w}>
              {w}
              {i < workingStyle.length - 1 && <span className="ml-5 text-dim">·</span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
