import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { experience } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { MaskLines } from "../kit/Text";
import { useLightbox } from "../kit/Lightbox";
import { Stagger, Item } from "../kit/Stagger";

const pad = (n) => String(n).padStart(2, "0");

/** Leans its contents toward the pointer, like picking something up to look at it. */
function useLean(strength = 10) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 140, damping: 16 });
  const ry = useSpring(0, { stiffness: 140, damping: 16 });
  const on = fine && !reduce;
  return {
    style: { rotateX: rx, rotateY: ry, transformPerspective: 1400 },
    handlers: {
      onPointerMove: (e) => {
        if (!on) return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * strength);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * strength * 0.8);
      },
      onPointerLeave: () => {
        rx.set(0);
        ry.set(0);
      },
    },
  };
}

function Tags({ tech }) {
  return (
    <Stagger className="flex flex-wrap gap-2" gap={0.05}>
      {tech.map((t) => (
        <Item key={t} kind="pop" as="span" className="rounded-full border border-white/15 px-3 py-1 text-[0.8rem] text-mute transition-colors duration-500 hover:border-paper/50 hover:text-paper">
          {t}
        </Item>
      ))}
    </Stagger>
  );
}

function Heading({ item, index, total }) {
  return (
    <>
      <Reveal from="none" className="label flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-paper">
          {pad(index + 1)} / {pad(total)}
        </span>
        <span className="h-px w-8 bg-accent-strong" />
        <span>{item.kind}</span>
        <span className="text-dim">· {item.year}</span>
      </Reveal>
      <MaskLines as="h3" lines={[item.role]} className="display mt-6 text-[clamp(2.4rem,4.8vw,4.6rem)]" />
      <Reveal from="left" distance={0.3} delay={0.15} className="editorial mt-2 text-[clamp(1.25rem,2vw,1.9rem)] text-paper/55">
        {item.org}
      </Reveal>
    </>
  );
}

/**
 * The club's photographs as a pair of prints. They lean toward the pointer and
 * fan apart; click the one behind to bring it forward, click the one in front
 * to see it full size. On touch: tap to bring forward, tap again to open.
 */
function Prints({ photos }) {
  const { open } = useLightbox();
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef(null);
  const entered = useInView(ref, { once: true, amount: 0.35 });
  const [front, setFront] = useState(0);
  const [spread, setSpread] = useState(false);
  const lean = useLean(12);
  const slides = photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption ? { title: p.caption, meta: "" } : undefined }));

  // where each print rests, depending on whether it is in front and whether the pair is fanned
  const place = (i) => {
    const isFront = i === front;
    const side = i === 0 ? -1 : 1;
    if (reduce) return { x: `${side * 6}%`, y: isFront ? "4%" : "-4%", rotate: 0, scale: isFront ? 1 : 0.94 };
    return {
      x: `${side * (spread ? 15 : 7)}%`,
      y: isFront ? "5%" : "-5%",
      rotate: side * (spread ? 6 : 3),
      scale: isFront ? 1 : 0.92,
    };
  };

  return (
    <div ref={ref} className="relative">
      <motion.div
        className="relative mx-auto aspect-[1.32] w-full"
        style={lean.style}
        onPointerEnter={() => fine && setSpread(true)}
        onPointerLeave={(e) => {
          lean.handlers.onPointerLeave(e);
          if (fine) setSpread(false);
        }}
        onPointerMove={lean.handlers.onPointerMove}
      >
        {photos.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            aria-label={i === front ? `Open photo: ${p.alt}` : `Bring forward: ${p.alt}`}
            className="absolute inset-x-[9%] top-[8%] origin-center"
            style={{ zIndex: i === front ? 2 : 1 }}
            initial={reduce ? false : { opacity: 0, y: "18%", rotate: 0, scale: 0.9 }}
            animate={entered || reduce ? { opacity: 1, ...place(i) } : { opacity: 0, y: "18%", rotate: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 17, delay: entered && !spread ? i * 0.12 : 0 }}
            onClick={() => (i === front ? open(slides, i) : setFront(i))}
          >
            <span
              className={`block bg-paper p-1.5 transition-[box-shadow,filter] duration-500 md:p-2.5 ${
                i === front ? "shadow-[0_50px_90px_-35px_rgba(0,0,0,0.95)]" : "shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] brightness-[0.7] hover:brightness-90"
              }`}
            >
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} className="block h-auto w-full" />
            </span>
          </motion.button>
        ))}
      </motion.div>
      <div className="mt-4 flex items-center justify-center gap-4">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setFront(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-pressed={i === front}
            className="group py-2"
          >
            <span className={`block h-[3px] rounded-full transition-all duration-500 ${i === front ? "w-10 bg-accent-strong" : "w-5 bg-white/20 group-hover:bg-white/40"}`} />
          </button>
        ))}
        <span className="label text-dim">{fine ? "Click the back photo to bring it forward" : "Tap a photo to bring it forward"}</span>
      </div>
    </div>
  );
}

