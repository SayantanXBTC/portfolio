import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { marqueeBottom, marqueeTop } from "../../data/portfolio";

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** One row of keywords that drifts on its own and accelerates with scroll speed. */
function Row({ words, base = -1, outline = false }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const xPct = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    // base speed in %/s, multiplied up while the page is being scrolled
    const speed = base * (1 + Math.min(4, Math.abs(boost.get())));
    x.set(x.get() + speed * (delta / 1000));
  });

  const items = [...words, ...words, ...words, ...words];
  return (
    <div className="overflow-hidden whitespace-nowrap py-2">
      <motion.div style={{ x: xPct }} className="flex w-max items-center">
        {items.map((w, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`display px-6 text-[clamp(2.4rem,7vw,6.5rem)] md:px-10 ${outline ? "stroke-text" : "text-paper/90"}`}
              style={outline ? { WebkitTextStroke: "1px rgba(255,255,255,0.28)" } : undefined}
            >
              {w}
            </span>
            <span className="h-2 w-2 shrink-0 rotate-45 bg-accent-strong" aria-hidden="true" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 border-y border-white/[0.07] bg-ink/60 py-6 backdrop-blur-[2px] md:py-10"
    >
      <Row words={marqueeTop} base={-2.2} />
      <Row words={marqueeBottom} base={2.2} outline />
    </div>
  );
}
