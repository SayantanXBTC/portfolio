import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { EASE } from "../../lib/asset";

/**
 * Headline split into lines; each line rises out of a mask.
 * trigger="view" reveals on scroll, trigger="mount" runs immediately (hero).
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  trigger = "view",
  from = "up",
  as = "h2",
  id,
  renderLine,
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  // Observe the (unclipped) heading itself: the lines inside are translated out of
  // their overflow mask, so they can never report as intersecting on their own.
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const show = trigger === "mount" || seen;
  const Tag = motion[as] ?? motion.h2;
  const hidden = from === "left" ? { x: "-105%", y: 0 } : from === "right" ? { x: "105%", y: 0 } : { y: "112%", x: 0 };

  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.24em] -mb-[0.24em]">
          <motion.span
            className={`block will-change-transform ${lineClassName ?? ""}`}
            initial={reduce ? false : hidden}
            animate={reduce || show ? { x: 0, y: 0 } : hidden}
            transition={{ duration: 1.25, delay: delay + i * stagger, ease: EASE }}
          >
            {renderLine ? renderLine(line, i) : line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
      {children}
    </motion.span>
  );
}

/** Paragraph whose words light up one by one as the reader scrolls through it. */
export function WordReveal({ text, className, highlight = [] }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.5"] });
  const words = text.split(" ");

  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const hot = highlight.some((h) => w.toLowerCase().includes(h));
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            <span aria-hidden="true" className={hot ? "text-accent-strong" : undefined}>
              {w}
            </span>
          </Word>
        );
      })}
    </p>
  );
}
