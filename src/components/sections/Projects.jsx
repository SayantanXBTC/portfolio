import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { projects } from "../../data/portfolio";
import { usePinnedLayout } from "../../hooks/useMedia";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";

function ProjectLinks({ project }) {
  const cls =
    "group inline-flex items-center gap-3 border-b border-white/25 pb-1.5 text-sm text-paper transition-colors duration-500 hover:border-accent-strong";
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
        Source
        <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5 group-hover:translate-x-1">
          <Arrow dir="up" />
        </span>
      </a>
    </div>
  );
}

function Panel({ project, index, total, nextRef, innerRef, pinned }) {
  const reduce = useReducedMotion();
  const fallback = useRef(null);
  // As the next project slides over this one, this one recedes (scale + dim).
  const { scrollYProgress } = useScroll({ target: nextRef ?? fallback, offset: ["start end", "start start"] });
  const last = index === total - 1;
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const dim = useTransform(scrollYProgress, [0, 1], [1, 0.25]);
  const recede = pinned && !reduce && !last;

  const flip = index % 2 === 1; // alternate which side the image sits on
  const imgFrom = flip ? "right" : "left";
  const textFrom = flip ? "left" : "right";

  return (
    <div ref={innerRef} className="stack-panel border-t border-white/10 bg-ink">
      <motion.div
        style={recede ? { scale, opacity: dim, transformOrigin: "50% 100%" } : undefined}
        className="container-x flex h-full flex-col justify-center py-14 md:py-12"
      >
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
            <ClipReveal
              from={imgFrom}
              className="group relative aspect-[16/9] max-h-[52vh] w-full overflow-hidden rounded-sm border border-white/10 bg-ink-800 lg:aspect-auto lg:h-[52vh]"
              innerClassName="h-full w-full"
            >
              <img
                src={project.image}
                alt={`${project.title} screenshot`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-[1400ms] ease-cine group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent-strong transition-transform duration-[900ms] ease-cine group-hover:scale-x-100" />
            </ClipReveal>
          </div>

          <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
            <Reveal from={textFrom} className="mb-5 flex items-center gap-4">
              <span className="display text-5xl text-accent-strong md:text-6xl">{String(index + 1).padStart(2, "0")}</span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="label">{project.tag}</span>
            </Reveal>

            <Reveal from={textFrom} delay={0.08}>
              <h3 className="display text-[clamp(2rem,3.8vw,3.8rem)]">{project.title}</h3>
              {project.featured && <p className="label mt-3 text-accent-strong">Featured project</p>}
            </Reveal>

            <Reveal from={textFrom} delay={0.16} className="mt-5 text-sm leading-[1.7] text-mute md:text-base">
              {project.desc}
            </Reveal>

            <ul className="mt-6 hidden border-t border-white/10 md:block">
              {project.details.map((d, i) => (
                <Reveal
                  as="li"
                  key={d}
                  from={textFrom}
                  distance={0.45}
                  delay={0.2 + i * 0.07}
                  className="flex gap-3 border-b border-white/10 py-2.5 text-[0.82rem] text-paper/85"
                >
                  <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent-strong" />
                  {d}
                </Reveal>
              ))}
            </ul>

            <Reveal from="up" delay={0.3} className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="label rounded-full border border-white/12 px-3 py-1.5 text-mute">
                  {t}
                </span>
              ))}
            </Reveal>

            <Reveal from="up" delay={0.35} className="mt-7">
              <ProjectLinks project={project} />
            </Reveal>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const pinned = usePinnedLayout();
  const refs = useRef(projects.map(() => ({ current: null })));

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pb-20 pt-28 md:pb-28 md:pt-44">
        <SectionHeader
          index="03"
          label="Projects"
          lines={["Selected", "work."]}
          watermark="PROJECTS"
        >
          Five builds across 3D simulation, applied AI, full-stack and Java. Each one open source on GitHub.
        </SectionHeader>
        <h2 id="projects-title" className="sr-only">
          Projects
        </h2>
      </div>

      <div>
        {projects.map((p, i) => (
          <Panel
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
