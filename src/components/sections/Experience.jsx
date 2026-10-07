import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useSpring } from "framer-motion";
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
        </Reveal>
      )}
    </article>
  );
}

/** Experience: leadership, then engineering. */
export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="experience" label="Experience" note="Leadership · Engineering" />
        <div className="space-y-32 md:space-y-44">
          {experience.map((item, i) =>
            item.photos ? (
              <Leadership key={item.role} item={item} index={i} total={experience.length} />
            ) : (
              <div key={item.role} className="border-t border-white/[0.08] pt-16 md:pt-24">
                <Internship item={item} index={i} total={experience.length} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
