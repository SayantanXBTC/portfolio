import { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { experience } from "../../data/portfolio";
import { usePointerParallax } from "../../hooks/usePointerParallax";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { MaskLines } from "../kit/Text";
import { useLightbox } from "../kit/Lightbox";
import { PhotoRow } from "../kit/PhotoRow";
import { Stagger, Item } from "../kit/Stagger";

/** A certificate shown as a document: small, slightly turned, readable on click. */
function DocumentCard({ doc }) {
  const ref = useRef(null);
  const { open } = useLightbox();
  const { x, y } = usePointerParallax(ref);
  const rotate = useTransform(x, [-1, 1], [-3.5, -0.5]);
  const lift = useTransform(y, [-1, 1], [-6, 6]);

  return (
    <div ref={ref}>
      <motion.div style={{ rotate, y: lift }} className="origin-bottom-left">
        <ClipReveal from="down" duration={1.6} scaleFrom={1.06} className="overflow-hidden bg-paper/5" innerClassName="w-full">
          <button
            type="button"
            onClick={() => open([{ src: doc.src, alt: doc.alt, caption: doc.caption }], 0)}
           
            aria-label={`Open ${doc.alt}`}
            className="block w-full"
          >
            <img src={doc.preview} alt={doc.alt} loading="lazy" decoding="async" className="w-full shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]" />
          </button>
        </ClipReveal>
      </motion.div>
      <p className="label mt-4 text-dim">Document — {doc.caption.title}</p>
    </div>
  );
}

function Chapter({ item, index, total }) {
  return (
    <article className={index ? "border-t border-white/[0.08] pt-10 md:pt-14" : ""}>
      {/* metadata: small */}
      <Reveal from="none" className="label flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-paper">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="text-dim">—</span>
        <span>{item.kind}</span>
        <span className="ml-auto text-dim">{item.year}</span>
      </Reveal>

      {/* role: huge, org: editorial */}
      <MaskLines
        as="h3"
        lines={[item.role]}
        className="display mt-10 text-[clamp(3rem,11vw,10.5rem)] md:mt-14"
      />
      <Reveal from="left" distance={0.4} delay={0.2} className="editorial mt-3 text-[clamp(1.5rem,3vw,2.8rem)] text-paper/60">
        {item.org}
      </Reveal>

      {item.photos ? (
        <>
          <div className="mt-16 md:mt-24">
            <PhotoRow photos={item.photos} />
          </div>
          <div className="mt-20 grid gap-10 md:mt-32 md:grid-cols-12">
            <Reveal from="none" duration={1.6} className="text-[clamp(1.1rem,1.6vw,1.4rem)] leading-[1.6] text-paper/90 md:col-span-6">
              {item.summary}
            </Reveal>
            <div className="md:col-span-5 md:col-start-8">
              <Meta item={item} />
            </div>
          </div>
        </>
      ) : (
        <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-6">
            <Reveal from="none" duration={1.6} className="text-[clamp(1.1rem,1.6vw,1.4rem)] leading-[1.6] text-paper/90">
              {item.summary}
            </Reveal>
            <Stagger as="ol" className="mt-10 border-t border-white/[0.08]" gap={0.12}>
              {item.points.map((p, i) => (
                <Item as="li" kind="left" key={p} className="flex gap-5 border-b border-white/[0.08] py-4 text-sm text-paper/80 md:text-[0.95rem]">
                  <span className="label mt-1 text-dim">{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </Item>
              ))}
            </Stagger>
            <div className="mt-10">
              <Meta item={item} />
            </div>
          </div>
          {item.document && (
            <div className="md:col-span-5 md:col-start-8 md:pt-6">
              <DocumentCard doc={item.document} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Meta({ item }) {
  return (
    <Stagger as="dl" className="space-y-6" gap={0.12}>
      <Item>
        <dt className="label mb-2 text-dim">Outcome</dt>
        <dd className="text-paper/85">{item.impact}</dd>
      </Item>
      <Item>
        <dt className="label mb-3 text-dim">Practice</dt>
        <dd>
          <Stagger className="flex flex-wrap gap-2" gap={0.06} delay={0.2}>
            {item.tech.map((t) => (
              <Item key={t} kind="pop" as="span" className="rounded-full border border-white/12 px-3.5 py-1.5 text-sm text-mute transition-colors duration-500 hover:border-paper/50 hover:text-paper">
                {t}
              </Item>
            ))}
          </Stagger>
        </dd>
      </Item>
    </Stagger>
  );
}

/** Experience reads as chapters: metadata, a huge role, the photograph, then the story. */
export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="experience" label="Experience" note="Leadership · Engineering" />
        <div className="space-y-36 md:space-y-56">
          {experience.map((item, i) => (
            <Chapter key={item.role} item={item} index={i} total={experience.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
