import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { certificates, education } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { MaskLines } from "../kit/Text";
import { useLightbox } from "../kit/Lightbox";
import { Stagger, Item } from "../kit/Stagger";

const pad = (n) => String(n).padStart(2, "0");
const PREVIEW_W = 340;

const certSlides = certificates.map((c) => ({
  src: c.image,
  alt: `${c.title} certificate`,
  caption: { title: c.title, meta: `${c.org} · ${c.date}`, points: c.points, link: c.link },
}));

/** The certificate follows the pointer like a document slid across a desk. */
function FloatingPreview({ cert, x, y }) {
  const reduce = useReducedMotion();
  const sx = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6 });
  const vx = useVelocity(sx);
  const tilt = useSpring(useTransform(vx, [-1600, 0, 1600], [-7, -1.5, 4], { clamp: true }), { stiffness: 120, damping: 18 });
  const left = useTransform(sx, (v) => (v > window.innerWidth * 0.6 ? v - PREVIEW_W - 36 : v + 36));
  const top = useTransform(sy, (v) => v - 120);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70]"
      style={reduce ? { x: left, y: top } : { x: left, y: top, rotate: tilt }}
    >
      <AnimatePresence mode="popLayout">
        {cert && (
          <motion.img
            key={cert.preview}
            src={cert.preview}
            alt=""
            width={PREVIEW_W}
            className="block rounded-[2px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)]"
            style={{ width: PREVIEW_W }}
            initial={{ opacity: 0, scale: 0.86, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
            transition={{ duration: 0.55, ease: EASE }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Certifications() {
  const { open } = useLightbox();
  const fine = useFinePointer();
  const [hover, setHover] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <div className="mt-40 md:mt-56">
      <div className="mb-12 flex items-end justify-between gap-6">
        <MaskLines as="h3" lines={["Certifications"]} className="display text-[clamp(2rem,4.2vw,3.8rem)]" />
        <p className="label pb-2 text-dim">{fine ? "Hover to preview · click to open" : "Tap to open"}</p>
      </div>

      <Stagger
        as="ul"
        gap={0.07}
        className="border-t border-white/[0.08]"
        onPointerMove={(e) => {
          x.set(e.clientX);
          y.set(e.clientY);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {certificates.map((c, i) => (
          <Item as="li" key={c.title} className="border-b border-white/[0.08]">
            <button
              type="button"
              onClick={() => open(certSlides, i)}
              onPointerEnter={() => fine && setHover(i)}
              onFocus={() => setHover(null)}
             
              aria-label={`${c.title}, ${c.org}, ${c.date}. Open certificate`}
              className="group relative grid w-full grid-cols-[2.25rem_1fr] items-baseline gap-x-4 gap-y-1 py-6 text-left md:grid-cols-[3rem_1fr_12rem_9rem] md:py-8"
            >
              <span className={`label transition-colors duration-500 ${hover === i ? "text-accent-strong" : "text-dim"}`}>{pad(i + 1)}</span>
              <span
                className={`text-[clamp(1.1rem,2vw,1.75rem)] leading-[1.2] tracking-tight transition-[color,transform] duration-700 ease-cine ${
                  hover === null ? "text-paper" : hover === i ? "translate-x-2 text-paper" : "text-paper/35"
                }`}
              >
                {c.title}
              </span>
              <span className="col-start-2 text-sm text-mute md:col-start-auto">{c.org}</span>
              <span className="label col-start-2 text-dim md:col-start-auto md:text-right">{c.date}</span>
            </button>
          </Item>
        ))}
      </Stagger>

      {fine && <FloatingPreview cert={hover !== null ? certificates[hover] : null} x={x} y={y} />}
    </div>
  );
}

/** Education as a story: the university first, then where it started, drawn as a line. */
export default function Education() {
  const u = education.university;
  const line = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: line, offset: ["start 0.8", "end 0.6"] });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  const record = [
    { k: "Degree", v: u.degree },
    { k: "Years", v: u.years },
    { k: "Minor", v: u.minor },
    { k: "Coursework", v: u.coursework.join(", ") },
  ];

  return (
    <section id="education" aria-labelledby="education-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="education" label="Education" note="2019 — 2027" />

        <Reveal from="none" className="label mb-6 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
          <span className="text-paper">{u.status}</span>
          <span className="text-dim">— {u.years}</span>
        </Reveal>
        <MaskLines
          as="h3"
          lines={["Lovely Professional", "University."]}
          className="display text-[clamp(2.6rem,7.4vw,7.6rem)]"
        />

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
          <Stagger as="dl" className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7" gap={0.1}>
            {record.map((r) => (
              <Item key={r.k} className="border-t border-white/[0.08] pt-4">
                <dt className="label mb-2 text-dim">{r.k}</dt>
                <dd className="text-paper/85">{r.v}</dd>
              </Item>
            ))}
          </Stagger>
          <Reveal from="none" delay={0.2} className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-white/[0.08] pt-4">
              <p className="label mb-3 text-dim">CGPA</p>
              <p className="display text-[clamp(3.4rem,6vw,5.6rem)] tabular-nums">
                {u.cgpa}
                <span className="editorial ml-2 text-[0.4em] text-mute">/ {u.scale}</span>
              </p>
            </div>
          </Reveal>
        </div>

        {/* where it started: a line draws down through the earlier chapters */}
        <div ref={line} className="relative mt-32 pl-8 md:mt-44 md:pl-0">
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-white/[0.08] md:left-[25%]" />
          <motion.span
            aria-hidden="true"
            style={reduce ? undefined : { scaleY: draw }}
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-paper/50 md:left-[25%]"
          />
          <p className="label mb-12 text-dim md:pl-[calc(25%+2.5rem)]">Before university</p>
          <ol className="space-y-16">
            {education.schools.map((s) => (
              <li key={s.title} className="relative grid gap-3 md:grid-cols-[25%_1fr]">
                <span aria-hidden="true" className="absolute -left-8 top-2 h-2 w-2 -translate-x-1/2 rounded-full border border-paper/60 bg-ink md:left-[25%]" />
                <Reveal from="none" className="label text-mute md:pr-10 md:pt-2 md:text-right">
                  {s.years}
                </Reveal>
                <Reveal from="left" distance={0.25} className="md:pl-10">
                  <h4 className="text-[clamp(1.4rem,2.4vw,2.2rem)] font-medium tracking-tight">{s.title}</h4>
                  <p className="mt-2 text-mute">{s.place}</p>
                  <p className="label mt-3 text-dim">{s.details}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <Certifications />
      </div>
    </section>
  );
}
