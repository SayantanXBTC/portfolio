import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { achievements } from "../../data/portfolio";
import { useHorizontalPin } from "../../hooks/useMedia";
import { getLenis } from "../../lib/scroll";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { ClipReveal, Reveal } from "../kit/Reveal";
import { useLightbox } from "../kit/Lightbox";

const pad = (n) => String(n).padStart(2, "0");
const LIGHT = ["30% 40%", "70% 30%", "45% 75%"];

/** The other photos of an entry: small, uncropped, popping in one after another. */
function Fragments({ item, onOpen, className = "", delay = 0 }) {
  const rest = item.images.slice(1, 5);
  if (!rest.length) return null;
  return (
    <motion.div
      className={`flex items-end gap-2.5 ${className}`}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: delay } } }}
    >
      {rest.map((img, i) => (
        <motion.button
          key={img.src}
          type="button"
          onClick={() => onOpen(i + 1)}
          aria-label={`Open photo ${i + 2} of ${item.images.length}: ${item.title}`}
          className="group relative block h-16 overflow-hidden bg-ink-800 xl:h-20"
          style={{ aspectRatio: `${img.w} / ${img.h}` }}
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.7 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.34, 1.4, 0.64, 1] } },
          }}
          whileHover={{ y: -4 }}
        >
          <img src={img.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-70 transition duration-700 ease-cine group-hover:opacity-100" />
        </motion.button>
      ))}
    </motion.div>
  );
}

/**
 * Desktop: an exhibition stage. Scrolling moves through the catalogue; the
 * active object is examined in the centre while its record assembles around it.
 */
function ArchiveStage() {
  const outer = useRef(null);
  const stage = useRef(null);
  const n = achievements.length;
  const [active, setActive] = useState(0);
  const seen = useInView(stage, { once: true, amount: 0.55 });
  const { open } = useLightbox();

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.9999)));
    setActive((a) => (a === i ? a : i));
  });

  const jump = (i) => {
    const el = outer.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const y = top + (span * (i + 0.5)) / n;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const item = achievements[active];
  // first appearance is slow and assembled; later changes are brisker
  const d = (t) => (seen ? t : t + 0.3);

  return (
    <div ref={outer} style={{ height: `${n * 95 + 20}vh` }}>
      <div
        ref={stage}
        className="pin-stage transition-[background-position] duration-1000"
        style={{
          backgroundImage: `radial-gradient(55% 60% at ${LIGHT[active]}, rgb(var(--accent-rgb) / 0.06), transparent 70%)`,
        }}
      >
        <div className="container-x grid h-full grid-cols-12 items-center gap-8 pb-10 pt-24">
          {/* index / catalogue */}
          <nav aria-label="Recognition index" className="col-span-3 self-center">
            <p className="label mb-8 text-dim">Index — {pad(n)} entries</p>
            <div className="relative pl-6">
              <span className="absolute bottom-0 left-0 top-0 w-px bg-white/10" />
              <motion.span style={{ scaleY: progress }} className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent-strong" />
              <ol className="space-y-6">
                {achievements.map((a, i) => (
                  <li key={a.title}>
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-current={i === active ? "true" : undefined}
                      className={`group block text-left transition-colors duration-700 ${i === active ? "text-paper" : "text-dim hover:text-mute"}`}
                    >
                      <span className="label block">
                        {pad(i + 1)} · {a.year}
                      </span>
                      <span className="mt-1.5 block text-[0.95rem] tracking-tight">{a.short}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* the object under examination */}
          <div className="relative col-span-5 col-start-4 self-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`num-${active}`}
                aria-hidden="true"
                className="stroke-text display pointer-events-none absolute -left-[18%] -top-[22%] select-none text-[18vw] leading-none"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: seen ? 1 : 0, y: seen ? 0 : 40 }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.5 } }}
                transition={{ duration: 1.2, delay: d(0), ease: EASE }}
              >
                {pad(active + 1)}
              </motion.span>
            </AnimatePresence>

            {/* the object: shown whole, at its own aspect ratio, inside a fixed frame */}
            <div className="relative h-[54vh] w-full">
              <AnimatePresence initial={false}>
                <motion.div
                  key={item.title}
                  className="absolute inset-0 flex items-center justify-center"
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.6, delay: 0.4 } }}
                >
                  <motion.button
                    type="button"
                    onClick={() => open(item.images, 0)}
                    aria-label={`Open ${item.title} photo gallery`}
                    className="group relative block max-w-full overflow-hidden shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)]"
                    initial={{ clipPath: "inset(100% 0 0 0)", y: 30 }}
                    animate={{ clipPath: seen ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", y: seen ? 0 : 30 }}
                    transition={{ duration: 1.3, delay: d(0.15), ease: EASE }}
                  >
                    <motion.img
                      src={item.images[0].src}
                      alt={item.images[0].alt}
                      width={item.images[0].w}
                      height={item.images[0].h}
                      decoding="async"
                      className="block h-auto max-h-[54vh] w-auto max-w-full"
                      initial={{ scale: 1.12 }}
                      animate={{ scale: seen ? 1 : 1.12 }}
                      transition={{ duration: 2, delay: d(0.15), ease: EASE }}
                    />
                    <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <p className="label text-dim">
                Obj. {pad(active + 1)} — {item.images.length} {item.images.length === 1 ? "photograph" : "photographs"}
              </p>
              {seen && <Fragments key={item.title} item={item} onOpen={(i) => open(item.images, i)} delay={0.7} />}
            </div>
          </div>

          {/* the record */}
          <div className="col-span-3 col-start-10 self-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.title}
                initial="hidden"
                animate={seen ? "show" : "hidden"}
                exit="exit"
                variants={{ exit: { opacity: 0, transition: { duration: 0.3 } } }}
              >
                <motion.dl
                  className="label space-y-2"
                  variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, delay: d(0.45), ease: EASE } } }}
                >
                  <div className="flex gap-3">
                    <dt className="text-dim">Badge</dt>
                    <dd className="text-accent-strong">{item.badge}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="text-dim">Role</dt>
                    <dd className="text-paper/80">{item.role}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="text-dim">Where</dt>
                    <dd className="text-paper/80">{item.where}</dd>
                  </div>
                </motion.dl>
                <span className="mt-6 block overflow-hidden pb-[0.1em]">
                  <motion.h3
                    className="display text-[clamp(1.9rem,2.6vw,2.8rem)]"
                    variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 1.1, delay: d(0.55), ease: EASE } } }}
                  >
                    {item.title}
                  </motion.h3>
                </span>
                <motion.p
                  className="mt-5 text-[0.92rem] leading-[1.7] text-mute"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.2, delay: d(0.8) } } }}
                >
                  {item.detail}
                </motion.p>
                <motion.p
                  className="mt-5 border-l border-accent pl-4 text-[0.92rem] leading-[1.6] text-paper/85"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.2, delay: d(1) } } }}
                >
                  {item.impact}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small screens and reduced motion: the same records, one after another. */
