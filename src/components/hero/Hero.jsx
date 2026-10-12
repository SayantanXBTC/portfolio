import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { Button } from "../kit/Button";
import { Magnetic } from "../kit/Magnetic";

// A touch of overshoot for the name: it lands, it does not just stop.
const LAND = [0.2, 1.18, 0.34, 1];

function Rise({ children, delay, className = "", ease = EASE, duration = 1.4 }) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
      <motion.span
        className={`block ${className}`}
        initial={reduce ? false : { y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Wipe({ children, delay, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`block ${className}`}
      initial={reduce ? false : { clipPath: "inset(0 100% 0 0)", x: -12 }}
      animate={{ clipPath: "inset(0 0% 0 0)", x: 0 }}
      transition={{ duration: 1.3, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Opening shot: name, profession, face. Type sits in the negative space left of
 * the subject (landscape) or below the framed plate (portrait).
 */
export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const late = (d) => (reduce ? 0 : d);

  return (
    <section
      id="home"
      ref={ref}
      aria-label="Introduction"
      className="relative z-10 flex min-h-[100svh] flex-col overflow-x-clip"
    >
      <motion.div
        style={reduce ? undefined : { y, opacity: fade }}
        className="container-x flex flex-1 flex-col justify-end pb-10 pt-28 landscape:justify-center landscape:pb-28 md:landscape:pt-32"
      >
        <div className="max-w-[min(100%,44rem)] landscape:max-w-[min(46vw,44rem)]">
          <motion.p
            className="label mb-9 flex items-center gap-4 text-mute md:mb-12"
            initial={reduce ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: late(0.9), ease: EASE }}
          >
            <motion.span
              className="h-px w-10 origin-left bg-accent-strong"
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: late(0.8), ease: EASE }}
            />
            {profile.signature}
          </motion.p>

          <h1 className="text-paper">
            <Rise delay={late(1.15)} className="editorial text-[clamp(1.35rem,2.3vw,2.1rem)] text-paper/75">
              {profile.greeting}
            </Rise>
            <span className="mt-2 block display text-[clamp(2.5rem,11vw,5rem)] landscape:text-[clamp(2.6rem,5.6vw,6.4rem)]">
              {profile.nameLines.map((l, i) => (
                <Rise key={l} delay={late(1.3 + i * 0.14)} ease={LAND} duration={1.5}>
                  {l}
                </Rise>
              ))}
            </span>
          </h1>

          <p className="mt-8 flex flex-col gap-1 editorial text-[clamp(1.3rem,2.4vw,2.2rem)] text-paper/85 md:mt-10">
            <span className="sr-only">I'm an </span>
            {profile.roles.map((r, i) => (
              <Wipe key={r} delay={late(2.1 + i * 0.16)}>
                <span className="mr-3 inline-block translate-y-[-0.2em] label text-accent-strong">{String(i + 1).padStart(2, "0")}</span>
                {r}
                {i === 0 && <span className="sr-only"> and </span>}
              </Wipe>
            ))}
          </p>

          <motion.div
            className="mt-10 flex flex-wrap gap-3 md:mt-12"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: late(2.75), ease: EASE }}
          >
            <Magnetic>
              <Button href="#projects" variant="primary">
                View work
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href={profile.resume} arrow={false}>
                Resume
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

    </section>
  );
}
