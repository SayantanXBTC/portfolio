import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "../../data/portfolio";
import { useTypewriter } from "../../hooks/useTypewriter";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { scrollToId } from "../../lib/scroll";
import { MaskLines } from "../kit/Text";
import { Button } from "../kit/Button";
import { Magnetic } from "../kit/Magnetic";

const rise = (delay) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.3, delay, ease: EASE },
});

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const { text, done } = useTypewriter(profile.typed, { speed: 34, startDelay: reduce ? 0 : 2300, enabled: !reduce });

  return (
    <section
      id="home"
      ref={ref}
      aria-label="Introduction"
      className="relative z-10 flex min-h-[100svh] flex-col justify-end overflow-x-clip pb-14 pt-36 md:pb-16"
    >
      <motion.div style={reduce ? undefined : { y, opacity: fade }} className="container-x">
        <motion.p {...rise(0.9)} className="label mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-mute">
          <span className="h-px w-10 bg-accent-strong" />
          <span className="text-paper">{profile.name}</span>
          <span className="text-dim">/</span>
          <span>{profile.eyebrow}</span>
        </motion.p>

        <MaskLines
          as="h1"
          trigger="mount"
          delay={1.15}
          stagger={0.16}
          lines={profile.headline}
          className="display max-w-[16ch] text-[clamp(2.9rem,8.6vw,9rem)]"
          renderLine={(line, i) =>
            i === profile.headline.length - 1 ? <span className="text-accent-strong">{line}</span> : line
          }
        />

        <div className="mt-9 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <motion.p {...rise(2.2)} className="min-h-[3.4rem] max-w-xl text-lg leading-relaxed text-paper/90 md:text-xl">
              <span aria-label={profile.typed}>{text}</span>
              {!done && <span className="caret" aria-hidden="true" />}
            </motion.p>
            <motion.p {...rise(2.4)} className="mt-4 max-w-xl text-sm leading-relaxed text-mute">
              {profile.intro}
            </motion.p>

            <motion.div {...rise(2.6)} className="mt-9 flex flex-wrap gap-3">
              <Magnetic>
                <Button href="#projects" variant="primary">
                  View Work
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="#about">About Me</Button>
              </Magnetic>
              <Magnetic>
                <Button href={profile.resume} arrow={false}>
                  Resume
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="#contact">Contact</Button>
              </Magnetic>
            </motion.div>
          </div>

          {/* scrub readout: tells the visitor the film responds to them */}
          <motion.div {...rise(2.9)} className="md:col-span-4 md:col-start-9">
            <div className="flex items-center justify-between label text-dim">
              <span>{fine ? "Move cursor to scrub" : "Drag to scrub"}</span>
              <span>{profile.location.split(",")[0]}</span>
            </div>
            <div className="mt-3 h-px w-full bg-white/10">
              <div
                className="h-full origin-left bg-accent-strong"
                style={{ transform: "scaleX(var(--scrub))", transition: "transform 0.25s linear" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.a
        {...rise(3.1)}
        href="#about"
        aria-label="Scroll to About"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("about");
        }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="label text-dim">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-accent-strong"
            animate={reduce ? undefined : { y: ["-100%", "220%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
