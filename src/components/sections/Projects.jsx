import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { projects } from "../../data/portfolio";
import { useFinePointer, usePinnedLayout } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { scrollToId } from "../../lib/scroll";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { PreviewVideo, useVideoClock } from "../work/PreviewVideo";
import { CountUp, ProjectLinks, WindowBar, hostOf } from "../work/parts";
import CaseStudy from "../work/CaseStudy";

// Each scene is this many viewports tall: one to arrive, the rest held on screen.
const LENGTH = 2.4;
const PIN = 1 / LENGTH;
const pad = (n) => String(n).padStart(2, "0");
const sceneId = (p) => `work-${p.slug}`;

const rise = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: (d = 0) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, delay: d, ease: EASE } }),
};
const pop = {
  hidden: { opacity: 0, scale: 0.6, y: 20 },
  show: (d = 0) => ({ opacity: 1, scale: 1, y: 0, transition: { duration: 0.9, delay: d, ease: [0.34, 1.4, 0.64, 1] } }),
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
 * The recording inside a browser window that has real depth: a back plate,
 * a coloured bloom and two notes floating in front of the glass.
 */
function Device({ project, videoRef, playing, onOpen, beat, side, notes: withNotes, style }) {
  const reduce = useReducedMotion();
  const notes = [
    { text: project.callouts[0], cls: side > 0 ? "-left-[7%] top-[16%]" : "-right-[7%] top-[16%]", z: 90 },
    { text: project.callouts[1], cls: side > 0 ? "-right-[4%] bottom-[12%]" : "-left-[4%] bottom-[12%]", z: 140 },
  ];

  return (
    <motion.div style={{ ...style, transformStyle: "preserve-3d" }} className="relative will-change-transform">
      {/* bloom and back plate give the window a body */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6%] rounded-[2rem] opacity-50 blur-[70px]"
        style={{ background: project.color, transform: "translateZ(-120px)" }}
      />
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
          <PreviewVideo project={project} videoRef={videoRef} playing={playing} />
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

      {withNotes &&
        notes.map((n, i) => (
          <motion.span
            key={n.text}
            aria-hidden="true"
            className={`pointer-events-none absolute hidden items-center gap-2.5 whitespace-nowrap rounded-full border border-white/15 bg-[#0d0d0d]/90 px-4 py-2.5 text-[0.8rem] text-paper shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] lg:flex ${n.cls}`}
            style={{ z: n.z }}
            variants={pop}
            custom={0.25 + i * 0.15}
            initial={reduce ? false : "hidden"}
            animate={beat >= 2 ? "show" : "hidden"}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.color, boxShadow: `0 0 12px ${project.color}` }} />
            {n.text}
          </motion.span>
        ))}
    </motion.div>
  );
}

/** Title, descriptor, summary, numbers, stack and links, arriving in three beats. */
function Copy({ project, index, beat, onOpen }) {
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

      <h3 id={`${sceneId(project)}-title`} className="display mt-6 text-[clamp(2.6rem,5.4vw,5.6rem)]">
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
      <motion.p variants={rise} custom={0.25} {...anim(1)} className="mt-4 text-[0.95rem] font-medium md:text-base" style={{ color: project.color }}>
        {project.descriptor}
      </motion.p>

      <motion.p variants={rise} {...anim(2)} className="body-copy mt-6 max-w-[34rem]">
        {project.summary}
      </motion.p>

      <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-6">
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

      <motion.ul variants={rise} {...anim(3)} className="mt-6 flex flex-wrap gap-1.5 [@media(max-height:820px)]:hidden" aria-label="Stack">
        {project.tech.slice(0, 6).map((t) => (
          <li key={t} className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.75rem] text-paper/75">
            {t}
          </li>
        ))}
        {extra > 0 && <li className="px-1.5 py-0.5 text-[0.75rem] text-dim">+{extra}</li>}
      </motion.ul>

      <motion.div variants={rise} custom={0.12} {...anim(3)} className="mt-8 flex flex-wrap items-center gap-2.5">
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
  const fine = useFinePointer();
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

  // pointer tilt, layered on top of the camera
  const px = useSpring(0, { stiffness: 120, damping: 18 });
  const py = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateX = useTransform([rx, py], ([a, b]) => a + b);
  const rotateY = useTransform([ry, px], ([a, b]) => a + b);
  const onMove = (e) => {
    if (!fine || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    py.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const device = (
    <div onPointerMove={onMove} onPointerLeave={onLeave} className="[perspective:1800px]">
      <Device
        project={project}
        videoRef={videoRef}
        playing={playing}
        onOpen={onOpen}
        beat={shown}
        side={side}
        notes={pinned}
        style={cinematic ? { rotateX, rotateY, scale, y: lift } : { rotateX: py, rotateY: px }}
      />
    </div>
  );
  const hud = (
    <Hud project={project} index={index} videoRef={videoRef} playing={playing} setPlaying={setPlaying} onJump={onJump} />
  );

  // Ambient light in the project's own colour, plus the recording's first frame, far behind.
  const backdrop = (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={cinematic ? { opacity: glow } : undefined}>
      <img src={project.poster} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.12] blur-2xl" loading="lazy" />
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
      <article id={sceneId(project)} aria-labelledby={`${sceneId(project)}-title`} className="relative border-t border-white/[0.06] py-24 md:py-32">
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

/** Work: five products, each one its own scene, with a full case study a click away. */
export default function Projects() {
  const pinned = usePinnedLayout();
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
      <div className="container-x overflow-x-clip pb-20 pt-36 md:pb-28 md:pt-52">
        <SectionHeader id="projects" label="Work" note="Five builds · one through-line">
          <Reveal from="none" delay={0.3} duration={1.6} className="mt-10 max-w-xl body-copy">
            Five products, in the order they tell the story: testing software, then teaching AI to test it, then seeing,
            simulating and syncing in real time. Every one is live and open source.
          </Reveal>
        </SectionHeader>
        <ThroughLine onJump={jump} />
      </div>

      {projects.map((p, i) => (
        <Scene key={p.slug} project={p} index={i} pinned={pinned} onOpen={() => setOpen(i)} onJump={jump} />
      ))}

      <AnimatePresence>{open !== null && <CaseStudy key="case" index={open} setIndex={setOpen} close={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
