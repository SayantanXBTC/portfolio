import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { projects } from "../../data/portfolio";
import { usePinnedLayout } from "../../hooks/useMedia";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { Stagger, Item } from "../kit/Stagger";

// Each chapter gets its own light: the same accent, placed somewhere new.
const LIGHT = ["18% 30%", "82% 24%", "24% 80%", "78% 76%", "50% 12%"];

function CaseLinks({ project }) {
  const cls =
    "group inline-flex items-center gap-3 border-b border-white/20 pb-1.5 text-sm text-paper transition-colors duration-500 hover:border-paper";
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3">
      {project.live && (
        <a href={project.live} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${project.title}: view live`}>
          View live
          <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5 group-hover:translate-x-1">
            <Arrow dir="up" />
          </span>
        </a>
      )}
      <a href={project.github} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${project.title}: source on GitHub`}>
        Source code
        <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5 group-hover:translate-x-1">
          <Arrow dir="up" />
        </span>
      </a>
    </div>
  );
}

function Case({ project, index, total, nextRef, innerRef, pinned }) {
  const reduce = useReducedMotion();
  const fallback = useRef(null);
  // As the next chapter rises, this one steps back into the dark.
  const { scrollYProgress } = useScroll({ target: nextRef ?? fallback, offset: ["start end", "start start"] });
  const last = index === total - 1;
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const dim = useTransform(scrollYProgress, [0, 1], [1, 0.2]);
  const lift = useTransform(scrollYProgress, [0, 1], ["0%", "-3%"]);
  const recede = pinned && !reduce && !last;
  const flip = index % 2 === 1;
  const n = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={innerRef}
      className="stack-panel border-t border-white/[0.08] bg-ink"
      style={{ backgroundImage: `radial-gradient(60% 55% at ${LIGHT[index % LIGHT.length]}, rgb(var(--accent-rgb) / 0.07), transparent 70%)` }}
    >
      <motion.article
        style={recede ? { scale, opacity: dim, y: lift, transformOrigin: "50% 0%" } : undefined}
        className="container-x flex h-full flex-col justify-center py-20 lg:py-12"
        aria-labelledby={`case-${index}`}
      >
        {/* case header */}
        <Reveal from="left" distance={0.3} className="label mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 md:mb-10">
          <span className="text-paper">Case {n}</span>
          <span className="text-dim">/ {String(total).padStart(2, "0")}</span>
          <span className="h-px w-10 bg-white/15" />
          <span>{project.tag}</span>
          {project.featured && <span className="text-accent-strong">Featured</span>}
          <span className="ml-auto text-dim">{project.live ? "Live · Open source" : "Open source"}</span>
        </Reveal>

        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
            <ClipReveal
              from="up"
              duration={1.6}
              scaleFrom={1.1}
              className="group relative w-full overflow-hidden bg-ink-800"
              innerClassName="w-full"
            >
              <a
                href={project.live ?? project.github}
                target="_blank"
                rel="noopener noreferrer"
               
                aria-label={`${project.title}: open ${project.live ? "live site" : "repository"}`}
                className="block w-full"
              >
                <img
                  src={project.image}
                  alt={`${project.title} interface`}
                  width={project.w}
                  height={project.h}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-[1600ms] ease-cine group-hover:scale-[1.035]"
                />
              </a>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
            </ClipReveal>
            <p className="label mt-3 flex justify-between text-dim">
              <span>Fig. {n} — {project.title}</span>
              <span className="hidden sm:inline">Interface</span>
            </p>
          </div>

          <Stagger className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`} gap={0.09} delay={0.15}>
            <Item as="h3" id={`case-${index}`} className="display text-[clamp(2.2rem,4.2vw,4.4rem)]">
              {project.title}
            </Item>
            <Item as="p" className="mt-6 body-copy">
              {project.desc}
            </Item>

            <dl className="mt-8 border-t border-white/[0.08] text-sm">
              <Item kind="left" className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-white/[0.08] py-3.5">
                <dt className="label pt-0.5 text-dim">Stack</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="rounded-full border border-white/12 px-2.5 py-0.5 text-[0.78rem] text-paper/80">
                      {t}
                    </span>
                  ))}
                </dd>
              </Item>
              <Item kind="left" className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-white/[0.08] py-3.5 [@media(max-height:800px)]:hidden">
                <dt className="label pt-0.5 text-dim">Highlights</dt>
                <dd>
                  <ul className="space-y-1.5 text-paper/75">
                    {project.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </dd>
              </Item>
            </dl>

            <Item kind="pop" className="mt-8">
              <CaseLinks project={project} />
            </Item>
          </Stagger>
        </div>
      </motion.article>
    </div>
  );
}

/** Selected work: each project is a chapter that takes the whole frame, then steps back. */
export default function Projects() {
  const pinned = usePinnedLayout();
  const refs = useRef(projects.map(() => ({ current: null })));

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pb-16 pt-36 md:pb-24 md:pt-52">
        <SectionHeader id="projects" label="Work" note="Selected case studies">
          <Reveal from="none" delay={0.3} duration={1.6} className="mt-10 max-w-xl body-copy">
            Builds across 3D simulation, applied AI, full-stack web and Java. Every one of them is open source.
          </Reveal>
        </SectionHeader>
      </div>

      <div>
        {projects.map((p, i) => (
          <Case
            key={p.title}
            project={p}
            index={i}
            total={projects.length}
            pinned={pinned}
            nextRef={refs.current[i + 1]}
            innerRef={(el) => {
              refs.current[i].current = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}
