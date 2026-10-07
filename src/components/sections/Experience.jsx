import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { experience } from "../../data/portfolio";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { useLightbox } from "../kit/Lightbox";

function Entry({ item, index }) {
  const { open } = useLightbox();
  return (
    <article className="relative grid gap-6 pb-20 pl-8 md:grid-cols-12 md:gap-10 md:pb-32 md:pl-0">
      {/* node on the timeline */}
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-accent-strong bg-ink md:left-[calc(25%-1.25rem)] md:top-3"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="absolute inset-0.5 rounded-full bg-accent-strong" />
      </motion.span>

      <Reveal from="left" className="md:col-span-3 md:pr-10 md:text-right">
        <p className="label text-accent-strong">{item.year}</p>
        <p className="label mt-3 text-dim">{String(index + 1).padStart(2, "0")}</p>
      </Reveal>

      <div className="md:col-span-8 md:col-start-5">
        <Reveal from="right" delay={0.05}>
          <h3 className="display text-[clamp(1.9rem,4.2vw,3.6rem)]">{item.role}</h3>
          <p className="mt-3 text-lg text-mute">{item.org}</p>
        </Reveal>

        <Reveal from="right" delay={0.15} className="mt-8 max-w-2xl text-base leading-[1.75] text-mute">
          {item.summary}
        </Reveal>

        {item.points.length > 0 && (
          <ul className="mt-8 max-w-2xl border-t border-white/10">
            {item.points.map((p, i) => (
              <Reveal as="li" key={p} from="right" distance={0.5} delay={0.08 * i} className="flex gap-4 border-b border-white/10 py-4 text-sm text-paper/90 md:text-base">
                <span className="label mt-1.5 text-accent-strong">{String(i + 1).padStart(2, "0")}</span>
                {p}
              </Reveal>
            ))}
          </ul>
        )}

        <Reveal from="up" delay={0.1} className="mt-8 max-w-2xl border-l-2 border-accent bg-white/[0.025] p-5">
          <p className="label mb-2 text-accent-strong">Impact</p>
          <p className="text-paper">{item.impact}</p>
        </Reveal>

        <Reveal from="up" delay={0.15} className="mt-8 flex flex-wrap items-center gap-2">
          {item.tech.map((t) => (
            <span key={t} className="label rounded-full border border-white/12 px-3.5 py-2 text-mute transition-colors duration-500 hover:border-accent-strong hover:text-paper">
              {t}
            </span>
          ))}
        </Reveal>

        {item.gallery?.length > 0 && (
          <Reveal from="up" delay={0.2} className="mt-9">
            <button
              type="button"
              onClick={() => open(item.gallery, 0)}
              className="group inline-flex items-center gap-3 border-b border-white/25 pb-1.5 text-sm text-paper transition-colors duration-500 hover:border-accent-strong"
            >
              {item.galleryLabel}
              <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1.5">
                <Arrow />
              </span>
            </button>
          </Reveal>
        )}
      </div>
    </article>
  );
}

export default function Experience() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative z-10 overflow-x-clip bg-ink py-28 md:py-44">
      <div className="container-x">
        <SectionHeader index="02" label="Experience" lines={["Work that", "ships."]} align="right" watermark="EXPERIENCE" />
        <h2 id="experience-title" className="sr-only">
          Experience
        </h2>

        <div ref={ref} className="relative ml-1.5 md:ml-0">
          {/* track + progressive fill */}
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-white/10 md:left-[calc(25%-1.25rem)]" />
          <motion.span
            aria-hidden="true"
            style={reduce ? { transform: "scaleY(1)" } : { scaleY }}
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent-strong md:left-[calc(25%-1.25rem)]"
          />
          {experience.map((item, i) => (
            <Entry key={item.role} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
