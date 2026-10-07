import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../../lib/asset";
import { useLightbox } from "./Lightbox";

const POP = [0.34, 1.25, 0.64, 1];

/**
 * A row of photographs at their natural aspect ratios: every photo shares one
 * height and keeps its full frame (nothing is cropped). When the row scrolls
 * into view the photos pop in one after another.
 */
export function PhotoRow({ photos, captions = true, gap = 0.16, className = "" }) {
  const { open } = useLightbox();
  const reduce = useReducedMotion();
  const gallery = photos.map((p) => ({ src: p.src, alt: p.alt }));

  return (
    <motion.div
      className={`flex flex-col gap-5 md:flex-row md:items-start md:gap-4 ${className}`}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {photos.map((p, i) => (
        <motion.figure
          key={p.src}
          className="min-w-0"
          style={{ flex: `${p.w / p.h} 1 0%` }}
          variants={{
            hidden: { opacity: 0, y: 60, scale: 0.9, clipPath: "inset(14% 6% 14% 6%)" },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              transition: { duration: 1.2, ease: POP, clipPath: { duration: 1.1, ease: EASE } },
            },
          }}
        >
          <button
            type="button"
            onClick={() => open(gallery, i)}
            aria-label={`Open photo: ${p.alt}`}
            className="group relative block w-full overflow-hidden bg-ink-800"
            style={{ aspectRatio: `${p.w} / ${p.h}` }}
          >
            <span className="block h-full w-full transition-transform duration-[1400ms] ease-cine group-hover:scale-[1.04]">
              <motion.img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                variants={{ hidden: { scale: 1.18 }, show: { scale: 1, transition: { duration: 1.8, ease: EASE } } }}
              />
            </span>
            <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
          </button>
          {captions && p.caption && <figcaption className="label mt-3 text-dim">Fig. {String(i + 1).padStart(2, "0")} — {p.caption}</figcaption>}
        </motion.figure>
      ))}
    </motion.div>
  );
}
