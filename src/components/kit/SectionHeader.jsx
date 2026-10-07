import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { chapterIndex } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { MaskLines } from "./Text";

/**
 * Chapter title card. The section name arrives large and fully readable in its
 * own space (it never sits behind other text). As the reader moves into the
 * section, the name slides off toward the left edge, where the fixed section
 * rail picks it up and keeps showing where you are.
 */
export function SectionHeader({ id, label, note, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.12", "start -0.35"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <header ref={ref} className="relative mb-20 md:mb-28">
      <div className="mb-8 flex items-center gap-5 md:mb-10">
        <p className="label flex shrink-0 items-center gap-3">
          <span className="text-paper">{chapterIndex(id)}</span>
          {note && (
            <>
              <span className="text-dim">—</span>
              <span>{note}</span>
            </>
          )}
        </p>
        <motion.span
          aria-hidden="true"
          className="h-px flex-1 origin-left bg-white/[0.08]"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
        />
      </div>

      {/* masked at the content edge: the name slides out of frame, never over the rail */}
      <div className="-mb-[0.15em] overflow-hidden pb-[0.15em]">
        <motion.div style={reduce ? undefined : { x, opacity }}>
          <MaskLines id={`${id}-title`} lines={[label]} className="display text-[clamp(3.2rem,10vw,10rem)] leading-[0.9]" />
        </motion.div>
      </div>
      {children}
    </header>
  );
}
