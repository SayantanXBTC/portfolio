import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { projects } from "../../data/portfolio";
import { usePinnedLayout, usePortrait } from "../../hooks/useMedia";
import { useStageSize } from "../../hooks/useStageSize";
import { EASE } from "../../lib/asset";
import { scrollToId } from "../../lib/scroll";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { PreviewVideo, useVideoClock } from "../work/PreviewVideo";
import { CountUp, ProjectLinks, WindowBar, hostOf } from "../work/parts";
import CaseStudy from "../work/CaseStudy";
import { Phone } from "../work/Phone";
import { useSwing } from "../work/swing";
import { buildRoute, cameraAt, project, smoother, toCamera, worldTransform } from "../work/flight";

// Each scene is this many viewports tall: one to arrive, the rest held on screen.
const LENGTH = 2.4;
const PIN = 1 / LENGTH;
const pad = (n) => String(n).padStart(2, "0");
const sceneId = (p) => `work-${p.slug}`;

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, delay: d, ease: EASE } }),
};

/** The five chapters at a glance; each one jumps to its scene. */
function ThroughLine({ onJump }) {
  const reduce = useReducedMotion();
  return (
    <motion.ol
      className="mt-16 grid gap-px sm:grid-cols-5 md:mt-24"
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ show: { transition: { staggerChildren: 0.12 } } }}
    >
      {projects.map((p, i) => (
        <motion.li key={p.slug} variants={rise} className="relative">
          <button
            type="button"
            onClick={() => onJump(i)}
            className="group relative block w-full pt-5 text-left sm:pr-4"
            aria-label={`Go to ${p.title}`}
          >
            <span className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
            <motion.span
              className="absolute left-0 top-0 h-px w-full origin-left"
              style={{ background: p.color }}
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, delay: 0.3, ease: EASE } } }}
            />
            {/* the recording's first frame, peeking out on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-0 mb-4 hidden w-full translate-y-3 overflow-hidden rounded-lg border border-white/10 opacity-0 shadow-2xl transition-all duration-500 ease-cine group-hover:translate-y-0 group-hover:opacity-100 sm:block"
            >
              <img src={p.poster} alt="" width={p.w} height={p.h} loading="lazy" className="block h-auto w-full" />
            </span>
            <span className="label flex items-center gap-2">
              <span className="text-paper">{pad(i + 1)}</span>
              <span className="h-1.5 w-1.5 rounded-full transition-transform duration-500 group-hover:scale-150" style={{ background: p.color }} />
            </span>
            <span className="label mt-4 block text-dim">{p.chapter}</span>
            <span className="mt-2 flex items-center justify-between gap-2 text-lg font-medium tracking-tight text-paper/80 transition-colors duration-500 group-hover:text-paper">
              {p.title}
              <span className="opacity-0 transition-all duration-500 ease-cine group-hover:translate-x-1 group-hover:opacity-100">
                <Arrow />
              </span>
            </span>
          </button>
        </motion.li>
      ))}
    </motion.ol>
  );
}

/** Timecode, the five-part reel (this scene's part fills with the recording) and a pause control. */
function Hud({ project, index, videoRef, playing, setPlaying, onJump }) {
  const progress = useMotionValue(0);
  const onProgress = useCallback((p) => progress.set(p), [progress]);
  const clock = useVideoClock(videoRef, onProgress);

  return (
    <div className="label flex items-center gap-4 text-dim md:gap-6">
      <span className="hidden shrink-0 xl:inline">
        Fig. {pad(index + 1)} — {hostOf(project.live)}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5" role="group" aria-label="Projects">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Go to ${p.title}`}
            aria-current={i === index ? "true" : undefined}
            className="group flex-1 py-2"
          >
            <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/10 transition-colors group-hover:bg-white/25">
              <motion.span
                className="absolute inset-0 origin-left rounded-full"
                style={{
                  background: p.color,
                  opacity: i === index ? 1 : 0.45,
                  scaleX: i < index ? 1 : i === index ? progress : 0,
                }}
              />
            </span>
          </button>
        ))}
      </div>
      <span className="shrink-0 tabular-nums text-paper/70">{clock}</span>
      <button
        type="button"
        onClick={() => setPlaying((v) => !v)}
        aria-label={playing ? `Pause the ${project.title} preview` : `Play the ${project.title} preview`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
      >
        {playing ? (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <rect x="3.5" y="2.5" width="3" height="11" rx="0.8" />
            <rect x="9.5" y="2.5" width="3" height="11" rx="0.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <path d="M4 2.5v11l9.5-5.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

/**
 * The desktop recording inside a browser window that has real depth: a back
 * plate behind the glass. It leans toward the pointer and swings when dragged.
 */
function BrowserWindow({ project, videoRef, playing, load = true, onOpen, beat, className = "" }) {
  const reduce = useReducedMotion();
  const { rotateX, rotateY, bind } = useSwing();

  return (
    <motion.div
      {...bind}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[14px] border border-white/[0.06] bg-[#0b0b0b]"
        style={{ transform: "translateZ(-26px)" }}
      />

      <div className="relative overflow-hidden rounded-[14px] border border-white/[0.12] bg-ink-800 shadow-[0_70px_140px_-50px_rgba(0,0,0,0.95)]">
        <WindowBar project={project} />
        <button
          type="button"
          onClick={onOpen}
          className="group relative block w-full cursor-pointer"
          aria-label={`Explore ${project.title}`}
        >
          <PreviewVideo project={project} videoRef={videoRef} playing={playing} load={load} />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-500 group-hover:bg-black/35">
            <span className="label flex translate-y-3 items-center gap-3 rounded-full bg-paper px-5 py-3 text-ink opacity-0 transition-all duration-500 ease-cine group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
              Explore project <Arrow />
            </span>
          </span>
          {/* one pass of light across the glass when the scene lands */}
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
              initial={{ x: "0%" }}
              animate={beat >= 1 ? { x: "400%" } : { x: "0%" }}
              transition={{ duration: beat >= 1 ? 1.8 : 0, delay: 0.3, ease: EASE }}
            />
          )}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * The two screens side by side, the desktop window and the phone, playing at
 * the same time. The scroll camera moves them together; each one can be
 * swung and clicked on its own. The phone stands on the outer edge.
 */
function Devices({ project, videoRef, playing, load = true, onOpen, beat, side, style }) {
  return (
    <motion.div
      style={{ ...style, transformStyle: "preserve-3d" }}
      className="relative flex items-center gap-[4%] will-change-transform"
    >
      {/* a coloured bloom behind both screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[12%] opacity-60"
        style={{ background: `radial-gradient(closest-side, ${project.color}, transparent)`, transform: "translateZ(-120px)" }}
      />
      <BrowserWindow
        project={project}
        videoRef={videoRef}
        playing={playing}
        load={load}
        onOpen={onOpen}
        beat={beat}
        className="min-w-0 flex-1"
      />
      <div className={`relative w-[27%] shrink-0 lg:w-[24%] ${side > 0 ? "order-last" : "order-first"}`} style={{ transformStyle: "preserve-3d" }}>
        <Phone project={project} playing={playing} load={load} onOpen={onOpen} beat={beat} />
      </div>
    </motion.div>
  );
}

/**
 * Title, descriptor, summary, numbers, stack and links, arriving in three beats.
 * `compact` is the phone-upright version: tighter, the summary held to three
 * lines, the stack left to the case study.
 */
function Copy({ project, index, beat, onOpen, compact = false }) {
  const reduce = useReducedMotion();
  const anim = (b) => ({ initial: reduce ? false : "hidden", animate: beat >= b ? "show" : "hidden" });
  const extra = project.tech.length - 6;

  return (
    <div>
      <motion.p variants={rise} {...anim(1)} className="label flex items-center gap-3">
        <span className="text-paper">{pad(index + 1)}</span>
        <span className="text-dim">/ {pad(projects.length)}</span>
        <span className="h-px w-8" style={{ background: project.color }} />
        <span>{project.chapter}</span>
      </motion.p>

      <h3 id={`${sceneId(project)}-title`} className={`display ${compact ? "mt-3 text-[clamp(2rem,9vw,3rem)]" : "mt-6 text-[clamp(2.6rem,5.4vw,5.6rem)]"}`}>
        <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            animate={reduce || beat >= 1 ? { y: "0%" } : { y: "110%" }}
            transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          >
            {project.title}
          </motion.span>
        </span>
      </h3>
      <motion.p variants={rise} custom={0.25} {...anim(1)} className={compact ? "mt-2 text-[0.85rem] font-medium" : "mt-4 text-[0.95rem] font-medium md:text-base"} style={{ color: project.color }}>
        {project.descriptor}
      </motion.p>

      <motion.p variants={rise} {...anim(2)} className={compact ? "mt-3 line-clamp-3 text-[0.88rem] leading-[1.6] text-mute" : "body-copy mt-6 max-w-[34rem]"}>
        {project.summary}
      </motion.p>

      <dl className={`grid grid-cols-3 gap-4 border-t border-white/[0.08] ${compact ? "mt-4 pt-4 [@media(max-height:700px)]:hidden" : "mt-8 pt-6"}`}>
        {project.stats.map((s, i) => (
          <motion.div key={s.label} variants={rise} custom={0.1 + i * 0.1} {...anim(2)}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-[clamp(1.15rem,1.9vw,1.75rem)] font-semibold leading-none tracking-tight text-paper">
              <CountUp value={s.value} start={beat >= 2} />
            </dd>
            <dd aria-hidden="true" className="mt-2 text-[0.75rem] leading-snug text-dim">
              {s.label}
            </dd>
          </motion.div>
        ))}
      </dl>

      <motion.ul variants={rise} {...anim(3)} className={`mt-6 flex-wrap gap-1.5 [@media(max-height:820px)]:hidden ${compact ? "hidden" : "flex"}`} aria-label="Stack">
        {project.tech.slice(0, 6).map((t) => (
          <li key={t} className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.75rem] text-paper/75">
            {t}
          </li>
        ))}
        {extra > 0 && <li className="px-1.5 py-0.5 text-[0.75rem] text-dim">+{extra}</li>}
      </motion.ul>

      <motion.div variants={rise} custom={0.12} {...anim(3)} className={`${compact ? "mt-5" : "mt-8"} flex flex-wrap items-center gap-2.5`}>
        <button
          type="button"
          onClick={onOpen}
          className="group inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-500 ease-cine hover:-translate-y-0.5"
          style={{ background: project.color, boxShadow: `0 18px 40px -18px ${project.color}` }}
        >
          Explore project
          <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1">
            <Arrow />
          </span>
        </button>
        <ProjectLinks project={project} />
      </motion.div>
    </div>
  );
}

/**
 * One project, one scene. On large screens it pins: the window arrives tilted
 * back like a screen being raised, settles flat while the story lands in
 * beats, drifts slowly while the recording plays, then tips away for the next.
 */
function Scene({ project, index, pinned, onOpen, onJump }) {
  const reduce = useReducedMotion();
  const cinematic = pinned && !reduce;
  const outer = useRef(null);
  const copyRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(!reduce);
  const [beat, setBeat] = useState(0);
  const side = index % 2 === 0 ? 1 : -1; // 1: window on the right
  const copySeen = useInView(copyRef, { once: true, amount: 0.25 });

  const { scrollYProgress: t } = useScroll({ target: outer, offset: ["start end", "end end"] });
  const beatAt = (v) => (v > PIN + 0.2 ? 3 : v > PIN + 0.07 ? 2 : v > PIN - 0.16 ? 1 : 0);
  useMotionValueEvent(t, "change", (v) => cinematic && setBeat(beatAt(v)));
  useEffect(() => {
    if (cinematic) setBeat(beatAt(t.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cinematic]);
  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);
  const shown = cinematic ? beat : reduce || copySeen ? 3 : 0;

  // scroll-driven camera
  const rx = useTransform(t, [0, PIN, PIN + 0.24, 0.88, 1], [32, 8, 0, 0, -14]);
  const ry = useTransform(t, [0, PIN, PIN + 0.24, 0.88, 1], [-26 * side, -8 * side, -3 * side, 4 * side, 10 * side]);
  const scale = useTransform(t, [0, PIN, PIN + 0.24, 0.88, 1], [0.72, 0.9, 1, 1.03, 0.88]);
  const lift = useTransform(t, [0, PIN, 0.88, 1], ["16%", "0%", "0%", "-6%"]);
  const fade = useTransform(t, [0.9, 1], [1, 0.25]);
  const ghostY = useTransform(t, [0, 1], ["35%", "-35%"]);
  const glow = useTransform(t, [0, PIN, 0.9, 1], [0, 1, 1, 0.2]);

  const device = (
    <div className="[perspective:1800px]">
      <Devices
        project={project}
        videoRef={videoRef}
        playing={playing}
        onOpen={onOpen}
        beat={shown}
        side={side}
        style={cinematic ? { rotateX: rx, rotateY: ry, scale, y: lift } : undefined}
      />
    </div>
  );
  const hud = (
    <Hud project={project} index={index} videoRef={videoRef} playing={playing} setPlaying={setPlaying} onJump={onJump} />
  );

  // Ambient light in the project's own colour, plus the recording's first frame, far behind.
  const backdrop = (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={cinematic ? { opacity: glow } : undefined}>
      {/* a 64px copy stretched to fill: the browser's smoothing does the blur for free */}
      <img src={project.posterTiny} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.14]" loading="lazy" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(55% 60% at ${side > 0 ? "70%" : "30%"} 50%, ${project.color}26, transparent 70%), linear-gradient(to bottom, #050505 0%, transparent 18%, transparent 82%, #050505 100%)`,
        }}
      />
      <motion.span
        className="stroke-text display absolute select-none text-[clamp(14rem,34vw,34rem)] leading-none"
        style={{ y: cinematic ? ghostY : 0, [side > 0 ? "right" : "left"]: "-1vw", top: "2%" }}
      >
        {pad(index + 1)}
      </motion.span>
    </motion.div>
  );

  if (!pinned) {
    return (
      <article id={sceneId(project)} ref={outer} aria-labelledby={`${sceneId(project)}-title`} className="relative border-t border-white/[0.06] py-24 md:py-32">
        {backdrop}
        <div className="container-x relative">
          <Reveal from="up" distance={0.6}>{device}</Reveal>
          <div className="mt-4">{hud}</div>
          <div ref={copyRef} className="mt-12 md:mt-16">
            <Copy project={project} index={index} beat={shown} onOpen={onOpen} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={sceneId(project)}
      ref={outer}
      aria-labelledby={`${sceneId(project)}-title`}
      className="relative"
      style={cinematic ? { height: `${LENGTH * 100}vh` } : undefined}
    >
      <div className={cinematic ? "sticky top-0 h-[100svh] overflow-hidden" : "relative min-h-[100svh]"}>
        {backdrop}
        <motion.div style={cinematic ? { opacity: fade } : undefined} className="container-x relative flex h-full min-h-[100svh] flex-col pb-6 pt-24">
          <div className="grid flex-1 grid-cols-12 items-center gap-12 xl:gap-16">
            <div ref={copyRef} className={`col-span-5 ${side > 0 ? "order-1" : "order-2"}`}>
              <Copy project={project} index={index} beat={shown} onOpen={onOpen} />
            </div>
            <div className={`col-span-7 ${side > 0 ? "order-2" : "order-1"}`}>{device}</div>
          </div>
          {hud}
        </motion.div>
      </div>
    </article>
  );
}

const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mixRgb = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const beatOf = (n) => (n > 0.97 ? 3 : n > 0.8 ? 2 : n > 0.55 ? 1 : 0);

// Dust hanging in the dark around the route. It is what makes the camera feel
// like it is moving through space rather than the scenes sliding past.
function makeDust(w, count = 340) {
  let seed = 20261029;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    p: [(-2.4 + rnd() * 7.2) * w, (-4 + rnd() * 5.8) * w, (-14.5 + rnd() * 21) * w],
    size: 0.5 + rnd() * 1.2,
    phase: rnd() * Math.PI * 2,
    speed: 0.3 + rnd() * 0.7,
    warm: rnd() < 0.25,
    prev: null,
  }));
}

function sizeCanvas(c, w, h, scale) {
  if (!c) return;
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  c.getContext("2d").setTransform(scale, 0, 0, scale, 0, 0);
}

/**
 * Night Flight. The five scenes hang in one dark 3D space and the scroll flies
 * a camera between them: it lifts off each scene, banks through the turn and
 * lands square in front of the next, where the scene sits at its natural size.
 * The flight opens and closes on a wide shot of the whole route. A thread of
 * light under the scenes lights up as you travel it.
 */
function Flight({ onOpen, onJump }) {
  const outer = useRef(null);
  const worldRef = useRef(null);
  const glowRef = useRef(null);
  const backRef = useRef(null);
  const frontRef = useRef(null);
  const hudRef = useRef(null);
  const openRef = useRef(null);
  const endRef = useRef(null);
  const stationRefs = useRef([]);
  const ghostRefs = useRef([]);
  const labelRefs = useRef([]);
  const [videoRefs] = useState(() => projects.map(() => ({ current: null })));
  const size = useStageSize();
  const portrait = usePortrait();
  const route = useMemo(() => buildRoute(size.w, size.h, projects.length), [size]);
  const dust = useMemo(() => makeDust(size.w), [size.w]);
  const [view, setView] = useState({ beats: projects.map(() => 0), focus: 0, active: -1 });
  const viewRef = useRef(view);
  const [playing, setPlaying] = useState(true);
  const live = useInView(outer, { margin: "200px 0px 200px 0px" });
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const colors = useMemo(() => projects.map((p) => hexRgb(p.color)), []);

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sizeCanvas(backRef.current, size.w, size.h, dpr);
    sizeCanvas(frontRef.current, size.w, size.h, dpr);
    // the glow is soft anyway: a quarter-size canvas stretched up costs almost nothing
    sizeCanvas(glowRef.current, size.w, size.h, 0.25);
  }, [size]);

  useEffect(() => {
    if (!live) return undefined;
    const { w, h, P, stations, thread } = route;
    const world = worldRef.current;
    const back = backRef.current.getContext("2d");
    const front = frontRef.current.getContext("2d");
    const glow = glowRef.current.getContext("2d");
    const last = stations.length - 1;
    let fogLen = 9 * w;
    const fog = (d) => clamp01(1 - (d - P) / fogLen) * clamp01((d - 0.12 * P) / (0.45 * P));
    const corners = stations.map((s) =>
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [s[0] + (a * w) / 2, s[1] + (b * h) / 2, s[2]])
    );
    const ghosts = stations.map((s, i) => [s[0] + (i % 2 === 0 ? 0.32 : -0.32) * w, s[1] - 0.12 * w, s[2] - 0.9 * w]);
    const glows = stations.map((s, i) => [s[0] + (i % 2 === 0 ? 0.18 : -0.18) * w, s[1], s[2] - 0.2 * w]);
    const beacons = stations.map((s) => [s[0], s[1] + h * 0.62, s[2]]);
    const threadRgb = thread.map(({ seg }) => {
      const a = Math.max(0, Math.min(last, Math.floor(seg)));
      const b = Math.max(0, Math.min(last, Math.ceil(seg)));
      return mixRgb(colors[a], colors[b], seg - Math.floor(seg));
    });
    const cache = stations.map(() => ({ o: -1, pe: "" }));
    const misc = { world: "", hud: -1, open: -1, end: -1 };
    let raf;
    let prevT = performance.now();
    let lastYaw = null;
    let roll = 0;

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - prevT) / 1000));
      prevT = now;
      const t = scrollYProgress.get() * route.total;
      const cam = cameraAt(route, t);
      // the dark thins out on the wide shots, so the far end of the route still shows
      fogLen = (9 + 10 * cam.overview) * w;

      // bank into the turns: the faster the camera turns, the further it leans
      const yawRate = lastYaw == null ? 0 : (cam.yaw - lastYaw) / dt;
      lastYaw = cam.yaw;
      const lean = Math.max(-0.22, Math.min(0.22, -yawRate * 0.11));
      roll += (lean - roll) * (1 - Math.exp(-dt * 5));
      if (cam.landed === 1 && cam.overview === 0 && Math.abs(roll) < 2e-4) roll = 0;
      cam.roll = roll;

      const tf = worldTransform(route, cam);
      if (tf !== misc.world) {
        world.style.transform = tf;
        misc.world = tf;
      }

      // which scene the flight is with, and how each one fades in the dark
      let focus = 0;
      for (let i = 1; i <= last; i++) if (cam.near[i] > cam.near[focus]) focus = i;
      if (cam.near[focus] === 0) focus = t < route.landings[0] ? 0 : last;
      const calm = cam.landed * (1 - cam.overview);
      const opac = stations.map((s, i) => {
        let mn = Infinity;
        for (const c of corners[i]) mn = Math.min(mn, toCamera(cam, c)[2]);
        const d = toCamera(cam, s)[2];
        // a scene the camera passes close by fades out before it can fill the lens
        if (mn < 0.3 * P) return 0;
        const o = clamp01((mn - 0.3 * P) / (0.6 * P)) * clamp01(1 - (d - P) / fogLen);
        return i === focus ? o : o * (1 - 0.74 * calm);
      });
      stations.forEach((_, i) => {
        const el = stationRefs.current[i];
        if (!el) return;
        const o = Math.round(opac[i] * 1000) / 1000;
        if (o !== cache[i].o) {
          el.style.opacity = String(o);
          cache[i].o = o;
        }
        const pe = cam.near[i] > 0.6 ? "auto" : "none";
        if (pe !== cache[i].pe) {
          el.style.pointerEvents = pe;
          cache[i].pe = pe;
        }
        const g = ghostRefs.current[i];
        if (g) g.style.opacity = String(Math.round(opac[i] * (0.55 + 0.45 * cam.near[i]) * 1000) / 1000);
      });

      const finale = t > route.landings[last];
      const hudO = Math.round(clamp01(1 - cam.overview * 2) * 100) / 100;
      if (hudRef.current && hudO !== misc.hud) {
        hudRef.current.style.opacity = String(hudO);
        hudRef.current.style.pointerEvents = hudO > 0.5 ? "auto" : "none";
        misc.hud = hudO;
      }
      const openO = finale ? 0 : Math.round(clamp01(cam.overview * 2 - 1) * 100) / 100;
      const endO = finale ? Math.round(smoother(clamp01((cam.overview - 0.55) / 0.45)) * 100) / 100 : 0;
      if (openRef.current && openO !== misc.open) {
        openRef.current.style.opacity = String(openO);
        misc.open = openO;
      }
      if (endRef.current && endO !== misc.end) {
        endRef.current.style.opacity = String(endO);
        endRef.current.style.pointerEvents = endO > 0.5 ? "auto" : "none";
        misc.end = endO;
      }

      // light from each screen, spilling into the dark around it
      glow.clearRect(0, 0, w, h);
      glow.globalCompositeOperation = "lighter";
      stations.forEach((_, i) => {
        if (opac[i] <= 0.01) return;
        const pr = project(route, cam, glows[i]);
        if (!pr) return;
        const r = Math.max(60, w * 0.62 * pr.k);
        const [cr, cg, cb] = colors[i];
        const gr = glow.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, r);
        gr.addColorStop(0, `rgba(${cr},${cg},${cb},${0.4 * opac[i]})`);
        gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        glow.fillStyle = gr;
        glow.fillRect(pr.x - r, pr.y - r, r * 2, r * 2);
      });
      glow.globalCompositeOperation = "source-over";

      back.clearRect(0, 0, w, h);
      front.clearRect(0, 0, w, h);

      // the thread: travelled stretch lit in each project's colour, the rest waiting in the dark
      const pts = thread.map(({ p }) => project(route, cam, p));
      back.lineCap = "round";
      for (let pass = 0; pass < 2; pass++) {
        for (let j = 0; j < pts.length - 1; j++) {
          const a = pts[j];
          const b = pts[j + 1];
          if (!a || !b) continue;
          const f = fog(a.depth);
          if (f <= 0.01) continue;
          const lit = (0.22 + 0.78 * clamp01((cam.prog - thread[j].seg) / 0.2 + 1)) * (1 - 0.65 * calm);
          const [cr, cg, cb] = threadRgb[j];
          const k = (a.k + b.k) / 2;
          back.strokeStyle = `rgba(${cr},${cg},${cb},${(pass ? 0.9 : 0.16) * lit * f})`;
          back.lineWidth = pass ? Math.max(0.6, Math.min(2.4, 2.2 * k)) : Math.max(2, Math.min(14, 12 * k));
          back.beginPath();
          back.moveTo(a.x, a.y);
          back.lineTo(b.x, b.y);
          back.stroke();
        }
      }
      // a spark at the head of the travelled stretch
      const head = Math.max(0, Math.min(thread.length - 1, thread.findIndex((s) => s.seg >= cam.prog)));
      const hp = pts[head];
      if (hp && cam.landed < 1) {
        const [cr, cg, cb] = threadRgb[head];
        const r = Math.max(10, Math.min(60, 46 * hp.k));
        const gr = back.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, r);
        const a = (1 - cam.landed) * fog(hp.depth);
        gr.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
        gr.addColorStop(0.25, `rgba(${cr},${cg},${cb},${0.55 * a})`);
        gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        back.fillStyle = gr;
        back.fillRect(hp.x - r, hp.y - r, r * 2, r * 2);
      }
      // a beacon under each scene, with its name on the wide shots
      beacons.forEach((b, i) => {
        const pr = project(route, cam, b);
        const label = labelRefs.current[i];
        if (!pr) {
          if (label) label.style.opacity = "0";
          return;
        }
        const f = fog(pr.depth);
        const [cr, cg, cb] = colors[i];
        const r = Math.max(1.6, Math.min(7, 5 * pr.k));
        const on = cam.prog >= i - 0.05 ? 1 : 0.45;
        back.fillStyle = `rgba(${cr},${cg},${cb},${0.22 * f * on})`;
        back.beginPath();
        back.arc(pr.x, pr.y, r * 4, 0, Math.PI * 2);
        back.fill();
        back.fillStyle = `rgba(${cr},${cg},${cb},${f * on})`;
        back.beginPath();
        back.arc(pr.x, pr.y, r, 0, Math.PI * 2);
        back.fill();
        if (label) {
          label.style.transform = `translate3d(${Math.round(pr.x)}px, ${Math.round(pr.y - r * 4 - 6)}px, 0) translate(-50%, -100%)`;
          label.style.opacity = String(Math.round(cam.overview * (0.45 + 0.55 * f) * 100) / 100);
        }
      });

      // dust: dots at rest, streaks when the camera is moving
      const focusDepth = toCamera(cam, stations[focus])[2];
      const time = now / 1000;
      for (const m of dust) {
        const p = [
          m.p[0] + Math.sin(time * 0.21 * m.speed + m.phase) * 0.02 * w,
          m.p[1] + Math.cos(time * 0.17 * m.speed + m.phase) * 0.015 * w,
          m.p[2],
        ];
        const pr = project(route, cam, p);
        if (!pr || pr.x < -40 || pr.x > w + 40 || pr.y < -40 || pr.y > h + 40) {
          m.prev = null;
          continue;
        }
        const f = clamp01(1 - (pr.depth - P) / (11 * w)) * clamp01(pr.depth / (0.25 * P));
        const tw = 0.55 + 0.45 * Math.sin(time * 1.3 * m.speed + m.phase);
        const ctx = pr.depth < focusDepth * 0.92 ? front : back;
        const nearScene = ctx === front ? 0.55 : 1;
        const a = Math.min(0.9, f * tw * 0.9 * nearScene);
        if (a < 0.02) {
          m.prev = { x: pr.x, y: pr.y };
          continue;
        }
        const r = Math.max(0.35, Math.min(2.6, m.size * pr.k * 1.3));
        const tint = m.warm ? colors[focus] : [239, 237, 233];
        const prev = m.prev;
        const moved = prev ? Math.hypot(pr.x - prev.x, pr.y - prev.y) : 0;
        if (prev && moved > 1.5 && moved < 260) {
          ctx.strokeStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${a})`;
          ctx.lineWidth = r * 1.6;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(pr.x, pr.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${a})`;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        m.prev = { x: pr.x, y: pr.y };
      }

      // React only hears about it when a scene's story beat or the focus changes
      const beats = cam.near.map(beatOf);
      const active = cam.near[focus] > 0.5 ? focus : -1;
      const v = viewRef.current;
      if (v.focus !== focus || v.active !== active || beats.some((b, i) => b !== v.beats[i])) {
        viewRef.current = { beats, focus, active };
        setView(viewRef.current);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [live, route, dust, colors, scrollYProgress]);

  const { w, h, P, stations, landings, total } = route;
  const hudIndex = view.focus;

  return (
    <div ref={outer} className="relative" data-live={live} style={{ height: `${(total + 1) * 100}vh` }}>
      {/* where each scene lands on the scroll, for the chapter links and the Skills page */}
      {projects.map((p, i) => (
        <span key={p.slug} id={sceneId(p)} aria-hidden="true" className="absolute left-0 h-px w-px" style={{ top: `${landings[i] * 100 - 55}vh` }} />
      ))}

      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ink" style={{ perspective: `${P}px` }}>
        <canvas ref={glowRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={backRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

        <div ref={worldRef} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          {projects.map((p, i) => {
            const side = i % 2 === 0 ? 1 : -1;
            const [x, y, z] = stations[i];
            return (
              <span
                key={`ghost-${p.slug}`}
                ref={(el) => (ghostRefs.current[i] = el)}
                aria-hidden="true"
                className="stroke-text display pointer-events-none absolute left-0 top-0 select-none whitespace-nowrap text-[clamp(14rem,34vw,34rem)] leading-none"
                style={{ opacity: 0, transform: `translate3d(${x + side * 0.32 * w}px, ${y - 0.12 * w}px, ${z - 0.9 * w}px) translate(-50%, -50%)` }}
              >
                {pad(i + 1)}
              </span>
            );
          })}
          {projects.map((p, i) => {
            const side = i % 2 === 0 ? 1 : -1;
            const [x, y, z] = stations[i];
            const near = Math.abs(i - view.focus) <= 1;
            return (
              <div
                key={p.slug}
                ref={(el) => (stationRefs.current[i] = el)}
                className="absolute left-0 top-0"
                style={{ width: w, height: h, opacity: 0, pointerEvents: "none", transform: `translate3d(${x - w / 2}px, ${y - h / 2}px, ${z}px)` }}
                onFocus={() => {
                  if (viewRef.current.active !== i) onJump(i);
                }}
              >
                <article aria-labelledby={`${sceneId(p)}-title`} className={`container-x relative flex h-full flex-col ${portrait ? "pb-4 pt-20" : "pb-6 pt-24"}`}>
                  {/* phone upright: the screens on top, the story under them */}
                  {portrait ? (
                    <div className="flex flex-1 flex-col justify-center gap-6">
                      <div className="[perspective:1800px]">
                        <Devices
                          project={p}
                          videoRef={videoRefs[i]}
                          playing={playing && view.active === i}
                          load={near}
                          onOpen={() => onOpen(i)}
                          beat={view.beats[i]}
                          side={side}
                        />
                      </div>
                      <Copy project={p} index={i} beat={view.beats[i]} onOpen={() => onOpen(i)} compact />
                    </div>
                  ) : (
                    <div className="grid flex-1 grid-cols-12 items-center gap-12 xl:gap-16">
                      <div className={`col-span-5 ${side > 0 ? "order-1" : "order-2"}`}>
                        <Copy project={p} index={i} beat={view.beats[i]} onOpen={() => onOpen(i)} />
                      </div>
                      <div className={`col-span-7 ${side > 0 ? "order-2" : "order-1"}`}>
                        <div className="[perspective:1800px]">
                          <Devices
                            project={p}
                            videoRef={videoRefs[i]}
                            playing={playing && view.active === i}
                            load={near}
                            onOpen={() => onOpen(i)}
                            beat={view.beats[i]}
                            side={side}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* the HUD is drawn over the stage; this keeps the scene's layout where it was */}
                  <div className="h-9 shrink-0" aria-hidden="true" />
                </article>
              </div>
            );
          })}
        </div>

        <canvas ref={frontRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* names over the beacons on the wide shots */}
        {projects.map((p, i) => (
          <span
            key={`label-${p.slug}`}
            ref={(el) => (labelRefs.current[i] = el)}
            aria-hidden="true"
            className="label pointer-events-none absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap text-paper/80"
            style={{ opacity: 0 }}
          >
            <span className="text-paper">{pad(i + 1)}</span>
            <span className="h-px w-4" style={{ background: p.color }} />
            {p.title}
          </span>
        ))}

        <div ref={openRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0" style={{ opacity: 0 }}>
          <div className="container-x flex items-end justify-between pb-10">
            <p className="label text-dim">
              <span className="text-paper">05</span> stops · one route
            </p>
            <p className="label flex items-center gap-3 text-dim">
              Scroll to fly
              <span className="relative block h-8 w-px overflow-hidden bg-white/10">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[flightCue_1.8s_ease-in-out_infinite] bg-paper/70" />
              </span>
            </p>
          </div>
        </div>

        <div
          ref={endRef}
          className={portrait ? "absolute inset-x-0 bottom-0 pb-12" : "absolute inset-y-0 right-0 flex w-[34%] items-center"}
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <div className={portrait ? "container-x" : "pr-[6vw]"}>
            <p className="label flex items-center gap-3">
              <span className="text-paper">05 / 05</span>
              <span className="h-px w-8 bg-white/25" />
              <span>The whole route</span>
            </p>
            <p className="display mt-6 text-[clamp(2.4rem,4.2vw,4.4rem)] leading-[0.95]">
              Five builds.
              <br />
              <span className="text-paper/45">One flight.</span>
            </p>
            <button
              type="button"
              onClick={() => onJump(0)}
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 px-5 py-2.5 text-sm text-paper transition-colors duration-500 hover:border-paper hover:bg-paper hover:text-ink"
            >
              Fly it again
              <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5">
                <Arrow dir="up" />
              </span>
            </button>
          </div>
        </div>

        <div ref={hudRef} className="absolute inset-x-0 bottom-0" style={{ opacity: 0 }}>
          <div className="container-x pb-6">
            <Hud
              key={hudIndex}
              project={projects[hudIndex]}
              index={hudIndex}
              videoRef={videoRefs[hudIndex]}
              playing={playing}
              setPlaying={setPlaying}
              onJump={onJump}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Work: five products, flown through one after another, with a full case study a click away. */
export default function Projects() {
  const pinned = usePinnedLayout();
  const reduce = useReducedMotion();
  const flight = pinned && !reduce;
  const [open, setOpen] = useState(null);
  const jump = useCallback(
    (i) => {
      // land a little into a pinned scene, so its story has already arrived
      scrollToId(sceneId(projects[i]), { offset: pinned ? Math.round(window.innerHeight * 0.55) : -24 });
    },
    [pinned]
  );

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pb-20 pt-28 md:pb-28 md:pt-36">
        <SectionHeader id="projects" label="Work" note="Five builds · one through-line">
          <Reveal from="none" delay={0.3} duration={1.6} className="mt-10 max-w-xl body-copy">
            Five projects chosen from the many I&rsquo;ve built. Together they run from automated testing, to AI that
            tests software, to computer vision, physics simulation and real-time multiplayer. Each one is live, with its
            source on GitHub.
          </Reveal>
        </SectionHeader>
        <ThroughLine onJump={jump} />
      </div>

      {flight ? (
        <Flight onOpen={setOpen} onJump={jump} />
      ) : (
        projects.map((p, i) => <Scene key={p.slug} project={p} index={i} pinned={pinned} onOpen={() => setOpen(i)} onJump={jump} />)
      )}

      <AnimatePresence>{open !== null && <CaseStudy key="case" index={open} setIndex={setOpen} close={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
