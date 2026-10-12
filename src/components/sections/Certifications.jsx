import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { certificates } from "../../data/portfolio";
import { usePinnedLayout } from "../../hooks/useMedia";
import { scrollToY } from "../../lib/scroll";
import { EASE } from "../../lib/asset";
import { lightOf } from "../../lib/light";
import { SectionHeader } from "../kit/SectionHeader";
import { Arrow } from "../kit/Button";
import { useLightbox } from "../kit/Lightbox";

const pad = (n) => String(n).padStart(2, "0");
const N = certificates.length;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const slides = certificates.map((c) => ({
  src: c.image,
  alt: `${c.title} certificate`,
  caption: { title: c.title, meta: `${c.org} · ${c.date}`, points: c.points, link: c.link },
}));

const years = certificates.map((c) => Number(c.date.slice(-4)));
const span = `${Math.min(...years)} — ${Math.max(...years)}`;

const TOPICS = ["All", ...new Set(certificates.map((c) => c.topic))];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOf = (date) => {
  const [m, y] = date.split(" ");
  return Number(y) * 12 + MONTHS.indexOf(m);
};
const FIRST = Math.min(...certificates.map((c) => monthOf(c.date)));
const LAST = Math.max(...certificates.map((c) => monthOf(c.date)));

/** Topic chips: they narrow the gallery to one subject. */
function Filters({ topic, setTopic }) {
  return (
    <div className="flex flex-wrap justify-center gap-1 md:justify-start" role="radiogroup" aria-label="Filter certificates by topic">
      {TOPICS.map((t) => {
        const on = t === topic;
        const count = t === "All" ? N : certificates.filter((c) => c.topic === t).length;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setTopic(t)}
            className={`label relative rounded-full px-3 py-2 transition-colors duration-500 ${on ? "text-paper" : "text-dim hover:text-mute"}`}
          >
            {on && <motion.span layoutId="cert-topic" className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.05]" transition={{ duration: 0.5, ease: EASE }} />}
            <span className="relative">
              {t} <span className={on ? "text-accent-strong" : "text-dim"}>{count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** When each one was earned, on a line from the first month to the last. */
function Timeline({ items, active, goTo, setTopic }) {
  const spanM = Math.max(1, LAST - FIRST);
  const label = (m) => `${MONTHS[m % 12].slice(0, 3)} ${Math.floor(m / 12)}`;
  // certificates from the same month sit side by side, centred on their month
  const seenAt = {};
  const perMonth = {};
  certificates.forEach((c) => {
    const m = monthOf(c.date);
    perMonth[m] = (perMonth[m] ?? 0) + 1;
  });
  return (
    <div className="w-full" aria-label="When each certificate was earned">
      <div className="relative mx-4 h-8">
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
        {certificates.map((c) => {
          const m = monthOf(c.date);
          const k = (seenAt[m] = (seenAt[m] ?? -1) + 1);
          const i = items.indexOf(c);
          const on = i === active;
          const inList = i >= 0;
          return (
            <button
              key={c.title}
              type="button"
              onClick={() => (inList ? goTo(i) : setTopic("All"))}
              aria-label={`${c.title}, ${c.date}`}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5"
              style={{ left: `calc(${((m - FIRST) / spanM) * 100}% + ${(k - (perMonth[m] - 1) / 2) * 14}px)` }}
            >
              <span
                className={`block rounded-full transition-all duration-500 ease-cine ${
                  on ? "h-3 w-3 bg-accent-strong shadow-[0_0_14px_rgb(var(--accent-strong-rgb))]" : inList ? "h-2 w-2 bg-paper/70 group-hover:bg-paper" : "h-1.5 w-1.5 bg-white/20"
                }`}
              />
            </button>
          );
        })}
      </div>
      <div className="label mx-1 flex justify-between text-[0.58rem] text-dim">
        <span>{label(FIRST)}</span>
        <span>{label(LAST)}</span>
      </div>
    </div>
  );
}

/**
 * The gallery: the certificates hang on a wire in one soft line. The one in
 * the middle swings round to face you and lifts forward; the others stay
 * turned toward it, dimmer. Moving the line makes the prints sway on their
 * clips and settle, and a pool of light on the floor takes the colour of the
 * one in front.
 */
function Gallery({ items, pos, center, onOpen, goTo, drag, tall }) {
  const reduce = useReducedMotion();
  const stage = useRef(null);
  const cards = useRef([]);
  const shades = useRef([]);
  const [w, setW] = useState(900);
  const [h, setH] = useState(400);
  const seen = useInView(stage, { once: true, amount: 0.3 });
  const live = useInView(stage, { margin: "120px 0px 120px 0px" });
  const st = useRef({ last: null, v: 0, swing: {}, swingV: {}, colors: {}, glow: null, t0: 0 });

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => {
      setW(e.contentRect.width);
      setH(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // each certificate's light, worked out once
  useEffect(() => {
    if (!seen) return undefined;
    let alive = true;
    st.current.t0 = performance.now();
    Promise.all(certificates.map((c) => lightOf(c.preview ?? c.image))).then((list) => {
      if (!alive) return;
      certificates.forEach((c, i) => (st.current.colors[c.title] = list[i]));
    });
    return () => {
      alive = false;
    };
  }, [seen]);

  // card size: as large as the stage allows, leaving room for the neighbours
  const narrow = w < 640;
  const cardW = Math.max(160, Math.round(Math.min(w * (narrow ? 0.7 : 0.4), (h - 40) * 1.36 * 0.92)));
  const cardH = Math.round(cardW / 1.36);
  const near = cardW * (narrow ? 0.9 : 0.92); // distance to the first neighbour
  const far = cardW * (narrow ? 0.42 : 0.5); // and between the ones further out
  const wireY = 16;

  useEffect(() => {
    if (!live) return undefined;
    let raf;
    let lastNow = performance.now();
    const accentRgb = getComputedStyle(stage.current).getPropertyValue("--accent-rgb").trim().split(/\s+/).map(Number);
    const tick = (now) => {
      const dt = Math.max(0.001, Math.min(0.05, (now - lastNow) / 1000));
      lastNow = now;
      const s = st.current;
      const p = pos.get();
      // how fast the line is moving, in cards per second
      const raw = s.last === null ? 0 : (p - s.last) / dt;
      s.last = p;
      s.v += (raw - s.v) * Math.min(1, dt * 8);
      const since = seen ? (now - s.t0) / 1000 : 0;

      items.forEach((c, i) => {
        const el = cards.current[i];
        if (!el) return;
        const d = i - p;
        const ad = Math.abs(d);
        const side = Math.sign(d);
        const x = side * (Math.min(ad, 1) * near + Math.max(ad - 1, 0) * far);
        const rotY = reduce ? 0 : -clamp(d, -1.4, 1.4) * 38;
        const z = ad < 1 ? (1 - ad) * 90 - ad * 60 : -60 - (ad - 1) * 110;
        const scale = 1 - Math.min(ad, 2.5) * 0.07;

        // each print sways on its clips: pushed by the motion, pulled back by its weight
        const key = c.title;
        if (s.swing[key] === undefined) {
          s.swing[key] = 0;
          s.swingV[key] = 0;
        }
        let swing = 0;
        if (!reduce) {
          const want = clamp(-s.v * 7, -16, 16) + Math.sin((now / 1000) * 0.9 + i * 1.7) * 0.5;
          const k = 38 + (i % 3) * 7;
          s.swingV[key] += ((want - s.swing[key]) * k - s.swingV[key] * 4.2) * dt;
          s.swing[key] += s.swingV[key] * dt;
          swing = s.swing[key];
        }

        // they arrive one by one, dropping onto the wire
        const e = reduce ? 1 : clamp((since - 0.1 - i * 0.09) / 0.9, 0, 1);
        const drop = Math.pow(1 - e, 3) * -140;

        el.style.transform = `translate3d(${x}px, ${drop}px, ${z}px) rotateY(${rotY}deg) rotateZ(${swing}deg) scale(${scale})`;
        el.style.opacity = String(ad > 3.6 ? 0 : e * (1 - clamp(ad - 2.6, 0, 1)));
        el.style.zIndex = String(100 - Math.round(ad * 10));
        const shade = shades.current[i];
        if (shade) shade.style.opacity = String(clamp(ad * 0.5, 0, 0.75));
      });

      // the floor light drifts to the colour of the certificate in front
      const front = items[clamp(Math.round(p), 0, items.length - 1)];
      const want = (front && s.colors[front.title]) || accentRgb;
      if (!s.glow) s.glow = [...want];
      for (let k = 0; k < 3; k += 1) s.glow[k] += (want[k] - s.glow[k]) * Math.min(1, dt * 3);
      stage.current?.style.setProperty("--glow", s.glow.map(Math.round).join(" "));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, seen, items, near, far, pos, reduce]);

  const glow = (a) => `rgb(var(--glow, var(--accent-rgb)) / ${a})`;

  return (
    <div
      ref={stage}
      className={`relative w-full touch-pan-y select-none ${tall ? "h-[min(46svh,30rem)] min-h-[17rem]" : "h-[min(66vw,24rem)]"}`}
      style={{ perspective: 1500, perspectiveOrigin: "50% 30%" }}
      {...drag}
    >
      {/* the room: a faint glow on the wall behind the print in front, and its pool of light on the floor */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[6%] h-[84%] w-[64%] -translate-x-1/2" style={{ background: `radial-gradient(closest-side, ${glow(0.17)}, transparent)` }} />
        <div className="absolute -bottom-[8%] left-1/2 h-[24%] w-[min(72%,42rem)] -translate-x-1/2" style={{ background: `radial-gradient(closest-side, ${glow(0.55)}, ${glow(0.12)} 55%, transparent)` }} />
      </div>

      {/* the wire, sagging a little between the walls */}
      <svg aria-hidden="true" className="pointer-events-none absolute top-0 h-8" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ left: "-50vw", width: "calc(100% + 100vw)" }}>
        <path d="M0 3 Q50 7 100 3" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="absolute left-1/2 top-0 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
        {items.map((c, i) => (
          <div
            key={c.title}
            ref={(el) => (cards.current[i] = el)}
            className="absolute will-change-transform"
            style={{ width: cardW, left: -cardW / 2, top: wireY + 6, transformOrigin: "50% 0%", opacity: 0 }}
          >
            {/* the clips that hold it to the wire */}
            {[0.18, 0.82].map((f) => (
              <span
                key={f}
                aria-hidden="true"
                className="absolute -top-4 z-10 h-6 w-3.5 -translate-x-1/2 rounded-[3px] bg-gradient-to-b from-[#6a6a6e] to-[#2a2a2d] shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                style={{ left: `${f * 100}%` }}
              >
                <span className="absolute inset-x-[3px] top-1 h-px bg-white/35" />
              </span>
            ))}
            <button
              type="button"
              onClick={() => (i === center ? onOpen(i) : goTo(i))}
              aria-label={i === center ? `Open ${c.title} certificate` : `Show ${c.title}`}
              tabIndex={i === center ? 0 : -1}
              className="group relative block w-full rounded-[4px] bg-[#f4f2ee] p-[2.4%] text-left shadow-[0_40px_70px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)]"
            >
              <span className="relative block overflow-hidden rounded-[2px]" style={{ height: Math.round(cardH * 0.952) }}>
                <img src={c.image} alt="" draggable={false} loading="lazy" decoding="async" className="pointer-events-none h-full w-full object-cover" />
                {/* light catching the glass when it faces you */}
                {i === center && !reduce && (
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.5)_50%,transparent_65%)] transition-transform duration-[1200ms] ease-cine group-hover:translate-x-full" />
                )}
              </span>
              <span ref={(el) => (shades.current[i] = el)} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[4px] bg-ink opacity-0" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The words for the certificate in front. */
function Caption({ cert, index, total, onOpen }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={cert.title}
        className="mx-auto max-w-[46rem] text-center"
        initial="hidden"
        animate="show"
        exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.p
          className="label flex items-center justify-center gap-3"
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
        >
          <span className="tabular-nums text-paper">
            {pad(index + 1)} <span className="text-dim">/ {pad(total)}</span>
          </span>
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-paper/70">{cert.topic}</span>
        </motion.p>
        <span className="mt-3 block overflow-hidden pb-[0.1em]">
          <motion.h3
            className="display text-[clamp(1.35rem,2.4vw,2.2rem)] leading-[1.05]"
            variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 0.8, ease: EASE } } }}
          >
            {cert.title}
          </motion.h3>
        </span>
        <motion.p
          className="mt-2 text-[0.88rem] text-mute"
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
        >
          {cert.org} · {cert.date}
        </motion.p>
        <motion.ul
          className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-[0.82rem] text-paper/70 [@media(max-height:780px)]:hidden"
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
        >
          {cert.points.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-px w-3 bg-white/30" />
              {p}
            </li>
          ))}
        </motion.ul>
        <motion.div
          className="mt-4 flex justify-center gap-6 text-sm"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } }}
        >
          <button type="button" onClick={onOpen} className="link-underline pb-0.5 text-paper">
            View full size
          </button>
          <a href={cert.link} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5 pb-0.5 text-mute hover:text-paper">
            Open PDF <Arrow dir="up" />
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Certificates as a floating gallery. On large screens the section holds
 * still and the scroll slides the line of prints along; elsewhere you swipe
 * it. The certificate in front can be opened full size.
 */
export default function Certifications() {
  const { open } = useLightbox();
  const reduce = useReducedMotion();
  const pinned = usePinnedLayout() && !reduce;
  const outer = useRef(null);
  const [topic, setTopic] = useState("All");
  const items = useMemo(() => (topic === "All" ? certificates : certificates.filter((c) => c.topic === topic)), [topic]);
  const n = items.length;
  const target = useMotionValue(0);
  const pos = useSpring(target, { stiffness: 110, damping: 24, mass: 0.9 });
  const [center, setCenter] = useState(0);
  const onOpen = (i) => open(items.map((c) => slides[certificates.indexOf(c)]), i);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (pinned) target.set(clamp(p, 0, 1) * (n - 1));
  });
  useMotionValueEvent(pos, "change", (p) => setCenter(clamp(Math.round(p), 0, n - 1)));

  // a new filter: keep the place in the scroll (pinned) or start again at the first
  useEffect(() => {
    target.set(pinned ? clamp(scrollYProgress.get(), 0, 1) * (n - 1) : 0);
    setCenter((c) => clamp(c, 0, n - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, topic, pinned]);

  const goTo = (i) => {
    const k = clamp(i, 0, n - 1);
    if (!pinned) {
      target.set(k);
      return;
    }
    const el = outer.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (n > 1 ? k / (n - 1) : 0) * (el.offsetHeight - window.innerHeight));
  };

  // swipe or drag the line; a drag never counts as a click
  const dragRef = useRef(null);
  const swallow = useRef(false);
  const drag = {
    onPointerDown: (e) => {
      swallow.current = false;
      dragRef.current = { x: e.clientX, y: e.clientY, start: target.get(), t: performance.now(), moved: false, last: e.clientX, v: 0 };
    },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - d.y)) {
        d.moved = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
      if (!d.moved) return;
      const now = performance.now();
      d.v = (e.clientX - d.last) / Math.max(1, now - d.t);
      d.last = e.clientX;
      d.t = now;
      if (!pinned) target.set(clamp(d.start - dx / (e.currentTarget.clientWidth * 0.5), -0.35, n - 0.65));
    },
    onPointerUp: (e) => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d?.moved) return;
      swallow.current = true;
      const dx = e.clientX - d.x;
      if (pinned) {
        if (Math.abs(dx) > 40) goTo(center + (dx < 0 ? 1 : -1));
      } else {
        target.set(clamp(Math.round(target.get() - d.v * 1.2), 0, n - 1));
      }
    },
    onPointerCancel: () => {
      dragRef.current = null;
      if (!pinned) target.set(clamp(Math.round(target.get()), 0, n - 1));
    },
    onClickCapture: (e) => {
      if (!swallow.current) return;
      swallow.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };

  const nav =
    "grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-ink/70 text-paper transition-[color,background-color,border-color,opacity] duration-300 hover:border-paper hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-25";
  const safe = clamp(center, 0, n - 1);
  const cert = items[safe];

  const body = (
    <div
      className="flex w-full flex-col outline-none"
      tabIndex={0}
      role="group"
      aria-roledescription="certificate gallery"
      aria-label={`Certificate ${safe + 1} of ${n}: ${cert.title}. Use the arrow keys to move, Enter to open.`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") (e.preventDefault(), goTo(safe + 1));
        if (e.key === "ArrowLeft") (e.preventDefault(), goTo(safe - 1));
        if (e.key === "Enter" && e.target === e.currentTarget) (e.preventDefault(), onOpen(safe));
      }}
    >
      <div className="relative">
        <Gallery items={items} pos={pos} center={safe} onOpen={onOpen} goTo={goTo} drag={drag} tall={pinned} />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[120] flex -translate-y-1/2 justify-between">
          <button type="button" onClick={() => goTo(safe - 1)} disabled={safe === 0} aria-label="Previous certificate" className={`pointer-events-auto ${nav}`}>
            <Arrow dir="left" />
          </button>
          <button type="button" onClick={() => goTo(safe + 1)} disabled={safe === n - 1} aria-label="Next certificate" className={`pointer-events-auto ${nav}`}>
            <Arrow />
          </button>
        </div>
      </div>
      <div className="mt-6 md:mt-8">
        <Caption cert={cert} index={safe} total={n} onOpen={() => onOpen(safe)} />
      </div>
      {/* the quiet bar along the bottom: filters, and when each was earned */}
      <div className="mt-6 grid items-center gap-4 border-t border-white/[0.06] pt-4 md:mt-7 md:grid-cols-[auto_minmax(0,24rem)] md:justify-between">
        <Filters topic={topic} setTopic={setTopic} />
        <Timeline items={items} active={safe} goTo={goTo} setTopic={setTopic} />
      </div>
    </div>
  );

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="relative z-10 bg-ink">
      <div className="container-x pt-28 md:pt-36">
        <SectionHeader id="certifications" label="Certificates" note={`${N} certificates · ${span}`} />
      </div>

      {pinned ? (
        <div ref={outer} className="relative" style={{ height: `${100 + n * 55}vh` }}>
          <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pb-5 pt-20">
            <div className="container-x">{body}</div>
          </div>
        </div>
      ) : (
        <div className="container-x overflow-hidden pb-28 md:pb-40">{body}</div>
      )}
    </section>
  );
}
