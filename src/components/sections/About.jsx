import { about } from "../../data/portfolio";
import { SectionHeader } from "../kit/SectionHeader";
import { WordReveal } from "../kit/Text";
import { Stagger, Item } from "../kit/Stagger";

/**
 * About is read, not looked at: no photo here (the face belongs to the hero).
 * The statement lights up word by word, then the story arrives paragraph by
 * paragraph, then the technical snapshot row by row.
 */
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />

        <WordReveal
          text={about.statement}
          highlight={["reliable", "rigor."]}
          className="editorial max-w-[22ch] text-[clamp(2.2rem,5.4vw,5.6rem)] text-paper"
        />

        <div className="mt-28 grid gap-16 md:mt-40 lg:grid-cols-12 lg:gap-12">
          <Stagger className="space-y-10 lg:col-span-7" gap={0.18}>
            {about.paragraphs.map((p, i) => (
              <Item
                key={i}
                as="p"
                className={
                  i === 0
                    ? "text-[clamp(1.3rem,2vw,1.75rem)] leading-[1.55] text-paper/90"
                    : "text-[clamp(1.1rem,1.5vw,1.35rem)] leading-[1.7] text-mute"
                }
              >
                {p}
              </Item>
            ))}
          </Stagger>

          <div className="lg:col-span-4 lg:col-start-9 lg:pt-2">
            <Stagger gap={0.1} delay={0.2}>
              <Item as="p" kind="fade" className="label mb-5 text-paper">
                Technical snapshot
              </Item>
              <dl className="border-t border-white/[0.08]">
                {about.snapshot.map((row) => (
                  <Item
                    key={row.label}
                    kind="left"
                    className="group border-b border-white/[0.08] py-5 transition-colors duration-500 hover:bg-white/[0.015]"
                  >
                    <dt className="label mb-2 text-dim transition-colors duration-500 group-hover:text-accent-strong">{row.label}</dt>
                    <dd className="text-[1.05rem] text-paper/90">{row.value}</dd>
                  </Item>
                ))}
              </dl>
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
