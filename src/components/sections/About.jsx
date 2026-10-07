import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { about, profile } from "../../data/portfolio";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { WordReveal } from "../kit/Text";

function Portrait() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <figure ref={ref}>
      <ClipReveal
        from="up"
        duration={1.7}
        scaleFrom={1.12}
        className="relative aspect-[4/5] overflow-hidden bg-ink-800"
        innerClassName="h-full w-full"
      >
        <motion.img
          src={profile.portrait}
          alt="Portrait of Sayantan Bhattacharjee"
          loading="lazy"
          decoding="async"
          style={reduce ? undefined : { y, scale: 1.16 }}
          className="h-full w-full object-cover object-[45%_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      </ClipReveal>
    </figure>
  );
}

/** About: the only section that is read, not watched. Words light up as you scroll. */
export default function About() {
  const [lead, ...rest] = about.paragraphs;

  return (
    <section id="about" aria-labelledby="about-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />

        <WordReveal
          text={about.statement}
          highlight={["reliable", "rigor."]}
          className="editorial max-w-[24ch] text-[clamp(2rem,4.9vw,5rem)] text-paper"
        />

        <div className="mt-32 grid gap-16 md:mt-48 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Portrait />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-24">
            <Reveal from="none" duration={1.6} className="text-[clamp(1.15rem,1.6vw,1.45rem)] leading-[1.6] text-paper/90">
              {lead}
            </Reveal>
            <div className="mt-10 space-y-6">
              {rest.map((p, i) => (
                <Reveal key={i} from="none" delay={0.1 + i * 0.1} duration={1.6} className="body-copy">
                  {p}
                </Reveal>
              ))}
            </div>

            <div className="mt-20">
              <p className="label mb-5 text-paper">Technical snapshot</p>
              <dl className="border-t border-white/[0.08]">
                {about.snapshot.map((row) => (
                  <div
                    key={row.label}
                    className="group grid grid-cols-[8.5rem_1fr] gap-4 border-b border-white/[0.08] py-4 transition-colors duration-500 hover:bg-white/[0.015]"
                  >
                    <dt className="label pt-1 text-dim transition-colors duration-500 group-hover:text-paper">{row.label}</dt>
                    <dd className="text-sm text-paper/85 md:text-[0.95rem]">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