/** The internship certificate as a document you can pick up and tilt; click to read it. */
function Certificate({ doc }) {
  const { open } = useLightbox();
  const lean = useLean(14);
  return (
    <figure>
      <motion.button
        type="button"
        onClick={() => open([{ src: doc.src, alt: doc.alt, caption: doc.caption }], 0)}
        aria-label={`Open ${doc.alt}`}
        className="group block w-full"
        style={lean.style}
        {...lean.handlers}
      >
        <span className="block -rotate-2 bg-white p-1 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)] transition-transform duration-700 ease-cine group-hover:rotate-0 group-hover:scale-[1.02] motion-reduce:rotate-0">
          <img src={doc.src} alt={doc.alt} loading="lazy" decoding="async" draggable={false} className="block h-auto w-full" />
        </span>
      </motion.button>
      <figcaption className="label mt-5 flex items-center justify-between text-dim">
        <span>
          {doc.caption.title} · {doc.caption.meta}
        </span>
        <span className="text-mute">Click to read ↗</span>
      </figcaption>
    </figure>
  );
}

/**
 * What the internship work looks like in motion: requests from many threads
 * queue through a pool of reused JDBC connections into the database, while
 * the unit, integration and concurrency suites run and pass underneath.
 */
function PoolDiagram() {
  const lanes = [46, 80, 114];
  const slots = [40, 66, 92, 118];
  return (
    <figure className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 md:p-5" aria-label="Diagram: requests from many threads share a pool of database connections; test suites run and pass.">
      <svg viewBox="0 0 480 160" className="block h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="pool-wire" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.18)" />
          </linearGradient>
        </defs>
        {/* threads */}
        <text x="14" y="22" className="fill-[#7d7a75] font-mono text-[9px] uppercase tracking-[0.18em]">Requests</text>
        {lanes.map((y, i) => (
          <g key={y}>
            <rect x="14" y={y - 9} width="92" height="18" rx="9" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <text x="26" y={y + 3} className="fill-[#a19e99] text-[8px]">Request {i + 1}</text>
            <line x1="106" y1={y} x2="186" y2={80} stroke="url(#pool-wire)" />
            <circle cx="106" cy={y} r="3.2" className="pool-packet fill-[rgb(var(--accent-strong-rgb))]" style={{ "--px": "80px", "--py": `${80 - y}px`, animationDelay: `${i * 0.55}s` }} />
          </g>
        ))}
        {/* the pool */}
        <text x="190" y="22" className="fill-[#7d7a75] font-mono text-[9px] uppercase tracking-[0.18em]">Connection pool</text>
        <rect x="186" y="32" width="104" height="96" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
        {slots.map((y, i) => (
          <rect key={y} x="200" y={y - 6} width="76" height="12" rx="6" className="pool-slot fill-[rgb(var(--accent-strong-rgb))]" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        <line x1="290" y1="80" x2="370" y2="80" stroke="url(#pool-wire)" />
        <circle cx="290" cy="80" r="3.2" className="pool-packet fill-paper" style={{ "--px": "80px", "--py": "0px", animationDelay: "0.3s" }} />
        <circle cx="290" cy="80" r="3.2" className="pool-packet fill-paper" style={{ "--px": "80px", "--py": "0px", animationDelay: "1.2s" }} />
        {/* the database */}
        <text x="374" y="22" className="fill-[#7d7a75] font-mono text-[9px] uppercase tracking-[0.18em]">Database</text>
        <g transform="translate(374 40)">
          <path d="M0 10 v60 a46 10 0 0 0 92 0 v-60" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.14)" />
          <ellipse cx="46" cy="10" rx="46" ry="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" />
          <path d="M0 32 a46 10 0 0 0 92 0 M0 52 a46 10 0 0 0 92 0" fill="none" stroke="rgba(255,255,255,0.08)" />
        </g>
      </svg>
      <ul className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4">
        {["Unit tests", "Integration tests", "Concurrency tests"].map((suite, i) => (
          <li key={suite} className="grid grid-cols-[8.5rem_1fr_1rem] items-center gap-3 text-[0.74rem] text-mute">
            <span>{suite}</span>
            <span className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
              <span className="suite-bar absolute inset-0 origin-left rounded-full bg-accent-strong" style={{ animationDelay: `${i * 0.5}s` }} />
            </span>
            <span className="suite-tick text-accent-strong" style={{ animationDelay: `${i * 0.5}s` }}>✓</span>
          </li>
        ))}
      </ul>
      <figcaption className="label mt-4 text-[0.58rem] text-dim">Illustration · connection pooling and automated testing</figcaption>
    </figure>
  );
}

function Leadership({ item, index, total }) {
  return (
    <article className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <Heading item={item} index={index} total={total} />
        <Reveal from="none" duration={1.4} className="mt-8 text-[clamp(1rem,1.3vw,1.18rem)] leading-[1.75] text-paper/85">
          {item.summary}
        </Reveal>
        <div className="mt-8">
          <Tags tech={item.tech} />
        </div>
      </div>
      <div className="lg:col-span-7">
        <Prints photos={item.photos} />
      </div>
    </article>
  );
}

function Internship({ item, index, total }) {
  return (
    <article className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        <Heading item={item} index={index} total={total} />
        <Reveal from="none" duration={1.4} className="mt-8 text-[clamp(1rem,1.3vw,1.18rem)] leading-[1.75] text-paper/85">
          {item.summary}
        </Reveal>
        <Stagger as="ol" className="mt-8 border-t border-white/[0.08]" gap={0.1}>
          {item.points.map((p, i) => (
            <Item
              as="li"
              kind="left"
              key={p}
              className="group relative flex gap-5 border-b border-white/[0.08] py-4 pl-1 text-[0.95rem] text-paper/75 transition-[color,padding] duration-500 ease-cine hover:pl-3 hover:text-paper"
            >
              <span aria-hidden="true" className="absolute inset-y-3 left-0 w-px origin-top scale-y-0 bg-accent-strong transition-transform duration-500 ease-cine group-hover:scale-y-100" />
              <span className="label mt-1 text-dim transition-colors duration-500 group-hover:text-accent-strong">{pad(i + 1)}</span>
              {p}
            </Item>
          ))}
        </Stagger>
        <div className="mt-8">
          <Tags tech={item.tech} />
        </div>
      </div>
      {item.document && (
        <Reveal from="right" distance={0.4} className="lg:col-span-6">
          <Certificate doc={item.document} />
          <PoolDiagram />
        </Reveal>
      )}
    </article>
  );
}

/** A point on the rail: lights up once the reader reaches its chapter. */
function Node({ label }) {
  const ref = useRef(null);
  const reached = useInView(ref, { margin: "0px 0px -45% 0px" });
  return (
    <div ref={ref} aria-hidden="true" className="absolute -left-8 top-1 md:-left-14">
      <span className={`absolute left-0 top-0 h-3 w-3 -translate-x-1/2 rounded-full border transition-all duration-700 ${reached ? "scale-100 border-accent-strong bg-accent-strong shadow-[0_0_18px_rgb(var(--accent-strong-rgb))]" : "scale-75 border-white/25 bg-ink"}`} />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

/** Experience: leadership, then engineering, along a rail that fills as you read. */
export default function Experience() {
  const list = useRef(null);
  const sectionRef = useRef(null);
  const live = useInView(sectionRef, { margin: "150px 0px 150px 0px" });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.6", "end 0.6"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const markerTop = useTransform(fill, (v) => `${v * 100}%`);

  return (
    <section ref={sectionRef} data-live={live} id="experience" aria-labelledby="experience-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="experience" label="Experience" note="Leadership · Engineering" />
        <div ref={list} className="relative pl-8 md:pl-14">
          {/* the rail, its fill, and a marker riding the fill */}
          <div aria-hidden="true" className="absolute bottom-0 left-0 top-1 w-px bg-white/10">
            <motion.div className="absolute inset-0 origin-top bg-gradient-to-b from-accent-strong via-accent-strong to-accent-strong/30" style={{ scaleY: reduce ? 1 : fill }} />
            {!reduce && (
              <motion.span className="absolute left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_14px_3px_rgb(var(--accent-strong-rgb)/0.8)]" style={{ top: markerTop }} />
            )}
          </div>
          <div className="space-y-32 md:space-y-44">
            {experience.map((item, i) =>
              item.photos ? (
                <div key={item.role} className="relative">
                  <Node label={item.year} />
                  <Leadership item={item} index={i} total={experience.length} />
                </div>
              ) : (
                <div key={item.role} className="relative border-t border-white/[0.08] pt-16 md:pt-24">
                  <div className="absolute left-0 top-16 md:top-24">
                    <Node label={item.year} />
                  </div>
                  <Internship item={item} index={i} total={experience.length} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
