import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { certificates, education } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";

function Certificate({ cert, index, open, onToggle }) {
  const from = index % 2 === 0 ? "left" : "right";
  return (
    <Reveal as="li" from={from} distance={0.7} delay={index * 0.05} className="group relative border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`cert-${index}`}
        className="relative flex w-full items-baseline gap-4 py-6 text-left md:gap-8 md:py-8"
      >
        <span className={`label w-7 shrink-0 transition-colors duration-500 ${open ? "text-accent-strong" : "text-dim"}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`display block text-[clamp(1.25rem,2.4vw,2.2rem)] leading-[1.1] transition-transform duration-700 ease-cine ${
              open ? "translate-x-2 text-paper" : "group-hover:translate-x-2"
            }`}
          >
            {cert.title}
          </span>
          <span className="mt-2 block text-sm text-mute">{cert.org}</span>
        </span>
        <span className="label hidden shrink-0 text-dim sm:block">{cert.date}</span>
        <span
          aria-hidden="true"
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-cine ${
            open ? "rotate-45 border-accent-strong bg-accent" : "border-white/15 group-hover:border-accent-strong"
          }`}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
            <path d="M6 1v10M1 6h10" />
          </svg>
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-accent-strong transition-transform duration-[900ms] ease-cine group-hover:scale-x-100"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`cert-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-8 pl-11 md:grid-cols-12 md:pl-[3.75rem]">
              <ul className="space-y-3 md:col-span-8">
                {cert.points.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.08, duration: 0.8, ease: EASE }}
                    className="flex gap-3 text-sm text-paper/85 md:text-base"
                  >
                    <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-accent-strong" />
                    {p}
                  </motion.li>
                ))}
              </ul>
              <div className="md:col-span-4 md:text-right">
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-3 border-b border-white/25 pb-1.5 text-sm text-paper transition-colors duration-500 hover:border-accent-strong"
                >
                  View certificate
                  <span className="transition-transform duration-500 ease-cine group-hover/link:-translate-y-0.5 group-hover/link:translate-x-1">
                    <Arrow dir="up" />
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

export default function Education() {
  const [open, setOpen] = useState(0);

  return (
    <section id="education" aria-labelledby="education-title" className="relative z-10 overflow-x-clip bg-ink py-28 md:py-44">
      <div className="container-x">
        <SectionHeader index="06" label="Education" lines={["Foundations", "& learning."]} watermark="EDUCATION" align="right" />
        <h2 id="education-title" className="sr-only">
          Education and certificates
        </h2>

        <ol className="border-t border-white/10">
          {education.map((e, i) => (
            <li key={e.title} className="group relative grid gap-4 border-b border-white/10 py-8 md:grid-cols-12 md:gap-10 md:py-12">
              <Reveal from="left" delay={i * 0.06} className="md:col-span-3">
                <p className="display text-[clamp(1.8rem,3.2vw,3rem)] text-paper/35 transition-colors duration-700 group-hover:text-accent-strong">
                  {e.years}
                </p>
              </Reveal>
              <Reveal from="right" delay={i * 0.06 + 0.08} className="md:col-span-7">
                <h3 className="display text-[clamp(1.5rem,2.8vw,2.6rem)]">{e.title}</h3>
                <p className="mt-3 text-mute">{e.place}</p>
                <p className="mt-2 text-sm text-paper/80">{e.details}</p>
              </Reveal>
              <Reveal from="right" delay={i * 0.06 + 0.16} className="md:col-span-2 md:text-right">
                <span
                  className={`label inline-block rounded-full border px-3.5 py-2 ${
                    e.status === "Current" ? "border-accent text-accent-strong" : "border-white/15 text-dim"
                  }`}
                >
                  {e.status}
                </span>
              </Reveal>
              <span
                aria-hidden="true"
                className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-accent-strong transition-transform duration-[1100ms] ease-cine group-hover:scale-x-100"
              />
            </li>
          ))}
        </ol>

        <div className="mt-28 md:mt-40">
          <Reveal from="left" className="mb-10 flex items-end justify-between gap-6">
            <h3 className="display text-[clamp(2rem,4.6vw,4.4rem)]">Certifications</h3>
            <span className="label pb-2 text-dim">{certificates.length} completed</span>
          </Reveal>
          <ul className="border-t border-white/10">
            {certificates.map((c, i) => (
              <Certificate key={c.title} cert={c} index={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
