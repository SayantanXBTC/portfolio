import { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { experience } from "../../data/portfolio";
import { usePointerParallax } from "../../hooks/usePointerParallax";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { MaskLines } from "../kit/Text";
import { useLightbox } from "../kit/Lightbox";

/** Two photographs that arrive into the frame, then answer the cursor at different depths. */
function PhotoPair({ photos }) {
  const ref = useRef(null);
  const { open } = useLightbox();
  const { x, y } = usePointerParallax(ref);
  const nearX = useTransform(x, [-1, 1], [-10, 10]);
  const nearY = useTransform(y, [-1, 1], [-8, 8]);
  const farX = useTransform(x, [-1, 1], [16, -16]);
  const farY = useTransform(y, [-1, 1], [12, -12]);
  const [main, second] = photos;
  const gallery = photos.map((p) => ({ src: p.src, alt: p.alt }));

  return (
    <div ref={ref} className="relative grid grid-cols-12 items-end gap-4 md:gap-0">
      <motion.figure style={{ x: nearX, y: nearY }} className="col-span-12 md:col-span-8">
        <ClipReveal
          from="left"
          duration={1.8}
          scaleFrom={1.08}
          amount={0.25}
          className="relative aspect-[16/10] overflow-hidden bg-ink-800"
          innerClassName="h-full w-full"
        >
          <button
            type="button"
            onClick={() => open(gallery, 0)}
           
            aria-label={`Open photo: ${main.alt}`}
            className="group block h-full w-full"
          >
            <img
              src={main.src}
              alt={main.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1600ms] ease-cine group-hover:scale-[1.03]"
            />
          </button>
        </ClipReveal>
        <figcaption className="label mt-3 text-dim">Fig. — {main.caption}</figcaption>
      </motion.figure>

      {second && (
        <motion.figure
          style={{ x: farX, y: farY }}
          className="relative z-10 col-span-7 col-start-6 md:col-span-4 md:col-start-auto md:-ml-[12%] md:mb-[-10%]"
        >
          <ClipReveal
            from="up"
            delay={0.45}
            duration={1.6}
            scaleFrom={1.08}
            amount={0.25}
            className="relative aspect-[4/5] overflow-hidden bg-ink-800 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
            innerClassName="h-full w-full"
          >
            <button
              type="button"
              onClick={() => open(gallery, 1)}
             
              aria-label={`Open photo: ${second.alt}`}
              className="group block h-full w-full"
            >
              <img
                src={second.src}
                alt={second.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[1600ms] ease-cine group-hover:scale-[1.04]"
              />
            </button>
          </ClipReveal>
          <figcaption className="label mt-3 text-dim">Fig. — {second.caption}</figcaption>
        </motion.figure>
      )}
    </div>
  );
}

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
            <PhotoPair photos={item.photos} />
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
            <ol className="mt-10 border-t border-white/[0.08]">
              {item.points.map((p, i) => (
                <li key={p} className="flex gap-5 border-b border-white/[0.08] py-4 text-sm text-paper/80 md:text-[0.95rem]">
                  <span className="label mt-1 text-dim">{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </li>
              ))}
            </ol>
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
    <dl className="space-y-6">
      <div>
        <dt className="label mb-2 text-dim">Outcome</dt>
        <dd className="text-paper/85">{item.impact}</dd>
      </div>
      <div>
        <dt className="label mb-3 text-dim">Practice</dt>
        <dd className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-mute">
          {item.tech.map((t, i) => (
            <span key={t}>
              {t}
              {i < item.tech.length - 1 && <span className="ml-4 text-dim">/</span>}
            </span>
          ))}
        </dd>
      </div>
    </dl>
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