function ArchiveList() {
  const { open } = useLightbox();
  return (
    <div className="container-x space-y-28 pb-36 md:space-y-36 md:pb-52">
      {achievements.map((a, i) => (
        <article key={a.title} className="border-t border-white/[0.08] pt-8">
          <Reveal from="none" className="label flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-paper">{pad(i + 1)}</span>
            <span className="text-accent-strong">{a.badge}</span>
            <span className="ml-auto text-dim">{a.year}</span>
          </Reveal>
          <h3 className="display mt-6 text-[clamp(2rem,7vw,3.6rem)]">{a.title}</h3>
          <p className="label mt-3 text-dim">
            {a.role} · {a.where}
          </p>
          <ClipReveal
            from="up"
            duration={1.5}
            scaleFrom={1.1}
            className="mt-8 overflow-hidden bg-ink-800 [&>div]:h-auto"
            innerClassName="w-full"
          >
            <button type="button" onClick={() => open(a.images, 0)} aria-label={`Open ${a.title} photo gallery`} className="block h-full w-full">
              <img
                src={a.images[0].src}
                alt={a.images[0].alt}
                loading="lazy"
                decoding="async"
                className="block max-h-[80vh] w-full object-contain"
                style={{ aspectRatio: `${a.images[0].w} / ${a.images[0].h}` }}
              />
            </button>
          </ClipReveal>
          <Fragments item={a} onOpen={(k) => open(a.images, k)} className="mt-3" />
          <p className="mt-8 body-copy">{a.detail}</p>
          <p className="mt-5 border-l border-accent pl-4 text-paper/85">{a.impact}</p>
        </article>
      ))}
    </div>
  );
}

export default function Achievements() {
  const wide = useHorizontalPin();
  const reduce = useReducedMotion();

  return (
    <section id="achievements" aria-labelledby="achievements-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pb-10 pt-36 md:pt-52">
        <SectionHeader id="achievements" label="Recognition" note="An archive" />
      </div>
      {wide && !reduce ? <ArchiveStage /> : <ArchiveList />}
    </section>
  );
}
