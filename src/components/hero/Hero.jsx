import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { scrollToId } from "../../lib/scroll";
import { Button } from "../kit/Button";
import { Magnetic } from "../kit/Magnetic";
import { Decode } from "../kit/Decode";

const COMMAND = "npx playwright test sayantan.spec.ts";

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
 * The site tests itself on arrival: a test command types out, each role runs
 * (a spinner) and passes (a tick), and the line reports the result.
 * Timing is in seconds from page load.
 */
function useTestRun(reduce) {
  const [typed, setTyped] = useState(reduce ? COMMAND.length : 0);
  const [passed, setPassed] = useState(reduce ? profile.roles.length : 0);
  useEffect(() => {
    if (reduce) return undefined;
    const timers = [];
    for (let i = 1; i <= COMMAND.length; i += 1) timers.push(setTimeout(() => setTyped(i), 600 + i * 26));
    profile.roles.forEach((_, i) => timers.push(setTimeout(() => setPassed(i + 1), 2650 + i * 330)));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);
  return { typed, passed, done: passed === profile.roles.length };
}

function Status({ state }) {
  return (
    <span className="relative mr-3 inline-grid h-[0.8em] w-[0.8em] translate-y-[-0.08em] place-items-center align-middle">
      <AnimatePresence mode="wait" initial={false}>
        {state === "pass" ? (
          <motion.svg
            key="tick"
            viewBox="0 0 16 16"
            className="h-full w-full text-accent-strong"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            <motion.path
              d="M3 8.5l3.2 3.2L13 4.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
            />
          </motion.svg>
        ) : (
          <motion.span
            key="spin"
            className="block h-full w-full animate-spin rounded-full border-[2px] border-white/15 border-t-accent-strong"
            exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}

/** Real facts under the buttons; each one jumps to where it is shown in full. */
function ProofStrip({ delay }) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      className="mt-10 grid max-w-[40rem] grid-cols-2 gap-x-6 gap-y-5 border-t border-white/[0.08] pt-6 md:mt-12 md:grid-cols-4 md:gap-x-5"
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: delay } } }}
    >
      {profile.proof.map((p) => (
        <motion.li key={p.label} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}>
          <button type="button" onClick={() => scrollToId(p.to)} className="group block text-left">
            <span className="block text-[clamp(1.15rem,1.7vw,1.5rem)] font-semibold leading-none tracking-tight text-paper transition-colors duration-500 group-hover:text-accent-strong">
              <Decode value={p.value} />
            </span>
            <span className="mt-2 block text-[0.72rem] leading-snug text-dim transition-colors duration-500 group-hover:text-mute">{p.label}</span>
          </button>
        </motion.li>
      ))}
    </motion.ul>
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
  const run = useTestRun(reduce);

  return (
    <section
      id="home"
      ref={ref}
      aria-label="Introduction"
      className="relative z-10 flex min-h-[100svh] flex-col overflow-x-clip"
    >
      <motion.div
        style={reduce ? undefined : { y, opacity: fade }}
        className="container-x flex flex-1 flex-col justify-end pb-10 pt-28 portrait:justify-start portrait:pt-[50svh] landscape:justify-center landscape:pb-28 md:landscape:pt-32"
      >
        <div className="max-w-[min(100%,44rem)] landscape:max-w-[min(46vw,44rem)]">
          <motion.p
            className="label mb-6 flex items-center gap-4 text-mute md:mb-12"
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

          {/* the test run */}
          <p className="label mb-5 flex h-4 items-center gap-2 overflow-hidden whitespace-nowrap normal-case tracking-[0.06em] text-dim md:mb-8" aria-hidden="true">
            {run.done ? (
              <motion.span initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <span className="text-accent-strong">✓ {profile.roles.length} passed</span>
                <span className="text-dim"> · 0 failed · sayantan.spec.ts</span>
              </motion.span>
            ) : (
              <span>
                <span className="text-accent-strong">$</span> {COMMAND.slice(0, run.typed)}
                <span className="caret !h-[1em]" />
              </span>
            )}
          </p>

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
                <Status state={run.passed > i ? "pass" : "run"} />
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

          <ProofStrip delay={late(3.0)} />
        </div>
      </motion.div>

    </section>
  );
}
