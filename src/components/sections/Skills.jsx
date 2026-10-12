import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { foundations, projects } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { focusSkill, jumpToProject, scrollToId } from "../../lib/scroll";
import { SectionHeader } from "../kit/SectionHeader";
import { Icon3D, tintFor } from "../kit/SkillIcon";
import SkillSphere from "../skills/SkillSphere";

// What a skill is called inside the projects' stacks, when that differs from its name here.
const ALIAS = {
  "REST APIs": ["rest api"],
  "Socket.io": ["socket.io"],
  "Claude API": ["claude"],
  "Generative AI": ["claude"],
  "Computer vision": ["insightface"],
};
const usedIn = (name) => {
  const keys = ALIAS[name] ?? [name.toLowerCase()];
  // a whole-word match: "Java" must not match "JavaScript", but "React" matches "React 18"
  const hit = (t, k) => t.startsWith(k) && !/[a-z]/.test(t.charAt(k.length));
  return projects.filter((p) => p.tech.some((t) => keys.some((k) => hit(t.toLowerCase(), k))));
};
const USED = Object.fromEntries(foundations.flatMap((g) => g.items.map((it) => [it.name, usedIn(it.name)])));

/** Where a skill comes from: the projects it was used in, or (when none) where else it was learned or applied. */
function UsedIn({ item, align, onClose }) {
  const list = USED[item.name];
  const note = item.note;
  const side = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <motion.div
      role="dialog"
      aria-label={`Where ${item.name} comes from`}
      className={`absolute bottom-[calc(100%+0.6rem)] z-30 w-max min-w-[11rem] max-w-[16rem] ${side}`}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="rounded-xl border border-white/10 bg-[#121212] p-2 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)]">
        {list.length > 0 ? (
          <>
            <p className="label px-2 pb-2 pt-1 text-[0.58rem] text-dim">Used in</p>
            <ul>
              {list.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      jumpToProject(p.slug);
                    }}
                    className="group/p flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[0.82rem] text-paper/85 transition-colors hover:bg-white/[0.06] hover:text-paper"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color }} />
                    <span className="flex-1">{p.title}</span>
                    <span className="text-dim transition-transform duration-300 group-hover/p:translate-x-0.5">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-2 pb-1.5 pt-1">
            <p className="label pb-2 text-[0.58rem] text-dim">Where it comes from</p>
            <p className="text-[0.82rem] leading-snug text-paper/85">{note?.text}</p>
            {note?.to && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  scrollToId(note.to);
                }}
                className="label mt-2.5 text-[0.58rem] text-accent-strong"
              >
                {note.cta} →
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * One skill as a small stage: the tile flips up into place, tilts toward the
 * pointer and catches a sheen; the 3D icon on it floats on its own rhythm and
 * lifts and turns once when you look at it. Skills used in projects say where.
 */
function Tile({ item, open, setOpen }) {
  const ref = useRef(null);
  const li = useRef(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);
  const [flash, setFlash] = useState(false);
  const [align, setAlign] = useState("center");
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const tint = tintFor(item);
  const tilt = fine && !reduce;
  const n = USED[item.name].length;
  const has = n > 0 || Boolean(item.note);
  const lit = hot || flash;

  // asked for from elsewhere (About, the globe): turn once and glow
  useEffect(() => {
    const on = (e) => {
      if (e.detail !== item.name) return;
      setFlash(true);
      setTimeout(() => setFlash(false), 1900);
    };
    window.addEventListener("skill:focus", on);
    return () => window.removeEventListener("skill:focus", on);
  }, [item.name]);

  // keep the card on screen at the edges of the grid
  useLayoutEffect(() => {
    if (!open || !li.current) return;
    const r = li.current.getBoundingClientRect();
    setAlign(r.left < 110 ? "left" : window.innerWidth - r.right < 110 ? "right" : "center");
  }, [open]);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--mx", `${px * 100}%`);
    ref.current.style.setProperty("--my", `${py * 100}%`);
    if (!tilt) return;
    ry.set((px - 0.5) * 26);
    rx.set((0.5 - py) * 26);
  };
  const leave = () => {
    setHot(false);
    rx.set(0);
    ry.set(0);
    if (fine) setOpen(null);
  };

  return (
    <motion.li
      ref={li}
      className="relative [perspective:700px]"
      style={{ zIndex: open ? 30 : undefined }}
      variants={{
        hidden: { opacity: 0, rotateX: -80, rotateY: -40, y: 50, scale: 0.6 },
        show: { opacity: 1, rotateX: 0, rotateY: 0, y: 0, scale: 1, transition: { duration: 1.3, ease: [0.34, 1.3, 0.64, 1] } },
      }}
      onPointerEnter={() => fine && has && setOpen(item.name)}
      onPointerLeave={leave}
    >
      <AnimatePresence>{open && has && <UsedIn item={item} align={align} onClose={() => setOpen(null)} />}</AnimatePresence>
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerEnter={() => setHot(true)}
        onClick={() => !fine && has && setOpen(open ? null : item.name)}
        whileTap={{ scale: 0.94 }}
        role={has ? "button" : undefined}
        tabIndex={has ? 0 : undefined}
        aria-expanded={has ? open : undefined}
        aria-label={n ? `${item.name}, used in ${n} project${n > 1 ? "s" : ""}` : has ? `${item.name}: where it comes from` : undefined}
        onKeyDown={(e) => has && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(open ? null : item.name))}
        style={{
          rotateX: rx,
          rotateY: ry,
          transformStyle: "preserve-3d",
          transformPerspective: 600,
          borderColor: lit ? `${tint}66` : undefined,
          boxShadow: flash ? `0 0 0 2px ${tint}, 0 30px 70px -20px ${tint}` : hot ? `0 30px 60px -30px ${tint}` : undefined,
        }}
        className={`group relative flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-3 transition-[border-color,box-shadow] duration-500 ${has ? "cursor-pointer" : ""}`}
      >
        {/* sheen that follows the pointer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(120px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.12), transparent 70%)" }}
        />
        {/* coloured glow under the object */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[40%] h-28 w-28 transition-opacity duration-500"
          style={{ background: `radial-gradient(closest-side, ${tint}, transparent)`, opacity: lit ? 0.5 : 0.12, transform: "translate(-50%,-50%) translateZ(4px)" }}
        />
        {/* how many projects it was used in */}
        {n > 0 && (
          <span aria-hidden="true" className="label absolute right-2.5 top-2.5 flex items-center gap-1 text-[0.55rem] text-dim" style={{ transform: "translateZ(14px)" }}>
            <span className="h-1 w-1 rounded-full" style={{ background: tint }} />
            {n}
          </span>
        )}
        {/* the icon: lifts toward you and does one full turn on hover */}
        <span
          className="relative block transition-transform duration-[1300ms] ease-cine"
          style={{ transform: lit ? "translateZ(60px) rotateY(360deg) scale(1.08)" : "translateZ(36px)" }}
        >
          <Icon3D item={item} />
        </span>
        <span
          style={{ transform: "translateZ(22px)" }}
          className="relative text-center text-[0.72rem] leading-tight tracking-wide text-paper/70 transition-colors duration-500 group-hover:text-paper md:text-[0.78rem]"
        >
          {item.name}
        </span>
      </motion.div>
    </motion.li>
  );
}

