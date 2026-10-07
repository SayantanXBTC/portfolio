import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { education } from "../../data/portfolio";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { MaskLines } from "../kit/Text";
import { Stagger, Item } from "../kit/Stagger";
import Certifications from "./Certifications";

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
