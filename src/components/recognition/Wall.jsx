import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { achievements } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { smoother } from "../../lib/camera";
import { useStageSize } from "../../hooks/useStageSize";
import { scrollToY } from "../../lib/scroll";
import { useLightbox } from "../kit/Lightbox";
import { useAccent } from "../../context/AccentContext";

const pad = (n) => String(n).padStart(2, "0");
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const r3 = (n) => Math.round(n * 1000) / 1000;
const rand = (i, n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
// The safelight is the site accent: change the accent and the whole room changes colour.
const SAFE = "var(--accent-rgb)";
// Scroll budget, in viewport heights: the safelight is already on when the reader
// arrives, each batch of prints gets its turn, then the room light comes on.
const T = { intro: 0.15, batch: 0.8, end: 0.9 };
const DEV = 0.5; // how long one print takes to develop, in viewport heights

/**
 * Where everything hangs, worked out for one viewport. The prints are set out
 * in order along as few lines as fit (beside the notes on a wide screen, above
 * them on a tall one), each batch kept together, at the largest size that fits.
 */
function layout(w, h, slides) {
  const portrait = h > w;
  const area = portrait ? { x0: w * 0.05, x1: w * 0.95, y0: h * 0.12, y1: h * 0.56 } : { x0: w * 0.38, x1: w * 0.96, y0: h * 0.14, y1: h * 0.9 };
  const areaW = area.x1 - area.x0;
  const HG = w * (portrait ? 0.015 : 0.018); // between prints of one batch
  const BG = w * 0.045; // between batches
  const peg = Math.round(Math.min(h * 0.03, portrait ? 18 : 26));
  const maxLines = portrait ? 4 : 3;
  let prints;
  let lines;
  for (let ih = Math.min(h * 0.36, w * 0.24); ; ih -= 4) {
    const m = Math.round(ih * 0.07);
    prints = slides.map((s, i) => {
      const iw = Math.round((ih * s.w) / s.h);
      return { i, owner: s.owner, k: s.k, m, W: iw + 2 * m, H: ih + 2 * m, rz: (rand(i, 3) - 0.5) * 2.4 };
    });
    lines = [[]];
    let lw = 0;
    for (const p of prints) {
      const g = lines[lines.length - 1];
      const add = p.W + (g.length ? (p.owner !== g[g.length - 1].owner ? BG : HG) : 0);
      if (g.length && lw + add > areaW) {
        lines.push([p]);
        lw = p.W;
      } else {
        g.push(p);
        lw += add;
      }
    }
    const need = lines.length * (ih + 2 * m + peg) + (lines.length - 1) * h * 0.03;
    if ((lines.length <= maxLines && need <= area.y1 - area.y0) || ih <= 40) break;
  }
  // each line centred in its band, sagging a little under the prints
  const pitch = (area.y1 - area.y0) / lines.length;
  const wires = lines.map((list, li) => {
    const total = list.reduce((s, p, n) => s + p.W + (n ? (p.owner !== list[n - 1].owner ? BG : HG) : 0), 0);
    const left = area.x0 + (areaW - total) / 2;
    const y = area.y0 + li * pitch + peg;
    const sag = Math.min(h * 0.012, 12);
    const x0 = Math.max(10, left - w * 0.05);
    const x1 = Math.min(w - 10, left + total + w * 0.05);
    const at = (x) => {
      const q = (x - (x0 + x1) / 2) / ((x1 - x0) / 2);
      return y + sag * (1 - q * q);
    };
    let x = left;
    list.forEach((p, n) => {
      if (n) x += p.owner !== list[n - 1].owner ? BG : HG;
      p.x = x;
      p.y = at(x + p.W / 2);
      x += p.W;
    });
    return { y, x0, x1, sag };
  });
  const sched = achievements.map((_, b) => ({ start: T.intro + b * T.batch }));
  const revealStart = T.intro + achievements.length * T.batch;
  return { w, h, portrait, prints, wires, sched, revealStart, total: revealStart + T.end, peg, area };
}

/**
 * Recognition, on the line. A darkroom wall under an amber safelight, every
 * print already pegged up as blank paper. As you scroll, each achievement's
 * batch develops in turn (shadows first, then the mid-tones, then the colour)
 * and steps forward while its notes are up. When the last batch is in, the
 * safelight goes off and the room light comes on over the whole archive.
 * Click any print to see the photograph in full.
 */
export default function Wall({ slides }) {
  const outer = useRef(null);
  const stageRef = useRef(null);
  const printRefs = useRef([]);
  const layerRefs = useRef([]);
  const lightRefs = useRef({});
  const cache = useRef(new Map());
  const { open } = useLightbox();
  const { accent } = useAccent();
  const title = useMemo(() => developTitle(accent.bright), [accent.bright]);
  const size = useStageSize();
  const room = useMemo(() => layout(size.w, size.h, slides), [size, slides]);
  const [view, setView] = useState({ batch: 0, count: 0, archive: false });
  const viewRef = useRef(view);
  const seen = useInView(outer, { once: true, margin: "-15% 0px" });
  const live = useInView(outer, { margin: "200px 0px 200px 0px" });
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  const set = (el, prop, value) => {
    if (!el) return;
    let c = cache.current.get(el);
    if (!c) cache.current.set(el, (c = {}));
    if (c[prop] !== value) {
      if (prop.startsWith("--")) el.style.setProperty(prop, value);
      else el.style[prop] = value;
      c[prop] = value;
    }
  };

  // everything the scroll drives, written straight to the elements
  const paint = (progress) => {
    const { prints, sched, revealStart, total, peg } = room;
    const t = progress * total;
    const lights = lightRefs.current;
    const safe = 1 - smoother(clamp01((t - revealStart) / 0.3));
    const white = smoother(clamp01((t - revealStart - 0.08) / 0.35));
    set(lights.safe, "opacity", String(r3(safe)));
    set(lights.lens, "opacity", String(r3(0.2 + 0.8 * safe)));
    set(lights.white, "opacity", String(r3(white)));
    set(lights.dark, "opacity", String(r3(0.5 - 0.42 * white)));
    set(stageRef.current, "--safe", String(r3(safe)));

    let count = 0;
    let batch = 0;
    sched.forEach((s, b) => {
      if (t >= s.start - 0.1) batch = b;
    });
    prints.forEach((p, i) => {
      const s = sched[p.owner];
      const dev = clamp01((t - (s.start + p.k * 0.07)) / DEV);
      if (dev > 0.5) count++;
      const a = smoother(clamp01(dev / 0.5));
      const b = smoother(clamp01((dev - 0.3) / 0.5));
      const c = smoother(clamp01((dev - 0.55) / 0.45));
      // the batch whose notes are up steps forward; once the room light is on, everything does
      const focus = smoother(clamp01((t - (s.start - 0.12)) / 0.18)) * (1 - smoother(clamp01((t - (s.start + T.batch - 0.12)) / 0.18)));
      const lift = focus * (1 - white);
      const lit = Math.max(lift, white);
      const el = printRefs.current[i];
      set(el, "transform", `translate3d(${r3(p.x)}px, ${r3(p.y - peg * 0.5 - 7 * lift)}px, 0) rotate(${r3(p.rz * (1 - 0.6 * lift))}deg) scale(${r3(1 + 0.05 * lift)})`);
      set(el, "zIndex", lift > 0.01 ? "2" : "1");
      const L = layerRefs.current[i];
      if (L) {
        set(L.a, "opacity", String(r3(a)));
        set(L.b, "opacity", String(r3(b)));
        set(L.c, "opacity", String(r3(c)));
        set(L.tint, "opacity", String(r3(0.18 * safe * (1 - 0.75 * c))));
        set(L.shade, "opacity", String(r3(0.55 * (1 - lit))));
      }
    });

    const archive = t >= revealStart + 0.08;
    const v = viewRef.current;
    if (v.batch !== batch || v.count !== count || v.archive !== archive) {
      viewRef.current = { batch, count, archive };
      setView(viewRef.current);
    }
  };
  const paintRef = useRef(paint);
  paintRef.current = paint;
  useMotionValueEvent(scrollYProgress, "change", (v) => live && paintRef.current(v));
  useEffect(() => {
    cache.current.clear();
    paintRef.current(scrollYProgress.get());
  }, [room, scrollYProgress]);

  const { w, h, prints, wires, portrait, peg, area } = room;
  const item = achievements[Math.min(view.batch, achievements.length - 1)];
  const archive = view.archive;
  const lampX = (area.x0 + area.x1) / 2;
  const goTo = (b) => {
    const top = outer.current.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (room.sched[b].start + 0.3) * window.innerHeight, { duration: 1.4 });
  };

  return (
    <div ref={outer} className="relative" data-live={live} style={{ height: `${(room.total + 1) * 100}vh` }}>
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden bg-[#0e0b0a]" style={{ "--safe": 1 }}>
        {/* ---------- the wall and its light ---------- */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: `${Math.round(w * 0.07)}px ${Math.round(w * 0.07)}px`,
          }}
        />
        {/* the safelight's pool down the wall */}
        <div
          ref={(el) => (lightRefs.current.safe = el)}
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `radial-gradient(60% 70% at ${(lampX / w) * 100}% 0%, rgb(${SAFE} /0.24), rgb(${SAFE} /0.07) 55%, transparent 80%)` }}
        />
        {/* the fixture it comes from */}
        <div aria-hidden="true" className="absolute top-0" style={{ left: lampX - 30, width: 60, height: 24 }}>
          <div className="absolute inset-0 rounded-b-[6px] bg-gradient-to-b from-[#2a2422] to-[#151110] shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
          <div
            ref={(el) => (lightRefs.current.lens = el)}
            className="absolute inset-x-[14%] bottom-[16%] top-[34%] rounded-[3px]"
            style={{ background: `radial-gradient(circle at 50% 40%, #fff3e8, rgb(${SAFE}) 60%, rgb(var(--accent-soft-rgb)))`, boxShadow: `0 0 18px rgb(${SAFE} /0.6)` }}
          />
        </div>
        {/* the room light, warm and even, once every print is up */}
        <div
          ref={(el) => (lightRefs.current.white = el)}
          aria-hidden="true"
          className="absolute inset-0"
          style={{ opacity: 0, background: "radial-gradient(70% 65% at 60% 25%, rgba(255,236,214,0.26), rgba(255,226,200,0.08) 60%, transparent)" }}
        />

        {/* ---------- the drying lines ---------- */}
        {wires.map((ln, li) => {
          const wd = ln.x1 - ln.x0;
          const ht = ln.sag + 8;
          return (
            <svg key={li} aria-hidden="true" width={wd} height={ht} viewBox={`0 0 ${wd} ${ht}`} className="absolute overflow-visible" style={{ left: ln.x0, top: ln.y - 4 }}>
              <path d={`M0 4 Q${wd / 2} ${4 + ln.sag * 2} ${wd} 4`} fill="none" stroke="rgba(230,210,200,0.5)" strokeWidth="1.2" />
              <circle cx="0" cy="4" r="3" fill="#3a3330" />
              <circle cx={wd} cy="4" r="3" fill="#3a3330" />
            </svg>
          );
        })}

        {/* ---------- the prints ---------- */}
        {prints.map((p) => {
          const s = slides[p.i];
          return (
            <div
              key={p.i}
              ref={(el) => (printRefs.current[p.i] = el)}
              className="absolute left-0 top-0"
              style={{ width: p.W, height: p.H + peg * 0.7, transformOrigin: "50% 0", willChange: "transform" }}
            >
              {/* the peg on the wire */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 block -translate-x-1/2 rounded-[2px] bg-gradient-to-b from-[#c9a27a] to-[#8a6a4b] shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                style={{ width: Math.max(6, Math.round(peg * 0.34)), height: peg }}
              >
                <span className="absolute inset-x-0 top-[42%] block h-[2px] bg-[#9aa0a6]" />
              </span>
              <motion.div
                className="absolute inset-x-0 bottom-0"
                style={{ top: peg * 0.7 }}
                initial={{ opacity: 0, y: -8 }}
                animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 1, delay: 0.15 + p.i * 0.06, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => open(slides, p.i)}
                  aria-label={`Open photo: ${s.alt}`}
                  className="group relative block h-full w-full rounded-[2px] bg-[#efe9df] shadow-[0_10px_26px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-cine hover:scale-[1.04] focus-visible:scale-[1.04]"
                  style={{ padding: p.m }}
                >
                  <span className="relative block h-full w-full overflow-hidden bg-[#f3eee6]">
                    {/* developing: the shadows come up first, then the mid-tones, then the colour */}
                    {[
                      ["a", "grayscale(1) contrast(2.4) brightness(1.45)"],
                      ["b", "grayscale(1) contrast(1.1) brightness(0.97)"],
                      ["c", "none"],
                    ].map(([key, filter]) => (
                      <img
                        key={key}
                        ref={(el) => {
                          layerRefs.current[p.i] = { ...layerRefs.current[p.i], [key]: el };
                        }}
                        src={s.src}
                        alt=""
                        draggable={false}
                        decoding="async"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ filter, opacity: 0 }}
                      />
                    ))}
                  </span>
                  {/* the safelight colours everything in the room, paper included */}
                  <span
                    ref={(el) => {
                      layerRefs.current[p.i] = { ...layerRefs.current[p.i], tint: el };
                    }}
                    className="pointer-events-none absolute inset-0 rounded-[2px]"
                    style={{ background: `rgb(${SAFE})`, opacity: 0 }}
                  />
                  {/* out of the light, a print falls back into the dark */}
                  <span
                    ref={(el) => {
                      layerRefs.current[p.i] = { ...layerRefs.current[p.i], shade: el };
                    }}
                    className="pointer-events-none absolute inset-0 rounded-[2px] bg-black transition-opacity duration-300"
                    style={{ opacity: 0 }}
                  />
                </button>
              </motion.div>
            </div>
          );
        })}

        {/* darkness at the edges that lifts as the room light comes up */}
        <div
          ref={(el) => (lightRefs.current.dark = el)}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 0.5, background: "radial-gradient(70% 65% at 60% 40%, rgba(5,5,5,0.1), #050505 95%)" }}
        />
        {/* the notes keep a quiet patch of dark behind them: the left on wide screens, the foot on tall ones */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute ${
            portrait ? "inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-ink via-ink/85 to-transparent" : "inset-y-0 left-0 w-[42%] bg-gradient-to-r from-ink/90 via-ink/55 to-transparent"
          }`}
        />
        {/* the frame's edges fade into the page above and below, so the room never starts on a hard line */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />

        {/* ---------- interface ---------- */}
        <div className="pointer-events-none absolute inset-0">
          <div className={`container-x flex h-full flex-col justify-between pt-24 md:pt-28 ${portrait ? "pb-6" : "pb-8"}`}>
            <div className="pointer-events-auto flex items-start justify-between gap-6">
              <ol className={`flex flex-wrap ${portrait ? "gap-1.5" : "gap-2"}`}>
                {achievements.map((a, b) => (
                  <li key={a.title}>
                    <button
                      type="button"
                      onClick={() => goTo(b)}
                      aria-current={b === view.batch && !archive ? "true" : undefined}
                      className={`label rounded-full border px-3.5 py-2 transition-colors duration-500 ${
                        b === view.batch && !archive ? "border-accent-strong/60 bg-accent-strong/10 text-paper" : "border-white/10 text-dim hover:text-mute"
                      }`}
                    >
                      {pad(b + 1)} <span className="ml-1 hidden md:inline">{a.short}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="label shrink-0 text-right text-dim">
                <p className="whitespace-nowrap text-paper">
                  Prints {pad(view.count)} <span className="text-dim">/ {pad(slides.length)}</span>
                </p>
                <p className="mt-2 hidden whitespace-nowrap min-[380px]:block">{archive ? (portrait ? "Tap a print" : "Click a print to see it") : "Scroll to develop"}</p>
              </div>
            </div>

            <div className={`pointer-events-auto ${portrait ? "w-full" : "max-w-[min(30rem,32vw)]"}`}>
              <AnimatePresence mode="wait">
                {archive ? (
                  <motion.div key="archive" initial="hidden" animate="show" exit="exit" variants={notes}>
                    <motion.p variants={develop} className="label flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#ffd9a6]" />
                      <span className="text-paper/80">Lights on</span>
                    </motion.p>
                    <motion.h3 variants={title} className="display mt-4 text-[clamp(1.6rem,3.2vw,3.2rem)]">
                      The whole archive.
                    </motion.h3>
                    <motion.p variants={develop} className="mt-4 text-[0.92rem] leading-[1.6] text-mute">
                      {slides.length} prints from {achievements.length} recognitions, drying on the line. {portrait ? "Tap" : "Click"} any of them to see the photograph in full.
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div key={view.batch} initial="hidden" animate="show" exit="exit" variants={notes}>
                    <motion.p variants={develop} className="label flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ background: `rgb(${SAFE})`, boxShadow: `0 0 12px rgb(${SAFE} /0.9)` }} />
                      <span className="text-accent-strong">{item.badge}</span>
                    </motion.p>
                    <span className="mt-3 block overflow-hidden pb-[0.1em]">
                      <motion.h3 variants={title} className={`display ${portrait ? "text-[clamp(1.45rem,6.4vw,2.2rem)]" : "text-[clamp(1.6rem,2.9vw,2.9rem)]"}`}>
                        {item.title}
                      </motion.h3>
                    </span>
                    <motion.dl variants={develop} className="mt-4 grid grid-cols-3 border-t border-white/10 pt-3">
                      {[
                        ["Year", item.year],
                        ["Role", item.role],
                        ["Where", item.where],
                      ].map(([k, v], n) => (
                        <div key={k} className={n ? "border-l border-white/10 pl-3" : "pr-3"}>
                          <dt className="label text-[0.58rem] text-dim">{k}</dt>
                          <dd className="mt-1.5 text-[0.8rem] leading-snug text-paper/90">{v}</dd>
                        </div>
                      ))}
                    </motion.dl>
                    <motion.p variants={develop} className={`mt-4 leading-[1.6] text-mute ${portrait ? "line-clamp-3 text-[0.84rem] [@media(max-height:620px)]:hidden" : "text-[0.9rem] [@media(max-height:820px)]:line-clamp-3"}`}>
                      {item.detail}
                    </motion.p>
                    <motion.p variants={develop} className={`mt-3 border-l pl-4 text-[0.88rem] text-paper/85 [@media(max-height:780px)]:hidden ${portrait ? "hidden" : ""}`} style={{ borderColor: `rgb(${SAFE})` }}>
                      {item.impact}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// The notes come up the way the prints do: out of the red, into focus.
const notes = {
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.45, ease: EASE } },
};
const develop = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};
// (the title starts in the safelight's colour, so it takes the accent as a plain value it can animate from)
const developTitle = (from) => ({
  hidden: { opacity: 0, y: 10, color: from },
  show: { opacity: 1, y: 0, color: "rgb(239,237,233)", transition: { duration: 1.4, ease: EASE } },
});
