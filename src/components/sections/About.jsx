import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { about, profile } from "../../data/portfolio";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { WordReveal } from "../kit/Text";
import { CountUp } from "../kit/CountUp";

function Portrait() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div ref={ref} className="relative">
      <ClipReveal from="right" className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink-800" innerClassName="h-full w-full">
        <motion.img
          src={profile.portrait}
          alt="Sayantan presenting at the National Youth Festival"
          loading="lazy"
          decoding="async"
          style={reduce ? undefined : { y, scale: 1.18 }}
          className="h-full w-full object-cover object-[50%_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-accent/10 mix-blend-multiply" />
      </ClipReveal>
      <Reveal from="up" delay={0.5} className="label mt-4 flex items-center justify-between text-dim">
        <span>National Youth Festival 2025</span>
        <span>{profile.location.split(",")[0]}</span>
      </Reveal>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative z-10 overflow-x-clip bg-ink py-28 md:py-44">
      <div className="container-x">
        <SectionHeader index="01" label="About" lines={["Engineer", "by method."]} watermark="ABOUT" />
        <h2 id="about-title" className="sr-only">
          About me
        </h2>

        <WordReveal
          text={about.statement}
          highlight={["reliable", "experimental"]}
          className="display max-w-[26ch] text-[clamp(1.9rem,4.6vw,4.6rem)] leading-[1.08] tracking-[-0.035em]"
        />

        <div className="mt-24 grid gap-14 md:mt-36 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-6">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} from="left" delay={i * 0.12} className="text-base leading-[1.75] text-mute md:text-[1.05rem]">
                {p}
              </Reveal>
            ))}

            <Reveal from="left" delay={0.2} className="pt-8">
              <p className="label mb-5 text-paper">Technical snapshot</p>
              <dl className="border-t border-white/10">
                {about.snapshot.map((row, i) => (
                  <Reveal
                    as="div"
                    key={row.label}
                    from="left"
                    distance={0.55}
                    delay={i * 0.1}
                    className="group grid grid-cols-[8.5rem_1fr] gap-4 border-b border-white/10 py-4 transition-colors duration-500 hover:bg-white/[0.02]"
                  >
                    <dt className="label pt-1 text-dim transition-colors duration-500 group-hover:text-accent-strong">{row.label}</dt>
                    <dd className="text-sm text-paper/90 md:text-base">{row.value}</dd>
                  </Reveal>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <Portrait />
          </div>
        </div>

        <dl className="mt-24 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:mt-36 lg:grid-cols-4">
          {about.stats.map((s, i) => (
            <Reveal
              as="div"
              key={s.label}
              from={i % 2 === 0 ? "left" : "right"}
              distance={0.6}
              delay={i * 0.1}
              className="bg-ink p-6 transition-colors duration-700 hover:bg-ink-700 md:p-9"
            >
              <dd className="display text-[clamp(2.1rem,3.6vw,3.8rem)] text-paper">
                <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
              </dd>
              <dt className="mt-4 text-sm text-paper">{s.label}</dt>
              <dd className="label mt-2 text-dim">{s.note}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
