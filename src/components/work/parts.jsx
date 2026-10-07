import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { Arrow } from "../kit/Button";

export const hostOf = (url) => new URL(url).hostname;

/** "329", "<200ms", "~50%" count up from zero the first time they are seen; words stay as they are. */
export function CountUp({ value, start = true }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true });
  const m = /^([<~≤+]?)(\d+)(.*)$/.exec(value);

  useEffect(() => {
    if (!m || reduce || !seen || !start || !ref.current) return undefined;
    const [, pre, num, post] = m;
    const el = ref.current;
    const c = animate(0, Number(num), {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${pre}${Math.round(v)}${post}`;
      },
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, start, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/** Live site / source links. */
export function ProjectLinks({ project, className = "" }) {
  const cls =
    "group inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 text-sm text-paper transition-colors duration-500 hover:border-paper hover:bg-paper hover:text-ink";
  const icon = (
    <span className="transition-transform duration-500 ease-cine group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
      <Arrow dir="up" />
    </span>
  );
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      <a href={project.live} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${project.title}: open the live site`}>
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full opacity-70" style={{ background: project.color }} />
          <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: project.color }} />
        </span>
        Live site
        {icon}
      </a>
      <a href={project.github} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${project.title}: source code on GitHub`}>
        GitHub
        {icon}
      </a>
    </div>
  );
}

/** Browser chrome around a recording: three dots, the real address, a live tag. */
export function WindowBar({ project }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#111] px-3.5 py-2.5 md:px-4">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </span>
      <span className="mx-auto flex min-w-0 items-center gap-2 rounded-md bg-white/[0.05] px-3 py-1 font-mono text-[0.68rem] text-paper/60">
        <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="3" y="7" width="10" height="7" rx="1.5" />
          <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
        </svg>
        <span className="truncate">{hostOf(project.live)}</span>
      </span>
      <span className="label hidden items-center gap-1.5 text-[0.6rem] text-paper/60 sm:flex">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: project.color }} />
        Live
      </span>
    </div>
  );
}
