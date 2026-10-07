import { useMemo } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { chapters, sections } from "../../data/portfolio";
import { useActiveSection } from "../../hooks/useActiveSection";
import { EASE } from "../../lib/asset";

const IDS = sections.map((s) => s.id);

/**
 * Section rail. Desktop: fixed in the left gutter, it shows the chapter number,
 * a thin progress line and the current section name (the large title "moves"
 * here as you scroll past it). Small screens: a 1px progress line on top; the
 * section name is shown in the header instead.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const active = useActiveSection(useMemo(() => IDS, []));
  const i = chapters.findIndex((c) => c.id === active);
  const chapter = i >= 0 ? chapters[i] : null;

  return (
    <>
      <motion.div aria-hidden="true" style={{ scaleX: p }} className="fixed inset-x-0 top-0 z-[90] h-px origin-left bg-paper/60 lg:hidden" />

      <div aria-hidden="true" className="pointer-events-none fixed bottom-0 left-0 top-0 z-[60] hidden w-[max(1.25rem,4vw)] lg:block">
        <AnimatePresence>
          {chapter && (
            <motion.div
              key="rail"
              className="absolute inset-y-0 left-0 flex w-full flex-col items-center justify-center gap-5"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <span className="label text-[0.6rem] text-paper">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative h-20 w-px bg-white/10">
                <motion.span style={{ scaleY: p }} className="absolute inset-0 origin-top bg-accent-strong" />
              </span>
              <span className="relative h-40 w-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={chapter.id}
                    className="label absolute left-1/2 top-0 origin-top-left whitespace-nowrap text-[0.66rem] text-paper/80"
                    style={{ rotate: 90, translateX: "0.45em" }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    {chapter.label}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
