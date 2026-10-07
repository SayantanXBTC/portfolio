import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MaskLines } from "./Text";
import { Reveal } from "./Reveal";

/**
 * Section title card: numbered label, a rule that draws across, the headline
 * rising out of a mask and an oversized outline word drifting sideways.
 */
export function SectionHeader({ index, label, lines, watermark, align = "left", children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], align === "left" ? ["12%", "-28%"] : ["-28%", "12%"]);

  return (
    <header ref={ref} className="relative mb-16 md:mb-24">
      {watermark && (
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { x }}
          className="pointer-events-none absolute -top-10 md:-top-24 left-0 select-none whitespace-nowrap stroke-text display text-[clamp(7rem,22vw,22rem)] opacity-70"
        >
          {watermark}
        </motion.div>
      )}

      <div className="relative">
        <div className="flex items-center gap-5 mb-8 md:mb-10">
          <Reveal from="left" distance={0.5} className="label flex items-center gap-3">
            <span className="text-accent-strong">{index}</span>
            <span className="text-dim">/</span>
            <span>{label}</span>
          </Reveal>
          <motion.span
            aria-hidden="true"
            className="h-px flex-1 bg-white/10 origin-left"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <MaskLines
          lines={lines}
          from={align === "left" ? "left" : "right"}
          className="display text-[clamp(2.6rem,7.4vw,7.5rem)] max-w-[18ch]"
        />
        {children && (
          <Reveal from="up" delay={0.25} className="mt-8 max-w-2xl text-mute text-base md:text-lg leading-relaxed">
            {children}
          </Reveal>
        )}
      </div>
    </header>
  );
}
