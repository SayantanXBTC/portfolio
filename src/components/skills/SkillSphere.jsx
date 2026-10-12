import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { foundations } from "../../data/portfolio";
import { MiniIcon } from "../kit/SkillIcon";

// Every skill once, tagged with its group, spread evenly over a sphere (Fibonacci lattice).
const ITEMS = foundations.flatMap((g) => g.items.map((item) => ({ ...item, group: g.key, groupTitle: g.title })));
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const POINTS = ITEMS.map((_, i) => {
  const y = 1 - (2 * (i + 0.5)) / ITEMS.length;
  const r = Math.sqrt(1 - y * y);
  const phi = i * GOLDEN;
  return [Math.cos(phi) * r, y, Math.sin(phi) * r];
});
const AUTO = 0.22; // radians per second when left alone

/**
 * All the skills as one slowly turning globe. Drag (or swipe sideways) to spin
 * it, with inertia; click an icon to jump to its group below. Icons always face
 * you; the far side of the globe falls into shadow.
 */
export default function SkillSphere({ onPick }) {
  const box = useRef(null);
  const nodes = useRef([]);
  const reduce = useReducedMotion();
  const visible = useInView(box, { margin: "100px 0px 100px 0px" });
  const [size, setSize] = useState(380);
  const [hover, setHover] = useState(null);
  const st = useRef({ ax: -0.35, ay: 0, vx: 0, vy: AUTO, drag: null, moved: 0 });

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const R = size * 0.4;
    const place = () => {
      const { ax, ay } = st.current;
      const [sx, cx, sy, cy] = [Math.sin(ax), Math.cos(ax), Math.sin(ay), Math.cos(ay)];
      POINTS.forEach(([x, y, z], i) => {
        const el = nodes.current[i];
        if (!el) return;
        // turn about y, then tilt about x
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const near = (z2 + 1) / 2; // 0 far .. 1 near
        el.style.transform = `translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${0.55 + 0.55 * near})`;
        el.style.opacity = String(0.18 + 0.82 * near * near);
        el.style.zIndex = String(Math.round(near * 100));
      });
    };
    place();
    if (!visible || reduce) return undefined;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (!s.drag) {
        // ease back toward a slow idle spin
        s.vy += (AUTO - s.vy) * Math.min(1, dt * 1.2);
        s.vx += (0 - s.vx) * Math.min(1, dt * 2);
        s.ay += s.vy * dt;
        s.ax = Math.max(-1.1, Math.min(1.1, s.ax + s.vx * dt));
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduce, size]);

  const onDown = (e) => {
    st.current.drag = { x: e.clientX, y: e.clientY, t: performance.now() };
    st.current.moved = 0;
  };
  const onMove = (e) => {
    const s = st.current;
    const d = s.drag;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, now - d.t) / 1000;
    s.moved += Math.abs(dx) + Math.abs(dy);
    if (s.moved > 6 && !d.captured) {
      d.captured = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    const k = 3 / size;
    s.ay += dx * k;
    s.ax = Math.max(-1.1, Math.min(1.1, s.ax - dy * k));
    s.vy = (dx * k) / dt;
    s.vx = (-dy * k) / dt;
    Object.assign(d, { x: e.clientX, y: e.clientY, t: now });
  };
  const onUp = () => {
    const s = st.current;
    s.drag = null;
    s.vy = Math.max(-6, Math.min(6, s.vy));
    s.vx = Math.max(-4, Math.min(4, s.vx));
  };

  const iconSize = Math.round(Math.max(30, Math.min(46, size * 0.105)));

  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <div
        ref={box}
        className="relative aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="group"
        aria-label="All skills on a globe. Drag to spin; choose a skill to jump to its group."
      >
        {/* the globe's body: a faint shell, rim light and a shadow beneath */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-[9%] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, rgb(var(--accent-rgb) / 0.16), transparent 62%), radial-gradient(circle, transparent 66%, rgba(255,255,255,0.05) 70%, transparent 71%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] bottom-[2%] h-[8%] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.8), transparent)" }} />

        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {ITEMS.map((item, i) => (
            <button
              key={item.name}
              ref={(el) => (nodes.current[i] = el)}
              type="button"
              aria-label={`${item.name} (${item.groupTitle})`}
              onClick={() => st.current.moved < 6 && onPick(item.group, item.name)}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              className="group absolute block will-change-transform"
              style={{ left: -iconSize / 2, top: -iconSize / 2, width: iconSize, height: iconSize }}
            >
              <span className="block h-full w-full transition-transform duration-300 ease-cine group-hover:scale-125 group-focus-visible:scale-125">
                <MiniIcon item={item} size={iconSize} />
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* the name of whichever icon you point at */}
      <p className="label mt-2 h-4 text-center text-paper/80" aria-hidden="true">
        {hover !== null ? (
          <>
            {ITEMS[hover].name} <span className="text-dim">· {ITEMS[hover].groupTitle}</span>
          </>
        ) : (
          <span className="text-dim">Drag to spin · click a skill</span>
        )}
      </p>
    </div>
  );
}
