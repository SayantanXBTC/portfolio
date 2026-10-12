import {
  siApachemaven,
  siClaude,
  siDocker,
  siExpress,
  siFlask,
  siFramer,
  siGit,
  siGithubactions,
  siJavascript,
  siJenkins,
  siJunit5,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siSelenium,
  siSocketdotio,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVite,
} from "simple-icons";
import {
  BrainCircuit,
  Coffee,
  Drama,
  FileBarChart,
  Glasses,
  ListChecks,
  Network,
  ScanFace,
  ScrollText,
  ShieldCheck,
  Trophy,
  Workflow,
} from "lucide-react";

// Brand logos (Simple Icons, CC0) and drawn concept icons (Lucide) for the rest.
const BRAND = {
  siApachemaven,
  siClaude,
  siDocker,
  siExpress,
  siFlask,
  siFramer,
  siGit,
  siGithubactions,
  siJavascript,
  siJenkins,
  siJunit5,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siSelenium,
  siSocketdotio,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVite,
};
const DRAWN = { BrainCircuit, Coffee, Drama, FileBarChart, Glasses, ListChecks, Network, ScanFace, ScrollText, ShieldCheck, Trophy, Workflow };

// Near-black brand colours would vanish on the page; fall back to paper.
export const lum = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
};
export const plateFor = (item) => {
  const hex = item.tint ?? (BRAND[item.icon] ? `#${BRAND[item.icon].hex}` : "#2a2a2a");
  return lum(hex) < 40 ? "#262626" : hex;
};
export const tintFor = (item) => {
  const hex = plateFor(item);
  return lum(hex) < 60 ? "#efede9" : hex;
};
const glyphFor = (plate) => (lum(plate) > 175 ? "#161616" : "#ffffff");

export function Glyph({ item, className }) {
  const brand = BRAND[item.icon];
  if (brand)
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={brand.path} />
      </svg>
    );
  const Drawn = DRAWN[item.icon];
  return Drawn ? <Drawn className={className} strokeWidth={2.2} aria-hidden="true" /> : null;
}

// a stable pseudo-random number per skill, so every icon moves on its own rhythm
export const seed = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h / 9973;
};

/**
 * A logo as a solid object: a glossy, rounded plate with real thickness (stacked
 * slabs), the logo raised off its face (stacked glyph layers), a light sweep and
 * a soft shadow. It floats and turns on its own, so its depth is always visible.
 */
export function Icon3D({ item }) {
  const plate = plateFor(item);
  const glyph = glyphFor(plate);
  const r = seed(item.name);
  const style = {
    "--c": plate,
    "--dur": `${5 + r * 3}s`,
    "--delay": `${-r * 8}s`,
  };
  return (
    <span className="icon3d block" style={style} aria-hidden="true">
      <span className="icon3d-shadow" />
      <span className="icon3d-bob">
        {/* thickness of the plate */}
        {[4, 3, 2, 1].map((d) => (
          <span
            key={d}
            className="icon3d-slab"
            style={{
              transform: `translateZ(${-d * 2.8}px)`,
              background: `color-mix(in srgb, var(--c) ${62 - d * 7}%, black)`,
            }}
          />
        ))}
        <span className="icon3d-face">
          <span className="icon3d-gloss" />
        </span>
        {/* the logo, embossed: darker layers underneath, bright layer on top */}
        {[1, 2].map((d) => (
          <span
            key={d}
            className="icon3d-glyph"
            style={{ transform: `translateZ(${d * 2.1}px)`, color: `color-mix(in srgb, ${glyph} 45%, black)` }}
          >
            <Glyph item={item} />
          </span>
        ))}
        <span
          className="icon3d-glyph"
          style={{ transform: "translateZ(6.4px)", color: glyph, filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.35))" }}
        >
          <Glyph item={item} />
        </span>
      </span>
    </span>
  );
}

/** The same plate, flat and light: for small sizes and for many at once (no layers, no animation). */
export function MiniIcon({ item, size = 34, className = "" }) {
  const plate = plateFor(item);
  return (
    <span className={`mini-icon ${className}`} style={{ "--c": plate, width: size, height: size, color: glyphFor(plate) }} aria-hidden="true">
      <Glyph item={item} className="absolute inset-[22%] h-[56%] w-[56%]" />
    </span>
  );
}
