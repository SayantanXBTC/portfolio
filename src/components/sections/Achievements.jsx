import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { achievements } from "../../data/portfolio";
import { useHorizontalPin } from "../../hooks/useMedia";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal, ClipReveal } from "../kit/Reveal";
import { useLightbox } from "../kit/Lightbox";

function Body({ item, index, horizontal }) {
  const { open } = useLightbox();
  const [lead, ...rest] = item.images;
  const from = horizontal ? "right" : index % 2 ? "right" : "left";

  return (
    <div className="grid h-full items-center gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <Reveal from={from} className="mb-6 flex items-center gap-4">
          <span className="label rounded-full border border-accent px-3.5 py-2 text-accent-strong">{item.badge}</span>
          <span className="label text-dim">{item.role}</span>
        </Reveal>
        <Reveal from={from} delay={0.08}>
          <h3 className="display text-[clamp(2.1rem,4.4vw,4.4rem)]">{item.title}</h3>
        </Reveal>
        <Reveal from={from} delay={0.16} className="mt-6 text-sm leading-[1.75] text-mute md:text-base">
          {item.detail}
        </Reveal>
        <Reveal from="up" delay={0.24} className="mt-7 border-l-2 border-accent bg-white/[0.025] p-5">
          <p className="label mb-2 text-accent-strong">Impact</p>
          <p className="text-paper">{item.impact}</p>
        </Reveal>
      </div>

      <div className="lg:col-span-7">
        <ClipReveal
          from={horizontal ? "right" : "up"}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-white/10 bg-ink-800 lg:aspect-auto lg:h-[50vh]"
          innerClassName="h-full w-full"
        >
          <button
            type="button"
            onClick={() => open(item.images, 0)}
            aria-label={`Open ${item.title} photo gallery`}
            className="block h-full w-full"
          >
            <img
              src={lead.src}
              alt={lead.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1400ms] ease-cine group-hover:scale-[1.05]"
            />
            <span className="label absolute bottom-4 left-4 rounded-full bg-ink/70 px-3.5 py-2 text-paper opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100">
              {item.images.length} {item.images.length === 1 ? "photo" : "photos"} · open
            </span>
          </button>
        </ClipReveal>

        {rest.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {rest.slice(0, 4).map((img, i) => (
              <Reveal key={img.src} from="right" distance={0.5} delay={0.1 + i * 0.08}>
                <button
                  type="button"
                  onClick={() => open(item.images, i + 1)}
                  aria-label={`Open photo ${i + 2} of ${item.images.length}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm border border-white/10"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-1000 ease-cine group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-ink/40 transition-opacity duration-500 group-hover:opacity-0" />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Achievements() {
  const horizontal = useHorizontalPin();
  const reduce = useReducedMotion();
  const outer = useRef(null);
  const n = achievements.length;
  const pin = horizontal && !reduce;

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.35 });
  const x = useTransform(smooth, [0, 1], ["0vw", `${-(n - 1) * 100}vw`]);
  const ghostX = useTransform(smooth, [0, 1], ["0vw", `${-(n - 1) * 46}vw`]);
  const bar = useTransform(smooth, [0, 1], [0, 1]);
  const counter = useTransform(smooth, (v) => String(Math.min(n, Math.floor(v * n * 0.999) + 1)).padStart(2, "0"));

  return (
    <section id="achievements" aria-labelledby="achievements-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pb-14 pt-28 md:pb-20 md:pt-44">
        <SectionHeader index="05" label="Achievements" lines={["Recognition", "earned."]} watermark="MOMENTS" />
        <h2 id="achievements-title" className="sr-only">
          Achievements
        </h2>
      </div>

      {pin ? (
        <div ref={outer} className="hpin-outer" style={{ height: `${n * 100}vh` }}>
          <div className="hpin-sticky">
            {/* oversized outline numeral drifting slower than the track = depth */}
            <motion.div
              aria-hidden="true"
              style={{ x: ghostX }}
              className="pointer-events-none absolute left-[4vw] top-1/2 flex -translate-y-1/2 whitespace-nowrap"
            >
              {achievements.map((a, i) => (
                <span key={a.title} className="stroke-text display w-[46vw] text-[34vw] leading-none opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              ))}
            </motion.div>

            <motion.div style={{ x }} className="relative flex h-full" >
              {achievements.map((a, i) => (
                <div key={a.title} className="h-full w-screen shrink-0">
                  <div className="container-x h-full pb-24 pt-6">
                    <Body item={a} index={i} horizontal />
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="container-x absolute inset-x-0 bottom-8 flex items-center gap-6">
              <p className="label text-paper">
                <motion.span>{counter}</motion.span>
                <span className="text-dim"> / {String(n).padStart(2, "0")}</span>
              </p>
              <div className="h-px flex-1 bg-white/10">
                <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-accent-strong" />
              </div>
              <p className="label hidden text-dim sm:block">Keep scrolling</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-x space-y-24 pb-28 md:space-y-32 md:pb-40">
          {achievements.map((a, i) => (
            <Body key={a.title} item={a} index={i} horizontal={false} />
          ))}
        </div>
      )}
    </section>
  );
}