/** The groups as a slim bar that stays in view while you read them; it follows along and jumps on click. */
function GroupBar({ active }) {
  const rail = useRef(null);
  const reduce = useReducedMotion();

  // keep the current group's chip in view on narrow screens (scroll the bar only, never the page)
  useEffect(() => {
    const el = rail.current?.querySelector(`[data-key="${active}"]`);
    if (!el || !rail.current) return;
    const r = rail.current;
    const left = el.offsetLeft - r.clientWidth / 2 + el.offsetWidth / 2;
    r.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  return (
    <div className="sticky top-[3.6rem] z-20 -mx-[max(1.25rem,4vw)] mb-12 border-y border-white/[0.06] bg-ink/95 px-[max(1.25rem,4vw)] md:mb-16">
      <nav ref={rail} aria-label="Skill groups" className="no-scrollbar flex gap-1 overflow-x-auto py-2.5">
        {foundations.map((g, i) => {
          const on = g.key === active;
          return (
            <button
              key={g.key}
              data-key={g.key}
              type="button"
              onClick={() => scrollToId(`skills-${g.key}`, { offset: -130 })}
              aria-current={on ? "true" : undefined}
              className={`label relative shrink-0 rounded-full px-3.5 py-2 transition-colors duration-500 ${on ? "text-paper" : "text-dim hover:text-mute"}`}
            >
              {on && <motion.span layoutId="skill-group" className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.05]" transition={{ duration: 0.5, ease: EASE }} />}
              <span className="relative">
                <span className={on ? "text-accent-strong" : ""}>{String(i + 1).padStart(2, "0")}</span> {g.title}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Skills, grouped by what they are for. Up top, every skill on one globe you
 * can spin; then a bar of the groups that stays in view, and the groups
 * themselves as tiles. A skill used in the projects says which, and jumps there.
 */
export default function Skills() {
  const sectionRef = useRef(null);
  const live = useInView(sectionRef, { margin: "150px 0px 150px 0px" });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(foundations[0].key);
  const [open, setOpen] = useState(null);

  // which group is in the middle of the screen
  useEffect(() => {
    const els = foundations.map((g) => document.getElementById(`skills-${g.key}`)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("skills-", ""))),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // a tap anywhere else closes an open "used in" card
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !e.target.closest?.("li") && setOpen(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <section ref={sectionRef} data-live={live} id="skills" aria-labelledby="skills-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x relative">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeader id="skills" label="Skills" note={`${foundations.length} groups · from code to shipping`} />
          </div>
          <motion.div
            className="mb-14 lg:col-span-5 lg:mb-20"
            initial={reduce ? false : { opacity: 0, scale: 0.86 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <SkillSphere onPick={focusSkill} />
          </motion.div>
        </div>

        <GroupBar active={active} />

        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 xl:grid-cols-4">
          {foundations.map((col, i) => (
            <div key={col.key} id={`skills-${col.key}`} className="scroll-mt-32 border-t border-white/[0.08] pt-8">
              <p className="label flex items-center justify-between">
                <span className={active === col.key ? "text-accent-strong" : "text-paper"}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-dim">{col.items.length} entries</span>
              </p>
              <h3 className="display mt-6 text-[clamp(1.9rem,2.6vw,2.6rem)]">{col.title}</h3>
              <p className="label mt-3 text-dim">{col.line}</p>

              <motion.ul
                className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2"
                initial={reduce ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: (i % 4) * 0.12 } } }}
              >
                {col.items.map((item) => (
                  <Tile key={item.name} item={item} open={open === item.name} setOpen={setOpen} />
                ))}
              </motion.ul>
            </div>
          ))}
        </div>
        <p className="label mt-14 text-center text-dim">Point at or tap any skill to see where I have used it</p>
      </div>
    </section>
  );
}
